#!/usr/bin/env node

const NL = '\n'
const colors = require('colors/safe')
const getDevices = require('../scripts/get-devices')
const testSchema = require('../scripts/test-schema')

const directory = './devices/**/*.json'

function summarise (results) {
  const errors = results.filter(result => result.error !== null)
  const valids = results.filter(result => result.error === null)

  console.log('Validating schemas for device mappings:')
  results.forEach((result) => {
    console.log('', colors.grey(`Checked #${result.key} ${result.device.brand}-${result.device.model}.json`))
  })
  console.log('')
  console.log(colors.blue(`Checked ${results.length} devices in total`), NL)

  if (errors.length) {
    console.log(colors.red(`Found ${errors.length} validation errors:`), NL)
    errors.forEach((result) => {
      const details = result.error.details.map((detail) => {
        return JSON.stringify(detail)
      }).join(', ')
      console.log(colors.red(`  Error in #${result.key} ${result.device.brand}-${result.device.model}.json, ${details}`), NL)
    })
  }
  if (valids) {
    console.log(colors.green(`Schema validation successful for ${valids.length} devices`), NL)
  }

  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2)
  console.log(colors.grey(`Time taken: ${timeTaken}s`), NL)

  if (errors.length) {
    process.exit(1)
  } else {
    process.exit(0)
  }
}

const startTime = Date.now()
getDevices(directory)
  .then(testSchema)
  .then(summarise)
