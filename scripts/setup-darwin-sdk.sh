#!/bin/bash
# Download macOS SDK for zig cross-compilation (shared across projects)
# Usage: scripts/setup-darwin-sdk.sh [target_dir]
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log_info()  { echo -e "${GREEN}[SDK]${NC} $*"; }
log_error() { echo -e "${RED}[SDK]${NC} $*" >&2; }

# Default to shared location: ../.sdk (sibling to all dbridge projects)
SHARED_SDK_DIR="$(cd "$ROOT_DIR/.." && pwd)/.sdk"
TARGET_DIR="${1:-$SHARED_SDK_DIR}"
SDK_VERSION="MacOSX15.5"
SDK_URL="https://github.com/joseluisq/macosx-sdks/releases/download/15.5/MacOSX15.5.sdk.tar.xz"

mkdir -p "$TARGET_DIR"

if [ -d "$TARGET_DIR/$SDK_VERSION.sdk" ]; then
    log_info "SDK already exists: $TARGET_DIR/$SDK_VERSION.sdk"
    echo ""
    echo "export SDKROOT=\"$TARGET_DIR/$SDK_VERSION.sdk\""
    exit 0
fi

if ! command -v curl &>/dev/null; then
    log_error "curl not found"
    exit 1
fi

log_info "Downloading macOS SDK..."
log_info "URL: $SDK_URL"
log_info "Target: $TARGET_DIR/"

TARBALL="$TARGET_DIR/${SDK_VERSION}.sdk.tar.xz"
curl -L -o "$TARBALL" "$SDK_URL"

log_info "Extracting..."
tar -xJf "$TARBALL" -C "$TARGET_DIR/"
rm -f "$TARBALL"

if [ -d "$TARGET_DIR/$SDK_VERSION.sdk" ]; then
    log_info "SDK installed: $TARGET_DIR/$SDK_VERSION.sdk"
    echo ""
    echo "Add to your shell profile (~/.bashrc or ~/.zshrc):"
    echo ""
    echo "  export SDKROOT=\"$TARGET_DIR/$SDK_VERSION.sdk\""
    echo ""
    echo "Or set it before running build.sh:"
    echo "  SDKROOT=\"$TARGET_DIR/$SDK_VERSION.sdk\" scripts/build.sh all"
else
    log_error "SDK extraction failed"
    exit 1
fi
