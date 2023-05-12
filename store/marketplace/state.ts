import { BigNumber } from 'ethers';
import { NFTType, Offer, Auction } from '~/models/marketplace';

const state = () => ({
  offers: null as (Offer[] | null),
  auctions: null as (Auction[] | null),
  isApprovedForNFTType: {} as Record<NFTType, boolean>,
  marketFee : {} as BigNumber
});

export default state;
export type State = ReturnType<typeof state>;
