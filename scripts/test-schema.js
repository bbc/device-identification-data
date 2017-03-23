const joi = require('joi')

const schemaString = joi.string().regex(/^[-_,;+ =/.a-zA-Z0-9()#&:]+$/g)
const schema = joi.object({
  brand: joi.string().required(),
  model: joi.string().required(),
  fuzzy: schemaString.allow('').required(),
  invariants: joi.array().items(schemaString).required(),
  disallowed: joi.array().items(schemaString).required(),
  type: joi.string().required()
})

function testSchema (devices) {
  const results = Object.keys(devices).map(key => {
    const device = devices[key]
    const error = joi.validate(device, schema, err => err)

    return {
      device,
      key,
      error
    }
  })

  return results
}

module.exports = testSchema
