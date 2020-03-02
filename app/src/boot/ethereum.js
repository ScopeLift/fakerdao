// import something here
import { ethers } from 'ethers';

const addresses = require('../../../abi/addresses.json');

const provider = ethers.getDefaultProvider('homestead');


/**
 * @notice Create ethers contract instance
 * @param {String} name contract name
 * @param {String} address for internal contracts, provide contract address
 */
const createContractInstance = (name, address) => {
  // eslint-disable-next-line
  const abi = require(`../../../abi/${name}.json`);
  return new ethers.Contract(address, abi, provider);
};

// "async" is optional
export default async ({ store /* app, router, Vue, ... */ }) => {
  // something to do
  const daiContract = createContractInstance('dai', addresses.MCD_DAI);
  store.dispatch('constants/setContracts', {
    daiContract,
  });
};
