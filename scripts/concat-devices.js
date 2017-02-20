#!/usr/bin/env node

const fs = require('fs')
const glob = require('glob')
const path = require('path')

const filename = process.argv[2]
const outputFile = process.argv[3]

let devices = {}

glob(filename, (err, files) => {
  files.forEach(file => {
    const contents = fs.readFileSync(file, 'utf-8')

    devices[path.basename(file, '.json')] = JSON.parse(contents)
  })

  fs.writeFileSync(outputFile, JSON.stringify(devices))
})
