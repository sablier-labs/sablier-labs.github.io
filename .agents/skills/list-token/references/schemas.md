# Token Schemas

## EVM (ERC-20)

```json
{
  "address": "0x...",
  "chainId": 1,
  "decimals": 18,
  "logoURI": "https://files.sablier.com/tokens/{FILENAME}.png",
  "name": "Token Name",
  "symbol": "SYMBOL"
}
```

### Field Descriptions

| Field      | Type   | Description                                                                                                                                                       |
| ---------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `address`  | string | ERC-20 contract address (`0x`-prefixed, 42 hex chars). Preserve the format from the metadata source — the repo uses a mix of checksummed and lowercase addresses. |
| `chainId`  | number | EVM chain ID — see `CHAINS.md` at repo root for valid values                                                                                                      |
| `decimals` | number | Token decimal places (typically 18; 6 for stablecoins like USDC/USDT)                                                                                             |
| `logoURI`  | string | `https://files.sablier.com/tokens/{FILENAME}.png` — usually matches symbol, but may differ for special characters (see SKILL.md step 4)                           |
| `name`     | string | Full token name (e.g., "USD Coin")                                                                                                                                |
| `symbol`   | string | Token ticker symbol — preserve casing from the metadata source (e.g., "USDC", "wstETH", "cbETH")                                                                  |

### Example

```json
{
  "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "chainId": 1,
  "decimals": 6,
  "logoURI": "https://files.sablier.com/tokens/USDC.png",
  "name": "USD Coin",
  "symbol": "USDC"
}
```

## Solana (SPL)

```json
{
  "address": "...",
  "chainId": 900000010,
  "cluster": "mainnet-beta",
  "decimals": 6,
  "logoURI": "https://files.sablier.com/tokens/{FILENAME}.png",
  "name": "Token Name",
  "program": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  "symbol": "SYMBOL"
}
```

> **Note:** Adjust `chainId` and `cluster` based on the target cluster. The template above shows mainnet-beta values.
> For devnet, use `chainId: 900000020` and `cluster: "devnet"`. See the Solana section of `CHAINS.md` for valid pairs.

### Field Descriptions

| Field      | Type   | Description                                                                                                          |
| ---------- | ------ | -------------------------------------------------------------------------------------------------------------------- |
| `address`  | string | SPL token mint address (Base58 encoded)                                                                              |
| `chainId`  | number | Sablier-specific chain ID — see `CHAINS.md` for valid values                                                         |
| `cluster`  | string | Solana cluster: `mainnet-beta` or `devnet`                                                                           |
| `decimals` | number | Token decimal places                                                                                                 |
| `logoURI`  | string | `https://files.sablier.com/tokens/{FILENAME}.png` (see SKILL.md step 4)                                              |
| `name`     | string | Full token name                                                                                                      |
| `program`  | string | SPL Token program address — optional in the TypeScript type but always include explicitly (see Token Programs below) |
| `symbol`   | string | Token ticker symbol — preserve casing from the metadata source                                                       |

### Token Programs

| Program    | Address                                       |
| ---------- | --------------------------------------------- |
| SPL Token  | `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA` |
| Token-2022 | `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb` |

Use the SPL Token program by default. Use Token-2022 only for tokens explicitly deployed on the Token-2022 program.
Always include this field explicitly in new entries.

### Example

```json
{
  "address": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "chainId": 900000010,
  "cluster": "mainnet-beta",
  "decimals": 6,
  "logoURI": "https://files.sablier.com/tokens/USDC.png",
  "name": "USD Coin",
  "program": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  "symbol": "USDC"
}
```
