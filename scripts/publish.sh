#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

# ── Colors ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
log_info()  { echo -e "${GREEN}[PUBLISH]${NC} $*"; }
log_warn()  { echo -e "${YELLOW}[PUBLISH]${NC} $*"; }
log_error() { echo -e "${RED}[PUBLISH]${NC} $*" >&2; }

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
MAX_RETRIES=3

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

# ── Preflight ───────────────────────────────────────────────────────────────
if ! command -v gh &>/dev/null; then
    log_error "GitHub CLI (gh) not found. Install: https://cli.github.com/"
    exit 1
fi

if ! gh auth status &>/dev/null 2>&1; then
    log_error "GitHub CLI not authenticated. Run: gh auth login"
    exit 1
fi

# Detect repo from git remote
REPO=$(git remote get-url github 2>/dev/null | sed 's/.*github.com[:/]//;s/\.git$//' || \
       git remote get-url origin 2>/dev/null | sed 's/.*github.com[:/]//;s/\.git$//' || "")
if [ -z "$REPO" ]; then
    log_error "Cannot detect GitHub repo. Set remote: git remote add github git@github.com:ORG/REPO.git"
    exit 1
fi

TAG="v${VERSION}"

log_info "Repo:    $REPO"
log_info "Tag:     $TAG"
log_info "Version: $VERSION"
log_info "Platforms: $PLATFORMS"
log_info "Retries: $MAX_RETRIES"
echo ""

# ── Create release if not exists ────────────────────────────────────────────
create_release() {
    if gh release view "$TAG" --repo "$REPO" &>/dev/null; then
        log_info "Release $TAG already exists"
        return 0
    fi

    log_info "Creating release $TAG..."
    gh release create "$TAG" \
        --repo "$REPO" \
        --title "$TAG" \
        --notes "## DBridge Community $TAG

### Multi-platform builds
- linux-amd64 / linux-arm64
- darwin-amd64 / darwin-arm64
- windows-amd64

### Usage
1. Download the archive for your platform
2. Extract and edit \`configs/config.yaml\`
3. Start: \`./start.sh\` (Windows: run \`dbridge.exe\`)" \
        --draft=false \
        --prerelease=false
}

create_release
echo ""

# ── Upload with retry ───────────────────────────────────────────────────────
upload_with_retry() {
    local file="$1"
    local filename
    filename=$(basename "$file")
    local attempt=1
    local delay=5

    while [ $attempt -le $MAX_RETRIES ]; do
        log_info "  Upload attempt $attempt/$MAX_RETRIES: $filename"

        if gh release upload "$TAG" "$file" --repo "$REPO" --clobber 2>&1; then
            log_info "  -> Uploaded: $filename"
            return 0
        fi

        if [ $attempt -lt $MAX_RETRIES ]; then
            log_warn "  Upload failed, retrying in ${delay}s..."
            sleep "$delay"
            delay=$((delay * 3))
        fi
        attempt=$((attempt + 1))
    done

    log_error "  Upload failed after $MAX_RETRIES attempts: $filename"
    return 1
}

# ── Main ────────────────────────────────────────────────────────────────────
FAILED=()
for plat in $PLATFORMS; do
    local_goos="${GOOS_MAP[$plat]}"
    archive_name="dbridge_${VERSION}_${plat}"

    if [ "$local_goos" = "windows" ]; then
        archive_file="$ROOT_DIR/dist/release/${archive_name}.zip"
    else
        archive_file="$ROOT_DIR/dist/release/${archive_name}.tar.gz"
    fi

    if [ ! -f "$archive_file" ]; then
        log_error "Archive not found: $archive_file"
        log_error "Run: scripts/package.sh $plat $VERSION"
        FAILED+=("$plat")
        continue
    fi

    log_info "Publishing ${plat}..."
    if ! upload_with_retry "$archive_file"; then
        FAILED+=("$plat")
    fi
    echo ""
done

# ── Summary ─────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}============================================================${NC}"
if [ ${#FAILED[@]} -eq 0 ]; then
    log_info "All platforms published!"
    echo -e "${CYAN}============================================================${NC}"
    echo ""
    echo "Release: https://github.com/${REPO}/releases/tag/${TAG}"
else
    log_error "Failed platforms: ${FAILED[*]}"
    echo -e "${CYAN}============================================================${NC}"
    echo ""
    echo "Re-publish failed platforms:"
    for plat in "${FAILED[@]}"; do
        echo "  scripts/publish.sh $plat $VERSION"
    done
    exit 1
fi
