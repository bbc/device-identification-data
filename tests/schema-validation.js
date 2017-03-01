#!/usr/bin/env node

const getDevices = require('../scripts/get-devices')
const testSchema = require('../scripts/test-schema')

const directory = './devices/**/*.json'

getDevices(directory).then(devices => {
  const results = testSchema(devices)
  const errors = results.filter(result => result.error !== null)

  if (errors.length) {
    console.log('Validation errors:')
    errors.forEach((result) => {
      console.log('', 'Error in', result.device, result.error.details.map((detail) => {
        return JSON.stringify(detail)
      }).join(', '))
    })
    process.exit(1)
  } else {
    console.log('Validation successful')
    results.forEach((result) => {
      console.log('', 'Checked', result.device)
    })
  }
})
