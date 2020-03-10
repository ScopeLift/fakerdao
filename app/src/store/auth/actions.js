// const addresses = require('../../../../abi/addresses.json');

export function setProvider({ commit }, provider) {
  commit('setProvider', provider);
}

export async function pollBlockchain({ commit, rootState }) {
  let userAddress;
  if (rootState.auth.provider && rootState.auth.provider.provider) {
    userAddress = rootState.auth.provider.provider.selectedAddress;
  } else if (rootState.auth.provider) {
    userAddress = rootState.auth.provider.selectedAddress;
  }
  // Get contracts and addresses
  const {
    fakerContract,
    // multicallContract,
    wethContract,
    // daiContract,
    makerContract,
    // chiefContract,
  } = rootState.constants.contracts;

  // Define promises
  console.log('userAddress ', userAddress);
  const p1 = makerContract.balanceOf(userAddress);
  const p2 = makerContract.allowance(userAddress, fakerContract.address);
  const p3 = wethContract.allowance(userAddress, fakerContract.address);
  // const p2 = fakerContract.totalDeposited();

  // Send promises and parse responses
  const [userMkrBalance, mkrAllowance, wethAllowance] = await Promise.all([p1, p2, p3]);
  const data = {
    contractMkrBalance: userMkrBalance, // TODO update
    userMkrBalance,
    mkrAllowance,
    wethAllowance,
    // contractMkrBalance: contractMkrBalance,
  };
  commit('setBlockchainData', data);
}
