export function setContracts(state, contracts) {
  state.contracts.fakerContract = contracts.fakerContract;
  state.contracts.multicallContract = contracts.multicallContract;
  state.contracts.wethContract = contracts.wethContract;
  state.contracts.daiContract = contracts.daiContract;
  state.contracts.makerContract = contracts.makerContract;
  state.contracts.chiefContract = contracts.chiefContract;
}
