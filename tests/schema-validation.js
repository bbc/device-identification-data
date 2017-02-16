const joi = require('joi')
const fs = require('fs')
const glob = require('glob')

const schemaString = joi.string().regex(/^[-,;+ =\/\.a-zA-Z0-9\(\)]*/)

const schema = joi.object().keys({
  fuzzy: schemaString.required(),
  invariants: joi.array().items(schemaString),
  disallowed: joi.array().items(schemaString)
})

glob("./devices/**/*.json", function (err, files) {
  const results = files.map(file => {
    const contents = fs.readFileSync(file, 'utf-8')
    const result = joi.validate(contents, schema, (err, value) => {
      return err
    })

    return {
      device : file,
      result: result
    }
  }).filter(result => result.result !== null)

  console.log(results)
})
