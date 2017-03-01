const glob = require('glob')
const path = require('path')

function getDevices (directory) {
  return new Promise(resolve => {
    let devices = []

    glob(directory, (err, files) => {
      if (err) throw err
      files.forEach(file => {
        let contents = require(`../${file}`)
        const device = path.basename(file, '.json').split('-')

        contents.map(content => {
          content.brand = device[0]
          content.model = device[1]
          devices.push(content)
        })
      })

      resolve(devices)
    })
  })
}

module.exports = getDevices
