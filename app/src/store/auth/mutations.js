export function setProvider(state, provider) {
  state.provider = provider;
}

export function setUserAddress(state, userAddress) {
  state.userAddress = userAddress;
}

export function setBlockchainData(state, data) {
  state.data.contractMkrBalance = data.contractMkrBalance;
  state.data.userMkrBalance = data.userMkrBalance;
  state.data.mkrAllowance = data.mkrAllowance;
  state.data.userWethBalance = data.userWethBalance;
  state.data.wethAllowance = data.wethAllowance;
}
