#!/usr/bin/env node
const fs = require('fs')

const getDevices = require('../scripts/get-devices')

const directory = process.argv[2]
const outputFile = process.argv[3]

getDevices(directory).then(devices => {
  fs.writeFileSync(outputFile, JSON.stringify(devices))
})
