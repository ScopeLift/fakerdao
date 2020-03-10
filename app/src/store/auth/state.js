export default function () {
  return {
    provider: undefined,
    userAddress: undefined,
    data: {
      contractMkrBalance: undefined,
      userMkrBalance: undefined,
      mkrAllowance: undefined,
      userWethBalance: undefined,
      wethAllowance: undefined,
    },
    faker: {
      winningBidder: undefined, // bidder who won the last auction
      leadingBidder: undefined, // bidder leading the current auction
      isShift: undefined,
      isAuction: undefined,
      currentPhase: undefined, // Shift, Auction, or Voting
      nextPhase: undefined, // Shift, Auction, or Voting
      deploymentTime: undefined,
      periodLength: undefined,
      totalMaker: undefined, // MKR available to bid on
    },
  };
}
