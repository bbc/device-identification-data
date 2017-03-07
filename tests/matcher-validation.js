const csv = require('csv')
const fetch = require('node-fetch')
const colors = require('colors/safe')
const melanite = require('melanite')
const NL = '\n'

const devices = require('../output/device-identification-data.json')
const fetchTestData = fetch('https://connected-tv.files.bbci.co.uk/tvp-user-agents/data.csv')
const match = melanite.match(devices)

function parse (data) {
  return new Promise((resolve, reject) => {
    csv.parse(data, (err, parsed) => {
      if (err) return reject(err)
      return resolve(parsed)
    })
  })
}

function microTime () {
  const hrTime = process.hrtime()
  return (hrTime[0] * 1000000) + (hrTime[1] / 1000)
}

function checkForUntested (results) {
  const tested = {}
  const untested = []
  results.forEach((result) => {
    const device = result.expected
    const key = `${device.brand}-${device.model}`
    tested[key] = result
  })
  devices.forEach((deviceMatcher) => {
    const key = `${deviceMatcher.brand}-${deviceMatcher.model}`
    if (!tested[key]) {
      untested.push(deviceMatcher)
    }
  })
  untested.forEach((deviceMatcher) => {
    const testStart = microTime()
    results.push({
      expected: {
        brand: 'Brand not tested',
        model: 'Model not tested'
      },
      actual: {
        brand: deviceMatcher.brand,
        model: deviceMatcher.model
      },
      ua: 'No user-agent specified',
      timeTaken: microTime() - testStart,
      warning: true
    })
  })

  return results
}

function testLine (line) {
  const [brand, model, ua] = line

  const testStart = microTime()
  const localDevice = devices.find((matcher) => matcher.brand === brand && matcher.model === model)
  const matchedDevice = match(ua)
  const timeTaken = microTime() - testStart

  const result = {
    expected: {
      brand,
      model
    },
    actual: {
      brand: matchedDevice.brand,
      model: matchedDevice.model
    },
    ua,
    timeTaken
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
  const error = [
    `Expected: ${expected.brand}-${expected.model}`,
    `Actual: ${actual.brand}-${actual.model}`,
    `UA: ${ua}`,
    ``
  ].join(NL)
  console.error(colors.red(error))
}

function logWarning (warning) {
  const {
    expected,
    actual,
    ua
  } = warning
  const warn = [
    `Expected: ${expected.brand}-${expected.model}`,
    `Actual: ${actual.brand}-${actual.model}`,
    `UA: ${ua}`,
    ``
  ].join(NL)
  console.error(colors.yellow(warn))
}

function summarise (results) {
  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2)

  const failures = results.filter(item => item.fail)
  const successes = results.filter(item => item.success)
  const warnings = results.filter(item => item.warning)

  if (failures.length) {
    failures.forEach(logFailure)
    console.log(colors.red(['Total failures: ', failures.length, NL].join('')))
    process.exit(1)
  }
  if (successes.length) {
    console.log(colors.green(`Successful checks: ${successes.length}${NL}`))
  }
  if (warnings.length) {
    warnings.forEach(logWarning)
    console.log(colors.yellow(`Warnings: ${warnings.length} (No local matchers)${NL}`))
  }

  const sumTimeTaken = results.reduce((total, item) => {
    return total + item.timeTaken
  }, 0)

  console.log(colors.grey(`Sum matcher time: ${(sumTimeTaken / 1000 / 1000).toFixed(2)}s`), NL)
  console.log(colors.grey(`Overall time taken: ${timeTaken}s`), NL)

  if (failures.length) {
    process.exit(1)
  } else {
    process.exit(0)
  }
}

const startTime = Date.now()
fetchTestData.then((response) => {
  return response.text()
}).then((testData) => {
  return parse(testData)
}).then((testDataLines) => {
  const results = testDataLines.map(testLine)
  console.log('')
  console.log(colors.blue(`Total user-agents: ${testDataLines.length}${NL}`))
  return checkForUntested(results)
}).then(summarise).catch((error) => {
  console.error('Something went horribly wrong')
  console.error(error)
  process.exit(1)
})
