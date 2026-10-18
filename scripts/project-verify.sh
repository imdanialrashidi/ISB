#!/usr/bin/env bash
# ISB project verification lane, invoked by the canonical scripts/verify.sh
# after the template self-checks pass. Covers the site's static gates plus a
# production build. Browser smoke stays local: npm run test:e2e.
set -Eeuo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

npm run lint
npm run check
npm run validate:content
npm test
npm run build
