---
argument-hint: "<network> <chain-or-cluster> <address>"
description: List a new token in the Sablier token list
---

## Context

- Working directory: !`pwd`
- Arguments: $ARGUMENTS
- See CHAINS.md for supported chains and clusters

## Your Task

Add a new token to the Sablier token list.

### Syntax

**EVM:**

```
/list-token evm <chain> <address>
```

Where `<chain>` is a chain name from CHAINS.md (case-insensitive).

**Solana:**

```
/list-token solana <cluster> <address>
```

Where `<cluster>` is a cluster name from CHAINS.md.

### Examples

```bash
# EVM
/list-token evm base 0xcb17C9Db87B595717C857a08468793f5bAb6445F
/list-token evm arbitrum 0x912CE59144191C1204E64559FE8253a0e49E6548

# Solana
/list-token solana mainnet-beta EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
```

### Mode Detection

**If first arg is `evm`:**

- Activate the `listing-evm-tokens` skill
- Parse: chain name (2nd arg) → lookup chain ID in CHAINS.md
- Parse: address (3rd arg)

**If first arg is `solana`:**

- Activate the `listing-solana-tokens` skill
- Parse: cluster name (2nd arg) → lookup cluster ID in CHAINS.md
- Parse: address (3rd arg)

If chain/cluster name is not found, report error with available options from CHAINS.md.

Follow the workflow defined in the activated skill.
