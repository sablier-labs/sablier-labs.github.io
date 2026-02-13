---
argument-hint: "<chain-or-cluster> <address>"
description: List a new token in the Sablier token list
---

## Context

- Working directory: !`pwd`
- Arguments: $ARGUMENTS
- See CHAINS.md for supported chains and clusters

## Your Task

Add a new token to the Sablier token list using the `token-listing` skill.

### Syntax

```
/list-token <chain-or-cluster> <address>
```

### Examples

```bash
# EVM
/list-token base 0xcb17C9Db87B595717C857a08468793f5bAb6445F
/list-token arbitrum 0x912CE59144191C1204E64559FE8253a0e49E6548

# Solana
/list-token solana EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
```

### Network Detection

Auto-detect network from address format:

- **EVM**: Address starts with `0x` → lookup chain ID in CHAINS.md
- **Solana**: Base58 address (no `0x` prefix) → lookup cluster ID in CHAINS.md
  - Accept `solana` as an alias for `mainnet-beta`

If chain/cluster name is not found, report error with available options from CHAINS.md.

Follow the workflow defined in the `token-listing` skill.
