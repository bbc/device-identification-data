const fetch = require('node-fetch');
const csv = require('csv');

const output = require('../output/device-identification-data.json');

const testDataFetch = fetch('https://connected-tv.files.bbci.co.uk/tvp-user-agents/dax.csv');

testDataFetch.then((response) => {
  return response.text();
}).then((testData) => {
  csv.parse(testData, (err, data) => {
    if (err) throw err;
    
    console.log(data);
  });
});
