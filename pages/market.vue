<!-- <template>
  <div v-if="loadingData" class="main_container">
    <span class="main_title">Market</span>    

    <div class="node_data">
      <DataTable
        v-for="(item, i) in protocolStats"
        :key="i"
        :title="item.title"
        :icon="item.icon"
        :price="item.price"
        :percentage="item.percentage"
      />
    </div>
     <span class="text-[26px] text-[#D89F0E]">{{$t('comming')}}</span> -->
    <!-- <div class="filter">
        <v-menu offset-y>
          <template #activator="{ on, attrs }">
            <div
              class="resource_btn"
              v-bind="attrs"
              v-on="on"
            > 
              <div class="filter_list">
                {{typeFilter}}
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M5.29289 7.29289C5.68342 6.90237 6.31658 6.90237 6.70711 7.29289L10 10.5858L13.2929 7.29289C13.6834 6.90237 14.3166 6.90237 14.7071 7.29289C15.0976 7.68342 15.0976 8.31658 14.7071 8.70711L10.7071 12.7071C10.3166 13.0976 9.68342 13.0976 9.29289 12.7071L5.29289 8.70711C4.90237 8.31658 4.90237 7.68342 5.29289 7.29289Z" fill="#D89F0E"/>
                </svg>
              </div>
            </div>
          </template>
          <v-list min-width="200px" class="resource_list" color="white">
            <v-list-item
              v-for="(item, index) in offerTypeList"
              :key="index"
              color="white"
            >
            <v-list-item-title class="desktop_link_color" @click="selectType(item)" v-text="$t(item)" />
            </v-list-item>
          </v-list>
        </v-menu>
         <v-menu offset-y>
          <template #activator="{ on, attrs }">
            <div
              class="resource_btn"
              v-bind="attrs"
              v-on="on"
            > 
              <div class="filter_list">
                {{treeFilter}}
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M5.29289 7.29289C5.68342 6.90237 6.31658 6.90237 6.70711 7.29289L10 10.5858L13.2929 7.29289C13.6834 6.90237 14.3166 6.90237 14.7071 7.29289C15.0976 7.68342 15.0976 8.31658 14.7071 8.70711L10.7071 12.7071C10.3166 13.0976 9.68342 13.0976 9.29289 12.7071L5.29289 8.70711C4.90237 8.31658 4.90237 7.68342 5.29289 7.29289Z" fill="#D89F0E"/>
                </svg>
              </div>
            </div>
          </template>
          <v-list min-width="200px" class="resource_list" color="white">
            <v-list-item
              v-for="(item, index) in treeList"
              :key="index"
              color="white"
            >
            <v-list-item-title class="desktop_link_color" @click="selectTree(item)" v-text="$t(item)" />
            </v-list-item>
          </v-list>
        </v-menu>

        <v-menu offset-y>
          <template #activator="{ on, attrs }">
            <div
              class="resource_btn"
              v-bind="attrs"
              v-on="on"
            > 
              <div class="filter_list">
                {{featureFilter}}
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M5.29289 7.29289C5.68342 6.90237 6.31658 6.90237 6.70711 7.29289L10 10.5858L13.2929 7.29289C13.6834 6.90237 14.3166 6.90237 14.7071 7.29289C15.0976 7.68342 15.0976 8.31658 14.7071 8.70711L10.7071 12.7071C10.3166 13.0976 9.68342 13.0976 9.29289 12.7071L5.29289 8.70711C4.90237 8.31658 4.90237 7.68342 5.29289 7.29289Z" fill="#D89F0E"/>
                </svg>
              </div>
            </div>
          </template>
          <v-list min-width="200px" class="resource_list" color="white">
            <v-list-item
              v-for="(item, index) in featureList"
              :key="index"
              color="white"
            >
            <v-list-item-title class="desktop_link_color" @click="selectFeature(item)" v-text="$t(item)" />
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    <MarketNFTList :offers="items" :userAddress="userAddress"/>
  </div>
  <div v-else>
     <v-container style="height: 400px;">
      <v-row
        class="fill-height"
        align-content="center"
        justify="center"
      >
        <v-col
          v-if="!walletConnect"
          class="text-subtitle-1 text-center"
          cols="12"
        >
          {{$t('getcollection')}}
        </v-col>
        <v-col
          v-else
          class="text-subtitle-1 text-center"
          cols="12"
        >
          {{$t('wallet_get_collection')}}
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
  </div> -->
  
</template>

<script lang="ts">
import { Component } from 'nuxt-property-decorator';
import WalletReactiveFetch, { IReactiveFetch } from '~/mixins/wallet-reactive-fetch';
import addresses from '~/config/addresses';
import { Item } from '~/models/marketplace';
const formatEther = ethers.utils.formatEther;
import * as ethers from "ethers";
@Component
export default class Market extends WalletReactiveFetch implements IReactiveFetch {
  private loadingData : boolean  = false;
  private walletConnect : boolean = false;  
  private marketOffers : any = {};
  private userAddress : string = '';
  private featureFilter: any = this.$t('featureFilter');
  private typeFilter: any = this.$t('typeFilter');
  private treeFilter: any = this.$t('treeFilter');

  private offerTypeList = ['all','mynfts','offer','auction']
  private treeList = ['all','Plum','Bonsai','Fir','Oak','Cherry']
  private featureList = ['all','seed','silver','gold','diamond']
  private marketFee = "0%";
  onScrollToTable () {
    const el = this.$refs.table;

    if (el) {
      (el as any).scrollIntoView({ behavior: 'smooth' });
    }
  }

   get protocolStats () {
    return [
      {
        icon: require('../assets/image/dashboard/total_trees.svg'),
        title: this.$t('total_items'),
        price: this.marketOffers.length,
        percentage: this.marketOffers.length,
      },
      //  {
      //   icon: require('../assets/image/dashboard/total_plots.svg'),
      //   title: this.$t('volume'),
      //   price: 0,
      //   percentage: null,
      // },
      // {
      //   icon: require('../assets/image/dashboard/gift_icon_yellow.svg'),
      //   title: this.$t('floor'),
      //   price: 1,
      //   percentage: null,
      // },
      {
        title: this.$t('spring_balance'),
        price: this.$store.getters["tokens/balanceForToken"](addresses.Token)?parseFloat(formatEther(this.$store.getters["tokens/balanceForToken"](addresses.Token))).toFixed(3) : 0,
        percentage: null,
      },
      {
        title: this.$t('marketselltax'),
        price: this.marketFee,
        percentage: null,
      },
      {
        title: this.$t('minprice'),
        price: "30%",
        percentage: null,
      },
    ];
  }

   get items () : Item[] {
     return this.$store.getters['marketplace/view/current']
   }

  // private onClick (item: Item) {
  //   this.selectedItem = item
  // }

  // get offers() {
  //   console.log(this.marketOffers, "marketplace result")
  //   return this.marketOffers;
  // }

  async reactiveFetch () {
    if (this.isWalletConnected) {
      await Promise.all([
        this.$store.dispatch('marketplace/load'),        
        this.$store.dispatch('nodes/loadNodeTypes'),
        this.$store.dispatch('luckyboxes/loadLuckyBoxTypes'),
        this.$store.dispatch("tokens/loadBalance", addresses.Token)      
      ])
      //this.marketOffers = this.$store.getters["marketplace/items"];
      this.marketOffers = this.$store.getters["marketplace/items"];
      this.filteredMarketOffers = this.marketOffers;
      this.userAddress = this.$store.getters['wallet/address'];
      this.marketFee = this.$store.getters["marketplace/marketFee"]?parseInt(this.$store.getters["marketplace/marketFee"]._hex)/100 + "%": "0%"
      console.log('userAddress',this.userAddress)
      this.loadingData = true;

    }
  }

  public selectFeature(item) {
    console.log("feature",item);
    this.featureFilter = this.$t(item);
    this.$store.commit('marketplace/view/setFeatureFilter',item)
  }

  public selectTree(item) {
    this.treeFilter =  this.$t(item)
    this.$store.commit('marketplace/view/setTreeFilter',item)
  }

  public selectType(item) {  
    this.typeFilter = this.$t(item)
    this.$store.commit('marketplace/view/setTypeFilter',item)
  }
}
</script>
<style scoped>
.main_container {
    display: flex;
    flex-direction: column;
    padding: 64px 200px;
}
.tabs_background > .v-tabs-bar {
  background-color: black !important;
}
.v-tab {
  width: 50% !important;
  max-width: unset !important;
  color: white !important;
}
.node_data{
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 32px;
  margin-bottom: 96px;
}
.main_title {
  font-size: 24px;
}
.title_description {
    width: 60%;
    color:rgba(255, 255, 255, 0.7);
    margin-top: 16px;
    margin-bottom: 64px;
}
.filter {
  display: flex;
  gap: 16px;
  margin-bottom: 45px;
}
.filter_list {
  display: flex;
  flex-direction: row;
  min-width: 120px;
  justify-content: center;
  align-items: center;
  background: #2A4733;
  border-radius: 4px;
  padding: 10px;
  height: 45px;
}
.filter_type_list {
  display:block;
}
.item_title {
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  color: #1F2937;
}
.filter_text {
  font-weight: 400;
  font-size: 16px;
  line-height: 16px;
  color: #4B5563;
}
.btn_apply {
  background: #D89F0E;
  border-radius: 4px;
  padding: 10px 16px;
  color : white;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
}

.btn_cancel {
  background: #D89F0E;
  border-radius: 4px;
  padding: 10px 16px;
  color : white;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  background: #E5E7EB;
  color: #4B5563;
}
.resource_list {
  flex-direction: column;
  background: white;
}
.desktop_link_color {
  color: black;
}
.desktop_link_color:hover {
  cursor : pointer;
  color: #D89F0E;
}
@media only screen and (max-width: 600px) {
    .main_container {
      padding: 64px 20px;
    }
    .title_description {
        width: 100%;
    }
    .node_data{
      margin-bottom: 56px;
    }
}
</style> -->
