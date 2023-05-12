<template>
  <div class="main_container">
    <div class="flex justify-between dash_header">
      <span class="main_title">{{ $t('welcome') }}</span>
      <a href="https://pancakeswap.finance/swap?outputCurrency=0xF2FAB804C4Bbd38CdbbF20394dfD223095edA0ae&inputCurrency=0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56" target="_blank" class="spr_buy">
        <v-btn
          v-if="!fakeMint && walletConnected == true"
          dark
          x-large
          elevation="0"
          class="btn_wrapper mr-[20px] md:mr-[200px]"
        >
          <span class="btn_color">{{$t('buyspr')}}</span>
        </v-btn>
      </a>
        <!-- <v-btn
        v-if="!fakeBUSD && walletConnected == true"
        dark
        x-large
        elevation="0"
        class="btn_wrapper mr-[20px] md:mr-[200px]"
        @click="onFakeBUSDMint"
      >
        <span class="btn_color">Mint f-BUSD</span> -->
      <!-- </v-btn> -->
    </div>

    <div class="node_data">
      <DataTable
        v-for="(item, i) in protocolStats"
        :key="`${item.title}-${i}`"
        :title="item.title"
        :icon="item.icon"
        :price="item.price"
        :percentage="item.percentage"
      />
    </div>
    <div v-if="walletConnected && loadingData">
      <span class="main_title">{{$t('buymystery')}}</span>
      <div class="seed_data">
        <SeedTable
          v-for="({ id, name, price }, index) of luckyBoxesList"
          :key="`${name}-${id}`"  
          :index="index"
          :name="name"
          :cost="price"
        />
      </div>
      <!-- <div class="description_plot">
        <div class="description">
          <span class="desciption_title">{{$t('housetree')}}</span>
        </div>
        <div class="tree_plot">
          <img src="~/assets/image/dashboard/tree_plots.png" alt="" />
        </div>
      </div> -->
      <!-- <div class="plot_list">
        <v-row>
          <v-col  cols="12" sm="12" md="6" lg="3" v-for="{ id, name, price } of plotList" :key="`${name}-${id}`" >
            <PlotTreeList
            v-if="id!=5"
            :name="name"
            :cost="price"
          />
          </v-col>
        </v-row>
      </div> -->
      <div class="invest_description">
        <div class="invest_title">
          <span>{{$t('investtree')}}</span>
        </div>
        <div class="invest_item">
          <div class="item_description">
            <span>{{$t('breathe')}}</span>
            <span
              >{{$t('waterpack')}}</span
            >
          </div>
          <div class="booster_item">
            <BoosterItem
              v-for="(item, i) of waterpackType"
              :key="`${item}-${i}`"
              :boostItem="item"
              :isWaterPack="true"
            />
          </div>
        </div>
        <div class="invest_item">
          <!-- <div class="item_description">
            <span>{{$t('boostpack')}}</span>
            <span
              >{{$t('fertilizerdesc')}}</span
            >
          </div> -->
          <!-- <div class="booster_item">
            <BoosterItem
              v-for="(item, i) of fertilizerType"
              :key="`${item}-${i}`"
              :boostItem="item"
              :isWaterPack="false"
            />
          </div> -->
        </div>
      </div>
    </div>
    <div v-else>
      <v-container style="height: 400px">
        <v-row class="fill-height" align-content="center" justify="center">
          <v-col
            v-if="!walletConnected"
            class="text-subtitle-1 text-center"
            cols="12"
          >
            {{$t('connectwallet1')}}
          </v-col>
          <v-col
            v-else="!loadingData"
            class="text-subtitle-1 text-center"
            cols="12"
          >
            {{$t('getdata')}}
          </v-col>

          <v-col cols="6">
            <v-progress-linear
              color="deep-purple accent-4"
              indeterminate
              rounded
              height="6"
            ></v-progress-linear>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<script lang="ts">
import { Component } from "nuxt-property-decorator";
import WalletReactiveFetch, {
  IReactiveFetch,
} from "~/mixins/wallet-reactive-fetch";
import addresses from "~/config/addresses";
import * as ethers from "ethers";
const formatEther = ethers.utils.formatEther;
import axios from 'axios';

@Component
export default class Dashboard
  extends WalletReactiveFetch
  implements IReactiveFetch
{
  public loadingData: boolean = false;
  public walletConnect : boolean = false;
  public connectWallet: boolean = false;
  public whitelisted: boolean = false;
  public vdialog = false;
  
  mounted() {
    this.$i18n.locale = localStorage.getItem('locale') ?? 'en';
  }

  get protocolStats() {
    return [
      {
        title: this.$t('sprprice'),
        price: this.$store.state.coingecko.price.toFixed(2)
        // price: "$1.00"
      },
      {
        title: this.$t('totalsupply'),
        price: this.$store.state.coingecko.totalSupply.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
        percentage: null,
      },
      {
        icon: require("../assets/image/dashboard/market_cap.svg"),
        title: this.$t('marketcap'),
        price: this.$store.state.coingecko.marketCap ? this.$store.state.coingecko.marketCap.toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : 0
      },
      {
        icon: require("../assets/image/dashboard/total_trees.svg"),
        title: this.$t('totaltrees'),
        price: this.$store.getters["nodes/totalCreated"] ? this.$store.getters["nodes/totalCreated"] : 0,
        percentage: null,
      },
      // {
      //   icon: require("../assets/image/dashboard/total_plots.svg"),
      //   title: this.$t('totalplots'),
      //   price: parseInt(this.$store.state.plot.totalPlot._hex) ? parseInt(this.$store.state.plot.totalPlot._hex) : 0,
      //   percentage: null,
      // },
    ];
  }

  get waterPack() {
    return [
      // {
      //   icon: require("../assets/image/dashboard/waterpack.svg"),
      //   description: this.$t('waterdesc1'),
      //   price: 1000,
      // },
      {
        icon: require("../assets/image/dashboard/ammo.png"),
        title: this.$t('waterpack2'),
        description: this.$t('waterdesc2'),
        price: 1000,
      },
    ];
  }

  // get fertilizePack() {
  //   return [
  //     {
  //       icon: require("../assets/image/dashboard/fertilpack.svg"),
  //       title: this.$t('waterpack1'),
  //       description: this.$t('waterdesc1'),
  //       price: 1000,
  //     },
  //     {
  //       icon: require("../assets/image/dashboard/fertilpack.svg"),
  //       title: this.$t('waterpack2'),
  //       description: this.$t('waterdesc2'),
  //       price: 1000,
  //     },
  //   ];
  // }

  get luckyBoxesList() {
    return this.$store.state.luckyboxes.luckyBoxTypes ?? [];
  }

  get plotList() {
    const temp  = this.$store.state.plot.plotTypes;
    return this.$store.state.plot.plotTypes ?? [];
  }

  get fakeMint()  {
    if(this.$store.getters['tokens/balanceForToken'](addresses.Token) > 0)
        return true
    else
        return false
  }

  // get fakeBUSD()  {
  //   if(this.$store.getters['tokens/balanceForToken'](addresses.fakeBUSD) > 0)
  //       return true
  //   else
  //       return false
  // }

  // get nodeType() {
  //   return this.$store.getters["nodes/nodeTypeByName"](this.$props.name);
  // }

  get cost() {
    return formatEther(this.nodeType.cost);
  }

  get walletConnected() {
    return this.isWalletConnected;
  }

  public selectedPlot() {
    this.vdialog = !this.vdialog;
  }
  public async onTokenMint() {
    await this.$store.dispatch("nft/onTokenMint")
  }

  get waterpackType() {
    return this.$store.state.booster.waterpackTypes ?? [];
  }

  // get fertilizerType() {
  //   return this.$store.state.booster.fertilizerType ?? [];
  // }

  async reactiveFetch() {
      
   
      this.loadingData = true;
    // ]);
    if (this.isWalletConnected)
    {
      // await Promise.all([
      await  this.$store.dispatch("tokens/loadBalance", addresses.Token);
      await  this.$store.dispatch("tokens/loadBalance", addresses.busd);
      await  this.$store.dispatch("luckyboxes/loadLuckyBoxTypes");
      await  this.$store.dispatch("plot/loadPlotTypes");
      await  this.$store.dispatch("booster/loadBoosterItemType");
    }
    else
    {
      await  this.$store.dispatch("plot/loadTotalPlot");

      await  this.$store.dispatch("coingecko/loadCoinData");
      await  this.$store.dispatch("nodes/loadNodeTypes");
      this.loadingData = true;
      
    }
      this.walletConnect = true;
  }
}
</script>
<style scoped>
.btn_wrapper {
  background: #D89F0E !important;
  padding: 10px 16px 10px 16px;
  border-radius: 4px;
  height: 40px !important;
}
.main_container {
  padding: 64px 0px;
}
.main_title {
  font-size: 24px;
  padding: 0px 200px;
}
.node_data {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 32px;
  margin-bottom: 96px;
  padding: 0px 200px;
}
.title_description {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 16px;
  width: 45%;
  padding: 0px 200px;
}
.seed_data {
  display: flex;
  flex-direction: column;
  gap: 64px;
  margin-top: 64px;
  padding: 0px 200px;
}
.description_plot {
  display: flex;
  justify-content: space-between;
  position: relative;
  margin-top: 27px;
  padding: 0px 200px;
}

.description {
  display: flex;
  flex-direction: column;
  justify-content: center;
  z-index: 1;
}
.desciption_title {
  font-weight: 600;
  font-size: 32px;
}
.desciption_content {
  font-weight: 400;
  font-size: 20px;
  color: rgba(255, 255, 255, 0.7);
}
.plot_list {
 padding: 0px 200px;
}
.item_card :hover {
  cursor: pointer;
}
/* .plot_card {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  margin-top: 86px;
  padding: 0px 200px;
} */
.invest_description {
  display: flex;
  flex-direction: column;
  margin-top: 96px;
  padding: 0px 200px;
}
.invest_title {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 37%;
}
.invest_title > span:nth-child(1) {
  font-weight: 600;
  font-size: 32px;
}
.invest_title > span :nth-child(2) {
  color: rgba(255, 255, 255, 0.7);
  font-size: 20px;
  font-weight: 400;
}
.invest_item {
  display: flex;
  margin-top: 96px;
}
.item_description {
  display: flex;
  flex-direction: column;
  width: 37%;
  margin-right: 86px;
}
.invest_item > div :nth-child(1) {
  display: flex;
  flex-direction: column;
}

.invest_item > div > span:nth-child(1) {
  font-weight: 600;
  font-size: 24px;
  color: rgba(255, 255, 255, 0.7);
}
.invest_item > div > span :nth-child(2) {
  color: rgba(255, 255, 255, 0.7);
  font-size: 20px;
  font-weight: 400;
}
.booster_item {
  display: flex;
  flex: 1;
  gap: 32px;
  width: 100%;
}
@media only screen and (max-width: 600px) {
  .main_container {
    padding: 64px 0px 81px 0px;
  }
  .title_description {
    width: 100%;
    padding: 0px 20px;
  }
  .description_plot {
    flex-wrap: wrap;
    margin-top: 64px;
    padding: 0px 20px;
  }
  .desciption_title {
    font-size: 24px;
  }
  .desciption_content {
    font-size: 16px;
  }
  .invest_title {
    width: 100%;
  }
  .seed_data {
    margin-top: 32px;
    padding: 0px 20px;
  }
  .node_data {
    margin-bottom: 56px;
    padding: 0px 20px;
  }
  .main_title {
    padding: 0px 20px;
  }
  .plot_list {
    padding: 0px 20px;
  }
  /* .plot_card {
    display: block;
    margin-top: 0px;
    padding: 0px 20px;
    gap: 16px;
    width: 100%;
  } */
  .invest_description {
    margin-top: 64px;
    padding: 0px 20px;
  }
  .invest_title > span:nth-child(1) {
    font-size: 24px;
  }
  .invest_title > span :nth-child(2) {
    font-size: 16px;
  }
  .invest_item {
    margin-top: 64px;
    flex-direction: column;
    gap: 32px;
  }
  .item_description {
    width: 100%;
    gap: 16px;
    margin-right: 0px;
  }
  .booster_item {
    flex-direction: column;
    width: 100%;
    gap: 16px;
  }
  .tree_plot {
    display: none;
  }
  .description_plot {
    justify-content: center;
    margin-bottom: 15px;
  }
}

@media only screen and (max-width: 1300px) {
  .invest_item {
    flex-wrap: wrap;
  }
  .item_description {
    width: 100%;
  }
  .dash_header {
    flex-direction: column;
    gap: 5px;
  }
  .spr_buy {
    padding: 0px 20px;
  }
}
</style> -->
