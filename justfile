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


# Build token list
@build:
    na tsx scripts/token-list/write.ts > token-list/evm.json
alias b := build
alias build-token-list := build

# Clean the generated files
@clean globs="token-list/evm.json":
    nlx del-cli {{ globs }}

# Sort tokens alphabetically by symbol
@sort-tokens:
    na tsx scripts/token-list/sort-tokens.ts

# Run all tests
[group("test")]
test *args:
    na vitest run {{ args }}
alias t := test
