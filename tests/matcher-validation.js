const csv = require('csv')
const fetch = require('node-fetch')
const colors = require('colors/safe')
const melanite = require('melanite')
const argv = require('yargs').argv
const NL = '\n'

const devices = require('../output/device-identification-data.json')
const testDataUrl = 'https://connected-tv.files.bbci.co.uk/tvp-user-agents/data.csv'

// Optional environment variables
const brand = process.env.BRAND
const model = process.env.MODEL
const localUserAgents = process.env.USER_AGENTS
const localFuzzyMatcher = process.env.FUZZY_MATCHER
const localInvariants = process.env.INVARIANTS
const localDisallowed = process.env.DISALLOWED
const localType = process.env.TYPE

function addLocalDevice () {
  if (brand && model && localFuzzyMatcher && localType) {
    let localDevice = {
      brand,
      model,
      invariants: localInvariants ? localInvariants.split(',') : [],
      fuzzy: localFuzzyMatcher,
      disallowed: localDisallowed ? localDisallowed.split(',') : [],
      type: localType
    }

    console.log('Creating local device:')
    console.log(JSON.stringify(localDevice, null, 2))

    devices.push(localDevice)
  }
}

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

let count = 0

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

  if (count % 100 === 99) {
    process.stdout.write('.')
    if (count % 1000 === 999) {
      process.stdout.write(NL)
    }
  }
  count++

  return result
}

function filterDevices (lines) {
  const includeBrand = argv['brand-only']
  if (includeBrand) {
    console.log(colors.grey(`Filter applied, only testing ${includeBrand} devices`))
    const brandsToInclude = includeBrand.split(',')
    return lines.filter(line => brandsToInclude.includes(line[0]))
  }
  const excludeBrand = argv['brand-not']
  if (excludeBrand) {
    console.log(colors.grey(`Filter applied, not testing ${excludeBrand} devices`))
    const brandsToExclude = excludeBrand.split(',')
    return lines.filter(line => !brandsToExclude.includes(line[0]))
  }
  const includeModel = argv['model-only']
  if (includeModel) {
    console.log(colors.grey(`Filter applied, only testing ${includeModel} model`))
    const modelsToInclude = includeModel.split(',')
    return lines.filter(line => modelsToInclude.includes(line[1]))
  }
  const excludeModel = argv['model-not']
  if (excludeModel) {
    console.log(colors.grey(`Filter applied, not testing ${excludeModel} model`))
    const modelsToExclude = excludeModel.split(',')
    return lines.filter(line => !modelsToExclude.includes(line[1]))
  }
  return lines
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

function addLocalUserAgent (userAgents) {
  if (brand && model && localUserAgents) {
    let newEntries = localUserAgents.trim()
      .split(NL)
      .filter((line) => line.trim())
      .map((userAgent) => {
        return `"${brand}","${model}","${userAgent}"`
      })
    if (newEntries.length) {
      console.log('Using custom user agents:')
      console.log(newEntries.join(NL))
    }
    return userAgents.trim() + NL + newEntries.join(NL)
  }
  return userAgents
}

const startTime = Date.now()
addLocalDevice()
const match = melanite.match(devices)

console.log('Validating matchers for all user agents:')
console.log('Fetching test data from:', testDataUrl)
fetch(testDataUrl).then((response) => {
  return response.text()
}).then((testData) => {
  const modifiedTestData = addLocalUserAgent(testData)
  return parse(modifiedTestData)
}).then((testDataLines) => {
  const lines = filterDevices(testDataLines)
  const results = lines.map(testLine)
  console.log('')
  console.log(colors.blue(`Total user-agents: ${testDataLines.length}${NL}`))
  return checkForUntested(results)
}).then(summarise).catch((error) => {
  console.error('Something went horribly wrong')
  console.error(error)
  process.exit(1)
})
