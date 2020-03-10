# FakerDAO

MKR governance auction

## Specification

TODO

## Kovan Deployment

This project is deployed on the Kovan test network.
The Maker Kovan addresses can be found in `abi/addresses.json`, and were
sourced from the Maker
[changelog](https://changelog.makerdao.com/releases/kovan/1.0.3/contracts.json).
The Faker contract can be found on Kovan at `0xde61938000ff6c94A66245c037D2FB48992D591d`.

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