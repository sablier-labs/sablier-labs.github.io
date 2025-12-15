![Sablier Branding](/banners/banner-files.png)

This repository serves as Sablier's static asset distribution hub and token list infrastructure, hosted at
[files.sablier.com](https://files.sablier.com).

## Contents

- **Token Lists**:
  - EVM: Comprehensive EVM token metadata for Sablier integrations (689 tokens across 32 chains)
  - Solana: Solana SPL token metadata for Sablier integrations (6 tokens across 2 clusters)
- **Static Assets**: Logos, icons, chain graphics, and legal documents
- **Templates**: CSV templates for stream configurations (linear, exponential, cliff, etc.)

## Token Lists

File new token listing requests through the
[dedicated issue templates](https://github.com/sablier-labs/sablier-labs.github.io/issues/new/choose) in this
repository.

### EVM

The canonical EVM token list is available at:

```
https://files.sablier.com/token-list/evm.json
```

This list is automatically built and validated via CI/CD, ensuring all token addresses are checksummed and metadata is
accurate.

> [!IMPORTANT]
>
> Sablier supports any ERC-20 token that follows the standard interface. Tokens with custom mechanics, like rebasing
> assets (e.g. Aave’s aTokens) or fee-on-transfer tokens, are not recommended.

### Solana

The canonical Solana token list is available at:

```
https://files.sablier.com/token-list/solana.json
```

This list includes SPL tokens across Solana clusters (mainnet-beta, devnet) and follows the Uniswap token list standard.

### Development

Prerequisites: Node.js >=18

```bash
# Install dependencies
ni

# Build all token lists (EVM and Solana)
just build

# Build EVM token list only
just build-evm

# Build Solana token list only
just build-solana

# Run validation suite
just test

# Run specific tests
just test-checksums
just test-duplicates
just test-schema
just test-metadata

# Clean generated files
just clean
```

### Validation

The CI pipeline automatically validates:

- **Schema compliance**: Conforms to Uniswap token list standard
- **Checksums**: All addresses are valid and checksummed
- **Duplicates**: No duplicate addresses, symbols, or names
- **Decimals**: Token decimals match on-chain data (via RouteMesh RPC)
- **Metadata**: Version matches package.json

## Static Assets

### Branding

- **Logo**: `logo.png`, `logo.svg`
- **Icons**: `favicon.ico`, `icon-*.png`
- **Banners**: `banners/`

For marketing materials, see the [sablier-labs/branding](https://github.com/sablier-labs/branding) repository.

### Chain Icons

Located in `chains/`, available in both PNG and WebP formats for all supported networks.

### Token Logos

Located in `tokens/`, referenced in the token list via the `logoURI` field.

### Legal Documents

- Privacy Policy: `privacy-policy.pdf`
- Terms of Service: `terms-of-service.pdf`
- Risk Notice: `risk-notice.pdf`

## Templates

CSV templates for creating vesting streams are available in two locations:

### `template/v1.0.0/` (Canonical)

Versioned templates with timing-first directory structure:

```
template/v1.0.0/{timing}/{shape}.csv
```

**URL pattern**: `https://files.sablier.com/template/v1.0.0/{timing}/{shape}.csv`

**Examples:**

- `template/v1.0.0/duration/linear.csv`
- `template/v1.0.0/range/cliff-exponential.csv`

**Available shapes**: backweighted, cliff, cliff-exponential, double-unlock, exponential, linear, monthly, stepper,
timelock, unlock-cliff, unlock-linear

**Timing types**: `duration/` and `range/`

**Versioning**: Bump the version (e.g., `v1.1.0`, `v2.0.0`) when CSV schema changes. Previous versions remain available
for backward compatibility.

### `templates/` (Legacy)

Historical templates with varying naming conventions. Kept for backward compatibility with existing integrations.
Contains airdrops, airstreams, and legacy vesting templates organized by year.

## Domain

The canonical domain is [files.sablier.com](https://files.sablier.com), also accessible via
[sablier-labs.github.io](https://sablier-labs.github.io).

## Jekyll

GitHub Pages uses Jekyll for building. By default, Jekyll excludes files/folders starting with `.` or `_`. For
customization, see the `_config.yml` file.
