import { MutationTree, ActionTree, GetterTree } from 'vuex';
import axios from 'axios';

export const state = () => ({
  price: 0 as (number | null),
  percentage24h: null as (number | null),
  marketCap: null as (number | null),
  totalSupply: 10000000 as (number | null),
});

type State = ReturnType<typeof state>;

export const getters: GetterTree<State, {}> = {
  isDataReady: store => !!store.price && !!store.percentage24h && !!store.marketCap && !!store.totalSupply,
};

export const mutations: MutationTree<State> = {
  setPrice (state, price: number) {
    state.price = price;
  },

  setPercentage24h (state, percentage24h: number) {
    state.percentage24h = percentage24h;
  },

  setMarketCap (state, marketCap: number) {
    state.marketCap = marketCap;
  },

  setTotalSupply (state, totalSupply: number) {
    state.totalSupply = totalSupply;
  },
};

export const actions: ActionTree<State, {}> = {
  async loadCoinData ({ commit }) {
    const params = {
      contract_addresses: '0xF2FAB804C4Bbd38CdbbF20394dfD223095edA0ae',
      vs_currencies: 'usd',
      include_market_cap: true,
      include_24hr_vol: true,
      include_24hr_change: true,
      include_last_updated_at: true,
    };
    await axios
      .get(
        "https://api.dev.dex.guru/v1/chain/56/tokens/0xF2FAB804C4Bbd38CdbbF20394dfD223095edA0ae/market?api-key=3J5KJ5FNxMvVfb5XWw0V80by1IBXi6UnA0Y186EjWoQ"
      )
      .then((response: any) => {
        const keyArray = Object.keys(response.data);

        commit('setPrice', response.data["price_usd"]);
        commit('setPercentage24h', response.data[keyArray[0]].usd_24h_change);
        commit('setMarketCap', response.data["price_usd"] * 10000000);
      });
  },
};
