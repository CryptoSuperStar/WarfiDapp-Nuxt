<template>
  <div class="seedTable_container">
    <div class="seed_collection_card">
      <img :src="image" class="node-video" alt="">
    </div>
    <div class="seed_Table">
      <div class="table_title">
        <div class="title">
          <span class="seed_Table_name">{{$t('tier')}}{{index+1}}</span>
          <span class="seed_Table_content">{{$t(name)}}</span>
        </div>
        <v-dialog
          v-model="vdialog"
          fullscreen
          class="buy_dialog_mobile"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              dark
              x-large
              elevation="0"
              class="btn_wrapper buy_dialog_mobile"
              v-bind="attrs"
              v-on="on"
            >
              <span class="btn_color">{{$t('buyfor')}} {{ price }}</span>
            </v-btn>
          </template>
          <BuyItem 
            :index="index"
            :name="name"
            :cost="price"
            :dialogOpen = "vdialog"
            :itemType="`mysterySeed`" 
            @close="()=> vdialog  = false"
          />
        </v-dialog>
        <v-dialog
          v-model="vtdialog"
          width="375"
          class="buy_dialog_desktop"
        >
          <template v-slot:activator="{ on, attrs }">
              <v-btn
                dark
                x-large
                elevation="0"
                class="btn_wrapper buy_dialog_desktop "
                v-bind="attrs"
                v-on="on"
              > 
                <span class="btn_color">{{$t('buyfor')}} {{ price }}</span>
              </v-btn>
          </template>
          <BuyItem 
            :index="index"
            :name="name"
            :cost="price"
            :dialogOpen="vtdialog"
            :itemType="`mysterySeed`" 
            @close="()=> vtdialog  = false" 
          />
        </v-dialog>
      </div>
      <div class="drop_rate">
        <span class="rate">{{$t('seedinformation')}}</span>
        <v-simple-table class="drop_table">
          <template v-slot:default>
            <thead>
              <tr>
                <th class="rate_title">
                  {{$t('mindailyreward')}}
                </th>
                <th class="rate_title">
                  {{$t('mindailaypercent')}}
                </th>
                <th v-for="box in dropRate" class="rate_title">
                  {{$t(box.name)}}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th class="rate_body">
                  {{dailyReward}} $KILL
                </th>
                <th class="rate_body">
                  {{dailyRewardPercent}}%
                </th>
                <td v-for="box in dropRate" class="rate_body">{{ box.probability}}%</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';
import * as ethers from 'ethers';
import { NODENAME_TO_IMAGE,NODENAME_TO_VIDEO,LUCKY_BOX_VIDEOS,LUCKY_BOX_IMAGES } from '~/models/constants';
import { LuckyBoxType } from '~/models/luckybox-type';
import WalletReactiveFetch, { IReactiveFetch } from '~/mixins/wallet-reactive-fetch';
import { NodeNftNames } from '~/models/types'
import * as LuckyBox from '~/models/luckybox-type'
import BigNumber from 'bignumber.js';

const formatEther = ethers.utils.formatEther;

@Component({
  props: {
    index: { type: Number },
    name: { type: String },
    cost: { type: ethers.BigNumber }
  }
})

export default class SeedTable extends WalletReactiveFetch implements IReactiveFetch {

  public vdialog : boolean = false;
  public vtdialog : boolean = false;

  get price () {
    return this.$props.cost ? ethers.utils.formatEther(this.$props.cost) : null
  }

  get image (): any {
    return (LUCKY_BOX_IMAGES as any)[this.$props.name];
  }

  get video (): any {
    return (LUCKY_BOX_VIDEOS as any)[this.$props.name];
  }

  get luckyBox () {
    return this.$store.getters['luckyboxes/typeById'](this.$props.index)
  }

  get dropRate() {
    if (!this.luckyBox) {
      return []
    }
    return LuckyBox.getPossibleTypes(this.luckyBox)
  }

  get dailyReward() : any {
    let originalNode;
    let lowestBoostRate = 1;
    switch (this.$props.index) {
      case 0:
        originalNode = this.$store.getters['nodes/nodeTypeByName']('Infantry')
        lowestBoostRate += 0;
        break;
      case 1:
        originalNode = this.$store.getters['nodes/nodeTypeByName']('K9')
        lowestBoostRate += 0.5;
        break;
      // case 2:
      //   originalNode = this.$store.getters['nodes/nodeTypeByName']('Rocketeer')
      //   lowestBoostRate += 0.2;
      //   break;
      // case 4:
      //   originalNode = this.$store.getters['nodes/nodeTypeByName']('Heavy Gunner')
      //   lowestBoostRate += 0.4;
      //   break;
      // case 5:
      //   originalNode = this.$store.getters['nodes/nodeTypeByName']('Sniper')
      //   lowestBoostRate += 0.6;
        break;
      default:
        break;
    }
    let amount: BigNumber = new BigNumber(originalNode?.rewardAmount
      ?
      originalNode.rewardAmount
      :
      0)

    // console.log("AMOUNT " + amount.toString());
    amount = amount.times(lowestBoostRate);
    return ethers.utils.formatEther(amount.toString());
  }

  get dailyRewardPercent() {
    if(this.$props.cost)
      return ((this.dailyReward)/parseFloat(ethers.utils.formatEther(this.$props.cost)) * 100).toFixed(2);
    return 0
  }

  get soundOption() {
    return this.$store.state.setting.sound_option
  }

   async reactiveFetch() {
    await  this.$store.dispatch("nodes/loadNodeTypes");
  }
}
</script>

<style scoped>
.node-video {
  width: 100%;
  height: 280px;
  border-radius: 14px;
  object-fit: cover;
}
.seedTable_container {
    display: flex;
    gap: 56px;
    flex-wrap: wrap;
}
.seed_collection_card {
    width: 380px;
    height: 280px;
    background: radial-gradient(59.64% 59.64% at 50% 50%, rgba(164, 189, 62, 0.6) 0%, rgba(0, 0, 0, 0) 100%), rgba(255, 255, 255, 0.05);
    box-shadow: inset 0px 0px 16px 4px rgba(255, 255, 255, 0.05);
    border-radius: 24px;
}
.seed_Table {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 10px 0px;
    flex: 1;
}
.table_title {
    display: flex;
    justify-content: space-between;
}
.title {
    display: flex;
    flex-direction: column;
}
.seed_Table_name{
    color: #D89F0E;
    font-size: 16px;
}
.seed_Table_content{
    color: white;
    font-size: 20px;
}
.btn_wrapper{
  background: #D89F0E !important;
  padding: 10px 16px 10px 16px;
  border-radius: 4px;
  height: 40px !important;
}
.btn_color {
  color: white;
  font-size: 14px;
  display: flex;
  gap: 4px;
  align-items: center;
}
.drop_rate {
    background: rgba(255, 255, 255, 0.1);
    box-shadow: inset 0px 0px 16px 4px rgba(255, 255, 255, 0.15);
    border-radius: 24px;
    padding: 10px;
}
.rate {
    font-size: 16px;
    color: white;
    margin-left: 16px;
}
.buy_dialog_mobile {
    display:none;
}
.buy_dialog_desktop {
  display: block;
}
.v-data-table {
  background: unset !important;
}
.v-data-table :hover {
  background: unset !important;
}
.rate_title {
  text-align: left !important;
  font-weight: 400 !important;
  font-size: 14px !important;
  color: rgba(255, 255, 255, 0.7) !important;
}
.rate_body {
  color: #FFFFFF !important;
  font-weight: 600 !important;
  font-size: 20px !important;
}
@media only screen and (max-width: 600px) { 
  .seed_Table { 
    flex-wrap: wrap;
    gap: 16px;
    padding: 0px;
  }
  .seedTable_container {
    flex-wrap: wrap;
    gap: 24px;
  }
  .table_title {
    flex-direction: column;
    gap: 5px;
    align-items: center;
    
  }
  .title {
    align-items: center
  }
  .btn_wrapper {
    width: 180px;
  }
  .buy_dialog_mobile {
    display:block;
  }
  .buy_dialog_desktop {
    display: none;
  }

  .seed_collection_card {
    width: 100%;
  }
  .drop_table {
    max-width: 300px!important;
  }
@media only screen and (min-width:400px) { 
  .drop_table {
    max-width: none !important;
  }
}
}
</style>
