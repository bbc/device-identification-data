#!usr/bin/env node

const fs = require('fs');

var deviceBrands = fs.readdirSync('devices');

deviceBrands.forEach(function(brand) {
    var deviceModels = fs.readdirSync(`devices/${brand}`);
    deviceModels.forEach(function(model) {
      var deviceData = JSON.parse(fs.readFileSync(`devices/${brand}/${model}`, 'utf-8'));
    })
})
