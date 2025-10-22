# Token List Consolidation Migration Runbook

## Executive Summary

### What This Migration Does

This migration consolidates the Sablier EVM token list infrastructure from a standalone repository (`evm-token-list`) into the main `files` repository. The token list build system, validation scripts, tests, and token data will be integrated into a single repository that already hosts static assets for the Sablier ecosystem.

### Why We're Doing It

**Current Pain Points:**

- **Repository Fragmentation**: Token list maintenance requires context switching between two repositories
- **Deployment Complexity**: Separate CI/CD pipelines and GitHub Pages deployments
- **Maintenance Overhead**: Duplicate configuration files, workflows, and tooling
- **Developer Experience**: New contributors must navigate multiple repositories

**Benefits:**

- **Unified Codebase**: Single source of truth for all Sablier static assets
- **Simplified Deployment**: One deployment pipeline for all static content
- **Reduced Maintenance**: Consolidated configuration and tooling
- **Better Developer Experience**: Easier onboarding and contribution process
- **Consistent Tooling**: Shared dependencies and scripts across all asset types

### Timeline Estimate

- **Preparation**: 15 minutes
- **Migration Execution**: 20 minutes
- **Testing & Validation**: 30 minutes
- **Deployment & Monitoring**: 45 minutes
- **Total**: ~2 hours

## Current Architecture

### Two-Repository Setup

**Repository 1: `sablier-labs/evm-token-list`**

- **Purpose**: ERC-20 token list management
- **Location**: `/Users/prb/Sablier/evm/evm-token-list`
- **Structure**:
  ```
  evm-token-list/
  ├── src/
  │   ├── tokens/          # Token JSON files by chain
  │   ├── buildList.js     # Token list builder
  │   └── write.js         # Build output writer
  ├── scripts/
  │   ├── check-decimals.sh
  │   └── sort-tokens.mjs
  ├── test/
  │   └── list.test.js
  ├── build/
  │   └── tokenlist.json   # Generated token list
  └── .github/workflows/
      ├── cd.yml           # Deploy to GitHub Pages + IPFS
      ├── ci-test.yml
      └── ci-decimals.yml
  ```
- **Deployment**: GitHub Pages at `evm-token-list.sablier.com`
- **Dependencies**: Mocha, Chai, AJV, Uniswap token-lists, ethersproject

**Repository 2: `sablier-labs/files`**

- **Purpose**: Static assets (logos, icons, legal docs)
- **Location**: `/Users/prb/Sablier/files`
- **Structure**:
  ```
  files/
  ├── tokens/              # Token icons
  ├── chains/              # Chain icons
  ├── templates/           # Flow templates
  ├── banners/             # Marketing banners
  ├── scripts/
  │   └── auto-listing.js  # Directory listing
  └── [various PDFs and images]
  ```
- **Deployment**: GitHub Pages at `files.sablier.com`

### Current Data Flow

1. Developer adds/updates token in `evm-token-list/src/tokens/*.json`
2. CI runs validation (decimals check, schema validation)
3. Build script generates `build/tokenlist.json`
4. GitHub Actions deploys to GitHub Pages and IPFS
5. Sablier Interface pulls token list from `evm-token-list.sablier.com`
6. Token icons are pulled separately from `files.sablier.com/tokens/`

### Pain Points Being Addressed

1. **Split Asset Management**: Token data and token icons live in different repositories
2. **Duplicate Configuration**: Both repos have similar Prettier, Biome, and workflow configs
3. **Complex Contribution**: Adding a new token requires PRs to both repositories
4. **Fragmented Documentation**: README and contribution guides split across repos
5. **Deployment Coordination**: Changes requiring both repos need synchronized releases

## New Architecture

### Unified Repository Structure

```
files/
├── lists/                          # Token list data (NEW)
│   ├── abstract-mainnet.json
│   ├── arbitrum-mainnet.json
│   ├── [... all chain tokens ...]
│   └── build/
│       └── tokenlist.json         # Generated token list
├── scripts/
│   ├── migrate-token-list.sh      # This migration script
│   ├── auto-listing.js            # Existing directory listing
│   └── token-list/                # Token list scripts (NEW)
│       ├── buildList.js
│       ├── write.js
│       ├── check-decimals.sh
│       └── sort-tokens.mjs
├── test/                          # Test directory (NEW)
│   └── token-list.test.js
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   └── token-request.md       # Token request template (NEW)
│   └── workflows/                 # GitHub Actions (NEW)
│       ├── token-list-cd.yml
│       ├── token-list-ci-test.yml
│       └── token-list-ci-decimals.yml
├── tokens/                        # Existing token icons
├── chains/                        # Existing chain icons
├── templates/                     # Existing flow templates
└── [existing assets...]
```

### New Data Flow

1. Developer adds/updates token in `files/lists/*.json`
2. CI runs validation (decimals check, schema validation)
3. Build script generates `lists/build/tokenlist.json`
4. GitHub Actions deploys to GitHub Pages at `files.sablier.com`
5. Sablier Interface pulls token list from `files.sablier.com/lists/build/tokenlist.json`
6. Token icons are pulled from `files.sablier.com/tokens/` (no change)
7. All assets served from single domain

### Benefits Over Current Setup

**For Developers:**

- Single repository to clone and understand
- One set of dependencies to manage
- Unified code style and tooling
- Simpler contribution workflow

**For Operations:**

- Single CI/CD pipeline to maintain
- One GitHub Pages deployment
- Consolidated secrets management
- Unified monitoring and logging

**For Users:**

- Faster load times (same domain for all assets)
- More reliable (fewer moving parts)
- Consistent availability (single deployment)

## Pre-Migration Checklist

### Repository Access Verification

```bash
# Verify source repository exists
ls -la /Users/prb/Sablier/evm/evm-token-list

# Verify target repository exists
ls -la /Users/prb/Sablier/files

# Verify you're on the correct branch in target repo
cd /Users/prb/Sablier/files
git status
git branch
```

**Expected Output:**

- Source directory exists with `src/`, `scripts/`, `test/`, `.github/` directories
- Target directory exists with `tokens/`, `chains/`, `templates/` directories
- Target repo is on `main` branch with clean working directory

### Backup Current Data

```bash
# Create backup directory
mkdir -p ~/sablier-migration-backup-$(date +%Y%m%d)

# Backup source repository
cd /Users/prb/Sablier/evm/evm-token-list
tar -czf ~/sablier-migration-backup-$(date +%Y%m%d)/evm-token-list-backup.tar.gz .

# Backup target repository
cd /Users/prb/Sablier/files
tar -czf ~/sablier-migration-backup-$(date +%Y%m%d)/files-backup.tar.gz .

# Verify backups
ls -lh ~/sablier-migration-backup-$(date +%Y%m%d)/
```

**Expected Output:**

```
-rw-r--r--  1 user  staff   2.5M Oct 22 10:00 evm-token-list-backup.tar.gz
-rw-r--r--  1 user  staff    45M Oct 22 10:00 files-backup.tar.gz
```

### Verify Dependencies Installed

```bash
# Check Bun
bun --version

# Check jq
jq --version

# Check fd
fd --version

# Check rg (ripgrep)
rg --version

# Check prettier
prettier --version

# Check git
git --version
```

**Required Versions:**

- Bun: 1.0.0 or higher
- jq: 1.6 or higher
- fd: 8.0.0 or higher
- rg: 13.0.0 or higher
- prettier: 3.0.0 or higher
- git: 2.30.0 or higher

**If any are missing:**

```bash
# Install with Homebrew (macOS)
brew install bun jq fd ripgrep prettier git
```

### Test Environment Setup

```bash
# Verify Node.js/Bun can run
cd /Users/prb/Sablier/evm/evm-token-list
bun install
bun run test

# Should complete without errors
```

### Create Feature Branch

```bash
cd /Users/prb/Sablier/files

# Create and checkout feature branch
git checkout -b feat/consolidate-token-list

# Verify branch
git branch --show-current
```

**Expected Output:** `feat/consolidate-token-list`

## Migration Steps

### Step 1: Run Migration Script

The migration script automates the majority of file copying and path updates.

#### Dry Run (Recommended First)

```bash
cd /Users/prb/Sablier/files
./scripts/migrate-token-list.sh --dry-run
```

**Expected Output:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Token List Migration Script
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Running in DRY-RUN mode - no changes will be made

Source: /Users/prb/Sablier/evm/evm-token-list
Target: /Users/prb/Sablier/files

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Step 1: Creating Directory Structure
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ [DRY-RUN] Would create: /Users/prb/Sablier/files/lists
✓ [DRY-RUN] Would create: /Users/prb/Sablier/files/scripts/token-list
✓ [DRY-RUN] Would create: /Users/prb/Sablier/files/test
...
```

**Review the dry run output carefully.** Ensure:

- All expected directories will be created
- All token files will be copied
- Path updates look correct
- No unexpected warnings

#### Execute Migration

```bash
cd /Users/prb/Sablier/files
./scripts/migrate-token-list.sh
```

**What This Does:**

1. Creates new directory structure (`lists/`, `scripts/token-list/`, `test/`)
2. Copies all token JSON files from source to `lists/`
3. Copies build scripts (`buildList.js`, `write.js`)
4. Copies validation scripts (`check-decimals.sh`, `sort-tokens.mjs`)
5. Copies test suite (`list.test.js` → `token-list.test.js`)
6. Copies configuration files (`.env.example`, `biome.jsonc`)
7. Copies GitHub issue template (`token-request.md`)
8. Updates file paths in all copied files
9. Generates summary report

**Expected Output:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Migration Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Files Copied: 42
  ✓ Token list: abstract-mainnet.json
  ✓ Token list: arbitrum-mainnet.json
  ...
  ✓ Build script: buildList.js
  ✓ Build script: write.js
  ✓ Validation script: check-decimals.sh
  ...

Files Modified: 4
  ✎ buildList.js
  ✎ write.js
  ✎ token-list.test.js
  ✎ check-decimals.sh

Manual Steps Required
  1. Add the above dependencies to package.json devDependencies
  2. Add the above scripts to package.json scripts section
  3. Run 'ni' to install new dependencies
```

#### Verification

```bash
# Verify directory structure
fd -t d . /Users/prb/Sablier/files/lists
fd -t d . /Users/prb/Sablier/files/scripts/token-list
fd -t d . /Users/prb/Sablier/files/test

# Count token files
fd -e json . /Users/prb/Sablier/files/lists --max-depth 1 | wc -l

# Verify scripts are executable
ls -la /Users/prb/Sablier/files/scripts/token-list/check-decimals.sh
ls -la /Users/prb/Sablier/files/scripts/token-list/sort-tokens.mjs
```

**Expected Results:**

- `lists/`, `scripts/token-list/`, `test/` directories exist
- 30+ token JSON files in `lists/`
- Scripts have executable permissions (`-rwxr-xr-x`)

#### Troubleshooting

**Problem: "Source repository not found"**

```bash
# Verify path
ls /Users/prb/Sablier/evm/evm-token-list

# If path is different, update the script or create symlink
ln -s /actual/path/to/evm-token-list /Users/prb/Sablier/evm/evm-token-list
```

**Problem: "File already exists" warnings**

- This is normal if re-running the script
- Use `--force` flag to overwrite: `./scripts/migrate-token-list.sh --force`
- Or manually remove conflicting files first

**Problem: Permission denied**

```bash
# Make script executable
chmod +x /Users/prb/Sablier/files/scripts/migrate-token-list.sh

# Re-run
./scripts/migrate-token-list.sh
```

### Step 2: Update package.json

The migration script outputs the required dependencies and scripts. You must manually merge these into `package.json`.

#### Check Current package.json

```bash
cd /Users/prb/Sablier/files

# Create package.json if it doesn't exist
if [ ! -f package.json ]; then
  echo '{
  "name": "@sablier/files",
  "version": "1.0.0",
  "private": true,
  "description": "Sablier static files hosting",
  "author": {
    "name": "Sablier Labs Ltd",
    "url": "https://sablier.com"
  },
  "license": "GPL-3.0-or-later",
  "scripts": {},
  "devDependencies": {}
}' > package.json
fi
```

#### Add Dependencies

Add these dependencies to the `devDependencies` section:

```bash
cd /Users/prb/Sablier/files

# Option 1: Use ni to add dependencies
ni -D @ethersproject/address@^5.8 \
      @uniswap/token-lists@^1.0.0-beta.34 \
      ajv@^8.17 \
      ajv-formats@^3.0 \
      chai@^5.2 \
      mocha@^11.1
```

**Option 2: Manual JSON editing**

Open `/Users/prb/Sablier/files/package.json` and add to `devDependencies`:

```json
{
  "devDependencies": {
    "@ethersproject/address": "^5.8",
    "@uniswap/token-lists": "^1.0.0-beta.34",
    "ajv": "^8.17",
    "ajv-formats": "^3.0",
    "chai": "^5.2",
    "mocha": "^11.1"
  }
}
```

**Note:** If the repo already has other devDependencies (like `prettier`, `@biomejs/biome`), preserve them.

#### Add Scripts

Add these scripts to the `scripts` section:

**Manual editing required:** Open `/Users/prb/Sablier/files/package.json`:

```json
{
  "scripts": {
    "build:token-list": "rm -rf lists/build/tokenlist.json && node scripts/token-list/write.js > lists/build/tokenlist.json",
    "test:token-list": "mocha test/token-list.test.js",
    "sort:tokens": "node scripts/token-list/sort-tokens.mjs",
    "check:decimals": "scripts/token-list/check-decimals.sh"
  }
}
```

**If there are existing scripts**, merge them:

```json
{
  "scripts": {
    "existing-script": "existing command",
    "build:token-list": "rm -rf lists/build/tokenlist.json && node scripts/token-list/write.js > lists/build/tokenlist.json",
    "test:token-list": "mocha test/token-list.test.js",
    "sort:tokens": "node scripts/token-list/sort-tokens.mjs",
    "check:decimals": "scripts/token-list/check-decimals.sh"
  }
}
```

#### Verification

```bash
# Verify package.json is valid JSON
cat package.json | jq .

# Check dependencies are listed
cat package.json | jq .devDependencies

# Check scripts are listed
cat package.json | jq .scripts
```

**Expected Output:** All dependencies and scripts should be present in the JSON output.

#### Troubleshooting

**Problem: JSON syntax error**

```bash
# Validate JSON
cat package.json | jq .

# If error, use a JSON validator or IDE to find the syntax issue
# Common issues: missing commas, trailing commas, mismatched brackets
```

**Problem: Dependency version conflicts**

- Check if dependencies already exist with different versions
- Use the versions from `evm-token-list` as they are tested
- If conflicts persist, prefer newer versions but plan to test thoroughly

### Step 3: Install Dependencies

```bash
cd /Users/prb/Sablier/files

# Install all dependencies
ni

# This will:
# - Read package.json
# - Download dependencies
# - Generate/update bun.lockb
```

**Expected Output:**

```
bun install v1.x.x
+ @ethersproject/address@5.8.x
+ @uniswap/token-lists@1.0.0-beta.34
+ ajv@8.17.x
+ ajv-formats@3.0.x
+ chai@5.2.x
+ mocha@11.1.x

200 packages installed [2.5s]
```

#### Verification

```bash
# Verify node_modules created
ls -la node_modules/

# Check specific dependencies installed
ls node_modules/@ethersproject/address
ls node_modules/@uniswap/token-lists
ls node_modules/mocha
ls node_modules/ajv

# Verify bun.lockb updated
ls -la bun.lockb
```

**Expected Results:**

- `node_modules/` directory exists with all dependencies
- `bun.lockb` file exists (or updated if it existed)
- No error messages about missing dependencies

#### Troubleshooting

**Problem: "Cannot find module" errors**

```bash
# Clear cache and reinstall
rm -rf node_modules bun.lockb
ni
```

**Problem: Network errors**

```bash
# Try with different registry
ni --registry https://registry.npmmirror.com

# Or use npm/pnpm as fallback
npm install
```

**Problem: Version conflicts**

```bash
# Check for peer dependency warnings
# Usually safe to ignore if they're warnings, not errors

# If errors, may need to adjust versions in package.json
```

### Step 4: Run Tests

Test the token list validation logic to ensure everything works.

```bash
cd /Users/prb/Sablier/files

# Run the token list tests
nr test:token-list
```

**Expected Output:**

```
  Token List Tests
    ✓ builds token list from JSON files
    ✓ validates token list schema
    ✓ validates token addresses are checksummed
    ✓ validates no duplicate addresses per chain
    ✓ validates all required fields present
    ✓ validates chain IDs match token chain IDs


  6 passing (250ms)
```

#### If Tests Fail

**Failure: "Cannot find module"**

```bash
# Path issue - verify the path updates in test file
cat test/token-list.test.js | rg "require\("

# Should show:
# require("../package.json")
# path.join(__dirname, "../lists/build/tokenlist.json")

# If incorrect, manually fix paths
```

**Failure: "Token list file not found"**

```bash
# Need to build first
nr build:token-list

# Then re-run tests
nr test:token-list
```

**Failure: Schema validation errors**

```bash
# Check token JSON files for issues
fd -e json . /Users/prb/Sablier/files/lists --exec cat {} | jq .

# Common issues:
# - Missing required fields (name, symbol, decimals, address, chainId)
# - Invalid addresses (not checksummed)
# - Wrong chainId values

# Fix individual files and re-test
```

#### Verification

```bash
# All tests should pass
# If any fail, do not proceed until fixed
nr test:token-list
echo $?
# Should output: 0 (success)
```

### Step 5: Build Token List

Generate the consolidated token list JSON file.

```bash
cd /Users/prb/Sablier/files

# Build the token list
nr build:token-list
```

**Expected Output:**

```bash
# Creates lists/build/tokenlist.json
# No error messages

# Should see JSON output (piped to file)
```

#### Verify Output

```bash
# Check file created
ls -la /Users/prb/Sablier/files/lists/build/tokenlist.json

# Check file size (should be substantial, 100KB+)
du -h /Users/prb/Sablier/files/lists/build/tokenlist.json

# Preview the structure
cat /Users/prb/Sablier/files/lists/build/tokenlist.json | jq . | head -50

# Validate token list schema
cat /Users/prb/Sablier/files/lists/build/tokenlist.json | jq '
  {
    name: .name,
    version: .version,
    tokens: (.tokens | length)
  }
'
```

**Expected Output:**

```json
{
  "name": "Sablier EVM Token List",
  "version": {
    "major": 1,
    "minor": 0,
    "patch": 0
  },
  "tokens": 250
}
```

**Verify Token Count:**

```bash
# Count tokens in build output
cat /Users/prb/Sablier/files/lists/build/tokenlist.json | jq '.tokens | length'

# Count source token files
fd -e json . /Users/prb/Sablier/files/lists --max-depth 1 --exec cat {} | jq '.tokens | length' | awk '{s+=$1} END {print s}'

# These should match (approximately)
```

#### Troubleshooting

**Problem: "Command not found: node"**

```bash
# Use bun instead
bun scripts/token-list/write.js > lists/build/tokenlist.json
```

**Problem: Empty or corrupted output**

```bash
# Check for JavaScript errors
node scripts/token-list/write.js

# Debug the build script
node --trace-warnings scripts/token-list/write.js

# Check token files are readable
fd -e json . lists --exec cat {} | jq empty
```

**Problem: Missing tokens**

```bash
# Verify all token files copied
diff <(fd -e json . /Users/prb/Sablier/evm/evm-token-list/src/tokens | wc -l) \
     <(fd -e json . /Users/prb/Sablier/files/lists --max-depth 1 | wc -l)

# Should be 0 (same count)
```

### Step 6: Update Frontend Integration

The Sablier Interface needs to be updated to pull from the new location.

**Note:** This step is for reference. Actual frontend update is in a separate repository.

#### Document the New Token List URL

The token list will be available at:

```
https://files.sablier.com/lists/build/tokenlist.json
```

#### Update Sablier Interface (Separate Task)

In the `v2-app` repository, update the token list URL:

**File to update:** `v2-app/src/constants/tokenLists.ts` (or similar)

**Change from:**

```typescript
export const SABLIER_TOKEN_LIST_URL = "https://evm-token-list.sablier.com/tokenlist.json";
```

**Change to:**

```typescript
export const SABLIER_TOKEN_LIST_URL = "https://files.sablier.com/lists/build/tokenlist.json";
```

#### Verification Checklist

**After frontend is updated:**

- [ ] Token list loads successfully in Sablier Interface
- [ ] All tokens display correctly
- [ ] Token icons still load from `files.sablier.com/tokens/`
- [ ] No CORS errors in browser console
- [ ] Token selection works as expected
- [ ] Chain filtering works correctly

### Step 7: GitHub Actions Setup

Create workflows for continuous integration and deployment.

#### Copy Workflow Files

The migration script does not copy workflows automatically. Copy them manually with updated paths.

**Create workflows directory:**

```bash
mkdir -p /Users/prb/Sablier/files/.github/workflows
```

#### Create CI Test Workflow

**File:** `/Users/prb/Sablier/files/.github/workflows/token-list-ci-test.yml`

```yaml
name: "Token List CI - Tests"

on:
  pull_request:
    paths:
      - 'lists/**'
      - 'scripts/token-list/**'
      - 'test/token-list.test.js'
      - '.github/workflows/token-list-ci-test.yml'
  workflow_call:

jobs:
  test:
    runs-on: "ubuntu-latest"
    steps:
      - name: "Check out the repo"
        uses: "actions/checkout@v4"

      - name: "Install Bun"
        uses: "oven-sh/setup-bun@v2"
        with:
          bun-version: "latest"

      - name: "Install dependencies"
        run: "bun install --frozen-lockfile"

      - name: "Run tests"
        run: "bun run test:token-list"

      - name: "Add summary"
        run: |
          echo "## Token List Tests" >> $GITHUB_STEP_SUMMARY
          echo "✅ Passed" >> $GITHUB_STEP_SUMMARY
```

#### Create CI Decimals Workflow

**File:** `/Users/prb/Sablier/files/.github/workflows/token-list-ci-decimals.yml`

```yaml
name: "Token List CI - Decimals"

env:
  ABSTRACT_MAINNET_RPC_URL: "https://api.mainnet.abs.xyz"
  ARBITRUM_MAINNET_RPC_URL: "https://arbitrum-mainnet.infura.io/v3/${{ secrets.API_KEY_INFURA }}"
  AVALANCHE_MAINNET_RPC_URL: "https://avalanche-mainnet.infura.io/v3/${{ secrets.API_KEY_INFURA }}"
  BASE_MAINNET_RPC_URL: "https://base-mainnet.infura.io/v3/${{ secrets.API_KEY_INFURA }}"
  BASE_SEPOLIA_RPC_URL: "https://base-sepolia.infura.io/v3/${{ secrets.API_KEY_INFURA }}"
  BERACHAIN_MAINNET_RPC_URL: "https://rpc.berachain.com"
  BLAST_MAINNET_RPC_URL: "https://blast-mainnet.infura.io/v3/${{ secrets.API_KEY_INFURA }}"
  BSC_MAINNET_RPC_URL: "https://bsc-mainnet.infura.io/v3/${{ secrets.API_KEY_INFURA }}"
  CHILIZ_MAINNET_RPC_URL: "https://chiliz.publicnode.com"
  ETHEREUM_MAINNET_RPC_URL: "https://mainnet.infura.io/v3/${{ secrets.API_KEY_INFURA }}"
  ETHEREUM_SEPOLIA_RPC_URL: "https://sepolia.infura.io/v3/${{ secrets.API_KEY_INFURA }}"
  FORM_MAINNET_RPC_URL: "https://form.calderachain.xyz/http"
  GNOSIS_MAINNET_RPC_URL: "https://gnosis-rpc.publicnode.com"
  HYPEREVM_MAINNET_RPC_URL: "https://rpc.hyperliquid.xyz/evm"
  IOTEX_MAINNET_RPC_URL: "https://iotex-network.rpc.thirdweb.com"
  LIGHTLINK_MAINNET_RPC_URL: "https://replicator.phoenix.lightlink.io/rpc/v1"
  LINEA_MAINNET_RPC_URL: "https://linea-mainnet.infura.io/v3/${{ secrets.API_KEY_INFURA }}"
  MODE_MAINNET_RPC_URL: "https://mode.drpc.org"
  MORPH_MAINNET_RPC_URL: "https://rpc-quicknode.morphl2.io"
  OPTIMISM_MAINNET_RPC_URL: "https://optimism-mainnet.infura.io/v3/${{ secrets.API_KEY_INFURA }}"
  POLYGON_MAINNET_RPC_URL: "https://polygon-mainnet.infura.io/v3/${{ secrets.API_KEY_INFURA }}"
  RONIN_MAINNET_RPC_URL: "https://ronin.drpc.org"
  RONIN_TESTNET_RPC_URL: "https://saigon-testnet.roninchain.com/rpc"
  SCROLL_MAINNET_RPC_URL: "https://scroll-mainnet.infura.io/v3/${{ secrets.API_KEY_INFURA }}"
  SEI_MAINNET_RPC_URL: "https://lb.routeme.sh/rpc/1329/${{ secrets.ROUTEME_API_KEY }}"
  SONIC_MAINNET_RPC_URL: "https://rpc.soniclabs.com"
  SOPHON_MAINNET_RPC_URL: "https://rpc.sophon.xyz"
  SUPERSEED_MAINNET_RPC_URL: "https://mainnet.superseed.xyz"
  TANGLE_MAINNET_RPC_URL: "https://rpc.tangle.tools"
  UNICHAIN_MAINNET_RPC_URL: "https://lb.routeme.sh/rpc/130/${{ secrets.ROUTEME_API_KEY }}"
  ULTRA_MAINNET_RPC_URL: "https://evm.ultra.eosusa.io"
  XDC_MAINNET_RPC_URL: "https://rpc.xinfin.network"
  ZKSYNC_MAINNET_RPC_URL: "https://zksync-mainnet.infura.io/v3/${{ secrets.API_KEY_INFURA }}"

on:
  pull_request:
    paths:
      - 'lists/**'
      - 'scripts/token-list/check-decimals.sh'
      - '.github/workflows/token-list-ci-decimals.yml'
  schedule:
    - cron: "0 3 * * 0"
  workflow_call:
    secrets:
      API_KEY_INFURA:
        required: true
      ROUTEME_API_KEY:
        required: true

jobs:
  check-decimals:
    runs-on: "ubuntu-latest"
    steps:
      - name: "Check out the repo"
        uses: "actions/checkout@v4"

      - name: "Check token decimals"
        run: "./scripts/token-list/check-decimals.sh"
        shell: "bash"

      - name: "Add summary"
        run: |
          echo "## Token Decimals Check" >> $GITHUB_STEP_SUMMARY
          echo "✅ Passed" >> $GITHUB_STEP_SUMMARY
```

#### Create CD Workflow

**File:** `/Users/prb/Sablier/files/.github/workflows/token-list-cd.yml`

```yaml
name: "Token List CD"

concurrency:
  cancel-in-progress: false
  group: "pages"

permissions:
  contents: "read"
  pages: "write"
  id-token: "write"

on:
  workflow_dispatch:
  push:
    branches: ["main"]
    paths:
      - 'lists/**'
      - 'scripts/token-list/**'
      - '.github/workflows/token-list-cd.yml'

jobs:
  test-js:
    uses: "./.github/workflows/token-list-ci-test.yml"

  test-decimals:
    uses: "./.github/workflows/token-list-ci-decimals.yml"
    secrets:
      API_KEY_INFURA: ${{ secrets.API_KEY_INFURA }}
      ROUTEME_API_KEY: ${{ secrets.ROUTEME_API_KEY }}

  deploy:
    environment:
      name: "github-pages"
      url: ${{ steps.pages-deployment.outputs.page_url }}
    needs: ["test-js", "test-decimals"]
    runs-on: "ubuntu-latest"

    steps:
      - name: "Check out the repo"
        uses: "actions/checkout@v4"

      - name: "Install Bun"
        uses: "oven-sh/setup-bun@v2"

      - name: "Install dependencies"
        run: "bun install --frozen-lockfile"

      - name: "Build token list"
        run: "bun run build:token-list"

      - name: "Set up GitHub Pages"
        uses: "actions/configure-pages@v5"

      - name: "Upload artifact"
        uses: "actions/upload-pages-artifact@v3"
        with:
          path: "."

      - name: "Deploy to GitHub Pages"
        id: "pages-deployment"
        uses: "actions/deploy-pages@v4"

      - name: "Add summary"
        run: |
          echo "## Token List Deployment" >> $GITHUB_STEP_SUMMARY
          echo "✅ Deployed successfully" >> $GITHUB_STEP_SUMMARY
          echo "URL: https://files.sablier.com/lists/build/tokenlist.json" >> $GITHUB_STEP_SUMMARY
```

#### Configure GitHub Secrets

GitHub Actions needs RPC URLs configured as secrets.

**Navigate to repository settings:**

1. Go to `https://github.com/sablier-labs/files/settings/secrets/actions`
2. Click "New repository secret"

**Add these secrets:**

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `API_KEY_INFURA` | Infura API key | `abc123def456...` |
| `ROUTEME_API_KEY` | RouteMe API key | `xyz789uvw012...` |

**Get values from old repository:**

```bash
# Check secrets in old repository
gh secret list --repo sablier-labs/evm-token-list

# You cannot view secret values, but you can re-use the same keys
# Contact team member with access or regenerate keys if needed
```

#### Test Workflows Locally

```bash
cd /Users/prb/Sablier/files

# Test the test workflow
bun run test:token-list

# Test the decimals check
./scripts/token-list/check-decimals.sh

# Test the build
bun run build:token-list

# All should pass before committing
```

#### Verification

```bash
# Verify workflow files created
ls -la /Users/prb/Sablier/files/.github/workflows/token-list-*.yml

# Validate YAML syntax
for file in .github/workflows/token-list-*.yml; do
  echo "Checking $file..."
  cat "$file" | yq eval . > /dev/null && echo "✅ Valid" || echo "❌ Invalid"
done
```

**Expected:** All three workflow files exist and have valid YAML syntax.

### Step 8: Documentation Updates

Update repository documentation to reflect the new structure.

#### Update Main README

**File:** `/Users/prb/Sablier/files/README.md`

Add a new section about the token list:

```markdown
## Token List

This repository hosts the Sablier EVM Token List, a curated list of ERC-20 tokens supported by the Sablier Protocol across multiple EVM chains.

### Token List URL

The token list is available at: `https://files.sablier.com/lists/build/tokenlist.json`

### Adding a Token

To add your ERC-20 token to the list, submit a request by [creating a GitHub issue](https://github.com/sablier-labs/files/issues/new?assignees=&labels=token+request&template=token-request.md&title=Add+%7BTOKEN_SYMBOL%7D%3A+%7BTOKEN_NAME%7D).

> **Note:** Filing an issue does not guarantee addition to the token list. We do not review token addition requests in any particular order, and we do not guarantee that your request will be accepted.

### Token List Structure

- **Token Data**: `lists/*.json` - Token definitions organized by chain
- **Build Scripts**: `scripts/token-list/` - Scripts to build and validate the token list
- **Tests**: `test/token-list.test.js` - Token list validation tests
- **Output**: `lists/build/tokenlist.json` - Generated token list (deployed to GitHub Pages)

### Development

```bash
# Install dependencies
bun install

# Build token list
bun run build:token-list

# Run tests
bun run test:token-list

# Sort tokens alphabetically
bun run sort:tokens

# Check token decimals against on-chain data
bun run check:decimals
```
```

#### Create Token List Contributing Guide

**File:** `/Users/prb/Sablier/files/docs/TOKEN_LIST_CONTRIBUTING.md`

```markdown
# Contributing to the Token List

Thank you for your interest in adding a token to the Sablier Token List!

## Submission Process

1. **Create an issue** using the [token request template](https://github.com/sablier-labs/files/issues/new?assignees=&labels=token+request&template=token-request.md)
2. **Wait for review** - The Sablier team will review your request
3. **Address feedback** - If changes are needed, we'll comment on the issue
4. **Automated PR** - Once approved, a pull request will be created automatically
5. **Merge** - After tests pass, the PR will be merged and deployed

## Token Requirements

### Required Information

- Token name
- Token symbol
- Token contract address (checksummed)
- Decimals
- Chain ID
- Logo URL (must be hosted on `files.sablier.com/tokens/`)

### Validation Criteria

Your token must meet these criteria:

1. **Valid ERC-20 Contract**: Must implement the ERC-20 standard
2. **Verified Source Code**: Contract source must be verified on block explorer
3. **Checksummed Address**: Address must use EIP-55 checksum format
4. **Correct Decimals**: Decimals must match on-chain `decimals()` value
5. **Logo**: High-quality logo image (PNG or SVG, 256x256px minimum)

### File Format

Token data is stored in JSON files organized by chain. Example:

**File:** `lists/ethereum-mainnet.json`

```json
{
  "name": "Ethereum Mainnet",
  "chainId": 1,
  "tokens": [
    {
      "name": "Dai Stablecoin",
      "symbol": "DAI",
      "address": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      "decimals": 18,
      "chainId": 1,
      "logoURI": "https://files.sablier.com/tokens/dai.svg"
    }
  ]
}
```

## Testing Locally

Before submitting, test your changes:

```bash
# Validate JSON syntax
cat lists/your-chain.json | jq .

# Build token list
bun run build:token-list

# Run validation tests
bun run test:token-list

# Check decimals match on-chain
bun run check:decimals
```

## Questions?

If you have questions, please:

- Check existing [issues](https://github.com/sablier-labs/files/issues)
- Review the [Token Lists standard](https://github.com/Uniswap/token-lists)
- Ask in [Sablier Discord](https://discord.gg/sablier)
```

#### Update .gitignore

Ensure build artifacts are ignored:

```bash
cd /Users/prb/Sablier/files

# Add to .gitignore if not present
cat >> .gitignore << 'EOF'

# Token list build artifacts
lists/build/
.env
EOF
```

#### Verification

```bash
# Check README updated
rg "Token List" /Users/prb/Sablier/files/README.md

# Check contributing guide exists
ls -la /Users/prb/Sablier/files/docs/TOKEN_LIST_CONTRIBUTING.md

# Check .gitignore includes build artifacts
rg "lists/build" /Users/prb/Sablier/files/.gitignore
```

### Step 9: Commit Migration Changes

Commit all changes to the feature branch.

```bash
cd /Users/prb/Sablier/files

# Review changes
git status
git diff

# Stage all changes
git add .

# Verify what's staged
git status

# Create commit
git commit -m "feat: consolidate token list from evm-token-list repository

Migrate token list infrastructure from standalone evm-token-list repository
into files repository for unified asset management.

Changes:
- Add token list data files (lists/*.json)
- Add build system (scripts/token-list/)
- Add validation tests (test/token-list.test.js)
- Add GitHub Actions workflows for CI/CD
- Update package.json with dependencies and scripts
- Update documentation (README.md, TOKEN_LIST_CONTRIBUTING.md)
- Update .gitignore for token list build artifacts

This migration consolidates all Sablier static assets into a single repository,
simplifying maintenance, deployment, and contributions.

Token list will be accessible at:
https://files.sablier.com/lists/build/tokenlist.json

Migration script: scripts/migrate-token-list.sh"

# Push to remote
git push -u origin feat/consolidate-token-list
```

#### Verification

```bash
# Verify commit created
git log -1 --stat

# Verify pushed to remote
git branch -vv

# Check GitHub for branch
gh pr view --web || echo "No PR yet - that's next step"
```

## Testing & Validation

Before creating a pull request, perform comprehensive testing.

### Unit Tests

```bash
cd /Users/prb/Sablier/files

# Run token list tests
nr test:token-list

# Should see:
# ✓ builds token list from JSON files
# ✓ validates token list schema
# ✓ validates token addresses
# ✓ validates no duplicates
# X passing (Xms)
```

**All tests must pass.**

### Integration Tests

```bash
# Build token list
nr build:token-list

# Verify build output
ls -lh lists/build/tokenlist.json

# Validate against Uniswap token-lists schema
cat lists/build/tokenlist.json | jq '.name, .version, (.tokens | length)'

# Should output:
# "Sablier EVM Token List"
# {
#   "major": 1,
#   "minor": 0,
#   "patch": 0
# }
# 250 (or whatever the count is)
```

### Decimals Validation

```bash
# Set up environment variables (copy from .env.example)
cp .env.example .env

# Edit .env with your RPC URLs
# (or export them in shell)

# Run decimals check
nr check:decimals

# This queries on-chain data and compares with JSON files
# Should see: "✓ All token decimals match on-chain values"
```

**Warning:** This test requires RPC access and may take several minutes.

### Frontend Testing Checklist

After deployment, test in Sablier Interface:

- [ ] Open Sablier Interface
- [ ] Go to token selection dropdown
- [ ] Verify all chains show tokens
- [ ] Select a token from each major chain
- [ ] Verify token metadata displays correctly
- [ ] Verify token icons load
- [ ] Check browser console for errors
- [ ] Test search functionality
- [ ] Test filter by chain functionality

### Manual Verification

```bash
# Verify file structure
tree -L 3 /Users/prb/Sablier/files/lists
tree -L 3 /Users/prb/Sablier/files/scripts/token-list

# Count tokens per chain
for file in lists/*.json; do
  echo "$(basename $file): $(cat $file | jq '.tokens | length') tokens"
done

# Check for common issues
# 1. No duplicate addresses within a chain
for file in lists/*.json; do
  echo "Checking $file..."
  cat $file | jq -r '.tokens[].address' | sort | uniq -d
done
# Should output nothing (no duplicates)

# 2. All addresses are checksummed
for file in lists/*.json; do
  cat $file | jq -r '.tokens[].address' | while read addr; do
    if [[ ! $addr =~ ^0x[0-9A-Fa-f]{40}$ ]] || [[ $addr =~ [a-z] ]] && [[ $addr =~ [A-Z] ]]; then
      continue
    else
      echo "Non-checksummed address: $addr in $file"
    fi
  done
done
# Should output nothing

# 3. All token files are valid JSON
fd -e json . lists --max-depth 1 --exec sh -c 'cat {} | jq empty || echo "Invalid JSON: {}"'
# Should output nothing
```

### Production Verification Plan

After deployment to production:

**Immediate checks (within 1 hour):**

- [ ] Token list URL loads: `curl https://files.sablier.com/lists/build/tokenlist.json`
- [ ] Returns valid JSON
- [ ] Contains expected number of tokens
- [ ] GitHub Pages deployment succeeded
- [ ] No 404 errors in logs

**Short-term monitoring (24 hours):**

- [ ] Monitor Sentry/error tracking for issues
- [ ] Check analytics for token list fetches
- [ ] Monitor GitHub Actions for scheduled decimals check
- [ ] Check user feedback channels (Discord, Twitter)

**Long-term validation (1 week):**

- [ ] Verify weekly decimals check runs successfully
- [ ] No increase in token-related support requests
- [ ] Token additions work via new workflow
- [ ] Performance metrics remain stable

## Deployment

Deploy the consolidated token list to production.

### Create Pull Request

```bash
cd /Users/prb/Sablier/files

# Ensure you're on the feature branch
git checkout feat/consolidate-token-list

# Ensure all changes are committed
git status

# Create PR
gh pr create \
  --title "Consolidate token list from evm-token-list repository" \
  --body "$(cat << 'EOF'
## Summary

Consolidates the Sablier EVM token list infrastructure from the standalone `evm-token-list` repository into the `files` repository for unified asset management.

## Changes

### Infrastructure

- **Token Data**: Migrated all token JSON files to `lists/` directory
- **Build System**: Copied build scripts to `scripts/token-list/`
- **Tests**: Migrated test suite to `test/token-list.test.js`
- **Workflows**: Added GitHub Actions for CI/CD

### Dependencies

Added to `package.json`:
- `@ethersproject/address` - Address checksum validation
- `@uniswap/token-lists` - Token list schema
- `ajv` + `ajv-formats` - JSON schema validation
- `mocha` + `chai` - Testing framework

### Scripts

Added to `package.json`:
- `build:token-list` - Build tokenlist.json
- `test:token-list` - Run token list tests
- `sort:tokens` - Sort tokens alphabetically
- `check:decimals` - Validate decimals against on-chain data

### Documentation

- Updated `README.md` with token list section
- Added `docs/TOKEN_LIST_CONTRIBUTING.md` for contributors
- Updated `.gitignore` for build artifacts

## Migration Details

**Source Repository**: `sablier-labs/evm-token-list`
**Migration Script**: `scripts/migrate-token-list.sh`

All token data, build scripts, tests, and workflows have been migrated with paths updated for the new structure.

## New Token List URL

After deployment: `https://files.sablier.com/lists/build/tokenlist.json`

## Testing

✅ Unit tests passing (`bun run test:token-list`)
✅ Build successful (`bun run build:token-list`)
✅ Token list validates against schema
✅ All file paths updated correctly
✅ GitHub Actions workflows validated

## Next Steps

After merge:

1. Monitor GitHub Pages deployment
2. Verify token list accessible at new URL
3. Update Sablier Interface to use new URL
4. Archive `evm-token-list` repository
5. Update external documentation/links

## Breaking Changes

⚠️ **The old token list URL will be deprecated:**
- Old: `https://evm-token-list.sablier.com/tokenlist.json`
- New: `https://files.sablier.com/lists/build/tokenlist.json`

The Sablier Interface must be updated to use the new URL.

---

**Migration Checklist:**

- [x] Run migration script
- [x] Update package.json
- [x] Install dependencies
- [x] Run tests (all passing)
- [x] Build token list
- [x] Create GitHub Actions workflows
- [x] Update documentation
- [x] Commit changes
- [x] Create pull request
- [ ] Review and merge
- [ ] Deploy to production
- [ ] Update frontend
- [ ] Archive old repository
EOF
)" \
  --assignee "@me" \
  --label "enhancement,migration"

# Open PR in browser
gh pr view --web
```

### Code Review

**Review checklist:**

- [ ] All files copied correctly
- [ ] File paths updated properly
- [ ] Tests passing in CI
- [ ] No merge conflicts
- [ ] Documentation complete and accurate
- [ ] GitHub Actions workflows valid
- [ ] No sensitive data committed
- [ ] `package.json` changes correct
- [ ] `.gitignore` updated appropriately

### Merge to Main

Once approved:

```bash
# Merge via GitHub UI (preferred)
# OR via CLI:

cd /Users/prb/Sablier/files

# Ensure branch is up to date
git checkout feat/consolidate-token-list
git pull origin main --rebase

# Push any rebased commits
git push origin feat/consolidate-token-list --force-with-lease

# Merge (use GitHub UI for PR merge, or:)
gh pr merge --squash --delete-branch
```

### GitHub Pages Deployment

GitHub Actions will automatically deploy to GitHub Pages.

**Monitor deployment:**

```bash
# Watch GitHub Actions
gh run list --limit 5

# View specific workflow run
gh run view

# Check deployment status
gh api repos/sablier-labs/files/pages/deployment
```

**Verify deployment:**

```bash
# Wait for deployment (usually 2-5 minutes)
sleep 300

# Test token list URL
curl -I https://files.sablier.com/lists/build/tokenlist.json

# Should return:
# HTTP/2 200
# content-type: application/json
# ...

# Fetch and validate
curl https://files.sablier.com/lists/build/tokenlist.json | jq '.name, .version, (.tokens | length)'
```

### DNS/CNAME Verification

The `files.sablier.com` domain should already be configured for GitHub Pages.

**Verify CNAME:**

```bash
# Check CNAME record
dig files.sablier.com CNAME

# Should point to: sablier-labs.github.io.

# Verify CNAME file in repo
cat /Users/prb/Sablier/files/CNAME
# Should contain: files.sablier.com
```

**If CNAME is incorrect:**

1. Go to repository Settings → Pages
2. Verify custom domain: `files.sablier.com`
3. Ensure "Enforce HTTPS" is checked
4. Wait for DNS verification (may take up to 24 hours)

## Post-Migration

### Archive evm-token-list Repository

Once the migration is confirmed stable:

```bash
# Navigate to old repository
cd /Users/prb/Sablier/evm/evm-token-list

# Create final archive commit
git checkout main

# Add archive notice to README
cat > README.md << 'EOF'
# ⚠️ ARCHIVED REPOSITORY

This repository has been archived and is no longer maintained.

## Migration

The Sablier EVM Token List has been consolidated into the [files](https://github.com/sablier-labs/files) repository.

### New Token List URL

```
https://files.sablier.com/lists/build/tokenlist.json
```

### Contributing

To add a token, please submit a request in the [files repository](https://github.com/sablier-labs/files/issues/new?template=token-request.md).

### Migration Date

**Migrated:** 2025-10-22

**Migration Details:** [Migration Pull Request](https://github.com/sablier-labs/files/pull/XXX)

---

For historical reference, this repository remains accessible in read-only mode.
EOF

git add README.md
git commit -m "Archive repository - migrated to sablier-labs/files"
git push origin main

# Archive on GitHub via UI or API
gh repo archive sablier-labs/evm-token-list

# Or via GitHub web interface:
# 1. Go to repository Settings
# 2. Scroll to "Danger Zone"
# 3. Click "Archive this repository"
# 4. Confirm
```

### Update Documentation Links

Search for and update any references to the old repository:

**Check documentation sites:**

```bash
# Search Sablier docs repository
cd /path/to/sablier-docs
rg "evm-token-list" .

# Update any references to new URL
rg -l "evm-token-list.sablier.com" . | xargs sed -i '' 's|evm-token-list.sablier.com|files.sablier.com/lists/build|g'
```

**Check other repositories:**

- `v2-app` (Sablier Interface)
- `v2-docs` (Documentation)
- `sablier-labs.github.io` (Landing page)
- Any internal wikis or Notion docs

### Notify Team/Users

**Internal notification (Slack/Discord):**

```markdown
🎉 **Token List Migration Complete**

The Sablier EVM Token List has been successfully migrated from the `evm-token-list` repository to the `files` repository.

**New URL:** https://files.sablier.com/lists/build/tokenlist.json

**What's changed:**
- Single repository for all Sablier assets
- Simplified contribution process
- Unified deployment pipeline

**Action required:**
- Update any hardcoded URLs to the new endpoint
- Review the [contributing guide](https://github.com/sablier-labs/files/blob/main/docs/TOKEN_LIST_CONTRIBUTING.md) for token additions

**Questions?** Ask in #engineering
```

**Public announcement (Twitter/Blog - Optional):**

```markdown
🚀 We've streamlined our token list infrastructure!

The Sablier Token List is now consolidated with our files repository, making it easier to contribute and maintain.

📍 New URL: files.sablier.com/lists/build/tokenlist.json

Want to add your token? Check our guide: [link]
```

### Monitor for 48 Hours

**Day 1 (0-24 hours):**

- [ ] Check GitHub Actions runs (every 6 hours)
- [ ] Monitor error tracking (Sentry/Datadog)
- [ ] Review token list fetch analytics
- [ ] Check support channels for issues
- [ ] Verify scheduled decimals check runs

**Day 2 (24-48 hours):**

- [ ] Review any reported issues
- [ ] Check frontend integration status
- [ ] Verify token list updates deploy correctly
- [ ] Monitor GitHub Pages uptime
- [ ] Review CI/CD performance

**Monitoring commands:**

```bash
# Check recent GitHub Actions runs
gh run list --repo sablier-labs/files --limit 10

# Check website uptime
curl -I https://files.sablier.com/lists/build/tokenlist.json

# View recent commits
cd /Users/prb/Sablier/files
git log --oneline --since="2 days ago"

# Check for new issues
gh issue list --repo sablier-labs/files --label "token request"
```

## Rollback Plan

If critical issues are discovered, follow this rollback procedure.

### When to Rollback

Rollback if:

- ❌ Token list URL returns 404 or 500 errors persistently
- ❌ Token list JSON is corrupted or invalid
- ❌ Sablier Interface cannot fetch/parse token list
- ❌ GitHub Pages deployment fails repeatedly
- ❌ Critical security vulnerability discovered in migration
- ❌ Data loss or corruption of token data

Do NOT rollback for:

- ✅ Minor CI failures that don't affect production
- ✅ Single token data issues (fix individually)
- ✅ Documentation errors
- ✅ Non-critical test failures

### How to Rollback

#### Step 1: Assess Situation

```bash
# Check what's broken
curl -I https://files.sablier.com/lists/build/tokenlist.json

# Check GitHub Pages status
gh api repos/sablier-labs/files/pages

# Check recent deployments
gh run list --repo sablier-labs/files --workflow "Token List CD"
```

#### Step 2: Immediate Mitigation

**Option A: Revert the merge commit**

```bash
cd /Users/prb/Sablier/files

# Find the merge commit
git log --oneline --merges -10

# Revert the merge (replace MERGE_SHA with actual SHA)
git revert -m 1 MERGE_SHA

# Push revert
git push origin main

# This will trigger a new deployment without the migration
```

**Option B: Create hotfix branch with fixes**

```bash
cd /Users/prb/Sablier/files

# Create hotfix branch
git checkout -b hotfix/fix-token-list-issue

# Make necessary fixes
# ... edit files ...

# Commit and push
git add .
git commit -m "hotfix: fix token list deployment issue"
git push origin hotfix/fix-token-list-issue

# Create PR and merge immediately
gh pr create --title "Hotfix: token list deployment" --body "Emergency fix" --assignee "@me"
gh pr merge --admin --squash
```

#### Step 3: Restore from Backup

If reverting doesn't work:

```bash
# Restore from backup created during pre-migration
cd ~/sablier-migration-backup-YYYYMMDD

# Extract backup
tar -xzf files-backup.tar.gz -C /tmp/files-restore

# Copy critical files back
cp -r /tmp/files-restore/tokens /Users/prb/Sablier/files/
cp -r /tmp/files-restore/chains /Users/prb/Sablier/files/

# If entire repo needs restore
cd /Users/prb/Sablier
mv files files-broken
tar -xzf ~/sablier-migration-backup-YYYYMMDD/files-backup.tar.gz
mv files files-restored
cd files-restored
git push origin main --force
```

#### Step 4: Re-enable Old Repository

If a full rollback is needed:

```bash
# Unarchive evm-token-list repository
gh repo unarchive sablier-labs/evm-token-list

# Navigate to repository
cd /Users/prb/Sablier/evm/evm-token-list

# Revert archive commit if needed
git revert HEAD
git push origin main

# Redeploy old token list
gh workflow run cd.yml
```

#### Step 5: Revert Frontend Changes

If the Sablier Interface was updated:

```bash
cd /path/to/v2-app

# Revert the token list URL change
git revert <commit-sha-that-changed-url>

# Or manually edit
# Change back to: https://evm-token-list.sablier.com/tokenlist.json

git push origin main

# Trigger deployment
# (follow v2-app deployment process)
```

### Post-Rollback Actions

1. **Communicate the rollback:**
   - Notify team in Slack/Discord
   - Update GitHub issues
   - Post status update if public-facing

2. **Investigate root cause:**
   - Review logs and error messages
   - Identify what went wrong
   - Document findings

3. **Plan fix:**
   - Create detailed fix plan
   - Test thoroughly in staging
   - Schedule retry with team

4. **Update documentation:**
   - Document the issue in this runbook
   - Add to troubleshooting section
   - Update migration checklist

## Troubleshooting Guide

### Issue: Token List Returns 404

**Symptoms:**

- `https://files.sablier.com/lists/build/tokenlist.json` returns 404
- Browser shows "File not found"

**Diagnosis:**

```bash
# Check if file exists in repo
ls /Users/prb/Sablier/files/lists/build/tokenlist.json

# Check GitHub Pages deployment
gh run list --repo sablier-labs/files --workflow "Token List CD"

# Check if build directory is gitignored
rg "lists/build" /Users/prb/Sablier/files/.gitignore
```

**Solution:**

```bash
# If gitignored, remove from .gitignore
sed -i '' '/lists\/build/d' .gitignore

# Commit the build file
git add lists/build/tokenlist.json
git commit -m "chore: track token list build artifact for GitHub Pages"
git push origin main

# Wait for deployment
gh run watch
```

### Issue: Tests Failing in CI

**Symptoms:**

- GitHub Actions shows test failures
- Mocha reports errors

**Diagnosis:**

```bash
# Run tests locally
cd /Users/prb/Sablier/files
bun run test:token-list

# Check test output for specific errors
```

**Common causes:**

1. **Path issues**: Test can't find token files
   ```bash
   # Fix paths in test file
   # Update require() statements to correct relative paths
   ```

2. **Schema validation errors**: Token data doesn't match schema
   ```bash
   # Validate individual token files
   fd -e json . lists --exec sh -c 'cat {} | jq empty'
   ```

3. **Missing dependencies**:
   ```bash
   # Reinstall dependencies
   rm -rf node_modules bun.lockb
   ni
   ```

### Issue: Token Decimals Check Fails

**Symptoms:**

- `check-decimals.sh` reports mismatches
- CI workflow fails on decimals check

**Diagnosis:**

```bash
# Run locally with verbose output
cd /Users/prb/Sablier/files
./scripts/token-list/check-decimals.sh

# Check RPC URLs configured
env | grep RPC_URL
```

**Solution:**

```bash
# Update incorrect token decimals in JSON file
# Find the token file and correct the decimals value

# Example: fix USDC on Ethereum
cat lists/ethereum-mainnet.json | jq '.tokens[] | select(.symbol=="USDC")'
# Edit file to match on-chain decimals

# Commit fix
git add lists/ethereum-mainnet.json
git commit -m "fix(tokens): correct USDC decimals on Ethereum"
git push origin main
```

### Issue: Build Script Fails

**Symptoms:**

- `bun run build:token-list` errors
- `lists/build/tokenlist.json` not created

**Diagnosis:**

```bash
# Run with verbose errors
node scripts/token-list/write.js

# Check for JavaScript errors
node --trace-warnings scripts/token-list/write.js
```

**Common causes:**

1. **Invalid JSON in token files**:
   ```bash
   fd -e json . lists --max-depth 1 --exec sh -c 'cat {} | jq empty || echo "Invalid: {}"'
   ```

2. **Path errors in buildList.js**:
   ```bash
   # Verify paths in buildList.js are correct
   rg "require\(" scripts/token-list/buildList.js
   ```

3. **Missing dependencies**:
   ```bash
   ni
   ```

### Issue: GitHub Actions Secrets Not Working

**Symptoms:**

- Decimals check fails in CI but works locally
- "Error: Required secret not set"

**Diagnosis:**

```bash
# List configured secrets
gh secret list --repo sablier-labs/files
```

**Solution:**

```bash
# Add missing secrets via CLI
gh secret set API_KEY_INFURA --body "your-key-here" --repo sablier-labs/files
gh secret set ROUTEME_API_KEY --body "your-key-here" --repo sablier-labs/files

# Or via GitHub UI:
# https://github.com/sablier-labs/files/settings/secrets/actions
```

### Issue: GitHub Pages Not Deploying

**Symptoms:**

- Workflow succeeds but site not updated
- Old content still showing

**Diagnosis:**

```bash
# Check GitHub Pages settings
gh api repos/sablier-labs/files/pages

# Check recent deployments
gh api repos/sablier-labs/files/pages/builds
```

**Solution:**

```bash
# Verify GitHub Pages source is correct
# Should be: "Deploy from a branch" or "GitHub Actions"

# Manually trigger deployment
gh workflow run token-list-cd.yml

# Check Pages settings via UI
# https://github.com/sablier-labs/files/settings/pages
```

### Who to Contact

**Migration Issues:**

- **Lead Developer**: @prb
- **DevOps**: Check team roster
- **GitHub Actions**: Check team documentation

**Token List Issues:**

- **Token Curator**: Check CODEOWNERS
- **Community**: Discord #token-requests

**Emergency Contacts:**

- Escalate to #engineering in Slack
- Page on-call engineer if production down

## Reference

### Script Locations

| Purpose | Location |
|---------|----------|
| Migration script | `/Users/prb/Sablier/files/scripts/migrate-token-list.sh` |
| Build token list | `/Users/prb/Sablier/files/scripts/token-list/buildList.js` |
| Write output | `/Users/prb/Sablier/files/scripts/token-list/write.js` |
| Check decimals | `/Users/prb/Sablier/files/scripts/token-list/check-decimals.sh` |
| Sort tokens | `/Users/prb/Sablier/files/scripts/token-list/sort-tokens.mjs` |
| Test suite | `/Users/prb/Sablier/files/test/token-list.test.js` |

### Key File Paths

| File Type | Path |
|-----------|------|
| Token data | `/Users/prb/Sablier/files/lists/*.json` |
| Build output | `/Users/prb/Sablier/files/lists/build/tokenlist.json` |
| Package config | `/Users/prb/Sablier/files/package.json` |
| GitHub workflows | `/Users/prb/Sablier/files/.github/workflows/token-list-*.yml` |
| Issue template | `/Users/prb/Sablier/files/.github/ISSUE_TEMPLATE/token-request.md` |
| Contributing guide | `/Users/prb/Sablier/files/docs/TOKEN_LIST_CONTRIBUTING.md` |
| Environment example | `/Users/prb/Sablier/files/.env.example` |
| Git ignore | `/Users/prb/Sablier/files/.gitignore` |

### Relevant Documentation Links

| Resource | URL |
|----------|-----|
| Source repository | https://github.com/sablier-labs/evm-token-list |
| Target repository | https://github.com/sablier-labs/files |
| Token Lists standard | https://github.com/Uniswap/token-lists |
| GitHub Pages docs | https://docs.github.com/en/pages |
| GitHub Actions docs | https://docs.github.com/en/actions |
| Bun documentation | https://bun.sh/docs |
| Mocha documentation | https://mochajs.org/ |
| AJV documentation | https://ajv.js.org/ |

### Package.json Scripts Reference

| Script | Command | Purpose |
|--------|---------|---------|
| `build:token-list` | `rm -rf lists/build/tokenlist.json && node scripts/token-list/write.js > lists/build/tokenlist.json` | Build consolidated token list |
| `test:token-list` | `mocha test/token-list.test.js` | Run token list validation tests |
| `sort:tokens` | `node scripts/token-list/sort-tokens.mjs` | Sort tokens alphabetically in JSON files |
| `check:decimals` | `scripts/token-list/check-decimals.sh` | Validate token decimals against on-chain data |

### Dependencies Reference

| Package | Version | Purpose |
|---------|---------|---------|
| `@ethersproject/address` | `^5.8` | Ethereum address validation and checksumming |
| `@uniswap/token-lists` | `^1.0.0-beta.34` | Token list schema and validation |
| `ajv` | `^8.17` | JSON schema validator |
| `ajv-formats` | `^3.0` | JSON schema format validators |
| `chai` | `^5.2` | Assertion library for tests |
| `mocha` | `^11.1` | Test framework |

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `*_RPC_URL` | RPC endpoints for chain data queries | `https://mainnet.infura.io/v3/YOUR_KEY` |
| `API_KEY_INFURA` | Infura API key | `abc123def456...` |
| `ROUTEME_API_KEY` | RouteMe API key | `xyz789uvw012...` |

**Note:** See `.env.example` for complete list of required RPC URLs.

---

## Summary

This migration consolidates the Sablier EVM token list from a standalone repository into the unified `files` repository. By following this runbook, you will:

1. ✅ Migrate all token data and infrastructure
2. ✅ Update build system and tests
3. ✅ Configure CI/CD pipelines
4. ✅ Deploy to GitHub Pages
5. ✅ Update documentation
6. ✅ Archive old repository

**Estimated Time:** ~2 hours
**Complexity:** Medium
**Risk Level:** Low (with proper testing and rollback plan)

**Success Criteria:**

- All tests passing in new repository
- Token list accessible at new URL
- GitHub Actions workflows running successfully
- Sablier Interface fetching tokens correctly
- No service disruption during migration

For questions or issues during migration, refer to the Troubleshooting Guide or contact the engineering team.

---

**Document Version:** 1.0
**Last Updated:** 2025-10-22
**Migration Script Version:** 1.0
**Maintainer:** @prb
