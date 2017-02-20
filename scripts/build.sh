#!/bin/bash
mkdir -p ./output
./scripts/concat-devices.js "./devices/**/*.json" "./output/device-identification-data.json"
