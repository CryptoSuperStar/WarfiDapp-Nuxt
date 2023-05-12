import { BigNumber } from 'ethers';
import { PlotType } from '~/models/plot-type';
export interface Plot {
  tokenId: BigNumber;
  owner: string;
  plot: PlotType;
  type: string;
  treeNodes : string[]
}
