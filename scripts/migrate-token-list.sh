#!/usr/bin/env bash

################################################################################
# Token List Migration Script
#
# Migrates token list from evm-token-list repository to files repository
#
# Source: /Users/prb/Sablier/evm/evm-token-list
# Target: /Users/prb/Sablier/files
#
# Usage: ./migrate-token-list.sh [--dry-run] [--force]
################################################################################

set -euo pipefail

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Paths
SOURCE_REPO="/Users/prb/Sablier/evm/evm-token-list"
TARGET_REPO="/Users/prb/Sablier/files"

# Flags
DRY_RUN=false
FORCE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --force)
      FORCE=true
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [--dry-run] [--force]"
      echo ""
      echo "Options:"
      echo "  --dry-run   Show what would be done without making changes"
      echo "  --force     Overwrite existing files without prompting"
      echo "  --help      Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Arrays to track migration
declare -a COPIED_FILES=()
declare -a SKIPPED_FILES=()
declare -a MODIFIED_FILES=()
declare -a WARNINGS=()
declare -a MANUAL_STEPS=()

################################################################################
# Utility Functions
################################################################################

print_section() {
  echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}  $1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_info() {
  echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
  WARNINGS+=("$1")
}

print_error() {
  echo -e "${RED}✗${NC} $1"
}

print_skip() {
  echo -e "${YELLOW}↷${NC} $1"
}

validate_source() {
  if [[ ! -d "$SOURCE_REPO" ]]; then
    print_error "Source repository not found: $SOURCE_REPO"
    exit 1
  fi
}

validate_target() {
  if [[ ! -d "$TARGET_REPO" ]]; then
    print_error "Target repository not found: $TARGET_REPO"
    exit 1
  fi
}

copy_file() {
  local src="$1"
  local dest="$2"
  local description="$3"

  if [[ ! -f "$src" ]]; then
    print_error "Source file not found: $src"
    SKIPPED_FILES+=("$description (source missing)")
    return 1
  fi

  if [[ -f "$dest" && "$FORCE" != "true" ]]; then
    print_skip "File already exists: $dest (use --force to overwrite)"
    SKIPPED_FILES+=("$description (already exists)")
    return 0
  fi

  if [[ "$DRY_RUN" == "true" ]]; then
    print_info "[DRY-RUN] Would copy: $description"
    print_info "          From: $src"
    print_info "          To:   $dest"
  else
    mkdir -p "$(dirname "$dest")"
    cp -p "$src" "$dest"
    print_info "Copied: $description"
    COPIED_FILES+=("$description")
  fi
}

copy_directory() {
  local src="$1"
  local dest="$2"
  local description="$3"

  if [[ ! -d "$src" ]]; then
    print_error "Source directory not found: $src"
    SKIPPED_FILES+=("$description (source missing)")
    return 1
  fi

  if [[ "$DRY_RUN" == "true" ]]; then
    print_info "[DRY-RUN] Would copy directory: $description"
    local file_count=$(fd . "$src" --type f | wc -l | tr -d ' ')
    print_info "          Files to copy: $file_count"
  else
    mkdir -p "$dest"
    local count=0
    while IFS= read -r file; do
      local rel_path="${file#$src/}"
      cp -p "$file" "$dest/$rel_path"
      ((count++))
    done < <(fd . "$src" --type f)
    print_info "Copied directory: $description ($count files)"
    COPIED_FILES+=("$description ($count files)")
  fi
}

make_executable() {
  local file="$1"
  local description="$2"

  if [[ "$DRY_RUN" == "true" ]]; then
    print_info "[DRY-RUN] Would make executable: $description"
  else
    chmod +x "$file"
    print_info "Made executable: $description"
  fi
}

backup_file() {
  local file="$1"

  if [[ -f "$file" ]]; then
    local backup="${file}.backup.$(date +%Y%m%d_%H%M%S)"
    if [[ "$DRY_RUN" == "true" ]]; then
      print_info "[DRY-RUN] Would create backup: $backup"
    else
      cp "$file" "$backup"
      print_info "Created backup: $backup"
    fi
  fi
}

################################################################################
# Migration Steps
################################################################################

step_1_create_directories() {
  print_section "Step 1: Creating Directory Structure"

  local dirs=(
    "$TARGET_REPO/lists"
    "$TARGET_REPO/scripts/token-list"
    "$TARGET_REPO/test"
    "$TARGET_REPO/.github/workflows"
    "$TARGET_REPO/.github/ISSUE_TEMPLATE"
    "$TARGET_REPO/lists/build"
  )

  for dir in "${dirs[@]}"; do
    if [[ "$DRY_RUN" == "true" ]]; then
      print_info "[DRY-RUN] Would create: $dir"
    else
      mkdir -p "$dir"
      print_info "Created: $dir"
    fi
  done
}

step_2_copy_token_files() {
  print_section "Step 2: Copying Token JSON Files"

  local token_dir="$SOURCE_REPO/src/tokens"
  local target_dir="$TARGET_REPO/lists"

  if [[ ! -d "$token_dir" ]]; then
    print_error "Token directory not found: $token_dir"
    return 1
  fi

  local count=0
  while IFS= read -r file; do
    local filename=$(basename "$file")
    copy_file "$file" "$target_dir/$filename" "Token list: $filename"
    ((count++))
  done < <(fd . "$token_dir" --type f --extension json)

  print_info "Total token files processed: $count"
}

step_3_copy_build_scripts() {
  print_section "Step 3: Copying Build System"

  copy_file \
    "$SOURCE_REPO/src/buildList.js" \
    "$TARGET_REPO/scripts/token-list/buildList.js" \
    "Build script: buildList.js"

  copy_file \
    "$SOURCE_REPO/src/write.js" \
    "$TARGET_REPO/scripts/token-list/write.js" \
    "Build script: write.js"
}

step_4_copy_validation_scripts() {
  print_section "Step 4: Copying Validation Scripts"

  copy_file \
    "$SOURCE_REPO/scripts/check-decimals.sh" \
    "$TARGET_REPO/scripts/token-list/check-decimals.sh" \
    "Validation script: check-decimals.sh"

  if [[ -f "$TARGET_REPO/scripts/token-list/check-decimals.sh" && "$DRY_RUN" != "true" ]]; then
    make_executable \
      "$TARGET_REPO/scripts/token-list/check-decimals.sh" \
      "check-decimals.sh"
  fi

  copy_file \
    "$SOURCE_REPO/scripts/sort-tokens.mjs" \
    "$TARGET_REPO/scripts/token-list/sort-tokens.mjs" \
    "Validation script: sort-tokens.mjs"

  if [[ -f "$TARGET_REPO/scripts/token-list/sort-tokens.mjs" && "$DRY_RUN" != "true" ]]; then
    make_executable \
      "$TARGET_REPO/scripts/token-list/sort-tokens.mjs" \
      "sort-tokens.mjs"
  fi
}

step_5_copy_test_suite() {
  print_section "Step 5: Copying Test Suite"

  copy_file \
    "$SOURCE_REPO/test/list.test.js" \
    "$TARGET_REPO/test/token-list.test.js" \
    "Test suite: token-list.test.js"
}

step_6_copy_config_files() {
  print_section "Step 6: Copying Configuration Files"

  # Copy .env.example only if it doesn't exist
  if [[ ! -f "$TARGET_REPO/.env.example" ]]; then
    copy_file \
      "$SOURCE_REPO/.env.example" \
      "$TARGET_REPO/.env.example" \
      "Configuration: .env.example"
  else
    print_skip "Configuration: .env.example (already exists, not overwriting)"
    SKIPPED_FILES+=(".env.example (preserved existing)")
  fi

  # Copy biome.jsonc only if it doesn't exist
  if [[ ! -f "$TARGET_REPO/biome.jsonc" ]]; then
    copy_file \
      "$SOURCE_REPO/biome.jsonc" \
      "$TARGET_REPO/biome.jsonc" \
      "Configuration: biome.jsonc"
  else
    print_skip "Configuration: biome.jsonc (already exists, not overwriting)"
    SKIPPED_FILES+=("biome.jsonc (preserved existing)")
  fi
}

step_7_copy_github_templates() {
  print_section "Step 7: Copying GitHub Templates"

  copy_file \
    "$SOURCE_REPO/.github/ISSUE_TEMPLATE/token-request.md" \
    "$TARGET_REPO/.github/ISSUE_TEMPLATE/token-request.md" \
    "GitHub template: token-request.md"
}

step_8_update_file_paths() {
  print_section "Step 8: Updating File Paths"

  local buildlist_file="$TARGET_REPO/scripts/token-list/buildList.js"
  local write_file="$TARGET_REPO/scripts/token-list/write.js"
  local test_file="$TARGET_REPO/test/token-list.test.js"
  local check_decimals_file="$TARGET_REPO/scripts/token-list/check-decimals.sh"

  if [[ "$DRY_RUN" == "true" ]]; then
    print_info "[DRY-RUN] Would update paths in buildList.js"
    print_info "[DRY-RUN] Would update paths in write.js"
    print_info "[DRY-RUN] Would update paths in test file"
    print_info "[DRY-RUN] Would update paths in check-decimals.sh"
    return
  fi

  # Update buildList.js
  if [[ -f "$buildlist_file" ]]; then
    backup_file "$buildlist_file"

    # Update package.json path
    sed -i '' 's|require("../package.json")|require("../../../package.json")|g' "$buildlist_file"

    # Update token file paths
    sed -i '' 's|require("./tokens/|require("../../lists/|g' "$buildlist_file"

    print_info "Updated paths in buildList.js"
    MODIFIED_FILES+=("buildList.js")
  fi

  # Update write.js
  if [[ -f "$write_file" ]]; then
    backup_file "$write_file"
    sed -i '' 's|require("./buildList")|require("./buildList")|g' "$write_file"
    print_info "Updated paths in write.js"
    MODIFIED_FILES+=("write.js")
  fi

  # Update test file
  if [[ -f "$test_file" ]]; then
    backup_file "$test_file"

    # Update package.json path
    sed -i '' 's|require("../package.json")|require("../package.json")|g' "$test_file"

    # Update build path
    sed -i '' 's|path.join(__dirname, "../build/tokenlist.json")|path.join(__dirname, "../lists/build/tokenlist.json")|g' "$test_file"

    # Update build script command
    sed -i '' 's|execSync("bun run build"|execSync("bun run build:token-list"|g' "$test_file"

    print_info "Updated paths in token-list.test.js"
    MODIFIED_FILES+=("token-list.test.js")
  fi

  # Update check-decimals.sh
  if [[ -f "$check_decimals_file" ]]; then
    backup_file "$check_decimals_file"

    # Update token directory path
    sed -i '' 's|for file in src/tokens/\*.json|for file in lists/*.json|g' "$check_decimals_file"

    print_info "Updated paths in check-decimals.sh"
    MODIFIED_FILES+=("check-decimals.sh")
  fi
}

step_9_extract_package_json_info() {
  print_section "Step 9: Extracting package.json Information"

  local source_pkg="$SOURCE_REPO/package.json"
  local target_pkg="$TARGET_REPO/package.json"

  if [[ ! -f "$source_pkg" ]]; then
    print_error "Source package.json not found"
    return 1
  fi

  print_info "Extracting dependencies and scripts from evm-token-list..."

  # Extract dependencies
  echo -e "\n${YELLOW}Required Dependencies:${NC}"
  jq -r '.devDependencies | to_entries[] | select(.key | test("@ethersproject/address|@uniswap/token-lists|ajv|ajv-formats|chai|mocha")) | "  \(.key): \(.value)"' "$source_pkg"

  # Extract scripts
  echo -e "\n${YELLOW}Required Scripts:${NC}"
  echo "  \"build:token-list\": \"rm -rf lists/build/tokenlist.json && node scripts/token-list/write.js > lists/build/tokenlist.json\","
  echo "  \"test:token-list\": \"mocha test/token-list.test.js\","
  echo "  \"sort:tokens\": \"node scripts/token-list/sort-tokens.mjs\","
  echo "  \"check:decimals\": \"scripts/token-list/check-decimals.sh\""

  MANUAL_STEPS+=("Add the above dependencies to package.json devDependencies")
  MANUAL_STEPS+=("Add the above scripts to package.json scripts section")
  MANUAL_STEPS+=("Run 'ni' to install new dependencies")
}

step_10_generate_gitignore_entries() {
  print_section "Step 10: Generating .gitignore Entries"

  print_info "Recommended .gitignore entries:"
  echo ""
  echo "  # Token list build artifacts"
  echo "  lists/build/"
  echo "  .env"
  echo ""

  MANUAL_STEPS+=("Add token list build artifacts to .gitignore if not already present")
}

################################################################################
# Main Execution
################################################################################

main() {
  print_section "Token List Migration Script"

  if [[ "$DRY_RUN" == "true" ]]; then
    echo -e "${YELLOW}Running in DRY-RUN mode - no changes will be made${NC}\n"
  fi

  echo "Source: $SOURCE_REPO"
  echo "Target: $TARGET_REPO"

  # Validate repositories
  validate_source
  validate_target

  # Execute migration steps
  step_1_create_directories
  step_2_copy_token_files
  step_3_copy_build_scripts
  step_4_copy_validation_scripts
  step_5_copy_test_suite
  step_6_copy_config_files
  step_7_copy_github_templates
  step_8_update_file_paths
  step_9_extract_package_json_info
  step_10_generate_gitignore_entries

  # Generate summary report
  print_section "Migration Summary"

  echo -e "${GREEN}Files Copied:${NC} ${#COPIED_FILES[@]}"
  if [[ ${#COPIED_FILES[@]} -gt 0 ]]; then
    for file in "${COPIED_FILES[@]}"; do
      echo "  ✓ $file"
    done
  fi

  echo -e "\n${YELLOW}Files Skipped:${NC} ${#SKIPPED_FILES[@]}"
  if [[ ${#SKIPPED_FILES[@]} -gt 0 ]]; then
    for file in "${SKIPPED_FILES[@]}"; do
      echo "  ↷ $file"
    done
  fi

  echo -e "\n${BLUE}Files Modified:${NC} ${#MODIFIED_FILES[@]}"
  if [[ ${#MODIFIED_FILES[@]} -gt 0 ]]; then
    for file in "${MODIFIED_FILES[@]}"; do
      echo "  ✎ $file"
    done
  fi

  if [[ ${#WARNINGS[@]} -gt 0 ]]; then
    echo -e "\n${YELLOW}Warnings:${NC}"
    for warning in "${WARNINGS[@]}"; do
      echo "  ⚠ $warning"
    done
  fi

  if [[ ${#MANUAL_STEPS[@]} -gt 0 ]]; then
    print_section "Manual Steps Required"
    for i in "${!MANUAL_STEPS[@]}"; do
      echo "  $((i+1)). ${MANUAL_STEPS[$i]}"
    done
  fi

  print_section "Next Steps"
  echo "  1. Review the changes and verify all files were copied correctly"
  echo "  2. Add dependencies and scripts to package.json (see manual steps above)"
  echo "  3. Run 'ni' to install new dependencies"
  echo "  4. Update .gitignore with token list build artifacts"
  echo "  5. Run 'nr build:token-list' to test the build script"
  echo "  6. Run 'nr test:token-list' to verify tests pass"
  echo "  7. Create GitHub Actions workflows for CI/CD"
  echo "  8. Consider archiving or deprecating the evm-token-list repository"
  echo ""

  if [[ "$DRY_RUN" == "true" ]]; then
    echo -e "${YELLOW}This was a dry run. Run without --dry-run to perform the migration.${NC}"
  else
    echo -e "${GREEN}Migration complete!${NC}"
  fi
}

# Run main function
main
