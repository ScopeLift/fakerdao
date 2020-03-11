import { MaxUint256, AddressZero, Zero } from 'ethers/constants';

export default function () {
  return {
    contracts: {
      fakerContract: undefined,
      multicallContract: undefined,
      wethContract: undefined,
      daiContract: undefined,
      makerContract: undefined,
      chiefContract: undefined,
    },
    AddressZero,
    MaxUint256,
    Zero,
  };
}
