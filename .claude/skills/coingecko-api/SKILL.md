---
name: CoinGecko API
description: This skill should be used when the user asks to "get token metadata", "fetch token info", "check token logo", "query CoinGecko", "lookup token by address", or mentions CoinGecko API, token metadata lookup, or token logo retrieval.
---

# CoinGecko API

## Overview

Query token metadata using CoinGecko's API. This skill covers:

- Token metadata lookup by contract address
- Token logo retrieval
- Token price queries
- Multi-chain support via the `platform` parameter

**Scope:** This skill focuses on token data queries for the Demo (free) tier. For other CoinGecko API features, consult the fallback documentation.

## Prerequisites

### API Key Validation

Before making any API call, verify the `COINGECKO_API_KEY` environment variable is set:

```bash
if [ -z "$COINGECKO_API_KEY" ]; then
  echo "Error: COINGECKO_API_KEY environment variable is not set."
  echo "Get a free API key at: https://www.coingecko.com/en/api/pricing"
  exit 1
fi
```

If the environment variable is missing, inform the user and halt execution.

## API Base URL

All requests use the Demo tier endpoint:

```
https://api.coingecko.com/api/v3
```

The `x_cg_demo_api_key` query parameter authenticates requests.

## Token Data by Contract Address

Query detailed token metadata including name, symbol, description, and logos.

### Endpoint Parameters

| Parameter          | Required | Description                        |
| ------------------ | -------- | ---------------------------------- |
| `platform`         | Yes      | Asset platform ID (see PLATFORMS.md) |
| `contract_address` | Yes      | Token contract address             |

### Example Query

```bash
curl -s "https://api.coingecko.com/api/v3/coins/ethereum/contract/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48?x_cg_demo_api_key=$COINGECKO_API_KEY"
```

### Response Format

```json
{
  "id": "usd-coin",
  "symbol": "usdc",
  "name": "USDC",
  "image": {
    "thumb": "https://coin-images.coingecko.com/.../thumb/usdc.png",
    "small": "https://coin-images.coingecko.com/.../small/usdc.png",
    "large": "https://coin-images.coingecko.com/.../large/usdc.png"
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

## Token Price Query

Query current token price in specified currencies.

### Endpoint Parameters

| Parameter            | Required | Description                          |
| -------------------- | -------- | ------------------------------------ |
| `platform`           | Yes      | Asset platform ID (see PLATFORMS.md) |
| `contract_addresses` | Yes      | Token contract address(es)           |
| `vs_currencies`      | Yes      | Target currency (e.g., `usd`, `eth`) |

### Example Query

```bash
curl -s "https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48&vs_currencies=usd&x_cg_demo_api_key=$COINGECKO_API_KEY"
```

### Response Format

```json
{
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": {
    "usd": 0.999821
  }
}
```

## Token Logo

The API response includes logo URLs in the `image` object:

| Field         | Typical Size |
| ------------- | ------------ |
| `image.thumb` | 25x25 px     |
| `image.small` | 50x50 px     |
| `image.large` | 200x200 px   |

## Multi-Chain Usage

Specify the `platform` path parameter to query different blockchains.

### Common Platform IDs

| Chain        | Platform ID           | Chain ID |
| ------------ | --------------------- | -------- |
| Ethereum     | `ethereum`            | `1`      |
| Polygon      | `polygon-pos`         | `137`    |
| Arbitrum One | `arbitrum-one`        | `42161`  |
| Optimism     | `optimistic-ethereum` | `10`     |
| Base         | `base`                | `8453`   |
| Solana       | `solana`              | N/A      |

### Example: Polygon Query

```bash
curl -s "https://api.coingecko.com/api/v3/coins/polygon-pos/contract/0x...?x_cg_demo_api_key=$COINGECKO_API_KEY"
```

For the complete list of supported platforms, see `references/PLATFORMS.md`.

## Error Handling

### Common Error Responses

| Status | Cause                                 |
| ------ | ------------------------------------- |
| `401`  | Invalid or missing API key            |
| `404`  | Token not found on specified platform |
| `429`  | Rate limit exceeded                   |

### Rate Limits (Demo Tier)

- 30 calls/minute
- 10,000 calls/month

If rate limited, wait 60 seconds before retrying.

## Reference Files

- **`references/PLATFORMS.md`** - Complete list of asset platform IDs with chain mappings

## Fallback Documentation

For use cases not covered by this skill (market data, exchanges, trending, etc.), fetch the AI-friendly documentation:

```
https://docs.coingecko.com/llms.txt
```

Use `WebFetch` to retrieve this documentation for extended API capabilities.
