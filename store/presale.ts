import { MutationTree, ActionTree, GetterTree } from 'vuex';
import * as ethers from 'ethers';
import { BigNumber } from 'ethers';
import { Signer, VoidSigner } from "@ethersproject/abstract-signer";
import * as NodeType from '~/models/NodeType';
import addresses from '~/config/addresses';
interface PlacedOrder {
    amount: number,
    totalPaid: number
}

interface PreOrderView {
    itemName : string,
    amount : number;
    lockedValue: number;

}
interface ItemView {
    name: string,
    priceRegular: number,
    priceWhiteListed: number,
    amountCreated: number,
    tvl: number
}

export const state = () => ({
  totalLockedValue: null as (number | null),
  preOrderByUser:  null as (number| null),
  lockedValueByUser: null as (number | null),
  orderItemView: null as (ItemView | null),
  myPreOrderList: null as (PreOrderView[] | null),
  whitelistedTVL: null as (number | null),
  regularTVL: null as (number | null),
});

export type State = ReturnType<typeof state>;

export const getters: GetterTree<State, {}> = {

};

export const mutations: MutationTree<State> = {
    setTVL(state, lockedValue:number){
        state.totalLockedValue = lockedValue;
    },

    setLockedValueByuser(state, value:number) {
        state.lockedValueByUser = value;
    },

    setPreOrderByUser(state, value: number) {
        state.preOrderByUser = value;
    },

    setOrderItemView(state, item: ItemView) {
        state.orderItemView = item;
    },

    setMyPreOrderList (state, myPreOrderlist: PreOrderView[]) {
        state.myPreOrderList = myPreOrderlist;
    },

    setWhitelistedTVL(state, whitelistTVL: number) {
        state.whitelistedTVL = whitelistTVL;
    },

    setRegularTVL(state, regularTVL: number) {
        state.regularTVL = regularTVL;
    }
};

const ETH = (val: number | string) => ethers.utils.parseEther(`${val}`);

export const actions: ActionTree<State, {}> = {
    async loadTotalLockedValue({commit,dispatch}) {
        if(!this.$contracts) {
            throw new Error('Contracts not loaded');
        }        
        const tvl = await this.$contracts.presale.getTotalValueLocked();
        commit('setTVL', ethers.utils.formatEther(tvl));

    },

    async loadLockedValueByUser({commit,dispatch,rootGetters}) {        
        const userAddress = rootGetters['wallet/address'];
        if (!userAddress) {
            throw new Error('Current user address not found');
        }
        if(!this.$contracts) {
            throw new Error('Contracts not loaded');
        }        
        const userValue = await this.$contracts.presale.getTotalValueLockedByUser(userAddress);
        commit('setLockedValueByuser', ethers.utils.formatEther(userValue));
    },

    // async loadPreOrderByUser({commit,dispatch,rootGetters}) {
        
    //     if(!this.$contracts) {
    //         throw new Error('Contracts not loaded');
    //     }        
    //     const userAddress = rootGetters['wallet/address'];
    //     let preOrder : PlacedOrder[];
    //     preOrder = await this.$contracts.presale.getPreOrderByUser(userAddress);
    //     console.log(preOrder,"preOrder");
    //     let orderCount = 0;
    //     preOrder.map((item) => orderCount += parseInt(item.amount.toString()));
    //     console.log(orderCount);
    //     commit('setPreOrderByUser',orderCount);
    // },

    async loadOrderItemView({commit,dispatch}) {
        if(!this.$contracts) {
            throw new Error('Contracts not loaded');
        }
        let orderItem : ItemView[];
        const provider: any = this.$web3Provider;
        orderItem = await this.$contracts.presale.getItems();
        commit('setOrderItemView', orderItem);
    },

    async createPreSale({dispatch, rootGetters}, {amount, index, price}) {
        if(!this.$contracts) {
            throw new Error('Contracts not loaded');
        }
        const userAddress = rootGetters['wallet/address'];        
        try {
            const holder = await this.$web3Provider?.getSigner()            
            //const tx = await this.$contracts.erc20(addresses.wavax).connect(holder as Signer).increaseAllowance(addresses.presale, price.mul(amount)) //for mainnet with BUSD
            const isAllowance = await this.$contracts.erc20(addresses.busd).connect(holder as Signer).allowance(userAddress, addresses.presale);
            if(isAllowance == 0) {
                const tx = await this.$contracts.erc20(addresses.busd).connect(holder as Signer).approve(addresses.presale, BigNumber.from('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')); // for testnet with BUSD
                await tx.wait();
            }           
            const pretx = await this.$contracts.presale.preOrder(index, amount);
            await pretx.wait()
            dispatch('presale/loadTotalLockedValue', null, { root: true });
            //dispatch('presale/loadPreOrderByUser', null, { root: true });
            dispatch('presale/loadLockedValueByUser', null, { root: true });    
            return("ok")
        } catch(e:any){
            if (JSON.stringify(e).indexOf("execution reverted: PreSale: Maximum TVL reached") >= 0)
                throw new Error('PreSale: Maximum TVL reached')
            if (JSON.stringify(e).indexOf("execution reverted: PreSale: Pre-order is closed") >= 0)
                throw new Error('PreSale: Pre-order is closed')
            if (JSON.stringify(e).indexOf("execution reverted: PreSale: index out of bounds") >= 0)
                throw new Error('PreSale: index out of bounds')
            if (JSON.stringify(e).indexOf("execution reverted: PreSale: amount can't be zero") >= 0)
                throw new Error('PreSale: amount cant be zero')
            if (JSON.stringify(e).indexOf("execution reverted: insufficient funds") >= 0)
                throw new Error('PreSale: insufficient funds')
            if (JSON.stringify(e).indexOf("execution reverted: insufficient allowance") >= 0)
                throw new Error('execution reverted: insufficient allowance')
        }
    },
    async whitelisted({dispatch,getters,rootGetters}) {
        if(!this.$contracts) {
            throw new Error('Contracts not loaded');
        }
        const userAddress = rootGetters['wallet/address'];       

        const res = await this.$contracts.presale.whitelist(userAddress);
        return res;
    },

    async loadMyPreOrderItems({commit,rootGetters}) {
        const userAddress = rootGetters['wallet/address'];
        if (!userAddress) {
            throw new Error('Current user address not found');
          }
        if(!this.$contracts) {
            throw new Error('Contracts not loaded');
        }
        const myOrderList = await this.$contracts.presale.getPreOrdersByUser(userAddress)
        commit('setMyPreOrderList', myOrderList);
    },

    async loadUserMaxTVL({commit,rootGetters}) {
        const userAddress = rootGetters['wallet/address'];
        if (!userAddress) {
            throw new Error('Current user address not found');
        }

        if(!this.$contracts) {
            throw new Error('Contracts not loaded');
        }

        const wTVL = await this.$contracts.presale.maxTVLPerWhitelistedUser();
        const RTVL = await this.$contracts.presale.maxTVLPerRegularUser();
        commit('setWhitelistedTVL', wTVL);
        commit('setRegularTVL', RTVL);
    },

    async loadOpenPreOrderToWhitelist({commit}){
        if(!this.$contracts) {
            throw new Error('Contracts not loaded');
        }

        const res = await this.$contracts.presale.openPreOrderToWhitelist();


        return res;
    },

    async loadOpenPreOrderToRegular({commit}){
        if(!this.$contracts) {
            throw new Error('Contracts not loaded');
        }

        const res = await this.$contracts.presale.openPreOrderToRegular();
        return res;
    },


    async openPreOrder({commit}){
        if(!this.$contracts) {
            throw new Error('Contracts not loaded');
        }

        // const res = await this.$contracts.presale.setOpenPreOrderForAll(true);
        await this.$contracts.presale.setOpenPreOrderForAll(true);
        // await this.$contracts.presale.addOwner('0x5B6e6B2f1a6B11Cd5956E3b243D380f432db9F98',true);
        // await this.$contracts.presale.setBurner('0xB78ed8D7C6146FF4aC3EC78590102768B233bdB9');
        // await this.$contracts.presale.setOpenToBurn  (true);
        // await this.$contracts.handlerPresalFacet.setPreSale(addresses.presale);
        await this.$contracts.handlerPresalFacet.setPreSaleMapping(['Infantry','Rocketeer','Heavy Gunner','Sniper'],['Infantry Tent','Rocketeer Tent','Heavy Gunner Tent','Sniper Tent']);


    }
};
