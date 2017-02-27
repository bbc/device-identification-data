const glob = require('glob')
const path = require('path')
const fs = require('fs')

function getDevices (directory) {
  return new Promise(resolve => {
    let devices = []

    glob(directory, (err, files) => {
      files.forEach(file => {
        let contents = require(`../${file}`)
        const device = path.basename(file, '.json').split('-')
        contents.brand = device[0]
        contents.model = device[1]
        devices.push(contents)
      })

      resolve(devices)
    })
  })
}

module.exports = getDevices
