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
export EXCHANGE_ADDRESS=0xdB33dFD3D61308C33C63209845DaD3e6bfb2c674
export WETH_HOLDER_ADDRESS=0xa71937147b55Deb8a530C7229C442Fd3F31b7db2
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

## Kovan Deployment

This project is deployed on the Kovan test network at `0xBbb73EC8520c8D5cB1047635007C08bcE13A6Af0`.
All required Maker Kovan addresses can be found in `abi/addresses.json`, and were
sourced from the Maker
[changelog](https://changelog.makerdao.com/releases/kovan/1.0.3/contracts.json).

To interact with this contract as a depositor, you will need MKR. To get this:

1. Click [here](https://kovan.etherscan.io/address/0xcbd3e165ce589657fefd2d38ad6b6596a1f734f6#writeContract)
to view the *Write Contract* tab of a Kovan token faucet
2. Click *Connect to Web3* to connect your wallet
3. In the `gulp` method, enter `0xAaF64BFCC32d0F15873a02163e7E500671a4ffcD` for the `gem` input
and put in your own address for the `addrs` input

To interact with this contract as a bidder, you will need WETH. To get this:

1. Go to https://faucet.kovan.network/
2. Follow the instructions to connect your GitHub and get 1 Kovan Ether.
3. Click [here](https://kovan.etherscan.io/address/0xd0a1e359811322d97991e03f863a0c30c2cf029c#writeContract) to go to the *Write Contract* tab of the Kovan WETH contract
4. Click *Connect to Web3* to connect your wallet
5. Scroll down to the `deposit` method, enter an amount of ETH to deposit, and click *Write* to complete the transaction
