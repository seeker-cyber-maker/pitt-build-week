#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

PITT_VIDEO_VERSION=v3 scripts/build-submission-video-v2.sh
