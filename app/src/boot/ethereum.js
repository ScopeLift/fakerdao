// import something here
import { ethers } from 'ethers';

const addresses = require('../../../abi/addresses.json');

let provider;
try {
  // eslint-disable-next-line no-undef
  provider = new ethers.providers.Web3Provider(web3.currentProvider);
} catch (err) {
  provider = ethers.getDefaultProvider('homestead');
}


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
  const fakerContract = createContractInstance('faker', addresses.faker);
  const multicallContract = createContractInstance('multicall', addresses.multicall);
  const daiContract = createContractInstance('dai', addresses.dai);
  const makerContract = createContractInstance('maker', addresses.maker);
  const iouContract = createContractInstance('iou', addresses.iou);
  const chiefContract = createContractInstance('chief', addresses.chief);

  store.dispatch('auth/setProvider', provider);
  store.dispatch('constants/setContracts', {
    fakerContract,
    multicallContract,
    daiContract,
    makerContract,
    iouContract,
    chiefContract,
  });
};
