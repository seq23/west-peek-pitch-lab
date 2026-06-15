#!/usr/bin/env bash
set -euo pipefail
mkdir -p logs
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=3072}"
npm run validate:authenticated-usability 2>&1|tee logs/deep-validation.log
npm run validate:all 2>&1|tee -a logs/deep-validation.log
echo "DEEP VALIDATION SAFE LOCAL LAYERS: PASS"
