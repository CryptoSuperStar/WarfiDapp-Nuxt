<template>
  <div class="seedTable_container">
    <div class="seed_collection_card">
      <img :src="image" class="node-video" alt="">
    </div>
    <div class="seed_Table">
      <div class="table_title">
        <div class="title">
          <span class="seed_Table_name">Tier{{index+1}}</span>
          <span class="seed_Table_content">{{name}}</span>
        </div>
        <!-- <v-dialog
          v-model="vdialog"
          width="375"
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
              <span class="btn_color">{{$t('buyfor')}} {{ cost }}</span>
            </v-btn>
          </template> -->
          <!-- <BuyItem 
            :index="index"
            :name="name"
            :cost="cost"
            :dialogOpen = "vdialog" 
            @close="()=> vdialog  = false"
          />
        </v-dialog> --> 
        <v-dialog
          v-model="vtdialog"
          width="375"
        >
          <template v-slot:activator="{ on, attrs }">
            <div v-if="(whitelisted && !openPreOrderToWhitelist) || (!whitelisted && !openPreOrderToRegular)">{{$t('preordernotopen')}}</div>
            <div v-else>
              <v-btn
                dark
                x-large
                elevation="0"
                class="btn_wrapper"
                v-bind="attrs"
                v-on="on"
              > 
                <span class="btn_color">{{$t('buyfor')}} {{ cost }}</span>
              </v-btn>
            </div>
          </template>
          <BuyItemPresale 
            :index="index"
            :name="name"
            :cost="cost"
            :dialogOpen="vtdialog" 
            @close="()=> vtdialog  = false" 
          />
        </v-dialog>
      </div>
      <div class="drop_rate">
        <span class="rate">Drop Rates:</span>
        <v-simple-table>
          <template v-slot:default>
            <thead>
              <tr>
                <th v-for="title in dropRate" class="rate_title">
                  {{title.seed}}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td v-for="item in dropRate" class="rate_body">{{ item.rate }}%</td>
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
import * as NodeType from '~/models/NodeType';
import { LUCKY_BOX_IMAGES } from '~/models/constants';
import { LuckyBoxType } from '~/models/luckybox-type';
import WalletReactiveFetch, { IReactiveFetch } from '~/mixins/wallet-reactive-fetch';

const formatEther = ethers.utils.formatEther;

@Component({
  props: {
    index: { type: Number },
    name: { type: String },
    regularCost: { type: ethers.BigNumber },
    whitelistCost: { type: ethers.BigNumber },
    dropRate: Array as () => String[] | null,
  },
})
export default class SeedTablePreSale extends WalletReactiveFetch implements IReactiveFetch {

  public vdialog : boolean = false;
  public vtdialog : boolean = false;
  public whitelisted : boolean = false;
  public openPreOrderToWhitelist : boolean = false;
  public openPreOrderToRegular : boolean = false;
  get cost ()  {
    if(this.whitelisted == true)
    {
      return parseFloat(formatEther(this.$props.whitelistCost));
    }
    else
    {
      return parseFloat(formatEther(this.$props.regularCost));
    }
  }

  get image (): any {
    return (LUCKY_BOX_IMAGES as any)[this.$props.name];
  }

   async reactiveFetch() {
    if(this.isWalletConnected)
      this.whitelisted = await this.$store.dispatch('presale/whitelisted')
    this.openPreOrderToWhitelist = await this.$store.dispatch('presale/loadOpenPreOrderToWhitelist');
    this.openPreOrderToRegular = await this.$store.dispatch('presale/loadOpenPreOrderToRegular')
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
}
.seed_collection_card {
    width: 379px;
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
    width: 100%;
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
  .drop_rate {
    width: 320px;
  }
  .seed_collection_card {
    width: 100%;
  }
}
</style>