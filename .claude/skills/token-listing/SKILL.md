---
name: token-listing
description: Adds tokens to the Sablier token list. Supports EVM (ERC-20) and Solana (SPL) tokens.
---

# Listing Tokens

## Overview

Add tokens to the Sablier token list by fetching metadata and inserting entries into network-specific JSON files.

## Schemas

### EVM (ERC-20)

```json
{
  "address": "0x...",
  "chainId": 1,
  "decimals": 18,
  "logoURI": "https://files.sablier.com/tokens/{SYMBOL}.{ext}",
  "name": "Token Name",
  "symbol": "SYMBOL"
}
```

### Solana (SPL)

```json
{
  "address": "...",
  "chainId": 900000010,
  "cluster": "mainnet-beta",
  "decimals": 6,
  "logoURI": "https://files.sablier.com/tokens/{SYMBOL}.{ext}",
  "name": "Token Name",
  "program": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA", // Token-2022: TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
  "symbol": "SYMBOL"
}
```

## Network-Specific Paths

| Network | Source files                       | Build command       |
| ------- | ---------------------------------- | ------------------- |
| EVM     | `token-list/evm/{chainId}.json`    | `just build-evm`    |
| Solana  | `token-list/solana/{cluster}.json` | `just build-solana` |

## Workflow

1. **Check duplicates**: Search for address in the appropriate directory
   - EVM: `grep -i "$ADDRESS" token-list/evm/*.json`
   - Solana: `grep -i "$ADDRESS" token-list/solana/*.json`

   If found, report "Token already listed in {file}" and **STOP**

2. **Search GitHub issues**:

   ```bash
   gh issue list --search "$ADDRESS" --repo sablier-labs/sablier-labs.github.io --state all --json number,title,state,body --limit 5
   ```

   - If open issue found: extract metadata for schema fields → skip step 3
   - If closed issue found: check comments for rejection reasons
   - Store issue number for commit message: `list ${SYMBOL} (closes #N)`

3. **Check CoinGecko** (if no issue or missing metadata): Use `coingecko-api` skill to fetch missing schema fields

4. **Fallback**: If still missing metadata, ask user for missing fields. Do NOT improvise with RPC calls

5. **Logo** (first available): GitHub issue image → CoinGecko logo → existing `tokens/{SYMBOL}.*`
   - All logos stored flat in `tokens/` directory (not chain-specific subdirectories)
   - **IMPORTANT: Use `image.thumb` from CoinGecko (25x25 px) - NOT `large` or `small`**
   - Download with `curl -L`, verify type with `file`, use correct extension (.jpg/.png)
   - JSON logoURI: `https://files.sablier.com/tokens/{SYMBOL}.{ext}`

6. **Generate entry**: Create JSON matching the appropriate schema above

7. **Insert**: Read the target file, add the entry alphabetically by symbol (case-insensitive), and save

8. **Build**: Run the appropriate build command from the table above

9. **Quality checks**: Follow CLAUDE.md sequence for modified files

10. **Validate**: Run `just test` to verify token entry is valid

11. **Commit** (skip gitignored files): `list ${SYMBOL}` or `list ${SYMBOL} (closes #N)`
