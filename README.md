# FakerDAO

MKR governance auction

## Setup

Create a file called `.env` that looks like the following:

```bash
export INFURA_ID=yourInfuraId
export EXCHANGE_ADDRESS=0x05E793cE0C6027323Ac150F6d45C2344d28B6019
```

Then run the following commands:

```bash
npm install
cd app
npm install
```

## Testing

1. From the project root, start ganache with `npm run ganache`
2. In a new terminal window, run tests with `npm run test`
