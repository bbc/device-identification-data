#!/bin/bash
set -e

aws s3 cp output/device-identification-data.json s3://connected-tv-public-unversioned/device-identification-data/data.json --cache-control max-age=60 --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers
