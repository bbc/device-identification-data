# Device Identification Data

This project contains data designed to be consumed by [Melanite](https://github.com/bbc/melanite), and used by [Matterhorn](https://github.com/bbc/matterhorn).

## Development

Clone the project:
```
git clone git@github.com:bbc/device-identification-data
```

Install dependencies:
```
npm install
```

### Test

To check the data against the schema provided, run:
```
npm test
```

### Create a new matcher

To create a new matcher, run:

```
npm run create
```

Then follow the prompt to enter a brand and model.

#### Matcher testing
To run only the matcher tests, run:
```
npm run test:matcher
```

You can also filter the matcher tests to run against a specific brand
```
npm run test:matcher -- --brand-only=panasonic
```

You can also filter the matcher tests to ignore a specific brand
```
npm run test:matcher -- --brand-not=panasonic
```

You can also filter the matcher tests to run against a specific model
```
npm run test:matcher -- --model-only=tv_2011
```

You can also filter the matcher tests to ignore a specific model
```
npm run test:matcher -- --model-not=tv_2011
```

You can also pass multiple brands/models to the above commands by comma seperating them
