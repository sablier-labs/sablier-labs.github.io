---
name: listing-evm-tokens
description: Adds ERC-20 tokens to the Sablier token list. Use when listing EVM tokens or adding ERC-20 tokens.
---

# Listing EVM Tokens

## Overview

Add ERC-20 tokens to the Sablier token list by fetching metadata and inserting entries into chain-specific JSON files.

## Schema

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

## Workflow

1. **Check duplicates**: `grep -i "$ADDRESS" token-list/evm/*.json` — if found, report "Token already listed in {file}"
   and **STOP**
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
   - Download with `curl -L`, verify type with `file`, use correct extension (.jpg/.png)
   - JSON logoURI: `https://files.sablier.com/tokens/{SYMBOL}.{ext}`
6. **Generate entry**: Create JSON matching schema above, save to `token-list/evm/{chainId}.json`
7. **Insert**: Use jq to add entry (DO NOT read the entire file with Read tool):
   ```bash
   # Create temp file with new entry
   echo '{...new entry...}' > /tmp/new_token.json
   # Insert and sort alphabetically by symbol
   jq --slurpfile new /tmp/new_token.json '. + $new | sort_by(.symbol | ascii_downcase)' token-list/evm/{chainId}.json > /tmp/out.json && mv /tmp/out.json token-list/evm/{chainId}.json
   ```
8. **Build**: Run `just build-evm` to regenerate combined token list
9. **Quality checks**: Follow CLAUDE.md sequence for modified files
10. **Validate**: Run `just test` to verify token entry is valid
11. **Commit** (skip gitignored files): `list ${SYMBOL}` or `list ${SYMBOL} (closes #N)`
