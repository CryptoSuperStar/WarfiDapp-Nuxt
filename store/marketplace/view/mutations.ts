import { MutationTree } from 'vuex';
import { State, ViewType } from './state';

const mutations: MutationTree<State> = {
  setView (state, view: ViewType) {
    if (!ViewType[view]) { return; }
    state.viewType = view;
  },

  setTreeFilter (state, filter:string) {    
    state.filter = filter;
  },

  setFeatureFilter(state, filter:string) {
    state.featureFilter = filter;
  },

  setTypeFilter(state, typeFilter : string) {
    state.typeFilter = typeFilter
  }
};

export default mutations;
