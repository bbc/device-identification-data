const joi = require('joi')
const fs = require('fs')
const glob = require('glob')

const schemaString = joi.string().regex(/^[-_,;+ =\/\.a-zA-Z0-9\(\)]+$/g)

const schema = joi.object({
  fuzzy: schemaString,
  invariants: joi.array().items(schemaString),
  disallowed: joi.array().items(schemaString)
})

const files = process.argv[2]

glob(files, (err, files) => {
  const results = files.map(file => {
    const contents = fs.readFileSync(file, 'utf-8')
    const error = joi.validate(contents, schema, err => err)

    return {
      device: file,
      error: error
    }
  }).filter(result => result.error !== null)

  if (results.length) {
    console.log('Validation errors:')
    console.log(results)
  } else {
    console.log('Validation successful')
  }
})
