# Mable test

This is a cli tool to simulate banking transactions between accounts using cvs files.

# Tools required

- node (22.19.0)

# Scripts

- `npm test`
  - run tests
- `npm run cli <starting-balance>.csv <transactions>.csv`
  - run the cli to process the files and get a printout of balances and failures

# Assumptions

- If a transaction fails then it is just ignored and continue to the next one
- Only support AUD for the moment with no conversion support
- I have added some basic input validation but not exhaustive
