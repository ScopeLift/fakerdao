# FakerDAO

MKR Governance Auction

## Setup For Development

```bash
# From the root directory
npm run ganache

# From the root directory, in a new terminal window
npx truffle migrate && source .env && npx truffle test test/initialize.js

# From the app directory
npm run dev
```
