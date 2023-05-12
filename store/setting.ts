import { GetterTree, MutationTree, ActionTree } from 'vuex';
import { BigNumber } from 'ethers';
import addresses from '~/config/addresses';
import {TokenType} from '../models/tokenType'
export const state = () => ({
  sound_option : 'ON' as string
});

export type State = ReturnType<typeof state>;

export const getters: GetterTree<State, {}> = {
};

export const mutations: MutationTree<State> = {
  setOption(state, option:string) { 
    state.sound_option = option
  }
   
};

export const actions: ActionTree<State, {}> = {
  loadOption ({commit}) {
    const option = localStorage.getItem('sound')
    if(option !=null)
      commit('setOption',option)
    else
      commit('setOption','ON')
  
  },
  setSoundOption ({commit}, {option} : {option:string}){
    commit('setOption',option)
  },
  
};


