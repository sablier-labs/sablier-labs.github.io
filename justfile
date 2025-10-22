# See https://github.com/sablier-labs/devkit/blob/main/just/base.just
import "./node_modules/@sablier/devkit/just/base.just"

# ---------------------------------------------------------------------------- #
#                                 DEPENDENCIES                                 #
# ---------------------------------------------------------------------------- #

# ni: https://github.com/antfu-collective/ni
na := require("na")
ni := require("ni")
nlx := require("nlx")

# ---------------------------------------------------------------------------- #
#                                    SCRIPTS                                   #
# ---------------------------------------------------------------------------- #

# Default recipe
default:
    just --list

# Clean the generated files
@clean globs="token-list/evm.json":
    nlx del-cli {{ globs }}

# ---------------------------------------------------------------------------- #
#                                     BUILD                                    #
# ---------------------------------------------------------------------------- #

# Build token list
[group("build")]
@build:
    na tsx scripts/token-list/write.ts > token-list/evm.json

# Build token list (alias)
[group("build")]
build-token-list: build

# ---------------------------------------------------------------------------- #
#                                     TESTS                                    #
# ---------------------------------------------------------------------------- #

# Test all addresses are valid and checksummed
[group("test")]
@test-checksums:
    na vitest run -t 'all addresses are valid and checksummed'

# Verify token decimals against on-chain data
[group("test")]
@test-decimals:
    na tsx scripts/token-list/check-decimals.ts

# Test no duplicate addresses, symbols, or names
[group("test")]
@test-duplicates:
    na vitest run -t 'duplicate'

# Test version matches package.json
[group("test")]
@test-metadata:
    na vitest run -t 'version matches package.json'

# Test token list schema
[group("test")]
@test-schema:
    na vitest run -t 'validates token list'

# ---------------------------------------------------------------------------- #
#                                   UTILITIES                                  #
# ---------------------------------------------------------------------------- #

# Sort tokens alphabetically by symbol
@sort-tokens:
    na tsx scripts/token-list/sort-tokens.ts

# Run all tests
[group("test")]
test *args:
    na vitest run {{ args }}
alias t := test
