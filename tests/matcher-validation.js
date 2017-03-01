const fetch = require('node-fetch')
const csv = require('csv')
const melanite = require('melanite')
const NL = '\n'

const devices = require('../output/device-identification-data.json')
const fetchTestData = fetch('https://connected-tv.files.bbci.co.uk/tvp-user-agents/dax.csv')
const match = melanite.match(devices)

function parse (data) {
  return new Promise((resolve, reject) => {
    csv.parse(data, (err, parsed) => {
      if (err) return reject(err)
      return resolve(parsed)
    })
  })
}

function testLine (line) {
  const [brand, model, ua] = line

  const localDevice = devices.find((matcher) => matcher.brand === brand && matcher.model === model)
  const matchedDevice = match(ua)

  console.log('Testing', ua, 'Expecting', brand, model)

  const result = {
    expected: {
      brand,
      model
    },
    actual: {
      brand: matchedDevice.brand,
      model: matchedDevice.model
    },
    ua: ua
  }

  if (localDevice) {
    if (localDevice.brand === matchedDevice.brand && localDevice.model === matchedDevice.model) {
      result.success = true
    } else {
      result.fail = true
    }
  } else {
    result.warning = true
    result.message = `No local device found for ${brand}-${model}`
  }

  return result
}

function logFailure (failure) {
  const {
    expected,
    actual,
    ua
  } = failure
  console.error([
    `Bad match: ${expected.brand}-${expected.model}`,
    `UA: ${ua}`,
    `Expected to match: ${actual.brand}-${actual.model}`,
    ``
  ].join(NL))
}

fetchTestData.then((response) => {
  return response.text()
}).then((testData) => {
  return parse(testData)
}).then((testDataLines) => {
  const results = testDataLines.map(testLine)
  console.log('Total user-agents:', testDataLines.length, NL)
  return results
}).then((results) => {
  const failures = results.filter(item => item.fail)
  const successes = results.filter(item => item.success)
  const warnings = results.filter(item => item.warning)

  if (failures && failures.length) {
    failures.forEach(logFailure)
    console.log('Total failures: ' + failures.length, NL)
    process.exit(1)
  } else {
    console.log('Successful checks: ' + successes.length, NL)
    console.log('Warnings: ' + warnings.length, '(No local matchers)', NL)
    process.exit(0)
  }
}).catch((error) => {
  console.error('Something went horribly wrong')
  console.error(error)
  process.exit(1)
})
