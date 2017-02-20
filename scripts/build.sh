#!/bin/bash
set -e

mkdir -p ./output
npm install
./scripts/concat-devices.js "./devices/**/*.json" "./output/device-identification-data.json"
aws s3 sync output s3://connected-tv-public-unversioned/device-identification-data/data.json --cache-control max-age=60 --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers
