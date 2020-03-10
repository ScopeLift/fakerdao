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
  const p11 = fakerContract.getCurrentPhase();
  const p12 = fakerContract.getCurrentPeriod();
  const p13 = fakerContract.getCurrentPeriod();

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
    currentPhaseNumberRaw,
    currentPeriod,
    phaseLength,
  ] = await Promise.all([p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13]);

  const currentPhaseNumber = parseInt(currentPhaseNumberRaw.toString(), 10);

  let currentPhase;
  let nextPhase;
  if (isShift) {
    currentPhase = 'Deposit/Withdraw';
    nextPhase = 'Auction';
  } else if (isAuction) {
    currentPhase = 'Auction';
    nextPhase = 'Voting';
  } else {
    currentPhase = 'Voting';
    nextPhase = 'Deposit/Withdraw';
  }

  const userMkrDepositAmount = mkrDepositInfo[0];
  const userMkrDepositPhase = mkrDepositInfo[1];

  // Get current auction winner
  const currentWinner = (await fakerContract.bids(currentPhaseNumber))[0];


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
    currentPhaseNumber,
    currentWinner,
    currentPeriod: parseInt(currentPeriod.toString(), 10),
    phaseLength: parseInt(phaseLength.toString(), 10),
  };
  commit('setBlockchainData', data);
}
