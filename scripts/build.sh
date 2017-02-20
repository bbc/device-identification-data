#!/bin/bash
set -e

mkdir -p ./output
npm install
./scripts/concat-devices.js "./devices/**/*.json" "./output/device-identification-data.json"
