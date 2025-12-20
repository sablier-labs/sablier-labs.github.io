---
name: CoinGecko API
description:
  This skill should be used when the user asks to "get token metadata", "fetch token info", "check token logo", "query
  CoinGecko", "lookup token by address", or mentions CoinGecko API, token metadata lookup, or token logo retrieval.
---

# CoinGecko API

## Overview

Query token metadata using CoinGecko's API. This skill covers:

- Token metadata lookup by contract address
- Token logo retrieval
- Token list queries (Uniswap-compatible)
- Multi-chain support

**Scope:** This skill focuses on token data queries for the Demo (free) tier. For other CoinGecko API features, consult
the fallback documentation.

## API Tiers

CoinGecko offers two API tiers:

| Tier | Base URL                               | Rate Limit     | Auth Parameter      |
| ---- | -------------------------------------- | -------------- | ------------------- |
| Demo | `https://api.coingecko.com/api/v3`     | 30 calls/min   | `x_cg_demo_api_key` |
| Pro  | `https://pro-api.coingecko.com/api/v3` | Plan-dependent | `x-cg-pro-api-key`  |

## Token Lookup Methods

### Demo API (Requires Free API Key)

For detailed token data including description, market cap, and social links.

#### Prerequisites

Set `COINGECKO_API_KEY` in `.env`. Get a free key at: https://www.coingecko.com/en/api/pricing

#### Token Data by Contract Address

```bash
curl -s "https://api.coingecko.com/api/v3/coins/{platform}/contract/{contract_address}?x_cg_demo_api_key=$COINGECKO_API_KEY"
```

**Parameters:**

| Parameter          | Required | Description                             |
| ------------------ | -------- | --------------------------------------- |
| `platform`         | Yes      | Asset platform ID (see reference below) |
| `contract_address` | Yes      | Token contract address                  |

**Response Fields (selected):**

```json
{
  "id": "usd-coin",
  "symbol": "usdc",
  "name": "USDC",
  "image": {
    "thumb": "https://assets.coingecko.com/.../thumb/usdc.png",
    "small": "https://assets.coingecko.com/.../small/usdc.png",
    "large": "https://assets.coingecko.com/.../large/usdc.png"
  },
  "description": { "en": "..." },
  "detail_platforms": {
    "ethereum": {
      "decimal_place": 6,
      "contract_address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
    }
  }
}
```

## Asset Platform IDs

For contract address queries, use these platform identifiers:

| Chain      | Platform ID           | Chain ID |
| ---------- | --------------------- | -------- |
| Ethereum   | `ethereum`            | `1`      |
| Polygon    | `polygon-pos`         | `137`    |
| Arbitrum   | `arbitrum-one`        | `42161`  |
| Optimism   | `optimistic-ethereum` | `10`     |
| Base       | `base`                | `8453`   |
| Avalanche  | `avalanche`           | `43114`  |
| BNB Chain  | `binance-smart-chain` | `56`     |
| Gnosis     | `xdai`                | `100`    |
| Fantom     | `fantom`              | `250`    |
| zkSync Era | `zksync`              | `324`    |
| Linea      | `linea`               | `59144`  |
| Scroll     | `scroll`              | `534352` |
| Blast      | `blast`               | `81457`  |

For the complete list, see `references/PLATFORMS.md`.

## Token Logo

The API response includes logo URLs in the `image` object:

| Field         | Typical Size |
| ------------- | ------------ |
| `image.thumb` | 25x25 px     |
| `image.small` | 50x50 px     |
| `image.large` | 200x200 px   |

## Token Price Query

```bash
curl -s "https://api.coingecko.com/api/v3/simple/token_price/{platform}?contract_addresses={address}&vs_currencies=usd&x_cg_demo_api_key=$COINGECKO_API_KEY"
```

**Response:**

```json
{
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": {
    "usd": 0.999821
  }
}
```

## Error Handling

### Common Errors

| Status | Cause                                 |
| ------ | ------------------------------------- |
| `404`  | Token not found on specified platform |
| `429`  | Rate limit exceeded (wait 60 seconds) |
| `401`  | Invalid or missing API key            |

### Rate Limits (Demo Tier)

- 30 calls/minute
- 10,000 calls/month

If rate limited, wait 60 seconds before retrying.

## Reference Files

- **`references/PLATFORMS.md`** - Complete list of asset platform IDs

## Fallback Documentation

For use cases not covered by this skill, fetch the AI-friendly documentation:

```
https://docs.coingecko.com/llms.txt
```

Use `WebFetch` to retrieve this documentation for extended API capabilities.
