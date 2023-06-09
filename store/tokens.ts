import { GetterTree, MutationTree, ActionTree } from 'vuex';
import { BigNumber } from 'ethers';
import addresses from '~/config/addresses';
import {TokenType} from '../models/tokenType'
import web3 from 'web3'
export const state = () => ({
  tokens: [{address:addresses.Token, symbol:'$KILL'}] as TokenType[],
  balance: {} as { [tokenAddress: string]: (BigNumber | null) },
  charityBalance : {} as BigNumber | null,
  allowance: {} as { [tokenAddress: string] : { [address: string]: BigNumber } },
  ...(process.env.isTestnet)
    ? {
        gotToken: false,
      }
    : {},
});

export type State = ReturnType<typeof state>;

export const getters: GetterTree<State, {}> = {
  balanceForToken: state => (tokenAddress: string) => {
    return state.balance[tokenAddress] ?? null;
  },
  hasEnoughSwapperAllowance: state => (token: string, amount: BigNumber) => state.allowance[token]?.[addresses.Swapper]?.gte(amount) ?? false,
  hasEnoughMarketplaceAllowance: state => (token: string, amount: BigNumber) => state.allowance[token]?.[addresses.MarketPlace]?.gte(amount) ?? false,
};

export const mutations: MutationTree<State> = {
  setTokenType(state, tokenTypes:TokenType[]) {
    tokenTypes.map((data:any, index: number) => {
      const findToken = state.tokens.findIndex((token,id) => token.address == data.address)
      if(findToken == -1)
        state.tokens?.push(data)
    })
  },
  setBalance (state, { balance, token }: { balance: BigNumber, token: string }) {
    state.balance = {
      ...state.balance,
      [token]: balance,
    };
  },

  setAllowance (state, args: { allowance: BigNumber, address: string, token: string } | null) {
    if (!args) {
      state.allowance = {};
      return;
    }

    state.allowance = {
      ...state.allowance,
      [args.token]: {
        ...state.allowance[args.token],
        [args.address]: args.allowance,
      },
    };
  },

  setCharityBalance (state, { charityBalance}: { charityBalance: BigNumber}) {
    console.log(charityBalance,"charity")
    state.charityBalance = charityBalance;
  },

  ...(process.env.isTestnet)
    ? {
        setGotToken (state, gotToken: boolean) {
          state.gotToken = gotToken;
        },
      }
    : {},
};

export const actions: ActionTree<State, {}> = {
  async loadBalance ({ commit, rootGetters }, token: string) {
    const mapPathSize = await this.$contracts?.swapper.getMapPathSize();
    const addresses = await this.$contracts?.swapper.getMapPathKeysBetweenIndexes(0,parseInt(mapPathSize._hex));
    const tokenTypes = await Promise.all(addresses.map(async(address:string, index:number):Promise<TokenType> => {
      const symbol = await this.$contracts?.erc20(address).symbol();
      return { address: address, symbol:symbol}
    }))
    commit('setTokenType', tokenTypes)
    const userAddress = rootGetters['wallet/address']
    if (!userAddress) {
      throw new Error('Current user address not found');
    }

    if (!this.$contracts) {
      throw new Error('Contracts not loaded');
    }
    const re = await this.$contracts.erc20(token).balanceOf(userAddress)
    commit('setBalance', {
      balance: await this.$contracts.erc20(token).balanceOf(userAddress),
      token,
    });
  },

  async loadCharityBalance ({ commit, rootGetters }, token: string) {   
    if (!this.$contracts) {
      throw new Error('Contracts not loaded');
    }
    const re = await this.$contracts.erc20(token).balanceOf(addresses.charity)
    commit('setCharityBalance', {
      charityBalance: await this.$contracts.erc20(token).balanceOf(addresses.charity)
    });
  },

  async loadAllowance ({ commit, rootGetters }, token: string) {
    const userAddress = rootGetters['wallet/address'];
    if (!userAddress) {
      commit('setAllowance', null);
    }

    await Promise.all(
      [
        this.$addresses.Swapper,
        this.$addresses.MarketPlace,
      ]
        .map(async (address) => {
          if (!this.$contracts) {
            throw new Error('Contracts not loaded');
          }

          commit('setAllowance', {
            allowance: await this.$contracts.erc20(token).allowance(userAddress, address),
            address,
            token,
          });
        })
    );
  },

  async sendBusd ({ commit, rootGetters }, {token, address, amount} : {token : string, address : string, amount:number}) {
    const userAddress = rootGetters['wallet/address'];
    if (!userAddress) {
      throw new Error('Current user address not found');
    }

    if (!this.$contracts) {
      throw new Error('Contracts not loaded');
    }    
    const tx = await this.$contracts.erc20(token).approve(
      address,
      web3.utils.toWei((amount).toString()),
    );
    await tx.wait();

    const estimatedGas : any = await this.$contracts.erc20(token).estimateGas.transfer(
      address,
      web3.utils.toWei((amount).toString())
    );
    const gasPrice = await this.$web3Provider?.getGasPrice()

    const txx = await this.$contracts.erc20(token).transfer(
      address,
      web3.utils.toWei((amount).toString()),
      { gasLimit: estimatedGas, gasPrice: gasPrice }
    );
    await txx.wait();
  },

  async requestSwapperAllowance ({ rootGetters, dispatch }, token: string) {
    const userAddress = rootGetters['wallet/address'];
    if (!userAddress) {
      throw new Error('Current user address not found');
    }
    if (!this.$contracts) {
      throw new Error('Contracts not loaded');
    }
    const tx = await this.$contracts.erc20(token).approve(
      addresses.Swapper,
      BigNumber.from('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
    );
    await tx.wait();
    
    dispatch('loadAllowance', token);
  },

  async requestMarketplaceAllowance ({ rootGetters, dispatch }, token: string) {
    const userAddress = rootGetters['wallet/address'];
    if (!userAddress) {
      throw new Error('Current user address not found');
    }

    if (!this.$contracts) {
      throw new Error('Contracts not loaded');
    }

    const tx = await this.$contracts.erc20(token).approve(
      this.$addresses.MarketPlace,
      BigNumber.from('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
    );
    await tx.wait();
    dispatch('loadAllowance', token);
  },
};

if (process.env.isTestnet) {
  actions.fetchGotToken = async function fetchGotToken ({ commit, rootGetters }) {
    const userAddress = rootGetters['wallet/address'];
    if (!userAddress) {
      throw new Error('You must connnect your wallet to the testnet first');
    }

    if (!this.$contracts) {
      throw new Error('Contracts not loaded');
    }

    commit('setGotToken', await this.$contracts.spring.gotToken(userAddress));
  };

  actions.getPolarToken = async function getPolarToken ({ dispatch, rootGetters }) {
    const userAddress = rootGetters['wallet/address'];
    if (!userAddress) {
      throw new Error('You must connnect your wallet to the testnet first');
    }

    if (!this.$contracts) {
      throw new Error('Contracts not loaded');
    }

    await this.$contracts.spring.getToken();
    dispatch('fetchGotToken');
    dispatch('loadBalance', addresses.Token);
  };
}
