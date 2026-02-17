---
argument-hint: "<chain-or-cluster> <address>"
description: List a new token in the Sablier token list
---

## Context

- Working directory: !`pwd`
- Arguments: $ARGUMENTS
- Chain mappings: see `CHAINS.md` at repo root

## Task

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

# Solana ("solana" is an alias for "mainnet-beta")
/list-token solana EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
```

### Argument Validation

Require exactly 2 arguments. If fewer or more are provided, report usage and **stop**:

```
Usage: /list-token <chain-or-cluster> <address>
```

Parse arg1 as the chain or cluster name and arg2 as the token address. Follow the input resolution and workflow defined
in the `token-listing` skill.
