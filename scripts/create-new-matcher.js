const fs = require('fs')
const prompt = require('prompt')
const { run, write } = require('promise-path')
const NL = '\n'

function validateBrandModel (brand, model) {
  const validateDeviceKey = /^[a-z][a-z\d_]+-[a-z][a-z\d_]+$/

  let deviceKey = `${brand}-${model}`

  if (!brand || !model) {
    console.log('No brand-model provided; use: `npm run create brand-model`', NL)
    process.exit(1)
  }

  if (brand === 'brand' || model === 'model') {
    console.log(`Brand '${brand}', Model '${model}' is not allowed.`, NL)
    process.exit(1)
  }

  if (validateDeviceKey.test(deviceKey) === false) {
    console.log(`Device key: '${deviceKey}' contains invalid characters, must match: ${validateDeviceKey}`, NL)
    process.exit(1)
  }

  if (fs.existsSync(`devices/${brand}/${brand}-${model}.json`)) {
    console.log(`Matcher already exists: devices/${brand}/${brand}-${model}.json`, NL)
    process.exit(1)
  }
}

function createNewMatcher (brand, model) {
  console.log(`Creating empty matcher for Brand: ${brand}, Model: ${model}`, NL)
  const matcherTemplate = [
    {
      'invariants': [
        'MUST HAVE THIS STRING'
      ],
      'disallowed': [],
      'fuzzy': 'SAMPLE USERAGENT STRING THAT MUST HAVE THIS STRING',
      'type': 'tv'
    }
  ]

  const pp = (data) => JSON.stringify(data, null, 2)
  const writeMatcher = () => write(`devices/${brand}/${brand}-${model}.json`, pp(matcherTemplate), 'utf8')
  const logSuccess = () => console.log(`Successfully created devices/${brand}/${brand}-${model}.json`, NL)
  const logFail = (ex) => console.log(`Unable to create devices/${brand}/${brand}-${model}.json : `, ex, NL)

  return run(`mkdir -p devices/${brand}`)
    .then(writeMatcher)
    .then(logSuccess)
    .catch(logFail)
}

function askForBrandModel () {
  // Start the prompt
  prompt.start()

  // Get two properties from the user: username and email
  prompt.get(['brand', 'model'], function (err, result) {
    if (err) {
      return console.log(`Unable read brand model values from prompt.`, err, NL)
    }

    let { brand, model } = result
    // Log the results.
    console.log('Received:')
    console.log(`  brand: ${brand}`)
    console.log(`  model: ${model}`)

    // Validate the characters contained in brand and model
    validateBrandModel(brand, model)

    // Make the new matcher file based on the template
    createNewMatcher(brand, model)
  })
}

askForBrandModel()
