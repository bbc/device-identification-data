const fetch = require('node-fetch');
const csv = require('csv');
const melanite = require('melanite');

const output = require('../output/device-identification-data.json');

const testDataFetch = fetch('https://connected-tv.files.bbci.co.uk/tvp-user-agents/dax.csv');

const match = melanite.match(output);

function parse (data) {
  return new Promise((resolve, reject) => {
    csv.parse(data, (err, parsed) => {
      if (err) return reject(err)
      return resolve(parsed)
    })
  })
}

testDataFetch.then((response) => {
  return response.text();
}).then((testData) => {
  return parse(testData)
}).then((testDataLines) => {
  testDataLines.forEach((testDataLine) => {
    const [brand, model, ua] = testDataLine;

    const device = match(ua);

    const outputDevices = output.filter((matcher) => matcher.brand === brand && matcher.model === model);

    if (outputDevices.length) {
      const outputBrand = outputDevices[0].brand;
      const outputModel = outputDevices[0].model;

      if (device.brand !== outputBrand || device.model !== outputModel) {
        console.error(
          `Bad match: ${outputBrand} ${outputModel}`,
          `Expected to match: ${brand} ${model}`,
          `UA: ${ua}`
        );
        process.exit(1);
      }
    }
  });
});
