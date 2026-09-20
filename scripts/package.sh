#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

# ── Colors ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
log_info()  { echo -e "${GREEN}[PACKAGE]${NC} $*"; }
log_warn()  { echo -e "${YELLOW}[PACKAGE]${NC} $*"; }
log_error() { echo -e "${RED}[PACKAGE]${NC} $*" >&2; }

# ── Platform definitions ────────────────────────────────────────────────────
ALL_PLATFORMS="linux-amd64 linux-arm64 darwin-arm64 darwin-amd64 windows-amd64"

declare -A GOOS_MAP=(
    [linux-amd64]=linux  [linux-arm64]=linux
    [darwin-amd64]=darwin [darwin-arm64]=darwin
    [windows-amd64]=windows
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
VERSION=$(echo "$VERSION" | sed 's/^v//')

# ── Resolve platform list ───────────────────────────────────────────────────
if [ "$PLATFORM" = "all" ]; then
    PLATFORMS="$ALL_PLATFORMS"
else
    if [ -z "${GOOS_MAP[$PLATFORM]+x}" ]; then
        log_error "Unknown platform: $PLATFORM"
        echo "Valid: $ALL_PLATFORMS | all | native"
        exit 1
    fi
    PLATFORMS="$PLATFORM"
fi

log_info "Version: $VERSION"
log_info "Platforms: $PLATFORMS"
echo ""

# ── Package function ────────────────────────────────────────────────────────
package_platform() {
    local plat="$1"
    local goos="${GOOS_MAP[$plat]}"
    local bin_dir="$ROOT_DIR/dist/release/${plat}"
    local archive_dir="$ROOT_DIR/dist/release"
    local archive_name="dbridge_${VERSION}_${plat}"

    local ext=""
    local bin_ext=""
    [ "$goos" = "windows" ] && bin_ext=".exe"

    local src_bin="${bin_dir}/dbridge${bin_ext}"
    if [ ! -f "$src_bin" ]; then
        log_error "Binary not found: $src_bin"
        log_error "Run: scripts/build.sh $plat $VERSION"
        return 1
    fi

    if [ "$goos" = "windows" ]; then
        # Windows zip: flat structure (no top-level directory)
        local pkg_tmp="${archive_dir}/_pkg_${plat}"
        rm -rf "$pkg_tmp"
        mkdir -p "$pkg_tmp/web"

        cp "$src_bin" "$pkg_tmp/"
        cp -r "$ROOT_DIR/web/dist" "$pkg_tmp/web/"
        cp -r "$ROOT_DIR/configs" "$pkg_tmp/"

        local zip_file="${archive_dir}/${archive_name}.zip"

        if command -v zip &>/dev/null; then
            (cd "$pkg_tmp" && zip -qr "$zip_file" .)
        elif command -v powershell &>/dev/null; then
            powershell -Command "Compress-Archive -Path '${pkg_tmp}/*' -DestinationPath '${zip_file}' -Force"
        else
            log_error "Neither zip nor powershell found. Cannot create zip."
            rm -rf "$pkg_tmp"
            return 1
        fi

        rm -rf "$pkg_tmp"

        if [ -f "$zip_file" ]; then
            local size
            size=$(ls -lh "$zip_file" | awk '{print $5}')
            log_info "  -> $zip_file ($size)"
        else
            log_error "  Package failed for $plat"
            return 1
        fi
    else
        # tar.gz: with top-level directory
        local pkg_dir="${archive_dir}/${archive_name}"
        rm -rf "$pkg_dir"
        mkdir -p "$pkg_dir/web"

        cp "$src_bin" "$pkg_dir/"
        cp -r "$ROOT_DIR/web/dist" "$pkg_dir/web/"
        cp -r "$ROOT_DIR/configs" "$pkg_dir/"

        # Copy shell scripts if they exist
        for sh in start.sh stop.sh restart.sh status.sh; do
            [ -f "$ROOT_DIR/$sh" ] && cp "$ROOT_DIR/$sh" "$pkg_dir/"
        done

        local tar_file="${archive_dir}/${archive_name}.tar.gz"
        tar -czf "$tar_file" -C "$archive_dir" "$archive_name"

        rm -rf "$pkg_dir"

        if [ -f "$tar_file" ]; then
            local size
            size=$(ls -lh "$tar_file" | awk '{print $5}')
            log_info "  -> $tar_file ($size)"
        else
            log_error "  Package failed for $plat"
            return 1
        fi
    fi
}

# ── Main ────────────────────────────────────────────────────────────────────
FAILED=()
for plat in $PLATFORMS; do
    log_info "Packaging ${plat}..."
    if ! package_platform "$plat"; then
        FAILED+=("$plat")
    fi
    echo ""
done

# ── Summary ─────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}============================================================${NC}"
if [ ${#FAILED[@]} -eq 0 ]; then
    log_info "All packages created!"
    echo -e "${CYAN}============================================================${NC}"
    echo ""
    echo "Output: dist/release/dbridge_${VERSION}_<platform>.{tar.gz|zip}"
    echo ""
    echo "Next: scripts/publish.sh [platform] $VERSION"
else
    log_error "Failed platforms: ${FAILED[*]}"
    echo -e "${CYAN}============================================================${NC}"
    exit 1
fi
