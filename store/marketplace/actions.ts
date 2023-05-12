import { ActionTree, Store } from 'vuex';
import * as ethers from 'ethers';
import { BigNumber } from 'ethers';
import { State } from './state';
import { NFTType, Offer, Auction, ItemType } from '~/models/marketplace';
import { ContractsPlugin } from '~/plugins/ethers';
import { NFT } from '~/models/nft';
import { Signer } from "@ethersproject/abstract-signer";

function getSupportedNfts (addresses: ContractsPlugin['$addresses']): Record<NFTType, string> {
  return {
    [NFTType.Node]: addresses.SpringNode,
    [NFTType.LuckyBox]: addresses.SpringLuckyBox,
  };
}

async function fetchAttribute<T> (this: Store<T>, nftType: NFTType, tokenId: BigNumber): Promise<string> {
  const contract = (nftType === NFTType.Node) ? this.$contracts?.springNode : this.$contracts?.luckyBoxes;
  if (!contract) {
    return '';
  }

  return await contract.getAttribute(tokenId);
}

const actions: ActionTree<State, {}> = {
  async loadOffers ({ commit, rootGetters }) {
    const supportedNfts = getSupportedNfts(this.$addresses);

    const offersByNft = await Promise.all(
      Object.entries(supportedNfts).map(async ([nftType, nftAddress]): Promise<Offer[]> => {
        if (!this.$contracts) {
          throw new Error('Contracts not loaded');
        }

        const offerSize = await this.$contracts.marketplace.getOfferOfSize(nftAddress);
        const offers: any[] = await this.$contracts.marketplace.getOfferOfBetweenIndexes(nftAddress, 0, offerSize);
        const contracts = this.$contracts;
        const userAddress = rootGetters['wallet/address'];

        return Promise.all(offers.map(async (offer): Promise<Offer> => {
          console.log(offer,"offer")
          const nodeType = await contracts.springNode.tokenIdsToType(offer.tokenId);
          const nodeTypeContract = await contracts.nodeTypeByName(nodeType);
          const totalCount = await nodeTypeContract.getTotalNodesNumberOf(userAddress);
          
          const { tokenIds} = {
            tokenIds: await nodeTypeContract.getTokenIdsOfBetweenIndexes(userAddress, 0, totalCount) as BigNumber[],
          };
          // const { tokenIds, timeRoi} = {
          //   tokenIds: await nodeTypeContract.getTokenIdsOfBetweenIndexes(userAddress, 0, totalCount) as BigNumber[],
          //   timeRoi: await nodeTypeContract.getTimeGRPOfBetweenIndexes(userAddress, 0, totalCount) as BigNumber[],
          // };        
          const tokenId = offer.tokenId;
          const node: any = await nodeTypeContract.getNodeFromTokenId(tokenId);          
          const pendingRewards = await nodeTypeContract.calculateUserRewardsBatch(node.owner, [tokenId]) as [[BigNumber], [BigNumber]]; 


          let rewardLevel = 0;    
          const grpTime = await nodeTypeContract.getGRP(node.feature);
          const [knownLifetime, knownTime] = await nodeTypeContract.getCurrentLifetimeOfNode(tokenId)
          const currentTime = BigNumber.from(Math.floor(new Date().getTime()/1000))
          let lifetime = node.lastLifetime.sub(currentTime.sub(node.lastRewardUpdateTime)).add(node.plotAdditionalLifetime)
          
          console.log(lifetime,"1111111111111111")
          //const roidDate = node.creationTime + node.price/baseRewardsPerSeconds;

          let baseRewardsPerSecond =  await nodeTypeContract.baseRewardsPerSecond(node.feature)
          let price =  await nodeTypeContract.price()
          
          let leftTime = 0;
          if (lifetime.gt(Math.floor(grpTime*1.5))) {
            console.log("rewardlevel-0");
            rewardLevel = 0;
            leftTime = lifetime.sub(Math.floor(grpTime*1.5)) * 1000
          } else if (lifetime.lt(Math.floor(grpTime*1.5)) && lifetime.gt(grpTime)) {
            rewardLevel = 1;
            leftTime = lifetime.sub(grpTime) * 1000
          } else if(lifetime.lt(grpTime) && lifetime.gt(0)) {
            rewardLevel = 2;
            leftTime = lifetime * 1000
          }
          else {
            rewardLevel = 3;
            leftTime = 0;
          }

          const nft: NFT = {
            owner: offer.owner,
            nodeType,
            tokenId,
            creationTime: new Date(node.creationTime.toNumber() * 1000),
            lastClaimTime: new Date(node.lastClaimTime.toNumber() * 1000),
            obtainingTime: new Date(node.obtainingTime.toNumber() * 1000),
            lastRewardUpdateTime:new Date(node.obtainingTime.toNumber() * 1000),
            plotAdditionalLifetime: new Date(node.obtainingTime.toNumber() * 1000),
            feature: node.feature,
            lastLifetime:  new Date(node.lastLifetime.toNumber() * 1000),
            totalClaimedRewards : node.totalClaimedRewards,
            userPendingRewards: pendingRewards[0][0],
            userPendingFees: pendingRewards[1][0],
            attribute: await this.$contracts?.springNode?.getAttribute(tokenId),
            leftTime: leftTime,
            rewardLevel: rewardLevel,
            timeRoi : node.attribute != "" ? new Date((node.creationTime.add(price.div(baseRewardsPerSecond).add(node.plotAdditionalLifetime)))*1000) : new Date((node.creationTime.add(price.div(baseRewardsPerSecond)))*1000),
            price: price
          };
          return {
            type: ItemType.Offer,
            nft: nft,
            owner: offer.owner,
            creationTime: new Date(offer.creationTime.toNumber() * 1000),
            price: offer.price,
          };
        }));
      })
    );

    commit('setOffers', offersByNft.flat());
  },

  async loadAuctions ({ commit }) {
    const supportedNfts = getSupportedNfts(this.$addresses);

    const auctionsByNft = await Promise.all(
      Object.entries(supportedNfts).map(async ([nftType, nftAddress]): Promise<Auction[]> => {
        if (!this.$contracts) {
          throw new Error('Contracts not loaded');
        }
        const auctionSize = await this.$contracts.marketplace.getAuctionOfSize(nftAddress);
        const auctions: any[] = await this.$contracts.marketplace.getAuctionOfBetweenIndexes(nftAddress, 0, auctionSize);
        const contracts = this.$contracts;
        return Promise.all(auctions.map(async (auction): Promise<Auction> => {
          console.log(auction,"auction")
          const nodeType = await contracts.springNode.tokenIdsToType(auction.tokenId);

          const nodeTypeContract = await contracts.nodeTypeByName(nodeType);

          const node: any = await nodeTypeContract.getNodeFromTokenId(auction.tokenId);
          const pendingRewards = await nodeTypeContract.calculateUserRewardsBatch(node.owner, [auction.tokenId]) as [[BigNumber], [BigNumber]]; 
          const tokenId = auction.tokenId;

          let rewardLevel = 0;
          const grpTime = await nodeTypeContract.getGRP(node.feature);
          const [knownLifetime, knownTime] = await nodeTypeContract.getCurrentLifetimeOfNode(tokenId)
          const currentTime = BigNumber.from(Math.floor(new Date().getTime()/1000))
          let lifetime = node.lastLifetime.sub(currentTime.sub(node.lastRewardUpdateTime)).add(node.plotAdditionalLifetime)
          console.log(node,"nodeeeeeeeeeee")
          
          let baseRewardsPerSecond =  await nodeTypeContract.baseRewardsPerSecond(node.feature)
          let price =  await nodeTypeContract.price()

          let leftTime = 0;
          if (lifetime.gt(Math.floor(grpTime*1.5))) {
            console.log("rewardlevel-0");
            rewardLevel = 0;
            leftTime = (lifetime.sub(Math.floor(grpTime*1.5))) * 1000
          } else if (lifetime.lt(Math.floor(grpTime*1.5)) && lifetime.gt(grpTime)) {
            rewardLevel = 1;
            leftTime = lifetime.sub(grpTime) * 1000
          } else if(lifetime.lt(grpTime) && lifetime.gt(0)) {
            rewardLevel = 2;
            leftTime = lifetime * 1000
          }
          else {
            rewardLevel = 3;
            leftTime = 0;
          }

          const nft: NFT = {
            owner: auction.owner,
            nodeType,
            tokenId,
            creationTime: new Date(node.creationTime.toNumber() * 1000),
            lastClaimTime: new Date(node.lastClaimTime.toNumber() * 1000),
            obtainingTime: new Date(node.obtainingTime.toNumber() * 1000),
            lastRewardUpdateTime:new Date(node.obtainingTime.toNumber() * 1000),
            plotAdditionalLifetime: new Date(node.obtainingTime.toNumber() * 1000),
            feature: node.feature,
            lastLifetime:  new Date(node.lastLifetime.toNumber() * 1000),
            totalClaimedRewards : node.totalClaimedRewards,
            userPendingRewards: pendingRewards[0][0],
            userPendingFees: pendingRewards[1][0],
            attribute: await this.$contracts?.springNode?.getAttribute(tokenId),
            leftTime: leftTime,
            rewardLevel : rewardLevel,
            timeRoi : new Date((node.creationTime.add(price.div(baseRewardsPerSecond)))*1000),
            price: price
          };
          return {
            type: ItemType.Auction,
            nft: nft,
            owner: auction.owner,
            nextOwner : auction.nextOwner,
            creationTime: new Date(auction.creationTime.toNumber() * 1000),
            currentPrice: auction.currentPrice,
            end: auction.end.toNumber() * 1000,
          };
        }));
      })
    );

    commit('setAuctions', auctionsByNft.flat());
  },

  async loadFee({commit}) {    
    if (!this.$contracts) {
      throw new Error('Contracts not loaded');
    }
    const marketFee = await this.$contracts.marketplace.fee();

    commit('setMarketFee', marketFee);
  },

  async load ({ dispatch }) {
    await Promise.all([
      dispatch('loadOffers'),
      dispatch('loadAuctions'),
      dispatch('loadFee'),
    ]);
  },

  async sellOffer ({ dispatch, rootGetters }, { nftType, tokenId, price }: { nftType: NFTType; tokenId: number; price: number; }) {
    const userAddress = rootGetters['wallet/address'];
    if (!userAddress) {
      throw new Error('User address is not defined');
    }

    const supportedNfts = getSupportedNfts(this.$addresses);
    if (!supportedNfts[nftType]) {
      throw new Error('NFT type is not supported');
    }

    if (!this.$contracts) {
      throw new Error('Contracts not loaded');
    }
    const tx = await this.$contracts.marketplace.sellOfferItem(
      supportedNfts[nftType],
      tokenId,
      ethers.utils.parseEther(price.toString())
    );

    await tx.wait();
    dispatch('loadOffers');
  },

  async sellAuction ({ dispatch, rootGetters }, { nftType, tokenId, price, end }: { nftType: NFTType; tokenId: number; price: number; end: number; }) {
    const userAddress = rootGetters['wallet/address'];
    if (!userAddress) {
      throw new Error('User address is not defined');
    }
    const supportedNfts = getSupportedNfts(this.$addresses);
    if (!supportedNfts[nftType]) {
      throw new Error('NFT type is not supported');
    }

    if (!this.$contracts) {
      throw new Error('Contracts not loaded');
    }

    const tx = await this.$contracts.marketplace.sellAuctionItem(
      supportedNfts[nftType],
      tokenId,
      ethers.utils.parseEther(price.toString()),
      end
    );

    await tx.wait();
    dispatch('loadAuctions');
  },

  async loadApproveForNftType ({ commit, rootGetters }, nftType: NFTType) {
    const userAddress = rootGetters['wallet/address'];
    if (!userAddress) {
      commit('resetApprovedForNftType');
      return;
    }
    const nftAddress = getSupportedNfts(this.$addresses)[nftType];
    if (!nftAddress) {
      throw new Error('NFT type is not supported');
    }

    if (!this.$contracts) {
      throw new Error('Contracts not loaded');
    }
    const holder = await this.$web3Provider?.getSigner();
    const isAllowance = await this.$contracts
      .erc20(this.$addresses.Token)
      .connect(holder as Signer)
      .allowance(userAddress, this.$addresses.MarketPlace);
      console.log("isAllowance", parseInt(ethers.utils.formatEther(isAllowance)))

    commit('setApprovedForNftType', {
      nftType,
      isApproved: parseInt(ethers.utils.formatEther(isAllowance)) != 0 && await this.$contracts.erc721(nftAddress).isApprovedForAll(userAddress, this.$addresses.MarketPlace),
    });
  },

  async approveForNftType ({ dispatch, rootGetters }, nftType: NFTType) {
    const userAddress = rootGetters['wallet/address'];
    if (!userAddress) {
      throw new Error('User address is not defined');
    }
    const nftAddress = getSupportedNfts(this.$addresses)[nftType];
    if (!nftAddress) {
      throw new Error('NFT type is not supported');
    }

    if (!this.$contracts) {
      throw new Error('Contracts not loaded');
    }
    const tx = await this.$contracts.erc721(nftAddress).setApprovalForAll(this.$addresses.MarketPlace, true);
    await tx.wait();
    const holder = await this.$web3Provider?.getSigner();
    const isAllowance = await this.$contracts
      .erc20(this.$addresses.Token)
      .connect(holder as Signer)
      .allowance(userAddress, this.$addresses.MarketPlace);
    if (isAllowance == 0) {
      const txx = await this.$contracts
        .erc20(this.$addresses.Token)
        .connect(holder as Signer)
        .approve(
          this.$addresses.MarketPlace,
          BigNumber.from(
            "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
          )
        ); // for testnet with BUSD
      await txx.wait();
    }
    dispatch('loadApproveForNftType', nftType);
  },

  async bidAuction ({ dispatch, rootGetters }, { nftType, tokenId, bid }: { nftType: NFTType; tokenId: BigNumber; bid: number; }) {
    const userAddress = rootGetters['wallet/address'];
    console.log(ethers.utils.parseEther(bid.toString()),"wwwwwwwww")
    if (!userAddress) {
      throw new Error('User address is not defined');
    }

    const nftAddress = getSupportedNfts(this.$addresses)[nftType];
    if (!nftAddress) {
      throw new Error('NFT type is not supported');
    }

    if (!this.$contracts) {
      throw new Error('Contracts not loaded');
    }
    console.log("bid",bid)
    const tx = await this.$contracts.marketplace.purchaseAuctionItem(
      nftAddress,
      tokenId,
      ethers.utils.parseEther(bid.toString()),
    );

    await tx.wait();
    dispatch('loadAuctions');
  },

  async buyNow ({ dispatch, rootGetters }, { nftType, tokenId }: { nftType: NFTType; tokenId: BigNumber; }) {
    const userAddress = rootGetters['wallet/address'];
    if (!userAddress) {
      throw new Error('User address is not defined');
    }

    const nftAddress = getSupportedNfts(this.$addresses)[nftType];
    if (!nftAddress) {
      throw new Error('NFT type is not supported');
    }

    if (!this.$contracts) {
      throw new Error('Contracts not loaded');
    }

    const tx = await this.$contracts.marketplace.purchaseOfferItem(
      nftAddress,
      tokenId
    );

    await tx.wait();
    dispatch('loadOffers');
    dispatch('nft/loadMyNFTs', null, { root: true });
  },

  async recover ({ dispatch, rootGetters }, { nft, type }: { nft: NFT; type: ItemType; }) {
    const userAddress = rootGetters['wallet/address'];
    if (!userAddress) {
      throw new Error('User address is not defined');
    }

    const nftAddress = getSupportedNfts(this.$addresses)[NFTType.Node];
    if (!nftAddress) {
      throw new Error('NFT type is not supported');
    }

    const getTx = async () => {
      if (!this.$contracts) {
        throw new Error('Contracts not loaded');
      }

      switch (type) {
        case ItemType.Offer:
          return await this.$contracts.marketplace.recoverOfferItem(
            nftAddress,
            nft.tokenId
          );
        case ItemType.Auction:
          return await this.$contracts.marketplace.recoverAuctionItem(
            nftAddress,
            nft.tokenId
          );
        default:
          throw new Error('Unknown item type');
      }
    };

    const tx = await getTx();
    await tx.wait();
    dispatch('load');
    dispatch('nft/loadMyNFTs', null, { root: true });
  },
};

export default actions;
