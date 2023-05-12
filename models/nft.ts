import { BigNumber } from 'ethers';

export interface NFT {
  owner: string;
  nextOwner?: string;
  nodeType: string;
  tokenId: BigNumber;
  creationTime: Date;
  lastClaimTime: Date;
  obtainingTime: Date;
  lastRewardUpdateTime : Date;
  // isBoostedAirDropRate: number
  // isBoostedNft: boolean;
  // isBoostedToken: boolean;
  plotAdditionalLifetime: Date;
  lastLifetime : Date;  
  feature: string;
  userPendingRewards: BigNumber;
  totalClaimedRewards : BigNumber;
  userPendingFees: BigNumber;
  attribute: string;
  timeRoi?:   Date;
  leftTime: number;
  rewardLevel: number;
  price : BigNumber;
}
