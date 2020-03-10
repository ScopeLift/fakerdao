export function setProvider(state, provider) {
  state.provider = provider;
}

export function setUserAddress(state, userAddress) {
  state.userAddress = userAddress;
}

export function setBlockchainData(state, data) {
  state.data.contractMkrBalance = data.contractMkrBalance;
  state.data.userMkrBalance = data.userMkrBalance;
  state.data.userMkrDepositAmount = data.userMkrDepositAmount;
  state.data.userMkrDepositPhase = data.userMkrDepositPhase;
  state.data.mkrAllowance = data.mkrAllowance;
  state.data.userWethBalance = data.userWethBalance;
  state.data.wethAllowance = data.wethAllowance;

  state.faker.isShift = data.isShift;
  state.faker.isAuction = data.isAuction;
  state.faker.currentPhase = data.currentPhase;
  state.faker.nextPhase = data.nextPhase;
  state.faker.deploymentTime = data.deploymentTime;
  state.faker.periodLength = data.periodLength;
  state.faker.totalMaker = data.totalMaker;
  state.faker.phaseLength = data.phaseLength;
  state.faker.currentPhaseNumber = data.currentPhaseNumber;
  state.faker.currentWinner = data.currentWinner;
  state.faker.currentPeriod = data.currentPeriod;
}
