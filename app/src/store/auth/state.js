export default function () {
  return {
    provider: undefined,
    userAddress: undefined,
    data: {
      contractMkrBalance: undefined,
      userMkrBalance: undefined,
      userMkrDepositAmount: undefined,
      userMkrDepositPhase: undefined,
      mkrAllowance: undefined,
      userWethBalance: undefined,
      wethAllowance: undefined,
    },
    faker: {
      leadingBidder: undefined, // bidder leading the current auction
      isShift: undefined,
      isAuction: undefined,
      currentPeriod: undefined,
      currentPhase: undefined, // Deposit/Withdraw, Auction, or Voting
      nextPhase: undefined, // Deposit/Withdraw, Auction, or Voting
      deploymentTime: undefined,
      periodLength: undefined,
      totalMaker: undefined, // MKR available to bid on
      currentPhaseNumber: undefined,
      phaseLength: undefined,
      currentWinner: undefined,
    },
  };
}
