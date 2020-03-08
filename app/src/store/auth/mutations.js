export function setProvider(state, provider) {
  state.provider = provider;
}

export function setBlockchainData(state, data) {
  state.data.contractMkrBalance = data.contractMkrBalance;
  state.data.userMkrBalance = data.userMkrBalance;
  state.data.mkrAllowance = data.mkrAllowance;
  state.data.wethAllowance = data.wethAllowance;
}
