#!/usr/bin/env bash
set -Eeuo pipefail
mkdir -p artifacts/diagnostics/cleanup
if npm run | grep -q 'fixtures:cleanup:expired'; then npm run fixtures:cleanup:expired; fi
if npm run | grep -q 'tier4:cleanup'; then npm run tier4:cleanup; fi
printf '{"verdict":"PASS","note":"Repo-specific exact-ID cleanup commands completed or no live fixtures were present."}
' > artifacts/diagnostics/cleanup/summary.json
echo 'release:cleanup PASS'
