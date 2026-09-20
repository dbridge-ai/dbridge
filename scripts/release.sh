#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

# ── Colors ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
log_info()  { echo -e "${GREEN}[RELEASE]${NC} $*"; }
log_warn()  { echo -e "${YELLOW}[RELEASE]${NC} $*"; }
log_error() { echo -e "${RED}[RELEASE]${NC} $*" >&2; }

# ── Args ────────────────────────────────────────────────────────────────────
PLATFORM="${1:-native}"
VERSION="${2:-}"
PUBLISH_ONLY=false

shift 2 2>/dev/null || true
for arg in "$@"; do
    case "$arg" in
        --publish-only) PUBLISH_ONLY=true ;;
    esac
done

if [ -z "$VERSION" ]; then
    VERSION=$(git describe --tags --always 2>/dev/null | sed 's/^v//' || echo "dev")
fi
VERSION=$(echo "$VERSION" | sed 's/^v//')

# ── Banner ──────────────────────────────────────────────────────────────────
echo -e "${CYAN}============================================================${NC}"
echo -e "${CYAN}  DBridge Community Release Pipeline${NC}"
echo -e "${CYAN}============================================================${NC}"
echo ""
log_info "Platform: $PLATFORM"
log_info "Version:  $VERSION"
log_info "Mode:     $(if $PUBLISH_ONLY; then echo 'publish-only'; else echo 'build → package → publish'; fi)"
echo ""

# ── Stage 1: Build ──────────────────────────────────────────────────────────
if ! $PUBLISH_ONLY; then
    echo -e "${CYAN}────────────────────────────────────────────────────────────${NC}"
    log_info "Stage 1/3: Build"
    echo -e "${CYAN}────────────────────────────────────────────────────────────${NC}"
    echo ""

    if ! "$SCRIPT_DIR/build.sh" "$PLATFORM" "$VERSION"; then
        log_error "Build stage failed"
        exit 1
    fi
    echo ""
else
    log_info "Skipping build (--publish-only)"
    echo ""
fi

# ── Stage 2: Package ────────────────────────────────────────────────────────
if ! $PUBLISH_ONLY; then
    echo -e "${CYAN}────────────────────────────────────────────────────────────${NC}"
    log_info "Stage 2/3: Package"
    echo -e "${CYAN}────────────────────────────────────────────────────────────${NC}"
    echo ""

    if ! "$SCRIPT_DIR/package.sh" "$PLATFORM" "$VERSION"; then
        log_error "Package stage failed"
        exit 1
    fi
    echo ""
else
    log_info "Skipping package (--publish-only)"
    echo ""
fi

# ── Stage 3: Publish ────────────────────────────────────────────────────────
echo -e "${CYAN}────────────────────────────────────────────────────────────${NC}"
log_info "Stage 3/3: Publish"
echo -e "${CYAN}────────────────────────────────────────────────────────────${NC}"
echo ""

if ! "$SCRIPT_DIR/publish.sh" "$PLATFORM" "$VERSION"; then
    log_error "Publish stage failed"
    echo ""
    echo "Archives are ready. Re-publish when network is stable:"
    echo "  scripts/publish.sh $PLATFORM $VERSION"
    exit 1
fi

# ── Done ────────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}============================================================${NC}"
log_info "Release $VERSION complete!"
echo -e "${CYAN}============================================================${NC}"
