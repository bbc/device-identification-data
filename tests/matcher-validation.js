const fetch = require('node-fetch')
const csv = require('csv')
const melanite = require('melanite')

const output = require('../output/device-identification-data.json')

const testDataFetch = fetch('https://connected-tv.files.bbci.co.uk/tvp-user-agents/dax.csv')

const match = melanite.match(output)

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

  const device = match(ua)

  const outputDevice = output.find((matcher) => matcher.brand === brand && matcher.model === model)

  if (outputDevice) {
    if (device.brand !== outputDevice.brand || device.model !== outputDevice.model) {
      return {
        expected: { brand: device.brand, model: device.model },
        actual: { brand: outputDevice.brand, model: outputDevice.model },
        ua: ua
      }
    }
  }
}

function logFailure (failure) {
  const {expected, actual, ua} = failure
  console.error(`
    Bad match: ${expected.brand} ${expected.model}
    Expected to match: ${actual.brand} ${actual.model}
    UA: ${ua}
  `)
}

testDataFetch.then((response) => {
  return response.text()
}).then((testData) => {
  return parse(testData)
}).then((testDataLines) => {
  const results = testDataLines.map(testLine)
  return results.filter(item => item !== undefined)
}).then((failures) => {
  return failures.forEach(logFailure)
}).catch((error) => {
  console.error(error)
  process.exit(1)
})
