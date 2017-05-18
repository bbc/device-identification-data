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

## Test

To check the data against the schema provided, run:
```
npm test
```

### Matcher Testing Tool

A build job [check-device-matchers](https://jenkins.connected-tv.tools.bbc.co.uk/job/check-device-matcher/build) has been provided which allows you to enter in required information about a matcher, and then run the matcher tests in this context. This tool can help you test new matchers before committing to creating files and modifying repos.

Fields are as follows:

| Key | Description |
| --- | ----------- |
| BRAND | Brand to be associated with user-agent and matcher |
| MODEL | Model to be associated with user-agent and matcher |
| USER_AGENTS | Newline separated list of example user-agents for a new device |
| INVARIANTS | Comma separated list of invariant strings - strings that MUST appear in the user-agent for a match. |
| DISALLOWED | Comma separated list of disallowed strings - strings that MUST NOT appear in the user-agent for a match. |
| FUZZY_MATCHER | An example user-agent to match against |
| TYPE | The type of the device for iPlayer RW to identify; probably going to be "TV" if its a TAP device. |

**Note:** If any of these are set in your local environment then tests may not run as expected.

**See:** https://jenkins.connected-tv.tools.bbc.co.uk/job/check-device-matcher/build



### Local Matcher Testing

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
