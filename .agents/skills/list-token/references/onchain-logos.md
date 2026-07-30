# On-Chain Logo Provenance

How to recover a token logo from the chain itself when off-chain sources (GitHub issue, CoinGecko) have nothing.

Launchpad-minted tokens are the common case. Aggregators only index tokens with trading volume or a manual submission,
so a freshly launched token is invisible to them while its artwork has been on-chain since the moment it was created.
The launchpad factory takes a metadata URI as a `createToken` argument, and that URI points at a JSON document
containing the image.

This path is strictly better than a third-party listing: the URI is embedded in the transaction that created the exact
address being listed, so provenance is not a guess.

## Recipe

Substitute the chain's Blockscout base URL (from `CHAINS.md` or the SDK chain definition) for `$EXPLORER`.

### 1. Find the creation transaction

```bash
curl -s "$EXPLORER/api/v2/addresses/$ADDRESS" \
  | jq -c '{proxy_type, implementations, creation_transaction_hash, creation_tx_hash}'
```

Field naming varies across Blockscout versions — check both `creation_transaction_hash` and `creation_tx_hash`. A
`proxy_type` of `eip1167` with an `implementations` entry is a strong launchpad signal: the token is a minimal proxy and
the factory holds the shared logic.

If both fields are `null`, also try the v1 endpoint:

```bash
curl -s "$EXPLORER/api?module=contract&action=getcontractcreation&contractaddresses=$ADDRESS" | jq -c '.result'
```

An empty result from both means there is no creation transaction — the contract is a genesis predeploy, and this whole
path does not apply. Move on.

### 2. Extract the metadata URI from the creation calldata

```bash
curl -s "$EXPLORER/api/v2/transactions/$CREATION_TX" | jq -r '.decoded_input.parameters'
```

Look for an `ipfs://<CID>`, `ar://<TXID>`, or `https://` string sitting alongside the token's name and symbol. Those
three arguments travelling together is the confirmation that you are reading the right call.

When Blockscout cannot decode the input (unverified factory), scan the raw calldata directly — ABI-encoded strings
survive as readable UTF-8:

```bash
curl -s "$EXPLORER/api/v2/transactions/$CREATION_TX" | jq -r '.raw_input' \
  | python3 -c 'import binascii,sys; raw=sys.stdin.read().strip(); print(binascii.unhexlify(raw[2:]).decode("utf-8","ignore"))' \
  | rg -o 'ipfs://[A-Za-z0-9]+|ar://[A-Za-z0-9_-]+|https://[^\x00-\x1f"]+'
```

### 3. Fetch the metadata and read the image

```bash
curl -sL --max-time 60 "https://ipfs.io/ipfs/$METADATA_CID" | jq -c .
```

Read `.image` (some launchpads use `.image_url` or `.logo`). Resolve an `ipfs://` value through a public gateway
(`https://ipfs.io/ipfs/<CID>`) or, when the issuer runs one, its own gateway — the issuer's gateway is usually faster
and equally authoritative. Gateways can be slow; allow a generous `--max-time` before concluding a CID is unreachable.

Metadata frequently also carries `socials.website`, which identifies the issuer for step 5.

### 4. Alternative: metadata view functions

Some ERC-20s expose the URI as a view function instead of routing it through a factory. Worth one attempt when there is
no creation calldata to read — try `tokenURI()`, `uri()`, `metadataURI()`, `contractURI()`, and `logoURI()`. Any hit
feeds back into step 3.

### 5. Verify the image belongs to this exact contract

Do not skip this. A logo for a same-symbol token on another chain is worse than no logo.

At least one of these must hold, and two is better:

- The creation transaction's logs or internal transactions reference the token address being listed. This is the
  strongest single check — it proves the calldata you read created _this_ contract.
- The issuer's own token page renders the listed address, and serves its logo from the same CID. Launchpad token pages
  are usually JS-only, so `WebFetch` returns an empty shell — use the `chrome-devtools` MCP tools to load the page and
  read the rendered DOM.
- The creation transaction's sender matches an address independently known to be the project's deployer.

If none hold, treat the image as unverified and report that rather than guessing.

## Sizing

The repository has **no** single logo dimension. Across ~466 logos the distribution is roughly 200×200 (111), 64×64
(77), 100×100 (75), 250×250 (33), then a long tail up to 512×512. Do not resize to match a handful of neighbours in the
same chain file and call it a convention.

Keep the artwork as published when it is already in that range. Downscale only when a source image is a clear outlier
(larger than 512×512), since a multi-megabyte logo bloats a list served to every client:

```bash
sips -s format png -Z 256 source.png --out "tokens/$FILENAME.png"
```

State in your report that you resized and from what original size, so the choice is reviewable.

## Worked example: BUTTON on Robinhood Chain

Every off-chain source was empty — no GitHub issue, CoinGecko returned `coin not found` for the contract despite having
the `robinhood` platform, and Blockscout's `icon_url` was `null`.

1. `/api/v2/addresses/0x86E5aC7eC60EEec0a8989F1F1D617AE18c15FA0c` → `eip1167` proxy, creation tx `0xc2528b89…`.
2. That transaction's decoded input was
   `createToken(("button", "BUTTON", "ipfs://QmSpVMgioDYfpC2FQkhAN9zKPdfmMWwhBBWRkp4x2cj5Xt", …))` on factory
   `0xeaC47e69…3248`.
3. The metadata JSON gave `image: ipfs://QmQVKey4jBLE8M9e37qRKR8gS4q94AR9Jt4NcLw2eivyV9` and
   `socials.website: https://button.fun/`.
4. Verification: the creation transaction's logs referenced `0x86E5aC7e…FA0c`, and the issuer's token page (loaded via
   `chrome-devtools`, since plain fetches returned a JS shell) rendered that same address while serving its logo from
   the identical CID.
5. The published PNG was 1200×1200, an outlier against the repo's 512×512 maximum, so it was downscaled to 250×250.
