import { MutationTree, ActionTree, GetterTree } from "vuex";
import { BigNumber } from "ethers";
import { LuckyBoxType } from "~/models/luckybox-type";
// import { LuckyBox } from '~/models/luckybox';
import { PlotType } from "~/models/plot-type";
import { Plot } from "~/models/plot";
// import { PlotView } from '~/models/plot';
import { Signer } from "@ethersproject/abstract-signer";
import addresses from "~/config/addresses";

export const state = () => ({
  plotTypes: null as PlotType[] | null,
  myPlot: null as Plot[] | null,
  totalPlot: {} as number | null,
  byTokenIds: {} as { [tokenId: string]: Plot | null }, // null means the tokenId doesn't exist
  // plotView : null as (PlotView [] | null),
});

export type State = ReturnType<typeof state>;

export const getters: GetterTree<State, {}> = {
  // totalCreated: state => state.plotTypes?.reduce((total, nodeType) => total + plotTypes.totalCreatedNodes, 0) ?? null,
  typesNames: (state) => state.plotTypes?.map((type) => type.name) ?? null,
  typeByName: (state) => (name: string) =>
    state.plotTypes?.find((type) => type.name === name) ?? null,
  typeById: (state) => (id: number) => state.plotTypes?.[id] ?? null,
  byTokenId: (state) => (tokenId: BigNumber) =>
    state.byTokenIds[tokenId.toString()] ?? null,
};

export const mutations: MutationTree<State> = {
  setplotTypes(state, types: PlotType[]) {
    state.plotTypes = types.slice(1);
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

  setTotalPlot(state, plotAmount: number) {
    state.totalPlot = plotAmount;
  },
};

export const actions: ActionTree<State, {}> = {
  async loadPlotTypes({ commit }) {
    if (!this.$contracts) {
      throw new Error("Contracts not loaded");
    }
    const plotSize = await this.$contracts.springPlot.getPlotTypeSize();
    const results = await this.$contracts.springPlot.getPlotTypeBetweenIndexes(
      0,
      plotSize
    );
    // const results = {
    //   names: (await this.$contracts.luckyBoxes.getMapKeysBetweenIndexes(0, plotSize)) as string[],
    //   luckyBoxes: (await this.$contracts.luckyBoxes.getMapBetweenIndexes(0, plotSize)) as any[],
    // };
    const plotArray = results
      .filter((box, id) => parseInt(box.maxNodes._hex) > 0)
      .map((plot, id): PlotType => {
        return {
          id,
          name: plot.name,
          price: plot.price ? plot.price : 10,
          additionalGRPTime: plot.additionalGRPTime,
          maxNodes: plot.maxNodes,
          allowedNodeTypes: plot.allowedNodeTypes,
          waterpackGRPBoost: plot.waterpackGRPBoost,
        };
      });
    commit("setplotTypes", plotArray);
  },

  async buyPlot(
    { rootGetters, dispatch },
    {
      plotTypeName,
      amount,
      withToken,
      user,
      sponso,
    }: {
      plotTypeName: string;
      amount: number;
      withToken: string;
      user: string;
      sponso: string | null;
    }
  ) {
    const userAddress = rootGetters["wallet/address"];
    if (!userAddress) {
      throw new Error("Current user address not found");
    }
    if (!this.$contracts) {
      throw new Error("Contracts not loaded");
    }

    const holder = await this.$web3Provider?.getSigner();
    const isAllowance = await this.$contracts
      .erc20(withToken)
      .connect(holder as Signer)
      .allowance(userAddress, addresses.Swapper);
    if (isAllowance == 0) {
      const tx = await this.$contracts
        .erc20(withToken)
        .connect(holder as Signer)
        .approve(
          addresses.Swapper,
          BigNumber.from(
            "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
          )
        ); // for testnet with BUSD
      await tx.wait();
    }
    try {
      const tx = await this.$contracts.handlerGameLogicFacet.createPlotWithTokens(
        withToken,
        plotTypeName,
        sponso??''
      );
      await tx.wait();
      dispatch("loadMyPlot");
      dispatch("loadTotalPlot");
    }catch(e) {
      console.log(e)
      if (JSON.stringify(e).indexOf("execution reverted: ERC20: transfer amount exceeds balance") >= 0)
        throw new Error('ERC20: transfer amount exceeds balance')
      if (JSON.stringify(e).indexOf("MetaMask Tx Signature: User denied transaction signature.") >= 0)
        throw new Error('User denied transaction signature')
    }
   
  },

  async loadMyPlot({ commit, rootGetters }) {
    const userAddress = rootGetters["wallet/address"];
    if (!userAddress) {
      throw new Error("Current user address not found");
    }

    if (!this.$contracts) {
      throw new Error("Contracts not loaded");
    }
    console.log("loadMyPlot")
    const PlotTokens: BigNumber[] =
      await this.$contracts.springPlot.tokensOfOwner(userAddress);
    const plot = await Promise.all(
      PlotTokens.map(async (tokenId): Promise<Plot> => {
        if (!this.$contracts) {
          throw new Error("Contracts not loaded");
        }
        const result = await this.$contracts.springPlot.getPlotByTokenId(
          tokenId
        );
        return {
          tokenId,
          owner: userAddress,
          type: await this.$contracts.luckyBoxes.tokenIdsToType(tokenId),
          plot: await this.$contracts.springPlot.getPlotTypeByTokenId(tokenId),
          treeNodes: result.nodeTokenIds,
        };
      })
    );
    commit("setMyPlot", plot);
  },

  async reveal({ dispatch, rootGetters }, tokenIds: BigNumber[]) {
    const userAddress = rootGetters["wallet/address"];
    if (!userAddress) {
      throw new Error("Current user address not found");
    }

    if (!this.$contracts) {
      throw new Error("Contracts not loaded");
    }

    const estimatedGas =
      await this.$contracts.handlerGameLogicFacet.estimateGas.createNodesWithLuckyBoxes(
        tokenIds
      );
    const tx = await this.$contracts.handlerGameLogicFacet.createNodesWithLuckyBoxes(
      tokenIds,
      { gasLimit: estimatedGas.toNumber() + 1500000 }
    );

    await tx.wait();
    dispatch("loadMyPlot");
    dispatch("nft/loadMyNFTs", null, { root: true });
  },

  async loadTotalPlot({ commit, dispatch }) {
    if (!this.$contracts) {
      throw new Error("Contracts not loaded");
    }
    try {
    const amount = await this.$contracts.springPlot.totalSupply();
    commit("setTotalPlot", amount);

      
    }
    catch(e) {
      console.log(e,"error")
    }
  },

  async moveToPlot(
    { dispatch },
    { tokenId, plotId }: { tokenId: BigNumber; plotId: BigNumber }
  ) {
      if (!this.$contracts) {
        throw new Error("Contracts not loaded");
      }
      let tokenIds: any = [];
      let plotIds: any = [];
      let errmsg = "";
      tokenIds[0] = [];
      tokenIds[0][0] = tokenId;
      plotIds[0] = plotId;
      try {
        const tx = await this.$contracts.handlerGameLogicFacet.moveNodesToPlots(plotIds, tokenIds);
        await tx.wait();
        dispatch('nft/loadMyNFTs', null, { root: true })
        dispatch('loadMyPlot')
      } catch (e: any) {
        console.log(e)
        if (
          JSON.stringify(e).indexOf(
            "execution reverted: SpringPlot: Node type not allowed"
          ) >= 0
        ) {
          throw new Error('SpringPlot: Node type not allowed')
        }
      }
  },
};
