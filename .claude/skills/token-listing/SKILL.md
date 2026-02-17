---
name: token-listing
description:
  This skill should be used when the user asks to "list a token", "add a token", "list ERC-20 token", "add ERC-20
  token", "list SPL token", "add SPL token", "list token on Sablier", "add token to token list", "add token to Sablier",
  or needs to insert an EVM or Solana token entry into a chain-specific JSON file.
---

# Token Listing

## Overview

Add ERC-20 (EVM) or SPL (Solana) tokens to the Sablier token list by fetching metadata from GitHub issues, CoinGecko, or
user input, then inserting validated entries into chain-specific JSON files.

## File Structure

| Component          | Path                               |
| ------------------ | ---------------------------------- |
| EVM source data    | `token-list/evm/{chainId}.json`    |
| Solana source data | `token-list/solana/{cluster}.json` |
| Generated EVM list | `token-list/evm.json`              |
| Generated Solana   | `token-list/solana.json`           |
| Token logos        | `tokens/{FILENAME}.png`            |
| Chain mappings     | `CHAINS.md` (repo root)            |

## Input Resolution

Resolve two inputs before proceeding: a **chain or cluster name** and a **token address**.

### Chain/Cluster (arg1 — authoritative)

Arg1 is a **single word** (no spaces). Match it against `CHAINS.md` using these rules in order:

1. **Case-insensitive exact match** — against the Chain Name column (EVM) or Cluster column (Solana). E.g., `base` →
   "Base", `arbitrum` → "Arbitrum", `devnet` → "devnet".
2. **Hyphenated full-name match** — join multi-word names with hyphens. E.g., `base-sepolia` → "Base Sepolia",
   `op-mainnet` → "OP Mainnet", `linea-mainnet` → "Linea Mainnet".
3. **First-word match** — for multi-word chain names only, match on the first word when it does not collide with an
   exact match from rule 1. E.g., `op` → "OP Mainnet", `bnb` → "BNB Chain", `sei` → "Sei Network", `zksync` → "ZKsync
   Era". Note: `base` resolves to "Base" via rule 1, not "Base Sepolia" — use `base-sepolia` or `84532` instead.
4. **Numeric chain ID** — accept a number directly if `token-list/evm/{number}.json` exists. E.g., `8453` → Base. If the
   chain ID has no entry in `CHAINS.md`, use the numeric ID in the commit message.
5. **Alias** — accept `solana` as alias for `mainnet-beta`.

If no match is found, report the error with available options from `CHAINS.md`.

### Address Family Validation

After resolving arg1, validate that the address format matches the network family:

- **EVM chains** require a `0x`-prefixed hex address (42 characters)
- **Solana clusters** require a Base58 address (no `0x` prefix)

If the address format conflicts with arg1 (e.g., a Base58 address with an EVM chain name), report the mismatch and
**stop**.

## Workflow

### 1. Check Duplicates

Check for an exact match on the `address` field in the target file. EVM uses case-insensitive comparison because
addresses vary in checksum casing. Solana is case-sensitive (Base58).

EVM:

```bash
jq -e --arg addr "$ADDRESS" '[.[] | select(.address | ascii_downcase == ($addr | ascii_downcase))] | length > 0' "token-list/evm/$CHAIN_ID.json"
```

Solana:

```bash
jq -e --arg addr "$ADDRESS" '[.[] | select(.address == $addr)] | length > 0' "token-list/solana/$CLUSTER.json"
```

If jq returns an error (not just `false`), inspect the output — the file may contain malformed JSON. If a match is
found, report "Token already listed in {file}" and **stop**.

Also check for **symbol and name collisions** on the same chain or cluster. The EVM test suite
(`token-list/evm.test.ts`) rejects duplicate symbols and names per chain, with exceptions listed in
`approvedDuplicateSymbols` or `approvedDuplicateNames`. Solana tests do **not** enforce symbol/name uniqueness — check
manually with jq. If a collision is found, warn the user and ask how to proceed.

### 2. Search GitHub Issues

```bash
gh issue list --search "$ADDRESS" --repo sablier-labs/sablier-labs.github.io --state all --json number,title,state,body,createdAt --limit 50
```

Filter results to issues whose body contains the address **and** references the target chain or cluster. For EVM
addresses, compare case-insensitively (checksum and lowercase refer to the same address). For chain/cluster matching,
check whether the issue title or body contains **any** of: the exact chain name from `CHAINS.md`, the cluster name, or a
common alias (e.g., "BSC" for BNB Chain, "Optimism" for OP Mainnet). Accept any supported chain ID from `CHAINS.md` as a
matching signal, but require boundary context (e.g., "Chain ID: 130", "chainId: 999") — bare short numbers like `1`,
`10`, `56` appear too often in unrelated text. Avoid overly broad terms like "ETH" — prefer the full chain name
"Ethereum". Discard results that do not match the target network — the same token address can appear in issues for
different chains. Note: the Solana issue template lists "Testnet" as an option, but only `mainnet-beta` and `devnet` are
supported (see `CHAINS.md`). If the **requested cluster is testnet**, report the unsupported cluster and **stop**. If
the requested cluster is supported but a matching issue specifies testnet, discard that issue as non-matching and
continue. If multiple issues match, process closed issues first (to catch rejections), then use the most recent open
issue for metadata.

- **Closed issue found** → fetch comments to check for rejection reasons:
  ```bash
  gh issue view <number> --repo sablier-labs/sablier-labs.github.io --comments --json comments,state
  ```
  If rejected **and no newer open issue exists for the same token + network**, report the reason and **stop**. If a
  newer open issue supersedes the rejection, use the open issue instead. If closed without rejection, proceed normally.
- **Open issue matching address + network** → extract metadata from the issue body (follows templates in
  `.github/ISSUE_TEMPLATE/`). Store issue number for step 8 (commit). If all metadata fields (name, symbol, decimals,
  logo) are present, skip step 3. For Solana, also extract the token program if specified — confirmation happens in step
  6 regardless.

### 3. Fetch Metadata

If no issue found or metadata incomplete, use the `coingecko-api` skill to fetch missing schema fields. Look up the
token by contract address on the appropriate platform to retrieve name, symbol, decimals, and logo URL. If the
`coingecko-api` skill is unavailable, ask the user for the missing fields.

For **Solana tokens**, also determine the token program. The `program` field is optional in the TypeScript type
(`program?: string` in `scripts/token-list/types.ts`) — if omitted, it will be absent from the generated output.
**Always include it explicitly** in the JSON entry for correctness and consistency with existing entries:

1. If the GitHub issue or CoinGecko data explicitly specifies Token-2022, use
   `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`.
2. Otherwise, default to SPL Token: `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`.

There is no deterministic way to verify the program without an RPC call, and the build system does not validate it.

See `./references/schemas.md` for the full program table. Do not improvise with RPC calls.

As a last resort, ask the user for any remaining missing fields.

### 4. Acquire Logo

Determine the logo filename first: use `{SYMBOL}` by default, but for symbols with dots, leading digits, or special
characters (e.g., `AAVE.e`, `0x` → `ZEROX`), check existing `logoURI` values in `token-list/` JSON files for naming
precedent.

If `tokens/{FILENAME}.png` already exists, verify it belongs to the same token (different projects can share a symbol).
If it matches, reuse it. If it belongs to a different token, ask the user how to resolve the conflict before proceeding.

Otherwise, use first available source: GitHub issue image → CoinGecko logo → ask user.

- Store all logos flat in `tokens/` (not in chain-specific subdirectories)
- Download with `curl -L` to a temp file, verify format with `file`
- **Must be PNG** — if not PNG, convert with `sips -s format png input --out tokens/{FILENAME}.png` (macOS) or
  `magick input tokens/{FILENAME}.png` (ImageMagick). If neither tool is available, ask the user to provide a PNG.
- Save as `tokens/{FILENAME}.png`

Set logoURI to `https://files.sablier.com/tokens/{FILENAME}.png` for all new entries, even if the same token on another
chain uses a legacy external URI.

### 5. Validate Address

Before generating the entry, perform a basic address format check to catch obvious errors early:

- **EVM**: Verify it is exactly 42 characters (`0x` + 40 hex digits). Preserve the address format from the metadata
  source (the repo uses a mix of checksummed and lowercase addresses).
- **Solana**: Verify it is a valid Base58 string (32-44 characters, no `0`, `O`, `I`, `l`).

If validation fails, report the error and **stop**.

Note: This is a pre-filter. The `just test` command in step 7 performs stricter validation using `getAddress()` for EVM
and `assertIsAddress()` for Solana.

### 6. Generate and Insert Entry

Create a JSON entry matching the appropriate schema from `./references/schemas.md`. For Solana entries, look up the
`chainId` from the Solana section of `CHAINS.md` using the resolved cluster name. **Before generating a Solana entry,
confirm the token program with the user** — an incorrect program value will pass all tests silently. Append the entry to
the target chain/cluster file's array — `just sort-tokens` in the next step handles ordering.

### 7. Build and Validate

Run these steps in order:

1. `just sort-tokens` — sort source and generated token files alphabetically by symbol
2. `just build-evm` or `just build-solana` — build the appropriate generated list
3. Follow CLAUDE.md quality check sequence for modified files
4. `just test` — verify the token entry is valid

If any step fails, read the error output, fix the source JSON entry, and re-run from step 1 (`just sort-tokens`) to
ensure tests never run on stale generated files.

### 8. Commit

Skip gitignored files. Use one of:

- EVM: `feat(token-list): list ${SYMBOL} on ${CHAIN_NAME}` (e.g., `list USDC on Base`)
- Solana: `feat(token-list): list ${SYMBOL} on Solana ${CLUSTER}` (e.g., `list USDC on Solana mainnet-beta`)
- Append `(closes #N)` when a matching issue exists

## Reference Files

- **`./references/schemas.md`** — Complete EVM and Solana token JSON schemas with field descriptions

## Dependencies

- **`coingecko-api` skill** — fetch token metadata and logos when GitHub issue data is insufficient
- **`CHAINS.md`** (repo root) — chain ID and cluster mappings for all supported networks
- **CLI tools** — `jq`, `gh` (GitHub CLI), `curl`, `file`; optional: `sips` (macOS) or `magick` (ImageMagick) for logo
  conversion
