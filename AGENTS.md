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

## Token Logos

Logos live flat in `tokens/`, are referenced as `https://files.sablier.com/tokens/{FILENAME}.png`, and are served from a
public CDN. `token-list/logos.test.ts` enforces the rules below, so `just test` catches violations before they ship.

| Rule                                                                      | Enforcement                                           |
| ------------------------------------------------------------------------- | ----------------------------------------------------- |
| Every `files.sablier.com` `logoURI` resolves to a file in `tokens/`       | Hard failure, no exceptions                           |
| Every file named `*.png` really is a PNG (checked by signature, not name) | Hard failure, no exceptions                           |
| No logo exceeds 150 KB                                                    | `approvedOversizedLogos` allowlist for legacy entries |

Adding a logo, in order of what matters:

1. **The file must exist.** A `logoURI` with no matching file is a live 404 for every client that renders the list. This
   is the failure that recurs, and it is invisible in review because the JSON looks fine on its own.
2. **Real PNG, not just a `.png` name.** Browsers sniff content type and render a mislabeled WebP or JPEG anyway, so
   this hides easily. Convert with `sips -s format png in.webp --out tokens/{FILENAME}.png`.
3. **Keep the published artwork as-is.** There is deliberately **no** standard dimension — 200×200 is the most common of
   many, and the repo also holds 32×32 through 512×512. Do not resize to match neighbouring entries. Downscale only
   genuine outliers above 512×512, with `sips -s format png -Z 256`.
4. **Square is preferred but not enforced.** Consumers render logos in square frames, so a lopsided source distorts.

Do not delete unreferenced logos in `tokens/`. This repository is a public CDN and third parties hotlink these files
directly, so removing one is a breaking change rather than cleanup.

Do not infer that a logo is unreferenced by grepping for its filename. `new-ui` constructs CDN paths at runtime from
`core/isomorphic/tokens/images/known.ts`'s `KNOWN_TOKEN_LOGOS_BY_SYMBOL`,
`landing/app/(solutions)/_shared/configs/brand-logos.ts`'s `BRAND_LOGO_IDS`, and the exported entries in
`core/isomorphic/chains/registry.ts`. Run `new-ui/core/isomorphic/tokens/images/cdn-assets.test.ts` against this
checkout before deleting an asset.

To source a logo, use the `list-token` skill (`.agents/skills/list-token/`). When aggregators have nothing — routine for
recently launched tokens — its `references/onchain-logos.md` covers recovering the official image from the token's
creation calldata.

## Repository Structure

- **token-list/**: Token data and generated lists
  - **evm/**: EVM chain-specific token data (source)
  - **solana/**: Solana cluster-specific token data (source)
  - **evm.json**: Generated EVM token list
  - **solana.json**: Generated Solana token list
- **scripts/**: Build and validation scripts
- **tokens/**: Token logos (see [Token Logos](#token-logos))
- **chains/**: Chain icons
- **templates/**: CSV templates for streams
- **banners/**: Branding assets
