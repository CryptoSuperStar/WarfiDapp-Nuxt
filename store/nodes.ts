import { MutationTree, ActionTree, GetterTree } from 'vuex';
import * as ethers from 'ethers';
import * as NodeType from '~/models/NodeType';
import {Node} from '~/models/Node';
import { BigNumber } from 'ethers';

export const state = () => ({
  nodeTypes: null as (NodeType.NodeType[] | null),
  node : null as (any | null),
  oldNodeCounter: {} as { [nodeType: string]: (number | null) },
  myNodes: {} as Record<string, Node[]>,
  // oldNodeCounter: 0 as (number | null)
});

export type State = ReturnType<typeof state>;

export const getters: GetterTree<State, {}> = {
  oldNodeCount: state => (nodeType: string) => {
    return state.oldNodeCounter[nodeType] ?? null;
  },
  totalCreated: state => state.nodeTypes?.reduce((total, nodeType) => total + nodeType.totalCreatedNodes, 0) ?? null,
  myTotalCreated: state => state.nodeTypes?.reduce((total, nodeType) => total + (nodeType?.userCount ?? 0), 0) ?? null,
  nodeTypesNames: state => state.nodeTypes?.map(node => node.name),
  nodeTypeByName: state => (name: string) => state.nodeTypes?.find(node => node.name === name),
  totalDailyRewards: state => state.nodeTypes?.reduce(
    (total, node) =>
      total.add(NodeType.dailyRewardsPerUser(node)),
    ethers.BigNumber.from(0)
  ) ?? null,
  totalPendingRewards: state => state.nodeTypes?.reduce(
    (total, node) =>
      total.add(node.userRewards ?? 0),
    ethers.BigNumber.from(0)
  ) ?? null,
  nftNode: (state) => state.node,
  myNodesByNodeType: state => (typename : string) => state.myNodes[typename],
  // nodeNameById : state =>(tokenId : string) => {
  //   console.log
  // }
  
}

export const mutations: MutationTree<State> = {
  setNodeTypes (state, nodeTypes: NodeType.NodeType[]) {
    state.nodeTypes = nodeTypes;
  },

  setMyNodes (state, nodes: Record<string, Node[]>) {
    state.myNodes = nodes;    
  },
//   setOldNodeNumber (state, { nodeType, oldNodeCount }: {nodeType : string, oldNodeCount : number}) {
//     state.oldNodeCounter[nodeType] = oldNodeCount;
//   },

  setUserRewardsForNodeType (state, { nodeTypeName, rewards, fees }) {
    state.nodeTypes = state.nodeTypes?.map((node) => {
      if (node.name === nodeTypeName) {
        node.userRewards = rewards;
        node.userFees = fees;
      }

      return node;
    }) ?? null;
  },
};

interface CreateNodesWithPendingArgs {
  selectedNodes: {
    tokenId: number, nodeType: string
  }[]
  tokenOut: string
  nodeTypeTo: string
  count: number
}

export const actions: ActionTree<State, {}> = {
  async loadNodeTypes ({ commit, dispatch, rootGetters }) {
    if (!this.$contracts) {
      throw new Error('Contracts not loaded');
    }
    const nodeSize = (await this.$contracts.handlerAdministrationFacet.getNodeTypesSize()).toNumber();
    const nodeTypesNames: string[] = await this.$contracts.handlerAdministrationFacet.getNodeTypesBetweenIndexes(0, nodeSize);
    const nodeTypes = await Promise.all(
      nodeTypesNames.map(async (name, index): Promise<NodeType.NodeType> => {
        if (!this.$contracts) {
          throw new Error('Contracts not loaded');
        }
        const nodeTypeContract = await this.$contracts.nodeTypeByName(name);        
        const userAddress = rootGetters['wallet/address'];
          return {
          index,
          name,
          cost: await nodeTypeContract.price(),
          claimTax: (await nodeTypeContract.claimTaxGRP()).div(100).toNumber(),
          globalTax:(await nodeTypeContract.globalTax()).div(100).toNumber(),
          rewardAmount: await nodeTypeContract.rewardAmount(),
          userCount: (userAddress)
            ? (await nodeTypeContract.getTotalNodesNumberOf(userAddress)).toNumber()
            : null,
          totalCreatedNodes: (await nodeTypeContract.totalCreatedNodes()).toNumber(),
          maxSlots: (await nodeTypeContract.maxCount()).toNumber(),
          // maxLevelUpUser: (await nodeTypeContract.maxLevelUpUser()).toNumber(),
          // maxLevelUpGlobal: (await nodeTypeContract.maxLevelUpTotal()).toNumber(),
          // maxCreationPendingUser: (await nodeTypeContract.maxCreationPendingUser()).toNumber(),
          // maxCreationPendingGlobal: (await nodeTypeContract.maxCreationPendingTotal()).toNumber(),
          timeToGRP : await nodeTypeContract.getGRP(""),
        };
      })
    );
    commit('setNodeTypes', nodeTypes);
    nodeTypes.forEach(node => dispatch('loadUserRewardsByNodeType', node.name));
  },
  async loadNodeTypeByName ({ dispatch }, _name) {
    await dispatch('loadNodeTypes');
  },

  async loadAllNodes ({ commit, rootGetters }) {
    const nodeTypeNames: string[] | undefined = rootGetters['nodes/nodeTypesNames'];
    if (!nodeTypeNames || nodeTypeNames.length === 0) {
      commit('resetMyNFTs');
      return;
    }

    const nftsIndexByNodeType = await Promise.all(nodeTypeNames.map(async (nodeTypeName) => {
      const nodeType: any = rootGetters['nodes/nodeTypeByName'](nodeTypeName);
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
        // timeRoi: await nodeTypeContract.getTimeRoiOfBetweenIndexes(userAddress, 0, totalCount) as BigNumber[],
      };

      const { nodes } = {
        nodes: await Promise.all(tokenIds.map(async (tokenId, idx) => {
          return {
            nft: await nodeTypeContract.getNodeFromTokenId(tokenId),
            attribute: await this.$contracts?.springNode?.getAttribute(tokenId),
            // timeRoi: timeRoi[idx],
            tokenId,
          };
        }))
      };
      return nodes.map(({ nft, tokenId}, idx): Node => {
        return {
          owner: nft.owner,
          nodeType: nodeType.name,
          tokenId,
          creationTime: new Date(nft.creationTime.toNumber() * 1000),
          lastClaimTime: new Date(nft.lastClaimTime.toNumber() * 1000),
          obtainingTime: new Date(nft.obtainingTime.toNumber() * 1000),
          isBoostedAirDropRate : nft.isBoostedAirDropRate,
          isBoostedNft : nft.isBoostedNft,
          isBoostedToken : nft.isBoostedToken,
          feature: nft.feature,
          accumulatedRewards : nft.accumulatedRewards,
          lastRewardUpdateTime : nft.lastRewardUpdateTime,
          lastLifetime : nft.lastLifetime,
          fertilizerCreationTime : nft.fertilizerCreationTime,
          fertilizerDuration : nft.fertilizerDuration,
          fertilizerBoost : nft.fertilizerBoost,
          plotAdditionalLifetime : nft.plotAdditionalLifetime,
        };
      });
    }));

    const entries = nftsIndexByNodeType
      .map((nodes, idx) => {
        return [
          nodeTypeNames[idx],
          nodes,
        ] as const;
      })
      .filter(([, nodes]) => nodes !== null);
      commit('setMyNodes', Object.fromEntries(entries));
  },

  async loadNodebyNodeType ({ commit, getters, rootGetters }, {nodeTypeName , tokenId}:{nodeTypeName:string, tokenId:ethers.BigNumber}) {

    if (!this.$contracts) {
      throw new Error('Contracts not loaded');
    }
    
    const nodeType = getters.nodeTypeByName(nodeTypeName);
    if (!nodeType) { throw new Error(`Node type ${nodeTypeName} not found in state`); }

    const nodeTypeContract = await this.$contracts.nodeTypeByName(nodeType.name);

    const node: any = await nodeTypeContract.getNodeFromTokenId(tokenId);
    commit('setNodeByNodeType', { node });
  },

  async loadUserRewardsByNodeType ({ commit, getters, rootGetters }, nodeTypeName: string) {
    const userAddress = rootGetters['wallet/address'];
    if (!userAddress) {
      commit('setUserRewardsForNodeType', { nodeTypeName, rewards: null, fees: null });
      return;
    }

    if (!this.$contracts) {
      throw new Error('Contracts not loaded');
    }

    const nodeType = getters.nodeTypeByName(nodeTypeName);
    if (!nodeType) { throw new Error(`Node type ${nodeTypeName} not found in state`); }

    const nodeTypeContract = await this.$contracts.nodeTypeByName(nodeType.name);

    const [rewards, fees]: [ethers.BigNumber, ethers.BigNumber] =
      await nodeTypeContract.calculateUserRewards(userAddress);
    await commit('setUserRewardsForNodeType', { nodeTypeName, rewards, fees });
  },

  loadOldNodeCount ({ commit, rootGetters }, _nodeType: string) {
    if (!this.$contracts) {
      throw new Error('Contracts not loaded');
    }

    const userAddress = rootGetters['wallet/address'];

    const nodeList = ['Fuji', 'Mont Blanc', 'Kilimanjaro', 'Ushuaia', 'Everest'];
    nodeList.map(async (nodeType : string) => {
      if (!this.$contracts) {
        throw new Error('Contracts not loaded');
      }
    //   const nodeCount = await this.$contracts.old.getNodeTypeOwnerNumber(nodeType, userAddress);
    //   commit('setOldNodeNumber', { nodeType, oldNodeCount: nodeCount });
    });
  },

  // async onMigration ({ dispatch, rootGetters }, { nodeType, nodeCounter }) {
  //   if (!this.$contracts) {
  //     throw new Error('Contracts not loaded');
  //   }
  //   const userAddress = rootGetters['wallet/address'];
  //   await this.$contracts.handler.createNodesMigration(userAddress, [nodeType], [nodeCounter]);
  //   dispatch('nodes/loadOldNodeCount');
  // },
  // async createNodesFromToken ({ dispatch }, { nodeTypeName, user, count, token, sponso }) {
  //   if (!this.$contracts) {
  //     throw new Error('Contracts not loaded');
  //   }
  //   await this.$contracts.handler.createNodesWithTokens(token, user, nodeTypeName, count, sponso ?? '');
  //   dispatch('nft/loadMyNFTs', null, { root: true });
  // },

  // async createNodesWithPendingRewards ({ dispatch }, { selectedNodes, tokenOut, nodeTypeTo, count }: CreateNodesWithPendingArgs) {
  //   if (!this.$contracts) {
  //     throw new Error('Contracts not loaded');
  //   }

  //   if (selectedNodes.length === 0) { return; }

  //   const tokenIdsPerNodeType = selectedNodes.reduce((acc, { tokenId, nodeType }) => {
  //     if (!acc[nodeType]) { acc[nodeType] = []; }
  //     acc[nodeType].push(tokenId);
  //     return acc;
  //   }, {} as Record<string, number[]>);

  //   const nodeTypes = Object.keys(tokenIdsPerNodeType);
  //   const tokenIdDoubleIndex = nodeTypes.map((nodeType) => {
  //     return tokenIdsPerNodeType[nodeType];
  //   });

  //   await this.$contracts.handler.createNodesWithPending(
  //     tokenOut,
  //     nodeTypes,
  //     tokenIdDoubleIndex,
  //     nodeTypeTo,
  //     count
  //   );

  //   dispatch('nft/loadMyNFTs', null, { root: true });
  // },

  // async createNodesLevelUp ({ dispatch }, { selectedNodes, tokenOut, nodeTypeTo, count }: CreateNodesWithPendingArgs) {
  //   if (selectedNodes.length === 0) { return; }

  //   if (!this.$contracts) {
  //     throw new Error('Contracts not loaded');
  //   }

  //   const tokenIdsPerNodeType = selectedNodes.reduce((acc, { tokenId, nodeType }) => {
  //     if (!acc[nodeType]) { acc[nodeType] = []; }
  //     acc[nodeType].push(tokenId);
  //     return acc;
  //   }, {} as Record<string, number[]>);

  //   const nodeTypes = Object.keys(tokenIdsPerNodeType);
  //   const tokenIdDoubleIndex = nodeTypes.map((nodeType) => {
  //     return tokenIdsPerNodeType[nodeType];
  //   });

  //   await this.$contracts.handler.createNodesLevelUp(
  //     tokenOut,
  //     nodeTypes,
  //     tokenIdDoubleIndex,
  //     nodeTypeTo,
  //     count
  //   );
  //   dispatch('nft/loadMyNFTs', null, { root: true });
  // },


};
