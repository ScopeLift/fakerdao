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
  commit('setUserAddress', userAddress);
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
  const p1 = makerContract.balanceOf(userAddress);
  const p2 = makerContract.allowance(userAddress, fakerContract.address);
  const p3 = wethContract.balanceOf(userAddress);
  const p4 = wethContract.allowance(userAddress, fakerContract.address);
  // const p2 = fakerContract.totalDeposited();

  // Send promises and parse responses
  const [userMkrBalance, mkrAllowance, userWethBalance, wethAllowance] = await Promise.all([p1, p2, p3, p4]);
  const data = {
    contractMkrBalance: userMkrBalance, // TODO update
    userMkrBalance,
    mkrAllowance,
    userWethBalance,
    wethAllowance,
    // contractMkrBalance: contractMkrBalance,
  };
  commit('setBlockchainData', data);
}
