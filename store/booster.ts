import { MutationTree, ActionTree, GetterTree } from "vuex";
import { BigNumber } from "ethers";
import { LuckyBoxType } from "~/models/luckybox-type";
// import { LuckyBox } from '~/models/luckybox';
import { PlotType } from "~/models/plot-type";
import { Plot } from "~/models/plot";
// import { PlotView } from '~/models/plot';
import addresses from "~/config/addresses";
import { WaterPackType } from "~/models/boosterItem";
import { FertilizerType } from "~/models/boosterItem";
import * as BoosterItemPrice from "~/models/boosterItem";
import {BoosterItemName} from "~/models/types"
import { BoosterItemLog, BoosterItemListLog } from "~/models/boosterItem";
import * as ethers from "ethers";
const formatEther = ethers.utils.formatEther;
import { ItemType } from "~/models/itemTypes";

export const state = () => ({
  plotTypes: null as PlotType[] | null,
  myPlot: null as Plot[] | null,
  totalPlot: {} as number | null,
  byTokenIds: {} as { [tokenId: string]: Plot | null }, // null means the tokenId doesn't exist
  // plotView : null as (PlotView [] | null),
  waterpackTypes: null as WaterPackType[] | null,
  fertilizerType: null as FertilizerType[] | null,
  boosterPrice: null as BoosterItemPrice.BoosterItemPrice[] | null,
  boosterItemListLog: null as BoosterItemListLog[] | null,
  totalCreatedPerType: {} as number | null,
  totalCreatedPerNodeTokenId: {} as number| null,
  totalCreatedPerUserPerType: {} as number | null,
  // boosterItemListLog: null as BoosterItemListLog[]| null,
});
import { Signer } from "@ethersproject/abstract-signer";
import { Result } from "postcss";
export type State = ReturnType<typeof state>;

export const getters: GetterTree<State, {}> = {

  byTokenId: (state) => (tokenId: BigNumber) =>
    state.byTokenIds[tokenId.toString()] ?? null,
  byNodetype: (state) => (name: string, nodeType: string) => {
    const result = state.boosterPrice?.find((item) => {
      if (item.name == name && item.nodeType == nodeType) return item;
    });
    return result;
  },

  // boosterLog: (state) => (tokenId: BigNumber) => {
  //   const result = state.boosterItemListLog?.map(
  //     (data, id) => {  if(data.tokenId == tokenId)  return data}
  //   );
  //   return result;
  // },
  boosterConfigByName: (state) => (boosterType: string, boostername: string) => {
    let result;
    if(boosterType == ItemType.waterPack)
    {
       let temp = state.waterpackTypes?.find((type,id) => type.name == boostername)
       result =  temp

    } else {
       const temp = state.fertilizerType?.find((type,id) => type.name == boostername)
       result =  temp
    }    
    return result ? result : [] 
  },

  waterMReaminingTime: (state) =>(tokenId:BigNumber) => {
    let boosterListByToken = state.boosterItemListLog?.find((itemLoglist,id) => itemLoglist.tokenId.eq(tokenId))
    let waterMItem = boosterListByToken?.logList?.filter((log,id) => log.boosterType == ItemType.waterPack && log.name == BoosterItemName.waterMedium)
    let totalRemainingTime = 0;
    let totalActiveItem = 0;
    waterMItem?.map((itemLog) => {
      if(itemLog.activeTime > 0 )
      { 
        totalRemainingTime += itemLog.activeTime
        totalActiveItem ++;
      }
    })
    return {
      totalRemainingTime,
      totalActiveItem
    }
  },
  waterLReaminingTime: (state) =>(tokenId:BigNumber) => {
    let boosterListByToken = state.boosterItemListLog?.find((itemLoglist,id) => itemLoglist.tokenId.eq(tokenId))
    let waterMItem = boosterListByToken?.logList?.filter((log,id) => log.boosterType == ItemType.waterPack)
    let totalRemainingTime = 0;
    let totalActiveItem = 0;
    waterMItem?.map((itemLog) => {
      if(itemLog.activeTime > 0 )
      { 
        totalRemainingTime += itemLog.activeTime
        totalActiveItem ++;
      }
    })
    return {
      totalRemainingTime,
      totalActiveItem
    }
  },
  fertilizerMReaminingTime: (state) =>(tokenId:BigNumber) => {
    let boosterListByToken = state.boosterItemListLog?.find((itemLoglist,id) => itemLoglist.tokenId.eq(tokenId))
    let MItem = boosterListByToken?.logList?.filter((log,id) => log.boosterType == ItemType.fertilizer && log.name == BoosterItemName.fertilizeMedium)
    let totalRemainingTime = 0;
    let totalActiveItem = 0;
    MItem?.map((itemLog) => {
      if(itemLog.activeTime > 0 )
      { 
        totalRemainingTime = itemLog.activeTime
        totalActiveItem ++;
      }
    })
    return {
      totalRemainingTime,
      totalActiveItem
    }
  },
  fertilizerLReaminingTime: (state) =>(tokenId:BigNumber) => {
    let boosterListByToken = state.boosterItemListLog?.find((itemLoglist,id) => itemLoglist.tokenId.eq(tokenId))
    let LItem = boosterListByToken?.logList?.filter((log,id) => log.boosterType == ItemType.fertilizer && log.name == BoosterItemName.fertilizeLarge)
    let totalRemainingTime = 0;
    let totalActiveItem = 0;
    LItem?.map((itemLog) => {
      if(itemLog.activeTime > 0 )
      { 
        totalRemainingTime = itemLog.activeTime
        totalActiveItem ++;
      }
    })
    return {
      totalRemainingTime,
      totalActiveItem
    }
  },
  
};

export const mutations: MutationTree<State> = {
  setplotTypes(state, types: PlotType[]) {
    state.plotTypes = types;
  },

  setFertilizerType(state, type: FertilizerType[]) {
    state.fertilizerType = type;
  },

  setWaterPackType(state, type: WaterPackType[]) {
    state.waterpackTypes = type;
  },

  setMyPlot(state, myplot: Plot[]) {
    state.myPlot = myplot.sort((a, b) => {
      const cmp = b.tokenId.sub(a.tokenId);
      return cmp.gt(0) ? 1 : cmp.lt(0) ? -1 : 0;
    });

    myplot.forEach((plot) => {
      state.byTokenIds = {
        ...state.byTokenIds,
        [plot.tokenId.toString()]: plot.type === "" ? null : plot,
      };
    });
  },

  setLuckyBox(state, plot: Plot) {
    state.byTokenIds = {
      ...state.byTokenIds,
      [plot.tokenId.toString()]: plot.type === "" ? null : plot,
    };
  },

  setTotalPlot(state, plotAmount: number) {
    state.totalPlot = plotAmount;
  },
  setBoosterPrice(state, boosterPrice: BoosterItemPrice.BoosterItemPrice[]) {
    state.boosterPrice = boosterPrice;
  },
  setBoosterItemLog(state, itemLog: BoosterItemListLog[]) {
    state.boosterItemListLog = itemLog;
  },
  setTotalCreatedPerType(state, limit: number)
  {
    state.totalCreatedPerType = limit
  },
  setTotalCreatedPerNodeTokenId(state, limit: number)
  {
    state.totalCreatedPerNodeTokenId = limit
  },
  setTotalCreatedPerUserPerType(state, limit: number)
  {
    state.totalCreatedPerUserPerType = limit
  }
};

export const actions: ActionTree<State, {}> = {
  async loadPlotTypes({ commit }) {
    if (!this.$contracts) {
      throw new Error("Contracts not loaded");
    }
    const plotSize = await this.$contracts.handlerAddonsFacet.getWaterpackTypes();

    //   commit('setplotTypes', plotArray);
  },

  async loadBoosterItemType({ commit }) {
    if (!this.$contracts) {
      throw new Error("Contracts not loaded");
    }

    const fertilzierType = await this.$contracts.handlerAddonsFacet.getFertilizerTypes();
    const waterPackType = await this.$contracts.handlerAddonsFacet.getWaterpackTypes();
    commit("setFertilizerType", fertilzierType);
    commit("setWaterPackType", waterPackType);
  },

  async loadBoosterPrice(
    { commit, rootGetters },
    { boostertype, name }: { boostertype: string; name: string }
  ) {
    if (!this.$contracts) {
      throw new Error("Contracts not loaded");
    }
    if (boostertype == ItemType.seed || boostertype == ItemType.plot) return;
    const nodeSize = (
      await this.$contracts.handlerAdministrationFacet.getNodeTypesSize()
    ).toNumber();
    const nodeTypesNames: string[] =
      await this.$contracts.handlerAdministrationFacet.getNodeTypesBetweenIndexes(0, nodeSize);

    const itemPrice = await Promise.all(
      nodeTypesNames.map(
        async (type, index): Promise<BoosterItemPrice.BoosterItemPrice> => {
          if (!this.$contracts) {
            throw new Error("Contracts not loaded");
          }
          let cost;
          if (boostertype == ItemType.waterPack) {
            cost =
              await this.$contracts.handlerAddonsFacet.getWaterpackPriceByNameAndNodeType(
                name,
                type
              );
          } else {
            cost =
              await this.$contracts.handlerAddonsFacet.getFertilizerPriceByNameAndNodeType(
                name,
                type
              );
          }
          const userAddress = rootGetters["wallet/address"];
          return {
            boosterType: boostertype,
            name: name,
            nodeType: type,
            price: cost,
          };
        }
      )
    );
    commit("setBoosterPrice", itemPrice);
  },

  async buywaterpackItem(
    { commit, rootGetters, dispatch },
    {
      withToken,
      amount,
      tokenIds,
      boosterTypeName,
      sponso,
    }: {
      withToken: string;
      amount: number[];
      tokenIds: BigNumber[];
      boosterTypeName: string;
      sponso: string;
    }
  ) {
    const userAddress = rootGetters["wallet/address"];
    if (!userAddress) {
      throw new Error("Current user address not found");
    }

    if (!this.$contracts) {
      throw new Error("Contracts not loaded");
    }
    let nodeTokenList: any = [];
    let nodeTokenAmount: any = [];
    amount.map((data, id) => {
      if (data > 0) {
        nodeTokenList.push(tokenIds[id]);
        nodeTokenAmount.push(BigNumber.from(data));
      }
    });

    const holder = await this.$web3Provider?.getSigner()     
    const isAllowance = await this.$contracts.erc20(withToken).connect(holder as Signer).allowance(userAddress, addresses.Swapper);
    if(isAllowance == 0) {
        const tx = await this.$contracts.erc20(withToken).connect(holder as Signer).approve(addresses.Swapper, BigNumber.from('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')); // for testnet with BUSD
        await tx.wait();
    }
    try {
      const tx = await this.$contracts.handlerGameLogicFacet.applyWaterpackBatch(
        withToken,
        userAddress,
        nodeTokenList,
        boosterTypeName,
        nodeTokenAmount,
        sponso??"",
      );
      await tx.wait();
      dispatch('nft/loadByTokenId', tokenIds[0],{ root: true })
      dispatch('nodes/loadNodeTypes',null, { root: true })
      dispatch('nodes/loadAllNodes',null, { root: true })
      const myNFTList = rootGetters['nft/myNFTsByCreationDateDesc'];
      let tokenList : any = [];
      myNFTList.map((data, id) => {
        tokenList.push(data.tokenId)
      })
      dispatch('loadBoosterItemLog',tokenList)
     
     
    } catch(e:any) {
      console.log(e)
      if (JSON.stringify(e).indexOf("execution reverted: NodeType: User doesnt own this node") >= 0)
        throw new Error('execution reverted: NodeType: User doesnt own this node')
      if (JSON.stringify(e).indexOf("execution reverted: ERC20: transfer amount exceeds balance") >= 0)
        throw new Error('ERC20: transfer amount exceeds balance')
      if (JSON.stringify(e).indexOf("MetaMask Tx Signature: User denied transaction signature.") >= 0)
        throw new Error('User denied transaction signature')
    }
  },

  async buyfertilizerItem(
    { commit, rootGetters, dispatch },
    {
      withToken,
      amount,
      tokenIds,
      name,
      boosterTypeName,
      sponso,
      nodeType,
    }: {
      withToken: string;
      amount: number[];
      tokenIds: BigNumber[];
      name: string;
      boosterTypeName: string;
      sponso: string;
      nodeType: string[];
    }
  ) {
    const userAddress = rootGetters["wallet/address"];
    if (!userAddress) {
      throw new Error("Current user address not found");
    }

    if (!this.$contracts) {
      throw new Error("Contracts not loaded");
    }
    let nodeTokenList: any = [];
    let nodeTokenAmount: any = [];
    let nodeTypesNames: any = [];
    let j = 0;
    for (let i=0;  i < nodeType.length; i++) {
      if(amount[i] > 0) 
      { 
        nodeTypesNames[j] = nodeType[i];
        nodeTokenList[j] = [];
        nodeTokenList[j][0] = BigNumber.from(tokenIds[i]);
        nodeTokenAmount[j] = [];
        nodeTokenAmount[j][0] = BigNumber.from(amount[i]);
        j++;
      }
    }
    try {

      const holder = await this.$web3Provider?.getSigner()     
      const isAllowance = await this.$contracts.erc20(withToken).connect(holder as Signer).allowance(userAddress, addresses.Swapper);
      if(isAllowance == 0) {
          const tx = await this.$contracts.erc20(withToken).connect(holder as Signer).approve(addresses.Swapper, BigNumber.from('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')); // for testnet with BUSD
          await tx.wait();
      }
      const tx = await this.$contracts.handlerGameLogicFacet.applyFertilizerBatch(
        withToken,
        userAddress,
        nodeTypesNames,
        nodeTokenList,
        boosterTypeName,
        nodeTokenAmount,
        sponso??""
      );
      await tx.wait();
      dispatch('nft/loadMyNFTs', null, { root: true })
      const myNFTList = rootGetters['nft/myNFTsByCreationDateDesc'];
      let tokenList : any = [];
      myNFTList.map((data, id) => {
        tokenList.push(data.tokenId)
      })
      dispatch('loadBoosterItemLog',tokenList)
    } catch(e:any) {
      console.log(e)
      if (JSON.stringify(e).indexOf("execution reverted: NodeType: User doesnt own this node") >= 0)
        throw new Error('execution reverted: NodeType: User doesnt own this node')
      if (JSON.stringify(e).indexOf("execution reverted: Fertilizers: Node limit exceeded") >= 0)
        throw new Error('Node limit exceeded')
      if (JSON.stringify(e).indexOf("execution reverted: Fertilizers: User node type limit exceeded") >= 0)
        throw new Error('User node type limit exceeded')
      if (JSON.stringify(e).indexOf("execution reverted: Fertilizers: Global limit exceeded") >= 0)
        throw new Error('Global limit exceeded')
      if (JSON.stringify(e).indexOf("execution reverted: Fertilizers: User limit exceeded") >= 0)
        throw new Error('User limit exceeded')
      if (JSON.stringify(e).indexOf("execution reverted: ERC20: transfer amount exceeds balance") >= 0)
        throw new Error('ERC20: transfer amount exceeds balance')
      if (JSON.stringify(e).indexOf("MetaMask Tx Signature: User denied transaction signature.") >= 0)
        throw new Error('User denied transaction signature')
    }
  },

  async loadBoosterItemLog({ commit,rootGetters }, tokenIds: BigNumber[]) {
    if (!this.$contracts) {
      throw new Error("Contracts not loaded");
    }
    const itemLogListByToken  = await Promise.all(tokenIds.map(async(tokenId,id) :Promise<BoosterItemListLog> => {
    const itemLog = await this.$contracts?.handlerAddonsFacet.getItemLogForNode(tokenId);
    const nft = rootGetters['nft/nftByTokenID'](tokenId);
    const nodeType =rootGetters['nodes/nodeTypeByName'](nft.nodeType)
    const timeToGRP = nodeType.timeToGRP.toNumber() * 1000;
    let itemLogList = itemLog.map((log,id) : BoosterItemLog => {
      let config = rootGetters['booster/boosterConfigByName'](log.addonKind, log.addonTypeName)
      let effectTime = 0;
      let endTime = 0;
      let creationTime = log.creationTime.toNumber() * 1000;
      if(log.addonKind == ItemType.waterPack)
        effectTime = timeToGRP * config.ratioOfGRP.toNumber()/10000
      else
        effectTime = config.durationEffect.toNumber() * 1000;
      if(Date.now() < creationTime + effectTime)
      {
        endTime = creationTime + effectTime - Date.now();

      }
      return {
        boosterType: log.addonKind,
        name: log.addonTypeName,
        activeTime: endTime,
      }
    })
    return {
      tokenId: tokenId,
      logList: itemLogList
    }
    }))
    commit("setBoosterItemLog", itemLogListByToken);
  },

  async loadTotalCreatedNodeAomunt({commit,rootGetters}, typeName: string) {
    if (!this.$contracts) {
      throw new Error("Contracts not loaded");
    }
    const userAddress = rootGetters["wallet/address"];
    if (!userAddress) {
      throw new Error("Current user address not found");
    }
    try {
      const globalAmount = await this.$contracts.handlerAddonsFacet.totalFertilizerCreatedPerType(typeName)
      commit('setTotalCreatedPerType', globalAmount.toNumber())
    }catch(e){
      console.log(e,"errr")
    }
  },

  async loadTotalCreatedPerUserPerType({commit,rootGetters}, nodeType: string) {
    if (!this.$contracts) {
      throw new Error("Contracts not loaded");
    }
    const userAddress = rootGetters["wallet/address"];
    if (!userAddress) {
      throw new Error("Current user address not found");
    }
    try {
      const nodeAmount = await this.$contracts.handlerAddonsFacet.totalFertilizerCreatedPerUserPerType(userAddress,nodeType)
      commit('setTotalCreatedPerUserPerType', nodeAmount.toNumber())
    }catch(e){
      console.log(e,"errr")
    }
  },

  async loadTotalCreatedPerNodeTokenId ({commit,rootGetters}, tokenId : BigNumber) {
    if (!this.$contracts) {
      throw new Error("Contracts not loaded");
    }

    const userAddress = rootGetters["wallet/address"];
    if (!userAddress) {
      throw new Error("Current user address not found");
    }

    try {
      const amount = await this.$contracts?.handlerAddonsFacet.totalFertilizerCreatedPerNodeTokenId(tokenId)
      commit('setTotalCreatedPerNodeTokenId', amount.toNumber())
    }catch(e){
      console.log(e)
    }
  }
};
