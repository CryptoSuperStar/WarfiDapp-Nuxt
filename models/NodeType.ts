import * as ethers from 'ethers';
import { PAYOUTS_PER_DAY } from '~/models/constants';

export interface NodeType {
  index: number;
  name: string;
  rewardAmount: ethers.BigNumber;
  cost: ethers.BigNumber;
  claimTax: number;
  globalTax: number;
  userCount?: number;
  userRewards?: ethers.BigNumber;
  userFees?: ethers.BigNumber;
  totalCreatedNodes: number;
  maxSlots: number;
  // maxLevelUpUser: number;
  // maxLevelUpGlobal: number;
  // maxCreationPendingUser: number;
  // maxCreationPendingGlobal: number;
  timeToGRP : ethers.BigNumber;
}

export function dailyRewardsPerUser (node: NodeType) {
  return node.rewardAmount.mul(node.userCount ?? 0);
}

export function dailyRewardPerNode (node: NodeType) {
  return node.rewardAmount;
}

export function roi (node: NodeType) {
  if (node.cost.eq(0)) {
    return Infinity;
  }

  return (
    (ethers.utils.formatEther(dailyRewardPerNode(node)) as unknown as number) /
    (ethers.utils.formatEther(node.cost) as unknown as number)
  ) * 100;
}
