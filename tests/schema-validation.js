#!/usr/bin/env node
const getDevices = require('../scripts/get-devices')
const testSchema = require('../scripts/test-schema')

const directory = process.argv[2]
const outputFile = process.argv[3]

getDevices(directory).then(devices => {
  const results = testSchema(devices)

  if (results.length) {
    console.log('Validation errors:')
    console.log(results)
  } else {
    console.log('Validation successful')
  }
})
