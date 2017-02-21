const joi = require('joi')

const schemaString = joi.string().regex(/^[-_,;+ =\/\.a-zA-Z0-9\(\)]+$/g)
const schema = joi.object({
  fuzzy: schemaString.allow(''),
  invariants: joi.array().items(schemaString),
  disallowed: joi.array().items(schemaString)
})

function testSchema (devices) {
  const results = Object.keys(devices).map(device => {
    const error = joi.validate(devices[device], schema, err => err)

    return {
      device: device,
      error: error
    }
  }).filter(result => result.error !== null)

  return results
}

module.exports = testSchema
