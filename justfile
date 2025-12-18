# See https://github.com/sablier-labs/devkit/blob/main/just/base.just
import "./node_modules/@sablier/devkit/just/base.just"

# ---------------------------------------------------------------------------- #
#                                   CONSTANTS                                  #
# ---------------------------------------------------------------------------- #

GLOBS_PRETTIER := "\"**/*.{html,md,svg,yaml,yml}\""

# ---------------------------------------------------------------------------- #
#                                    SCRIPTS                                   #
# ---------------------------------------------------------------------------- #

# Default recipe
default:
    just --list

# Build all token lists (EVM and Solana)
@build:
    just build-evm
    just build-solana
alias b := build

# Build EVM token list
@build-evm:
    na tsx scripts/token-list/write.ts > token-list/evm.json
    echo '{{ GREEN }}✓ EVM token list built successfully'

# Build Solana token list
@build-solana:
    na tsx scripts/token-list/write-solana.ts > token-list/solana.json
    echo '{{ GREEN }}✓ Solana token list built successfully'

# Clean the generated files
@clean globs="token-list/evm.json token-list/solana.json":
    nlx del-cli {{ globs }}

# Sort tokens alphabetically by symbol
@sort-tokens:
    na tsx scripts/token-list/sort-tokens.ts

# Run all tests
@test *args:
    na vitest run {{ args }}
alias t := test

# Run all tests as they run in CI (i.e. include CI-only tests)
@test-all *args:
    CI=true na vitest run {{ args }}
alias ta := test-all
alias ci := test-all
