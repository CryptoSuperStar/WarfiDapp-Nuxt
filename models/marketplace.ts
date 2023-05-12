import { BigNumber } from 'ethers';
import { NFT } from '~/models/nft'

export enum NFTType {
  Node = 'node',
  LuckyBox = 'luckybox',
}
export enum TreeType {
  Plum = 'Plum',
  Bonsai = 'Bonsai',
  Fir = 'Fir',
  Oak = 'Oak',
  Cherry = 'Cherry'
}
export enum ItemType {
  Offer = 'offer',
  Auction = 'auction'
}

export interface Offer {
  type: ItemType.Offer
  nft: NFT;
  owner : string,
  creationTime: Date
  price: BigNumber
}

export interface Auction {
  type: ItemType.Auction;
  nft: NFT;
  owner : string,
  nextOwner : string,
  creationTime: Date
  currentPrice: BigNumber
  end: number
}

export type Item = Offer | Auction;
