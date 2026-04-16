# Mable test

This is a cli tool to simulate banking transactions between accounts using cvs files.

# Dependencies

- node (22.19.0)
- run `npm install` to install all packages

# Scripts

- `npm test`
  - run tests
- `npm run cli`
  - run the cli to process the files and get a printout of balances and failures
  - it uses the csv files in `test-data`. change those to try with other inputs
- `npm run build`
  - use to build project
- `npm run test`
  - run test watch mode
- `npm run test:run`
  - run test without watch
- `npm run test:coverage`
  - run test with coverage
- `npm run lint`
  - lint check the code
- `npm run pretty`
  - prettify the code

# Assumptions

- If a transaction fails then it is just ignored and continue to the next one
- Only support AUD for the moment with no conversion support
- I have added some basic input validation but not exhaustive
- Added a get all balances method to just make it easier to view balances from a cli

# Todo

- have not added the exhaustive error scenario tests for batch-file-processor
