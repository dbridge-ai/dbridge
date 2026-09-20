#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

# ── Colors ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
log_info()  { echo -e "${GREEN}[BUILD]${NC} $*"; }
log_warn()  { echo -e "${YELLOW}[BUILD]${NC} $*"; }
log_error() { echo -e "${RED}[BUILD]${NC} $*" >&2; }

# ── Platform definitions ────────────────────────────────────────────────────
ALL_PLATFORMS="linux-amd64 linux-arm64 darwin-arm64 darwin-amd64 windows-amd64"

declare -A ZIG_TARGETS=(
    [linux-amd64]="x86_64-linux-gnu"
    [linux-arm64]="aarch64-linux-gnu"
    [darwin-amd64]="x86_64-macos"
    [darwin-arm64]="aarch64-macos"
    [windows-amd64]="x86_64-windows"
)

declare -A GOOS_MAP=(
    [linux-amd64]=linux  [linux-arm64]=linux
    [darwin-amd64]=darwin [darwin-arm64]=darwin
    [windows-amd64]=windows
)

declare -A GOARCH_MAP=(
    [linux-amd64]=amd64  [linux-arm64]=arm64
    [darwin-amd64]=amd64 [darwin-arm64]=arm64
    [windows-amd64]=amd64
)

# ── Args ────────────────────────────────────────────────────────────────────
PLATFORM="${1:-native}"
VERSION="${2:-}"

detect_native() {
    local os arch
    case "$(uname -s)" in
        Linux)  os=linux ;;
        Darwin) os=darwin ;;
        MINGW*|MSYS*|CYGWIN*) os=windows ;;
        *) log_error "Unsupported host OS: $(uname -s)"; exit 1 ;;
    esac
    case "$(uname -m)" in
        x86_64|amd64)  arch=amd64 ;;
        aarch64|arm64) arch=arm64 ;;
        *) log_error "Unsupported host arch: $(uname -m)"; exit 1 ;;
    esac
    echo "${os}-${arch}"
}

if [ "$PLATFORM" = "native" ]; then
    PLATFORM=$(detect_native)
fi

if [ -z "$VERSION" ]; then
    VERSION=$(git describe --tags --always 2>/dev/null | sed 's/^v//' || echo "dev")
fi

resolve_version() {
    echo "$VERSION" | sed 's/^v//'
}
VERSION=$(resolve_version)

# ── Resolve platform list ───────────────────────────────────────────────────
if [ "$PLATFORM" = "all" ]; then
    PLATFORMS="$ALL_PLATFORMS"
else
    if [ -z "${ZIG_TARGETS[$PLATFORM]+x}" ]; then
        log_error "Unknown platform: $PLATFORM"
        echo "Valid: $ALL_PLATFORMS | all | native"
        exit 1
    fi
    PLATFORMS="$PLATFORM"
fi

# ── Preflight checks ────────────────────────────────────────────────────────
require_go() {
    if command -v go &>/dev/null; then
        echo "$(command -v go)"
        return 0
    fi
    for p in /usr/local/go/bin/go /opt/homebrew/bin/go ~/.gvm/gos/*/bin/go ~/go/bin/go; do
        if [ -x "$p" ]; then echo "$p"; return 0; fi
    done
    if [ -s "$HOME/.gvm/scripts/gvm" ]; then
        source "$HOME/.gvm/scripts/gvm" 2>/dev/null
        command -v go &>/dev/null && { echo "$(command -v go)"; return 0; }
    fi
    return 1
}

require_zig() {
    if command -v zig &>/dev/null; then
        echo "$(command -v zig)"
        return 0
    fi
    for p in /usr/local/bin/zig /opt/homebrew/bin/zig ~/bin/zig; do
        if [ -x "$p" ]; then echo "$p"; return 0; fi
    done
    return 1
}

GO_BIN=$(require_go) || { log_error "Go not found. Install: https://go.dev/dl/"; exit 1; }
ZIG_BIN=$(require_zig) || { log_error "zig not found. Install: https://ziglang.org/download/"; exit 1; }

# ── macOS SDK detection (optional, for darwin cross-compilation) ────────────
find_darwin_sdk() {
    if [ -n "$SDKROOT" ] && [ -d "$SDKROOT" ]; then
        echo "$SDKROOT"
        return 0
    fi
    for sdk_ver in 15.5 14.0 11.3; do
        local local_sdk="$ROOT_DIR/.sdk/MacOSX${sdk_ver}.sdk"
        if [ -d "$local_sdk" ]; then
            echo "$local_sdk"
            return 0
        fi
    done
    for sdk_ver in 15.5 14.0 11.3; do
        for p in /opt/MacOSX-SDKs/MacOSX${sdk_ver}.sdk \
                 /opt/macOS-SDKs/MacOSX${sdk_ver}.sdk \
                 "$HOME/MacOSX-SDKs/MacOSX${sdk_ver}.sdk"; do
            if [ -d "$p" ]; then
                echo "$p"
                return 0
            fi
        done
    done
    local xcode_sdk="/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk"
    if [ -d "$xcode_sdk" ]; then
        echo "$xcode_sdk"
        return 0
    fi
    return 1
}

DARWIN_SDK=""
DARWIN_SDK=$(find_darwin_sdk) || DARWIN_SDK=""

if [ -n "$DARWIN_SDK" ]; then
    log_info "macOS SDK found: $DARWIN_SDK"
else
    log_info "macOS SDK not found (will try zig built-in headers for darwin targets)"
fi

log_info "Go:  $GO_BIN ($($GO_BIN version 2>&1 | head -1))"
log_info "Zig: $ZIG_BIN ($($ZIG_BIN version 2>&1 | head -1))"
log_info "Version: $VERSION"
log_info "Platforms: $PLATFORMS"
echo ""

# ── Build frontend (once, shared across all platforms) ──────────────────────
build_frontend() {
    if [ -d "$ROOT_DIR/web/dist" ] && [ "$(ls -A "$ROOT_DIR/web/dist" 2>/dev/null)" ]; then
        log_info "Frontend already built (web/dist/ exists), skipping"
        return 0
    fi

    log_info "Building frontend..."
    if ! command -v node &>/dev/null; then
        [ -s "$HOME/.nvm/nvm.sh" ] && source "$HOME/.nvm/nvm.sh" 2>/dev/null
    fi
    if ! command -v node &>/dev/null; then
        log_error "Node.js not found. Cannot build frontend."
        exit 1
    fi

    cd "$ROOT_DIR/web"
    npm install --silent 2>&1 | tail -3
    npx vite build 2>&1 | tail -5

    if [ ! -d "dist" ]; then
        log_error "Frontend build failed"
        exit 1
    fi
    log_info "Frontend built: web/dist/ ($(du -sh dist | awk '{print $1}'))"
    cd "$ROOT_DIR"
}

build_frontend
echo ""

# ── Build backend per platform ──────────────────────────────────────────────
BUILD_TIME="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
LDFLAGS="-s -w -X main.Version=${VERSION} -X main.BuildTime=${BUILD_TIME}"

build_platform() {
    local plat="$1"
    local goos="${GOOS_MAP[$plat]}"
    local goarch="${GOARCH_MAP[$plat]}"
    local zig_target="${ZIG_TARGETS[$plat]}"
    local ext=""
    [ "$goos" = "windows" ] && ext=".exe"

    local out_dir="$ROOT_DIR/dist/release/${plat}"
    local out_bin="${out_dir}/dbridge${ext}"

    mkdir -p "$out_dir"

    local cc_base="$ZIG_BIN cc -target $zig_target"
    local extra_cflags=""
    local extra_ldflags=""

    if [ "$goos" = "darwin" ] && [ -n "$DARWIN_SDK" ]; then
        log_info "Building ${plat} (trying without SDK first...)"
        if CGO_ENABLED=1 GOOS="$goos" GOARCH="$goarch" \
            CC="$cc_base" \
            $GO_BIN build -trimpath -ldflags "$LDFLAGS" -o "$out_bin" ./cmd/server/ 2>/dev/null; then
            : # success without SDK
        else
            log_info "Retrying with macOS SDK..."
            extra_cflags="-I$DARWIN_SDK/usr/include -Wno-nullability-completeness -Wno-expansion-to-defined"
            extra_ldflags="-L$DARWIN_SDK/usr/lib -F$DARWIN_SDK/System/Library/Frameworks"
            
            CGO_ENABLED=1 GOOS="$goos" GOARCH="$goarch" \
                CC="$cc_base" \
                CGO_CFLAGS="$extra_cflags" \
                CGO_LDFLAGS="$extra_ldflags" \
                $GO_BIN build -trimpath -ldflags "$LDFLAGS" -o "$out_bin" ./cmd/server/
        fi
    else
        log_info "Building ${plat} (CGO_ENABLED=1, CC=${cc_base})"
        CGO_ENABLED=1 GOOS="$goos" GOARCH="$goarch" \
            CC="$cc_base" \
            $GO_BIN build -trimpath -ldflags "$LDFLAGS" -o "$out_bin" ./cmd/server/
    fi

    if [ -f "$out_bin" ]; then
        local size
        size=$(ls -lh "$out_bin" | awk '{print $5}')
        log_info "  -> $out_bin ($size)"
    else
        log_error "  Build failed for $plat"
        if [ "$goos" = "darwin" ] && [ -z "$DARWIN_SDK" ]; then
            echo ""
            echo "  Darwin cross-compilation may need macOS SDK."
            echo "  Run: scripts/setup-darwin-sdk.sh"
            echo "  Then: export SDKROOT=\"\$PWD/.sdk/MacOSX15.5.sdk\""
            echo ""
        fi
        return 1
    fi
}

echo ""
FAILED=()
for plat in $PLATFORMS; do
    if ! build_platform "$plat"; then
        FAILED+=("$plat")
    fi
    echo ""
done

# ── Summary ─────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}============================================================${NC}"
if [ ${#FAILED[@]} -eq 0 ]; then
    log_info "All builds succeeded!"
    echo -e "${CYAN}============================================================${NC}"
    echo ""
    echo "Output: dist/release/{platform}/dbridge"
    echo ""
    echo "Next: scripts/package.sh [platform] $VERSION"
else
    log_error "Failed platforms: ${FAILED[*]}"
    echo -e "${CYAN}============================================================${NC}"
    exit 1
fi
