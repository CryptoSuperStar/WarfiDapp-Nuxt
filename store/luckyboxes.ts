import { MutationTree, ActionTree, GetterTree } from 'vuex';
import { BigNumber } from 'ethers';
import { LuckyBoxType } from '~/models/luckybox-type';
import { LuckyBox } from '~/models/luckybox';
import { Signer } from "@ethersproject/abstract-signer";
import addresses from '~/config/addresses';
export const state = () => ({
  luckyBoxTypes: null as (LuckyBoxType[] | null),
  myLuckyBoxes: null as (LuckyBox[] | null),
  byTokenIds: {} as { [tokenId: string]: LuckyBox | null }, // null means the tokenId doesn't exist
});

export type State = ReturnType<typeof state>;

export const getters: GetterTree<State, {}> = {
  typesNames: state => state.luckyBoxTypes?.map(type => type.name) ?? null,
  typeByName: state => (name: string) => state.luckyBoxTypes?.find(type => type.name === name) ?? null,
  typeById: state => (id: number) => state.luckyBoxTypes?.[id] ?? null,
  byTokenId: state => (tokenId: BigNumber) => state.byTokenIds[tokenId.toString()] ?? null,
};

export const mutations: MutationTree<State> = {
  setLuckyBoxTypes (state, types: LuckyBoxType[]) {
  state.luckyBoxTypes = types;
  },

  setMyLuckyBoxes (state, myLuckyBoxes: LuckyBox[]) {
    state.myLuckyBoxes = myLuckyBoxes.sort((a, b) => {
      const cmp = b.tokenId.sub(a.tokenId);
      return cmp.gt(0) ? 1 : cmp.lt(0) ? -1 : 0;
    });

    myLuckyBoxes.forEach((luckyBox) => {
      state.byTokenIds = {
        ...state.byTokenIds,
        [luckyBox.tokenId.toString()]: (luckyBox.type === '') ? null : luckyBox,
      };
    });
  },

  setLuckyBox (state, luckyBox: LuckyBox) {
    state.byTokenIds = {
      ...state.byTokenIds,
      [luckyBox.tokenId.toString()]: (luckyBox.type === '') ? null : luckyBox,
    };
  },
};

export const actions: ActionTree<State, {}> = {
  async loadLuckyBoxTypes ({ commit }) {
    
    if (!this.$contracts) {
      throw new Error('Contracts not loaded');
    }
    const luckyBoxesSize = await this.$contracts.luckyBoxes.getBoxSize();
    const results = {
      names: (await this.$contracts.luckyBoxes.getMapKeysBetweenIndexes(0, luckyBoxesSize)) as string[],
      luckyBoxes: (await this.$contracts.luckyBoxes.getMapBetweenIndexes(0, luckyBoxesSize)) as any[],
    };
    let luckyBoxesArray = 
      results.luckyBoxes.filter((box, id) => parseInt(box.maxUser._hex) > 0).map((luckyBox, id): LuckyBoxType => {
        console.log(parseInt(luckyBox.maxBox._hex), parseInt(luckyBox.createdBox._hex), "LuckyBox")
        return {
          id,
          name: results.names[id],
          price: luckyBox.priceTokens,
          maxUser: luckyBox.maxUser,
          maxBox: luckyBox.maxBox,
          createdBox: luckyBox.createdBox,
          nodeTypes: luckyBox.nodeType,
          probabilities: luckyBox.probability,
          remaining: luckyBox.remaining,
          features: luckyBox.feature,
        };
      });
      luckyBoxesArray.sort((a, b) => {
        const cmp = b.price.sub(a.price);
        return  cmp.lt(0) ? 1  : cmp.gt(0) ? -1 : 0;
      });
      luckyBoxesArray = luckyBoxesArray.filter((box, id) => parseInt(box.createdBox._hex) <= parseInt(box.maxBox._hex))
      console.log(luckyBoxesArray, "LuckyboxesArray");
    commit('setLuckyBoxTypes', luckyBoxesArray);
  },

  async buy ({ dispatch, rootGetters }, { luckyBox, amount, withToken, user, sponso }: { luckyBox: LuckyBoxType, amount: number, withToken: string, user: string, sponso: string | null }) {
    const userAddress = rootGetters['wallet/address'];
    if (!userAddress) {
      throw new Error('Current user address not found');
    }

    if (!this.$contracts) {
      throw new Error('Contracts not loaded');
    }
    const holder = await this.$web3Provider?.getSigner()     
    const isAllowance = await this.$contracts.erc20(withToken).connect(holder as Signer).allowance(userAddress, addresses.Swapper);
    if(isAllowance == 0) {
        const tx = await this.$contracts.erc20(withToken).connect(holder as Signer).approve(addresses.Swapper, BigNumber.from('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')); // for testnet with BUSD
        await tx.wait();
    }
    /*const estimatedGas = await this.$contracts.handler.estimateGas.createLuckyBoxesWithTokens(
      withToken,
      user,
      luckyBox.name,
      amount,
      sponso??''
    );
    console.log(estimatedGas,"estimateGas");*/
    try {
      const tx = await this.$contracts.handlerGameLogicFacet.createLuckyBoxesWithTokens(
        withToken,
        user,
        luckyBox.name,
        amount,
        sponso??'',
      );
      await tx.wait();
      dispatch('loadMyLuckyBoxes');
    } catch(e : any)
    {
      console.log(e)
      if (JSON.stringify(e).indexOf("execution reverted: ERC20: transfer amount exceeds balance") >= 0)
        throw new Error('transfer amount exceeds balance')
      if (JSON.stringify(e).indexOf("MetaMask Tx Signature: User denied transaction signature.") >= 0)
        throw new Error('User denied transaction signature')
      if (JSON.stringify(e).indexOf("Error: VM Exception while processing transaction: reverted with reason string 'ERC20: transfer amount exceeds balance'") >= 0)
        throw new Error('transfer amount exceeds balance')
    }
           
  },

  async loadMyLuckyBoxes ({ commit, rootGetters }) {
    const userAddress = rootGetters['wallet/address'];
    if (!userAddress) {
      throw new Error('Current user address not found');
    }

    if (!this.$contracts) {
      throw new Error('Contracts not loaded');
    }
    const luckyBoxesTokens: BigNumber[] = await this.$contracts.luckyBoxes.tokensOfOwner(userAddress);
    const luckyBoxes = await Promise.all(luckyBoxesTokens.map(async (tokenId): Promise<LuckyBox> => {
      if (!this.$contracts) {
        throw new Error('Contracts not loaded');
      }

      return {
        tokenId,
        owner: userAddress,
        type: await this.$contracts.luckyBoxes.tokenIdsToType(tokenId),
        attribute: await this.$contracts.luckyBoxes.getAttribute(tokenId),
      };
    }));

    commit('setMyLuckyBoxes', luckyBoxes);
  },

  async reveal ({ dispatch, rootGetters }, tokenIds: BigNumber[]) {
    const userAddress = rootGetters['wallet/address'];
    if (!userAddress) {
      throw new Error('Current user address not found');
    }

    if (!this.$contracts) {
      throw new Error('Contracts not loaded');
    }
    try{
      const estimatedGas : any = await this.$contracts.handlerGameLogicFacet.estimateGas.createNodesWithLuckyBoxes(
        tokenIds, Array(tokenIds.length).fill(0)
      );
      const tx = await this.$contracts.handlerGameLogicFacet.createNodesWithLuckyBoxes(
        tokenIds, Array(tokenIds.length).fill(0),
        { gasLimit: estimatedGas.toNumber() + 1500000 }
      );
      await tx.wait();
    }catch(e:any)
    {
      console.log(e)
      throw new Error('UnKown Error')
    }finally{
      dispatch('loadMyLuckyBoxes');
      dispatch('nft/loadMyNFTs', null, { root: true });
      dispatch('plot/loadMyPlot',null, { root: true })
    }
  },

  async preOrderReveal({rootGetters,dispatch}, index: number) {
    if (!this.$contracts) {
      throw new Error('Contracts not loaded');
    }
    const userAddress = rootGetters['wallet/address'];
    if (!userAddress) {
      throw new Error('Current user address not found');
    }
    try {
      const result= await this.$contracts.handlerPresalFacet.createLuckyBoxFromPreSale(userAddress, BigNumber.from(index))
      await result.wait();
      
    }catch(e) {
      console.log(e)
      throw new Error('UnKown Error')
    }finally {
      dispatch('loadMyLuckyBoxes');
      dispatch('nft/loadMyNFTs', null, { root: true });
      // dispatch('plot/loadMyPlot',null, { root: true });
      dispatch('presale/loadMyPreOrderItems',null, { root: true });
    }
  },

  async loadByTokenId ({ commit }, tokenId: BigNumber) {
    if (!this.$contracts) {
      throw new Error('Contracts not loaded');
    }

    commit('setLuckyBox', {
      tokenId,
      owner: await this.$contracts.luckyBoxes.ownerOf(tokenId),
      type: await this.$contracts.luckyBoxes.tokenIdsToType(tokenId),
      attribute: await this.$contracts.luckyBoxes.getAttribute(tokenId),
    });
  },
};
