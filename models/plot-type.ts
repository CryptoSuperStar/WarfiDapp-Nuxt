import { BigNumber } from 'ethers';

export interface PlotType {
  id: number;
  name: string;
  price: BigNumber;
  additionalGRPTime: BigNumber;
  maxNodes: BigNumber;
  allowedNodeTypes: string[];
  waterpackGRPBoost: BigNumber;
}
