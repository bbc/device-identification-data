#!/usr/bin/env node

const getDevices = require('../scripts/get-devices')
const testSchema = require('../scripts/test-schema')

const directory = './devices/**/*.json'

function summarise (results) {
  const errors = results.filter(result => result.error !== null)
  const valids = results.filter(result => result.error === null)

  console.log('Validating schemas for device mappings:')
  results.forEach((result) => {
    console.log('', 'Checked', result.device.brand, result.device.model)
  })
  console.log(`Checked ${results.length} devices in total`)

  if (errors.length) {
    console.log(`Found ${errors.length} validation errors:`)
    errors.forEach((result) => {
      console.log(' ', 'Error in', result.device, result.error.details.map((detail) => {
        return JSON.stringify(detail)
      }).join(', '))
    })
  }
  if (valids) {
    console.log(`Validation successful for ${valids.length} devices`)
  }

  if (errors.length) {
    process.exit(1)
  } else {
    process.exit(0)
  }
}

getDevices(directory)
  .then(testSchema)
  .then(summarise)
