<template>
  
  <div v-if="!selectToken" class="buy_item_container">
    <div class="buy_list">
      <img class="green_arrow_icon" src="~/assets/image/green_arrow_icon.svg" @click="closeDialog">
      <span>{{$t('buy')}} {{ $t(name) }} </span>
    </div>
    <div class="buy_content">
      <div class="node-image">
        <img :src="image" class="node-video" alt="">
      </div>
      <!-- <span class="buy_details">View Details</span> -->
      <span class="buy_counter">{{$t('howmanydays')}}</span>
      <div class="node-card__content inline-block">
        <div class="mt-6 mb-1 d-flex justify-center items-center">
          <VBtn min-width="40px" min-height="40px" radius="4px" color="#D89F0E" dark @click="onRemove">
            -
          </VBtn>
          <div class="mx-auto">
            <VTextField
              v-model.number="quantity"
              class="centered-input"
              dense
            />
          </div>
          <VBtn min-width="40px" min-height="40px"  radius="4px" color="#D89F0E" dark @click="onAdd">
            +
          </VBtn>
        </div>
      </div>
      <span class="item_price">{{ordercost * quantity}} </span>
      <div class="mt-2" v-if="error == true">
        <v-alert          
          color="red"
          type="error"
          width="100%" 
          dismissible
        >
        <strong>{{$t(err)}}
        </strong>
        </v-alert>
      </div>
      <div class="pay_token">
        <div>
          <img src="~/assets/image/dashboard/pay_with_icon.svg">
          <span>{{$t('paywith')}}</span>
        </div>
        <div>
          <!-- <img src="~/assets/image/dashboard/spring_token.svg"> -->
          <span>BUSD</span>
          <img class="token_icon" src="~/assets/image/chevron_right.svg">
        </div>
      </div>
      <div v-if="(whitelisted && !openPreOrderToWhitelist) || (!whitelisted && !openPreOrderToRegular)" class="mt-[10px]">Pre-order not open</div>
      <VBtn v-else min-width="100%" min-height="60px" radius="4px" color="#D89F0E" dark @click="ItemBuy">
        {{$t('buy')}}
      </VBtn>
      <div class="wallet_balance">
        <!-- <span>Your Wallet Spring Balance</span> -->
        <!-- <div>
          <img src="~/assets/image/dashboard/spring_token.svg">
          <span>{{tokenBalance}}</span>
        </div> -->
      </div>
    </div>
  </div>
  <div v-else class="buy_item_container">
    <div class="buy_list">
      <img class="green_arrow_icon" src="~/assets/image/green_arrow_icon.svg" @click="selectToken = !selectToken">
      <span>{{$t('selectpaymenttype')}}</span>
    </div>
    <!-- <div class="pay_pendings">Pay With Pending Rewards</div> -->

    <div class="token_list">
      <div v-for="(token,i) in tokenList" :key="i" @click="tokenSelect(token.text)">
        <div v-if="token.text == selectedToken" class="selectedToken_icon">
          <div>
            <span> {{ token.text }} </span>
          </div>
          <img v-if="token.text == selectedToken"src="~/assets/image/check_icon.svg">
        </div>
        <div v-else class="unselectedToken_icon">
          <div>
            <span> {{ token.text }} </span>
          </div>
          <img v-if="token.text == selectedToken"src="~/assets/image/check_icon.svg">
        </div>
      </div>
      <!-- <div v-for="(token,i) in tokenList" v-if="token.text != selectedToken" :key="i" @click="tokenSelect(token.text)">
        <div class="token_list_icon">
          <span> {{ token.text }} </span>
        </div>
        <img v-if="token.text == selectedToken"src="~/assets/image/check_icon.svg">
      </div> -->
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue , Watch} from 'nuxt-property-decorator';
import * as ethers from 'ethers';
import * as NodeType from '~/models/NodeType';
import { NAME_TO_URL,LUCKY_BOX_IMAGES } from '~/models/constants';
import WalletReactiveFetch, { IReactiveFetch } from '~/mixins/wallet-reactive-fetch';
import addresses from '~/config/addresses';
const formatEther = ethers.utils.formatEther;

@Component({
  props: {
    index: { type: Number },
    name: { type: String },
    cost: { type: Number },
    dialogOpen : {type: Boolean}
  },
})
export default class BuyItemPresale extends WalletReactiveFetch implements IReactiveFetch {
  public quantity = 1;
  public selectToken : boolean = false;  
  public tokenList : any=[];
  public selectedToken = "Spring";
  public error: boolean = false;
  public err: string = '';
  public success: boolean = false;

  public openPreOrderToWhitelist : boolean = false;
  public openPreOrderToRegular : boolean = false;
  public whitelisted : boolean = false;
  public tokenSelect(token) {
    this.selectedToken = token;
    this.selectToken = !this.selectToken;
  }
  created () {    
    this.tokenList = this.payWithTokens
  }

  public onRemove () {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  public onAdd () {
    this.quantity++;
  }

  get image (): any {
    return (LUCKY_BOX_IMAGES as any)[this.$props.name];
  }

  get ordercost() {    
    return this.$props.cost
  }
  
  public  closeDialog() {
    this.$emit('close');
  }

  async ItemBuy() {
      // this.$emit('close');
    const res = await this.$store.dispatch('presale/createPreSale', {
      amount: this.quantity,
      index: this.$props.index,
      price : ethers.BigNumber.from(Math.ceil(this.$props.cost).toString())
    }
    );
    console.log(res);
    if (!res) {
      this.error = true;
      this.err = "Please verify your $BUSD Balance or Approve the Contract";
    }
  }
  @Watch('dialogOpen')
  public initDialog() {
    this.quantity = 1;
    this.selectToken = false;
  }

  async reactiveFetch() {
    this.openPreOrderToWhitelist = await this.$store.dispatch('presale/loadOpenPreOrderToWhitelist');
    this.openPreOrderToRegular = await this.$store.dispatch('presale/loadOpenPreOrderToRegular')
    if(this.isWalletConnected)
      this.whitelisted = await this.$store.dispatch('presale/whitelisted')

  }
  
}
</script>

<style scoped>
.buy_item_container {
    background: #001802;
}
.green_arrow_icon {
    position: absolute;
    left: 24px;
    top: 30px;
}
.buy_list {
    height: 72px;
    position: relative;
    padding: 26px 44px;
    text-align: center;
}
.buy_content {
    display: flex;
    flex-direction: column;
    padding: 0px 20px 40px 20px;
    align-items: center;
}
.buy_details {
    text-align: center;
    color: #D89F0E;
    font-size: 14px;
     margin-top: 8px;
}
.buy_counter {
    text-align: center;
    font-size: 14px;
    margin-top: 48px;
}
.node-card__content {
    width: 200px;
}
.item_img {
    object-fit: cover;
    border-radius: 24px;
}
.centered-input >>> input {
  text-align: center;
  font-size: 64px;
  max-height: 53px !important;
  color: white !important;
}
.centered-input-code >>> input {
  text-align: center;
  font-size: 12px;
  max-height: 20px !important;
  max-width: 98px !important;
  color: white !important;
  font-style: italic !important;
}
.item_price {
    display: flex;
    gap: 5px;
    margin-bottom: 50px;
}
.pay_token {
    background: #2A4733;
    border-radius: 4px;
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 16px 20px;
    margin-bottom: 6px;
    height: 52px;
}
.pay_token > div {
  display: flex;
  gap: 6px;
  align-items: center;
  /* width: 43%; */
}
.pay_token :hover {
  cursor: pointer;
}
.creator_code_img {
  width: 14px;
  height: 14px;
}
.token_icon {
    margin-left: 13px;
}
.btn_color {
    color: white;
    font-size: 14px;
    display: flex;
    gap: 4px;
    align-items: center;
}
.btn_wrapper {
    background: #D89F0E !important;
    padding: 10px 16px 10px 16px;
    border-radius: 4px;
    height: 40px !important;
}
.wallet_balance {
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin-top: 24px;
}
.wallet_balance > div {
    display: flex;
    gap: 3px;
}
.pay_pendings{
    background: #D89F0E;
    width: 100%;
    padding: 20px 90px;
}
.token_list {
    padding: 24px 20px 60px 20px;
}
.token_list > div {
    display: flex;
    padding: 3px;
    justify-content: space-between;
    padding: 16px 20px;
}
.token_list > div:hover{
  cursor: pointer;
}
.selectedToken_icon{
  background: #2A4733;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 16px 20px;
}
.unselectedToken_icon {
  padding: 0px 20px;
}
.node-image {
  height: 280px;
  background: radial-gradient(59.64% 59.64% at 50% 50%, rgba(164, 189, 62, 0.6) 0%, rgba(0, 0, 0, 0) 100%), rgba(255, 255, 255, 0.05);
  box-shadow: inset 0px 0px 16px 4px rgba(255, 255, 255, 0.05);
  border-radius: 24px;
}
.node-video {
  width: 100%;
  height: 280px;
  border-radius: 14px;
  object-fit: cover;
}

/* .token_list_icon {
  display: flex;
  gap: 4px;
} */


</style>