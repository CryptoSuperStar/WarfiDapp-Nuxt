import { ActionTree, MutationTree, GetterTree } from 'vuex';
import { BigNumber } from 'ethers';
import { NodeType } from '~/models/NodeType';
import { NFT } from '~/models/nft';
import addresses from '~/config/addresses';
import { NodeNftNames } from '~/models/types'
import * as ethers from "ethers";
const formatEther = ethers.utils.formatEther;

interface roilist {
  tokenId : BigNumber,
  specialROI : BigNumber
}
export const state = () => ({
  myNfts: {} as Record<string, NFT[]>,
  byTokenId: {} as Record<string, NFT | null>,
  specialROI : {} as roilist [] | null,
  rewardByTokenId : {} as Record<string, number|null>,
  leftTimeByTokenId : {} as Record<string, number|null>,
  usedAmmosByTokenId : {} as Record<string, number|null>,
});

export type State = ReturnType<typeof state>;

export const getters: GetterTree<State, {}> = {
  myNFTsByNodeType: (state, _getters, _rootState, rootGetters) =>
    rootGetters['nodes/nodeTypesNames']
      ?.map((name: string) => ({
        nodeType: name,
        nfts: state.myNfts[name],
      })),
  myNFTsByCreationDateDesc: state =>
    Object
      .entries(state.myNfts)
      .map(([nodeType, nfts]) => nfts.map(nft => ({ ...nft, nodeType })))
      .flat()
      .sort(
        (a, b) => (b.creationTime.getTime() - a.creationTime.getTime())
      ),
  byTokenId: state => (tokenId: BigNumber) => state.byTokenId[tokenId.toString()] ?? null,
  spROI: state => state.specialROI,
  nftByTokenID: state =>(tokenId : BigNumber) => {
    let resultInfantry = state.myNfts[NodeNftNames.Infantry]?.find((data) => data.tokenId.eq(tokenId));
    let resultRocketeer = state.myNfts[NodeNftNames.Rocketeer]?.find((data) => data.tokenId.eq(tokenId));
    let resultHeavyGunner = state.myNfts[NodeNftNames.HeavyGunner]?.find((data) => data.tokenId.eq(tokenId));
    let resultSniper = state.myNfts[NodeNftNames.Sniper]?.find((data) => data.tokenId.eq(tokenId));
    if(resultInfantry!=null)
    return resultInfantry;
    else if(resultRocketeer!=null)
      return resultRocketeer;
    else if (resultHeavyGunner !=null)
      return resultHeavyGunner;
    else if(resultSniper !=null)
      return resultSniper;
  },
  spROIByTokenID: state => (tokenId : BigNumber) => {
      const result = state.specialROI?.find((roi, data) => roi['tokenId'].eq(tokenId))
      return result?.specialROI

  },
  leftTimebyTokenId: state => (tokenId: BigNumber) => state.leftTimeByTokenId[tokenId?.toString()] ?? 0,
  // specialROI: state =>(tokenId: BigNumber) => state.specialROI[tokenId.toString()] ?? null
  rewardLevelByTokenId : state => (tokenId : BigNumber) => state.rewardByTokenId[tokenId?.toString()] ?? -1,
  usedAmmosByTokenId: state => (tokenId: BigNumber) => state.usedAmmosByTokenId[tokenId?.toString()] ?? 0,
};

export const mutations: MutationTree<State> = {
  setMyNFTs (state, nfts: Record<string, NFT[]>) {
    state.myNfts = nfts;
  },

  resetMyNFTs (state) {
    Object.values(state.myNfts).flat().forEach((nft) => {
      state.byTokenId[nft.tokenId.toString()] = nft;
    });
    state.myNfts = {};
  },

  setByTokenId (state, { tokenId, nft }: { tokenId: BigNumber, nft: NFT | null }) {
    state.byTokenId = {
      ...state.byTokenId,
      [tokenId.toString()]: nft,
    };
  },

  setRewardLevelByTokenId (state, { tokenId, rewardLevel }: { tokenId: BigNumber, rewardLevel: number | null }) {
    state.rewardByTokenId = {
      ...state.rewardByTokenId,
      [tokenId.toString()]: rewardLevel,
    };
  },

  setLeftTimeByTokenId (state, { tokenId, leftTime }: { tokenId: BigNumber, leftTime: number | null }) {
    state.leftTimeByTokenId = {
      ...state.leftTimeByTokenId,
      [tokenId.toString()]: leftTime,
    };
  },

  setUsedAmmosByTokenId (state, { tokenId, ammoUsed }: { tokenId: BigNumber, ammoUsed: number | null }) {
    state.usedAmmosByTokenId = {
      ...state.usedAmmosByTokenId,
      [tokenId.toString()]: ammoUsed,
    };
  },

  setSpecialROI(state, specialROI: roilist [] ){    
    state.specialROI = specialROI    
  }
};

export const actions: ActionTree<State, {}> = {

  async loadMyNFTs ({ commit, rootGetters }) {
    const nodeTypeNames: string[] | undefined = rootGetters['nodes/nodeTypesNames'];
    if (!nodeTypeNames || nodeTypeNames.length === 0) {
      commit('resetMyNFTs');
      return;
    }
      const nftsIndexByNodeType = await Promise.all(nodeTypeNames.map(async (nodeTypeName) => {
      
      const nodeType: NodeType | undefined = rootGetters['nodes/nodeTypeByName'](nodeTypeName);
      const userAddress = rootGetters['wallet/address'];

      if (!userAddress || !nodeType) {
        return null;
      }

      if (!this.$contracts) {
        throw new Error('Contracts not loaded');
      }
      const nodeTypeContract = await this.$contracts.nodeTypeByName(nodeTypeName);
      //Caculate Reward level
      const totalCount = await nodeTypeContract.getTotalNodesNumberOf(userAddress);
      // const { tokenIds, timeRoi} = {
      //   tokenIds: await nodeTypeContract.getTokenIdsOfBetweenIndexes(userAddress, 0, totalCount) as BigNumber[],
      //   timeRoi: await nodeTypeContract.getTimeGRPOfBetweenIndexes(userAddress, 0, totalCount) as BigNumber[],
      // };
      const { tokenIds} = {
        tokenIds: await nodeTypeContract.getTokenIdsOfBetweenIndexes(userAddress, 0, totalCount) as BigNumber[],
      };
      
      console.log(nodeTypeContract);
      const { nfts, pendingRewards } = {
        nfts: await Promise.all(tokenIds.map(async (tokenId, idx) => {
          let nft = await nodeTypeContract.getNodeFromTokenId(tokenId);
          return {
            nft: nft,
            attribute: await this.$contracts?.springNode?.getAttribute(tokenId),
            baseRewardsPerSecond: await nodeTypeContract.baseRewardsPerSecond(nft.feature),
            price: await nodeTypeContract.price(),    
            tokenId,
          };
        })),
        pendingRewards: await nodeTypeContract.calculateUserRewardsBatch(userAddress, tokenIds) as [BigNumber[], BigNumber[]],
      };
      console.log(nfts,"nfts");
      // return nfts.map(({ nft, attribute, tokenId,timeRoi}, idx): NFT => {
        return nfts.map(({ nft, attribute, tokenId, price, baseRewardsPerSecond}, idx): NFT => {
        return {
          owner: nft.owner,
          nodeType: nodeTypeName,
          tokenId,
          creationTime: new Date(nft.creationTime.toNumber() * 1000),
          lastClaimTime: new Date(nft.lastClaimTime.toNumber() * 1000),
          obtainingTime: new Date(nft.obtainingTime.toNumber() * 1000),
          lastRewardUpdateTime:new Date(nft.lastRewardUpdateTime.toNumber() * 1000),
          plotAdditionalLifetime: new Date(nft.plotAdditionalLifetime.toNumber() * 1000),
          lastLifetime:  new Date(nft.lastLifetime.toNumber() * 1000),
          // isBoostedAirDropRate: nft.isBoostedAirDropRate.toNumber() / 100,Fco
          // isBoostedNft: nft.isBoostedNft,
          // isBoostedToken: nft.isBoostedToken,
          feature: nft.feature,
          totalClaimedRewards : nft.totalClaimedRewards,
          userPendingRewards: pendingRewards[0][idx],
          userPendingFees: pendingRewards[1][idx],
          price: price,
          attribute,
          
          timeRoi:  new Date((nft.creationTime.add(price.div(baseRewardsPerSecond)))*1000),
          leftTime: nft.plotAdditionalLifetime.toNumber()*1000 + nft.lastLifetime.toNumber()*1000 - (Date.now()-nft.lastRewardUpdateTime.toNumber()*1000),
          rewardLevel: 0
        };
      });
    }));
    const entries = nftsIndexByNodeType
      .map((nfts, idx) => {
        // console.log(nfts,"nfts")
        return [
          nodeTypeNames[idx],
          nfts,
        ] as const;
      })
      .filter(([, nfts]) => nfts !== null);
    commit('setMyNFTs', Object.fromEntries(entries));
  },

  async claimRewards ({ dispatch, rootGetters }, nfts: NFT[]) {
    const userAddress = rootGetters['wallet/address'];
    if (!userAddress) {
      throw new Error('You must connect your wallet');
    }

    if (!this.$contracts) {
      throw new Error('Contracts not loaded');
    }

    const groupped = nfts.reduce((nodeTypeGroups, nft) => {
      if (!nodeTypeGroups[nft.nodeType]) {
        nodeTypeGroups[nft.nodeType] = [];
      }
      nodeTypeGroups[nft.nodeType].push(nft.tokenId);
      return nodeTypeGroups;
    }, {} as Record<string, BigNumber[]>);

    try {
      const estimatedGas : any = await this.$contracts.handlerGameLogicFacet.estimateGas.claimRewardsBatch(
        this.$addresses.Token,
        userAddress,
        Object.keys(groupped),
        Object.values(groupped),
      );
      const tx = await this.$contracts.handlerGameLogicFacet.claimRewardsBatch(
        this.$addresses.Token,
        userAddress,
        Object.keys(groupped),
        Object.values(groupped),
        { gasLimit: estimatedGas.toNumber() + 200000 }
      );
      await tx.wait();
  
      Object.values(groupped).forEach(tokenId => dispatch('loadByTokenId', tokenId));
      dispatch('nodes/loadNodeTypes',null, { root: true })
      dispatch('loadMyNFTs');
    } catch(e) {
      console.log(e)
    }
    
  },


  async claimAll ({ dispatch, rootGetters }) {
    const userAddress = rootGetters['wallet/address'];
    if (!userAddress) {
      throw new Error('You must connect your wallet');
    }

    if (!this.$contracts) {
      throw new Error('Contracts not loaded');
    }
    try{
      const estimatedGas : any = await this.$contracts.handlerGameLogicFacet.estimateGas.claimRewardsAll(
        this.$addresses.Token,
        userAddress,
      );
      const tx = await this.$contracts.handlerGameLogicFacet.claimRewardsAll(
        this.$addresses.Token,
        userAddress,
        { gasLimit: estimatedGas.toNumber() + 200000 }
      );
      await tx.wait();
      // const tx = await this.$contracts.handlerGameLogicFacet.claimRewardsAll(
      //   this.$addresses.Token,
      //   userAddress,
      // );
      // await tx.wait();
    }
    catch(e:any){
      console.log(e)
    }finally{
      dispatch('loadMyNFTs');
      dispatch('nodes/loadNodeTypes',null, { root: true })
    }
   

    
  },

  async loadByTokenId ({ commit }, tokenId: BigNumber) {
    if (!this.$contracts) {
      throw new Error('Contracts not loaded');
    }
    const nodeType = await this.$contracts.springNode.tokenIdsToType(tokenId);
    if (nodeType === '') {
      commit('setByTokenId', null);
      return;
    }
    const nodeTypeContract = await this.$contracts.nodeTypeByName(nodeType);

    const node: any = await nodeTypeContract.getNodeFromTokenId(tokenId);
    const pendingRewards = await nodeTypeContract.calculateUserRewardsBatch(node.owner, [tokenId]) as [[BigNumber], [BigNumber]];
    const price = await nodeTypeContract.price();
    // console.log(node.plotAdditionalLifetime.toNumber(), node.lastLifetime.toNumber(), Math.floor(Date.now()/1000), node.lastRewardUpdateTime.toNumber())
    const nft: NFT = {
      owner: node.owner,
      nodeType,
      tokenId,
      creationTime: new Date(node.creationTime.toNumber() * 1000),
      lastClaimTime: new Date(node.lastClaimTime.toNumber() * 1000),
      obtainingTime: new Date(node.obtainingTime.toNumber() * 1000),
      lastRewardUpdateTime:new Date(node.obtainingTime.toNumber() * 1000),
      plotAdditionalLifetime: new Date(node.obtainingTime.toNumber() * 1000),
      feature: node.feature,
      lastLifetime:  new Date(node.lastLifetime.toNumber() * 1000),
      userPendingRewards: pendingRewards[0][0],
      userPendingFees: pendingRewards[1][0],
      attribute: await this.$contracts?.springNode?.getAttribute(tokenId),
      leftTime: node.plotAdditionalLifetime.toNumber()*1000 + node.lastLifetime.toNumber()*1000 - (Date.now()-node.lastRewardUpdateTime.toNumber()*1000),
      rewardLevel: 0,
      totalClaimedRewards : node.totalClaimedRewards,
      price : price
    };
    
    commit('setByTokenId', { tokenId, nft });
  },

  async loadSpecialROI({commit}, tokenId:BigNumber[]){
    if (!this.$contracts) {
      throw new Error('Contracts not loaded');
    }
    const roiList = await Promise.all(tokenId.map(async (token,id) => {
      const nodeType = await this.$contracts?.springNode.tokenIdsToType(token);
      if (nodeType === '') {
        // commit('setByTokenId', null);
        return {
          tokenId: token,
          specialROI:0
        }
      }
      const attribute = await this.$contracts?.springNode.getAttribute(token);
      const nodeContract = await this.$contracts?.nodeTypeByName(nodeType);
      const tmp = await nodeContract?.featureToBoostRate(attribute);    
      return {
        tokenId: token,
        specialROI: tmp,
      }
    }))
    commit('setSpecialROI',roiList)
  },

  async onTokenMint({commit,rootGetters}) {
    if (!this.$contracts) {
      throw new Error('Contracts not loaded');
    }
    const userAddress = rootGetters['wallet/address'];
    if (!userAddress) {
      throw new Error('You must connect your wallet');
    }

    await this.$contracts.spring.getToken();
  },

  async loadNFTRewardLevel ({ commit, rootGetters }) {
    const nodeTypeNames: string[] | undefined = rootGetters['nodes/nodeTypesNames'];
    if (!nodeTypeNames || nodeTypeNames.length === 0) {
      commit('resetMyNFTs');
      return;
    }
    const nftsIndexByNodeType = await Promise.all(nodeTypeNames.map(async (nodeTypeName) => {
      const nodeType: NodeType | undefined = rootGetters['nodes/nodeTypeByName'](nodeTypeName);
      const userAddress = rootGetters['wallet/address'];
     
      
      if (!userAddress || !nodeType) {
        return null;
      }

      if (!this.$contracts) {
        throw new Error('Contracts not loaded');
      }
      
      const nodeTypeContract = await this.$contracts.nodeTypeByName(nodeTypeName);
      const totalCount = await nodeTypeContract.getTotalNodesNumberOf(userAddress);
      const { tokenIds} = {
        tokenIds: await nodeTypeContract.getTokenIdsOfBetweenIndexes(userAddress, 0, totalCount) as BigNumber[],
        //timeRoi: await nodeTypeContract.getTimeGRPOfBetweenIndexes(userAddress, 0, totalCount) as BigNumber[],
      };

      const rewardLevel = await Promise.all(tokenIds.map(async(tokenId) => {
        const isActive = await nodeTypeContract.nodeIsActive(userAddress, tokenId);
        const ammoUsed = await nodeTypeContract.getAmmosUsed(userAddress, tokenId);
        const price = await nodeTypeContract.price();

        let rewardLevel = -1;
        if (isActive) {
          /* from loadTimeLeftUntilAmmo() */
          const rewardAmount = await nodeTypeContract.rewardAmount();
          const attribute = await this.$contracts?.springNode?.getAttribute(tokenId);
          const specialROI = await nodeTypeContract.featureToBoostRate(attribute);
          const normalROI = (+formatEther(rewardAmount._hex)) / (+formatEther(nodeType.cost)) * 100;
          const roi = attribute ? normalROI + normalROI * specialROI / 10000 : normalROI;
          const dailyReward = (+formatEther(rewardAmount._hex)) * roi;
          const node: any = await nodeTypeContract.getNodeFromTokenId(tokenId);

          const pendingRewards = await nodeTypeContract.calculateUserRewardsBatch(node.owner, [tokenId]) as [[BigNumber], [BigNumber]];

          
          // const remaing = await nodeTypeContract.getTimeLeftUntilAmmo(userAddress,tokenId);
          console.log(node,  (+formatEther(pendingRewards[0][0]._hex)), "cccccccc")
          const remaing = (+formatEther(price._hex)) / 2 * (ammoUsed + 1) - ((+formatEther(node.totalClaimedRewards._hex)) + (+formatEther(pendingRewards[0][0]._hex)))
          console.log(remaing,"remaing")
          const days = remaing / dailyReward;
          /* ---- */
          if (days > 10) {
            rewardLevel = 0;
          } else {
            rewardLevel = 1;
          }
        } else if (ammoUsed < 3) {
          rewardLevel = 2;
        } else {
          rewardLevel = 3;
        }
        commit('setRewardLevelByTokenId', { tokenId, rewardLevel });
        commit('setUsedAmmosByTokenId', { tokenId, ammoUsed });
        return rewardLevel;
        // const node: any = await nodeTypeContract.getNodeFromTokenId(tokenId);
        // const baseRewardsPerSeconds = await nodeTypeContract.baseRewardsPerSecond(node.feature);        
        // // console.log("baseRewardsPerSeconds", node.feature,price.div(baseRewardsPerSeconds),new Date((node.creationTime.add(price.div(baseRewardsPerSeconds)))*1000));        
        // const grpTime = await nodeTypeContract.getGRP(node.feature);
        
        // //const [knownLifetime, knownTime] = await nodeTypeContract.getCurrentLifetimeOfNode(tokenId)
        // const currentTime = BigNumber.from(Math.floor(new Date().getTime()/1000))
        // let lifetime = node.lastLifetime.sub(currentTime.sub(node.lastRewardUpdateTime)).add(node.plotAdditionalLifetime)
        // console.log(node,"attribute");
        
        // console.log(lifetime,grpTime, "1111111111111111")        
        // if (lifetime.gt(Math.floor(grpTime*1.5))) {
        //   console.log("rewardlevel-0");
        //   commit('setRewardLevelByTokenId', {tokenId : tokenId,rewardLevel : 0});
        //   commit('setLeftTimeByTokenId', {tokenId : tokenId,leftTime : (lifetime.sub(Math.floor(grpTime*1.5))) * 1000});
        //   return baseRewardsPerSeconds;
        // } else if (lifetime.lt(Math.floor(grpTime*1.5)) && lifetime.gt(grpTime)) {
        //   console.log("rewardlevel-1");
        //   commit('setRewardLevelByTokenId', {tokenId : tokenId,rewardLevel : 1});
        //   commit('setLeftTimeByTokenId', {tokenId : tokenId,leftTime : lifetime.sub(grpTime) * 1000});
        //   return baseRewardsPerSeconds.div(2);
        // } else if(lifetime.lt(grpTime) && lifetime.gt(0)) {
        //   console.log("rewardlevel-2");
        //   commit('setRewardLevelByTokenId', {tokenId : tokenId,rewardLevel : 2});
        //   commit('setLeftTimeByTokenId', {tokenId : tokenId,leftTime : lifetime * 1000});
        //   return baseRewardsPerSeconds.div(20);
        // } else {
        //   console.log("rewardlevel-2");
        //   commit('setRewardLevelByTokenId', {tokenId : tokenId,rewardLevel : 3});
        // }
      }))
      console.log(rewardLevel[0],"rewardLevel")
    }))
  },
      // const totalCount = await nodeTypeContract.getTotalNodesNumberOf(userAddress);
      // const { tokenIds, timeRoi} = {
      //   tokenIds: await nodeTypeContract.getTokenIdsOfBetweenIndexes(userAddress, 0, totalCount) as BigNumber[],
      //   timeRoi: await nodeTypeContract.getTimeGRPOfBetweenIndexes(userAddress, 0, totalCount) as BigNumber[],
      // };

    
    // commit('setMyNFTs', Object.fromEntries(entries));
  
  async loadTimeLeftUntilAmmo ({commit,rootGetters}, { nodeTypeName, tokenId} : {nodeTypeName: string, tokenId : BigNumber}) {
    if (!this.$contracts) {
      throw new Error("Contracts not loaded");
    }
    const userAddress = rootGetters["wallet/address"];
    if (!userAddress) {
      throw new Error("Current user address not found");
    }
    const nodeType: NodeType | undefined = rootGetters['nodes/nodeTypeByName'](nodeTypeName);
    if (!nodeType) {
      throw new Error("Could not load node type");
    }
    try {
      const nodeTypeContract = await this.$contracts.nodeTypeByName(nodeTypeName);

      const price = await nodeTypeContract.price();
      const ammoUsed = await nodeTypeContract.getAmmosUsed(userAddress, tokenId);
      const node: any = await nodeTypeContract.getNodeFromTokenId(tokenId);
      const pendingRewards = await nodeTypeContract.calculateUserRewardsBatch(node.owner, [tokenId]) as [[BigNumber], [BigNumber]];
      const remaing = (+formatEther(price._hex)) / 2 * (ammoUsed + 1) - ((+formatEther(node.totalClaimedRewards._hex)) + (+formatEther(pendingRewards[0][0]._hex)))
      // const remaing = await nodeTypeContract.getTimeLeftUntilAmmo(userAddress,tokenId);
      const rewardAmount = await nodeTypeContract.rewardAmount();
      const attribute = await this.$contracts?.springNode?.getAttribute(tokenId);
      const specialROI = await nodeTypeContract.featureToBoostRate(attribute);
      const normalROI = (+formatEther(rewardAmount._hex)) / (+formatEther(nodeType.cost)) * 100;
      const roi = attribute ? normalROI + normalROI * specialROI / 10000 : normalROI;
      const dailyReward = (+formatEther(rewardAmount._hex)) * roi;
      const days = remaing / dailyReward;

      const remainingTimeInMillis = days * 24 * 3600 * 1000;
      commit('setLeftTimeByTokenId', {tokenId : tokenId, leftTime: remainingTimeInMillis});
    }catch(e){
      console.log(e,"errr")
    }
  },
  async getAmmosUsed ({commit,rootGetters}, { nodeTypeName, tokenId} : {nodeTypeName: string, tokenId : BigNumber}) {
    if (!this.$contracts) {
      throw new Error("Contracts not loaded");
    }
    const userAddress = rootGetters["wallet/address"];
    if (!userAddress) {
      throw new Error("Current user address not found");
    }
    const nodeType: NodeType | undefined = rootGetters['nodes/nodeTypeByName'](nodeTypeName);
    if (!nodeType) {
      throw new Error("Could not load node type");
    }
    try {
      const nodeTypeContract = await this.$contracts.nodeTypeByName(nodeTypeName);
      const ammoUsed = await nodeTypeContract.getAmmosUsed(userAddress, tokenId);
      console.log(ammoUsed,"ammoUsed")
      commit('setUsedAmmosByTokenId', { tokenId, ammoUsed });
    }catch(e){
      console.log(e,"errr")
    }
  },
};
