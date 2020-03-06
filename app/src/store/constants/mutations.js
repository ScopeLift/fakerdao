export function setContracts(state, contracts) {
  state.contracts.fakerContract = contracts.fakerContract;
  state.contracts.multicallContract = contracts.multicallContract;
  state.contracts.daiContract = contracts.daiContract;
  state.contracts.makerContract = contracts.makerContract;
  state.contracts.iouContract = contracts.iouContract;
  state.contracts.chiefContract = contracts.chiefContract;
}
