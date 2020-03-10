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
  const p5 = fakerContract.isShift();
  const p6 = fakerContract.isAuction();
  const p7 = fakerContract.deploymentTime();
  const p8 = fakerContract.periodLength();
  const p9 = fakerContract.totalMaker();
  const p10 = fakerContract.makerDeposits(userAddress);

  // Send promises and parse responses
  const [
    userMkrBalance,
    mkrAllowance,
    userWethBalance,
    wethAllowance,
    isShift,
    isAuction,
    deploymentTime,
    periodLength,
    totalMaker,
    mkrDepositInfo,
  ] = await Promise.all([p1, p2, p3, p4, p5, p6, p7, p8, p9, p10]);

  let currentPhase;
  let nextPhase;
  if (isShift) {
    currentPhase = 'Shift';
    nextPhase = 'Auction';
  } else if (isAuction) {
    currentPhase = 'Auction';
    nextPhase = 'Voting';
  } else {
    currentPhase = 'Voting';
    nextPhase = 'Shift';
  }

  const userMkrDepositAmount = mkrDepositInfo[0];
  const userMkrDepositPhase = mkrDepositInfo[1];

  const data = {
    userMkrBalance,
    mkrAllowance,
    userWethBalance,
    wethAllowance,
    isShift,
    isAuction,
    currentPhase,
    nextPhase,
    deploymentTime,
    periodLength,
    totalMaker,
    userMkrDepositAmount,
    userMkrDepositPhase,
  };
  commit('setBlockchainData', data);
}
