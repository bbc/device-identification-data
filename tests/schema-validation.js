const joi = require('joi')
const fs = require('fs')
const glob = require('glob')

const schemaString = joi.string().regex(/^[-_,;+ =\/\.a-zA-Z0-9\(\)]+$/g)

const schema = joi.object({
  fuzzy: schemaString,
  invariants: joi.array().items(schemaString),
  disallowed: joi.array().items(schemaString)
})

glob("./devices/**/*.json", (err, files) => {
  const results = files.map(file => {
    const contents = fs.readFileSync(file, 'utf-8')
    const error = joi.validate(contents, schema, (err, value) => {
      console.log('***')
      console.log(err)
      console.log(value)
    })

    return {
      device: file,
      error: error
    }
  }).filter(result => result.error !== undefined)

  if (results.length) {
    console.log('Validation errors:')
    console.log(results)
  } else {
    console.log('No validation errors')
  }
})
