// import something here
// import Web3 from 'web3';
import Web3Connect from 'web3connect';
import { ethers } from 'ethers';

const providerOptions = {};

const web3Connect = new Web3Connect.Core({
  network: 'kovan', // optional
  cacheProvider: true, // optional
  providerOptions, // required
});

const addresses = require('../../../abi/addresses.json');

export default async ({ store /* app, router, Vue, ... */ }) => {
  // Setup provider
  let ethersProvider;
  let signer;
  if (web3Connect.providers.length === 0) {
    // Fallback to ethers provider
    ethersProvider = ethers.getDefaultProvider('kovan');
    signer = ethersProvider; // not actually a signer
  } else {
    // Otherwise use user's web3
    const provider = await web3Connect.connect();
    ethersProvider = new ethers.providers.Web3Provider(provider);
    signer = ethersProvider.getSigner();
  }

  /**
   * @notice Create ethers contract instance
   * @param {String} name contract name
   * @param {String} address for internal contracts, provide contract address
   */
  const createContractInstance = (name, address) => {
    // eslint-disable-next-line
    const abi = require(`../../../abi/${name}.json`);
    return new ethers.Contract(address, abi, signer);
  };

  // something to do
  const fakerContract = createContractInstance('faker', addresses.faker);
  const multicallContract = createContractInstance(
    'multicall',
    addresses.multicall,
  );
  const wethContract = createContractInstance('weth', addresses.weth);
  const daiContract = createContractInstance('dai', addresses.dai);
  const makerContract = createContractInstance('maker', addresses.maker);
  const chiefContract = createContractInstance('chief', addresses.chief);

  store.dispatch('auth/setProvider', ethersProvider);
  store.dispatch('constants/setContracts', {
    fakerContract,
    multicallContract,
    wethContract,
    daiContract,
    makerContract,
    chiefContract,
  });
};
