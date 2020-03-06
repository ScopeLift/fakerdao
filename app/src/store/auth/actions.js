// const addresses = require('../../../../abi/addresses.json');
import { ethers } from 'ethers';

export function setProvider({ commit }, provider) {
  commit('setProvider', provider);
}

export async function pollBlockchain({ commit, rootState }) {
  let userAddress;
  if (rootState.auth.provider.provider) {
    userAddress = rootState.auth.provider.provider.selectedAddress;
  }
  console.log(userAddress);
  console.log(typeof userAddress);
  // Get contracts and addresses
  const {
    // fakerContract,
    // multicallContract,
    // daiContract,
    makerContract,
    // iouContract,
    // chiefContract,
  } = rootState.constants.contracts;

  // Define promises
  const p1 = makerContract.balanceOf(userAddress);
  // const p2 = fakerContract.totalDeposited();

  // Send promises and parse responses
  const [userMkrBalance] = await Promise.all([p1]);
  const data = {
    userMkrBalance: ethers.utils.formatEther(userMkrBalance),
    // contractMkrBalance: ethers.utils.formatEther(contractMkrBalance),
    contractMkrBalance: '0.0',
  };
  commit('setBlockchainData', data);
}
