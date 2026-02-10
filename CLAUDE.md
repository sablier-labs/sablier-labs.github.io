# Development Instructions

AI agents working on this Sablier static files repository must follow these guidelines.

## Most Important Thing

After generating code, run these commands **in order**.

**File argument rules:**

- Changed fewer than 10 files? → Pass specific paths or globs
- Changed 10+ files? → Omit file arguments to process all files

**Command sequence:**

1. **Identify which file types changed** — determines which tools to use in steps 2-5

2. **`just prettier-write <files>`** — auto-fix Markdown/YAML (skip if none changed)

3. **`just biome-write <files>`** — auto-fix TypeScript/JSON (skip if none changed)

4. **`just prettier-check <files>`** — verify Markdown/YAML formatting (skip if none changed)

5. **`just biome-check <files>`** — verify TypeScript/JSON formatting (skip if none changed)

6. **`just tsc-check`** — verify TypeScript types (always run on entire project)

**Examples:**

```bash
# Fewer than 10 files: use specific paths
just prettier-write README.md CHANGELOG.md
just biome-write scripts/token-list/write.ts
just prettier-check README.md CHANGELOG.md
just biome-check scripts/token-list/write.ts

# Fewer than 10 files: use globs
just prettier-write "*.md"
just biome-write "scripts/**/*.ts"
just prettier-check "*.md"
just biome-check "scripts/**/*.ts"

# 10+ files: omit file arguments
just prettier-write
just biome-write
just prettier-check
just biome-check

# TypeScript check always runs on entire project
just tsc-check
```

If any command fails, analyze the errors and fix them before continuing.

## Tech Stack

- **Language**: TypeScript (strict mode)
- **Package Manager**: pnpm (via ni utility)
- **Task Runner**: just (casey/just)
- **Linter and Formatter for TypeScript and JSON**: Biome (not Prettier)
- **Formatter for Markdown and YAML**: Prettier
- **Testing**: Vitest

## Commands

### Dependency Management

```bash
ni                   # Install all dependencies
ni package-name      # Add dependency
nun package-name     # Remove dependency
nlx package-name     # Execute package
```

### Development Workflow

```bash
just build           # Build all token lists (generates evm.json and solana.json)
just build-evm       # Build EVM token list only (generates token-list/evm.json)
just build-solana    # Build Solana token list only (generates token-list/solana.json)
just test            # Run all validation tests
just clean           # Remove generated files
just sort-tokens     # Sort tokens alphabetically by symbol
```

### Quality Checks

```bash
just biome-check     # Lint and format check TypeScript/JSON
just biome-write     # Auto-fix TypeScript/JSON issues
just prettier-check  # Format check Markdown/YAML
just prettier-write  # Auto-fix Markdown/YAML formatting
just tsc-check       # TypeScript type validation
```

## Repository Structure

- **token-list/**: Token data and generated lists
  - **evm/**: EVM chain-specific token data (source)
  - **solana/**: Solana cluster-specific token data (source)
  - **evm.json**: Generated EVM token list
  - **solana.json**: Generated Solana token list
- **scripts/**: Build and validation scripts
- **tokens/**: Token logos
- **chains/**: Chain icons
- **template/**: Versioned vesting CSV templates (`v1.0.0/{timing}/{shape}.csv`)
- **templates/**: Legacy CSV templates (backward compatibility)
- **banners/**: Branding assets
