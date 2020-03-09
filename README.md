# FakerDAO

Minimum viable implementation of a MKR token governance auction. Pool your tokens and sell their voting power to the highest bidder.

* Any MKR holder can lock their tokens in the contract.
* Every seven days, the contract holds an auction in which anyone can submit bids denominated in WETH (or any ERC20 specified at deployment).
* The highest bidder wins the right to control the MKR locked in the contract for the next seven days.
*  MKR depositors are paid out after each auction for the proportion of the MKR they contributed.
* At the end of each cycle, MKR withdraws/deposits are permitted, and the process starts again.

<big>For a more detailed write up on FakerDAO, and how it effects Maker governance incentives,  [read more](https://www.scopelift.co/blog/fakerdao) on the ScopeLift blog.</big>

## Development Requirements

* npm v6.5 (or later)
* node v11.6 (or later)
* Truffle v5.1 (or later)
* solc v0.5.16
* ganache-cli v6.9.1 (or later)
* An Infura ID (free account) or Ethereum node

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
