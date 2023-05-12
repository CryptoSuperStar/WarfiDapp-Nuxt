import { GetterTree } from 'vuex';
import { BigNumber } from 'ethers';
import { State, ViewType } from './state';
import { Auction, Item, ItemType, NFTType, TreeType } from '~/models/marketplace';
import { NFT } from '~/models/nft';
import { LuckyBox } from '~/models/luckybox';

type RootGetters = {
  'marketplace/items': Item[],
  'nft/byTokenId': (tokenId: BigNumber) => NFT | null,
  'luckyboxes/byTokenId': (tokenId: BigNumber) => LuckyBox | null,
  'wallet/address': string | null
};

const getValue = (item: Item) => {
  if (item.type === ItemType.Offer) {
    return item.price;
  }

  if (item.type === ItemType.Auction) {
    return item.currentPrice;
  }

  return null;
};

const orderByValue =
  (asc: boolean) =>
    (items: Item[]) =>
      [...items, ]
        .filter(item => getValue(item) !== null)
        .sort((a, b) => {
          const valueA = getValue(a);
          const valueB = getValue(b);

          if (valueA === null || valueB === null) {
            return 0;
          }

          return (valueB.gt(valueA) ? 1 : valueB.lt(valueA) ? -1 : 0) * (asc ? -1 : 1);
        });

const views: Record<ViewType, (items: Item[], rootGetters: RootGetters) => Item[]> = {
  [ViewType.Latest]: items => [...items, ].sort((a, b) => b.creationTime.getTime() - a.creationTime.getTime()),
  [ViewType.MyNFTs]: (items, getters) => items.filter(item => item.nft.owner === getters['wallet/address']),
  [ViewType.AscValue]: orderByValue(true),
  [ViewType.DescValue]: orderByValue(false),
  [ViewType.ExpiringSoon]: items =>
    items
      .filter((item): item is Auction => item.type === ItemType.Auction)
      .sort((a, b) => a.end - b.end),
};

const getters: GetterTree<State, {}> = {
  current: (state, _getters, _rootState, rootGetters: RootGetters) => {
    const items = rootGetters['marketplace/items'];
    const userAddress = rootGetters['wallet/address'];
    let filtered = items.filter((item) => {
      if (state.filter == '' || state.filter == 'all') {
        return item;
      }
      return item.nft.nodeType == state.filter
    });

    filtered = filtered.filter((item) => {
      if(state.featureFilter == '' || state.featureFilter == 'all') {
        return item
      }
      return item.nft.attribute.toLowerCase() == state.featureFilter
    })

    filtered = filtered.filter((item) => {
      if(state.typeFilter == '' || state.typeFilter == 'all' || state.typeFilter == 'mynfts') {
        return item
      }
      return item.type == state.typeFilter.toLowerCase()
    })

    filtered = filtered.filter((item) => {
      if(state.typeFilter == 'My NFTs') {
        return item.owner == userAddress
      }
      else return item
    })

    const view = views[state.viewType] ?? (noop => noop);
    return view(filtered, rootGetters);
  },
};

export default getters;
