const glob = require('glob')
const path = require('path')
const fs = require('fs')

function getDevices (directory) {
  return new Promise((resolve, reject) => {
    let devices = {}

    glob(directory, (err, files) => {
      files.forEach(file => {
        const contents = fs.readFileSync(file, 'utf-8')
        const device = path.basename(file, '.json')
        devices[device] = JSON.parse(contents)
      })

      resolve(devices)
    })
  })
}

module.exports = getDevices
