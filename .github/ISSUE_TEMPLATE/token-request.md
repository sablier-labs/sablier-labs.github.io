---
about: Request token listing in the Sablier UI
assignees: "maxdesalle"
labels: ["token-request"]
name: Token Request
title: "Add {TOKEN_SYMBOL}: {TOKEN_NAME}"
---

<!-- Please provide the following information for your token. -->

## Chain Type

- [ ] EVM (Ethereum, Polygon, Arbitrum, Optimism, Base, BSC, Avalanche, Gnosis, etc.)
- [ ] Solana (Mainnet, Devnet, Testnet)

---

## Token Information

**IMPORTANT NOTES:**

- **EVM chains**: Native tokens (e.g., ETH, MATIC, AVAX) are not supported. You must use a wrapped ERC-20 version (e.g.,
  WETH, WMATIC, WAVAX).
- **Solana**: Native SOL is not supported. You must use wrapped SOL (WSOL) or another SPL token.

---

### Required Fields

- **Chain**: (e.g., Ethereum Mainnet, Polygon, Arbitrum, Solana Mainnet)

- **Token Address**:
  - _EVM_: **MUST** be [checksummed](https://ethsum.netlify.app/). We do NOT support non-checksummed addresses.
  - _Solana_: **MUST** be a valid base58-encoded SPL token address.

- **Token Name** (from contract):

- **Token Decimals** (from contract, PLEASE DOUBLE CHECK):

- **Token Symbol** (from contract):

- **Token Icon** (**MUST** be in PNG format, under 200x200 pixels. We do NOT support JPG):

- **Block Explorer Link**:
  - _EVM_: Etherscan / Polygonscan / Arbiscan / etc.
  - _Solana_: Solscan / Solana Explorer

- **Official Project Website**:

- **CoinGecko / CoinMarketCap Page** (if available):
