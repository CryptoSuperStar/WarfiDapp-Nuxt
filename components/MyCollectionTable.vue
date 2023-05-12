<template>
  <div v-if="seeds.length > 0 || nfts.length > 0 || preorderList.length > 0 " class="collectionTabe_container">
    <!-- <div class="filter">
       <v-menu offset-y>
          <template #activator="{ on, attrs }">
            <div
              class="resource_btn"
              v-bind="attrs"
              v-on="on"
            >
              <div class="filter_list">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.8333 2.5H4.16667C3.24167 2.5 2.5 3.24167 2.5 4.16667V15.8333C2.5 16.2754 2.67559 16.6993 2.98816 17.0118C3.30072 17.3244 3.72464 17.5 4.16667 17.5H15.8333C16.2754 17.5 16.6993 17.3244 17.0118 17.0118C17.3244 16.6993 17.5 16.2754 17.5 15.8333V4.16667C17.5 3.24167 16.75 2.5 15.8333 2.5Z" fill="white"/>
                </svg>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M5.29289 7.29289C5.68342 6.90237 6.31658 6.90237 6.70711 7.29289L10 10.5858L13.2929 7.29289C13.6834 6.90237 14.3166 6.90237 14.7071 7.29289C15.0976 7.68342 15.0976 8.31658 14.7071 8.70711L10.7071 12.7071C10.3166 13.0976 9.68342 13.0976 9.29289 12.7071L5.29289 8.70711C4.90237 8.31658 4.90237 7.68342 5.29289 7.29289Z" fill="#D89F0E"/>
                </svg>
              </div>
            </div>
          </template>
          <v-list min-width="200px" class="resource_list" color="white">
            <v-list-item
              v-for="(item, index) in sortList"
              :key="index"
              color="white"
              @click ="clickSelectionList(item)"
            >
              <a :href="item.to" target="_blank"><v-list-item-title class="desktop_link_color" v-text="item" /></a>
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
                Tree ID
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M5.29289 7.29289C5.68342 6.90237 6.31658 6.90237 6.70711 7.29289L10 10.5858L13.2929 7.29289C13.6834 6.90237 14.3166 6.90237 14.7071 7.29289C15.0976 7.68342 15.0976 8.31658 14.7071 8.70711L10.7071 12.7071C10.3166 13.0976 9.68342 13.0976 9.29289 12.7071L5.29289 8.70711C4.90237 8.31658 4.90237 7.68342 5.29289 7.29289Z" fill="#D89F0E"/>
                </svg>
              </div>
            </div>
          </template>
          <v-list min-width="200px" class="resource_list" color="white">
            <v-list-item
              v-for="(item, index) in TreeIDList"
              :key="index"
              color="white"
            >
              <a :href="item.to" target="_blank"><v-list-item-title class="desktop_link_color" v-text="item" /></a>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-menu
          v-model="menu"
          :close-on-content-click="false"
          offset-y
        >
          <template v-slot:activator="{ on, attrs }">
            <div
              class="resource_btn"
              v-bind="attrs"
              v-on="on"
            >
             <div class="filter_list">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 4C5 3.44772 4.55228 3 4 3C3.44772 3 3 3.44772 3 4V11.2676C2.4022 11.6134 2 12.2597 2 13C2 13.7403 2.4022 14.3866 3 14.7324V16C3 16.5523 3.44772 17 4 17C4.55228 17 5 16.5523 5 16V14.7324C5.5978 14.3866 6 13.7403 6 13C6 12.2597 5.5978 11.6134 5 11.2676V4Z" fill="#D89F0E"/>
                <path d="M11 4C11 3.44772 10.5523 3 10 3C9.44772 3 9 3.44772 9 4V5.26756C8.4022 5.61337 8 6.25972 8 7C8 7.74028 8.4022 8.38663 9 8.73244V16C9 16.5523 9.44772 17 10 17C10.5523 17 11 16.5523 11 16V8.73244C11.5978 8.38663 12 7.74028 12 7C12 6.25972 11.5978 5.61337 11 5.26756V4Z" fill="#D89F0E"/>
                <path d="M16 3C16.5523 3 17 3.44772 17 4V11.2676C17.5978 11.6134 18 12.2597 18 13C18 13.7403 17.5978 14.3866 17 14.7324V16C17 16.5523 16.5523 17 16 17C15.4477 17 15 16.5523 15 16V14.7324C14.4022 14.3866 14 13.7403 14 13C14 12.2597 14.4022 11.6134 15 11.2676V4C15 3.44772 15.4477 3 16 3Z" fill="#D89F0E"/>
                </svg>
                Filters
              </div>      
            </div>
          </template>
          <v-card>
            <v-list>
              <v-list-item class="filter_type_list">
                <v-list-item-content>
                  <v-list-item-title class="item_title">NFT Type</v-list-item-title>
                  <v-list-item-subtitle>
                    <v-row class = "filter_grid" no-gutters>
                      <template v-for="(item, index) in NFTType">
                        <v-col 
                          class="pa-2"                        
                          :key="index">
                          <v-checkbox
                            :label="item"
                            value="red"
                            hide-details
                            class = "filter_text"
                          ></v-checkbox>                                               
                        </v-col>
                        <v-responsive
                          v-if="index === 1"
                          :key="`width-${index}`"
                          width="100%"
                        ></v-responsive>
                      </template>
                    </v-row>
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item class="filter_type_list">
                <v-list-item-content>
                  <v-list-item-title class="item_title">Booster Type</v-list-item-title>
                  <v-list-item-subtitle>
                    <v-row class = "filter_grid" no-gutters>
                      <template v-for="(item, index) in BoosterType">
                        <v-col 
                          class="pa-2"                        
                          :key="index">
                          <v-checkbox
                            :label="item"
                            value="red"
                            hide-details
                            class = "filter_text"
                          ></v-checkbox>                                               
                        </v-col>
                        <v-responsive
                          v-if="index === 1"
                          :key="`width-${index}`"
                          width="100%"
                        ></v-responsive>
                      </template>
                    </v-row>
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item class="filter_type_list">
                <v-list-item-content>
                  <v-list-item-title class="item_title">Filter Heding</v-list-item-title>
                  <v-list-item-subtitle>
                    <v-row class = "filter_grid" no-gutters>
                      <template v-for="(item, index) in FilterHeading">
                        <v-col 
                          class="pa-2"                        
                          :key="index">
                          <v-checkbox
                            :label="item"
                            value="red"
                            hide-details
                            class = "filter_text"
                          ></v-checkbox>                                               
                        </v-col>
                        <v-responsive
                          v-if="index === 1"
                          :key="`width-${index}`"
                          width="100%"
                        ></v-responsive>
                      </template>
                    </v-row>
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
            <v-divider></v-divider>
            <v-card-actions>              
              <v-btn
                class="btn_cancel"
                text
                @click="menu = false"
              >
                Cancel
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn
                class="btn_apply"
                text
                @click="menu = false"
              >
                Apply
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
      </div> -->
   
    <NFTList :seeds = "seeds" :treenfts="nfts" :prenfts="preorderList"/>
  </div>
  <div v-else class="text-[#D89F0E] text-[24px]" >
    {{$t('nocollection')}}
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';
import * as ethers from 'ethers';
import { NFT } from '~/models/nft';
import { LuckyBox } from '~/models/luckybox';
import { BigNumber } from "ethers";

interface PreOrderView {
    itemName : string,
    amount : number;
    lockedValue: number;

}

import { NAME_TO_URL, NODENAME_TO_IMAGE,NODENAME_TO_VIDEO } from '~/models/constants';
const formatEther = ethers.utils.formatEther;
@Component({
  props: {
    seeds: Array as () => LuckyBox[],
    nfts : Array as () => NFT[],
    preorderList: Array as() => PreOrderView[],
  },
})
export default class MyCollectionTable extends Vue {
  public nftSellSectionModal = false;
  public nftSellModal = false;
  public selectedNft: NFT | null = null;
  public isClaimAllBtnLoading = false;
  public isRevealAllBtnLoading = false;
  public selectedNFTs : any = [];
  public myCollectionList : any= [];
  public sortList = ['Select All', 'None', 'All Trees', 'All Mystery Seeds','Active Booster','No Booster'];
  public TreeIDList = ['Tier: high to Low', 'Tier: Low to High', 'Cycle: Hight to Low', 'Cycle: Low to High', 'Rewards: Hight to Low', 'Rewards: Low to Hight']
  public filterList = ['NFT Type', 'Booster Type', 'Filter Heading']
  public NFTType = ['Ban','Fir','Oak','Cherry'];
  public BoosterType = ['Fertilize','Booster Type','Booster Type','Booster Type'];
  public FilterHeading = ['Filet OPtion','Filet OPtion','Filet OPtion','Filet OPtion']; 
  public menu: boolean = false;
  public selectedTokenIds : BigNumber[] = [];
  public video (nodeName:string): any {
    return (NODENAME_TO_VIDEO as any)[nodeName];
  }

  // public selectedTokenIds : BigNumber [] = [];
  // formatDate (date: Date) {
  //   return new Intl.DateTimeFormat('default', { dateStyle: 'medium' }).format(date);
  // }

  public amountNumber (bn: ethers.BigNumber) {
    return parseInt(bn._hex)
  }

  get pendingReward() {
    return this.$store.getters["nodes/totalPendingRewards"] ? this.$store.getters["nodes/totalPendingRewards"] : 0;
  }

  async onClaimAll() {
    try {
      this.isClaimAllBtnLoading = true;
      await this.$store.dispatch("nft/claimAll");
    } finally {
      this.isClaimAllBtnLoading = false;
    }
  }

  public clickSelectionList(action) {

    switch (action) {
      case 'Select All':
        break;
      case 'None':
        break;
      case 'All Trees':
        break;
      case 'All Mystery Seeds':
        break;
      case 'Active Booster':
      default:
        break;
    }
  }

  public selectedSeeds(tokenIds) {

    this.selectedTokenIds = []
    this.selectedTokenIds = tokenIds;
  }
  get tokenCount() {
    return this.selectedTokenIds.length ? this.selectedTokenIds.length : 0;
  }
}
</script>
<style scoped>
.collectionTabe_container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 45px;
}
.seed_collection_card {
    height: 280px;
    background: radial-gradient(59.64% 59.64% at 50% 50%, rgba(164, 189, 62, 0.6) 0%, rgba(0, 0, 0, 0) 100%), rgba(255, 255, 255, 0.05);
    box-shadow: inset 0px 0px 16px 4px rgba(255, 255, 255, 0.05);
    border-radius: 24px;
    width: 100%;
    object-fit: fill;
}
.collection_img {
  border-radius: 16px;
}

.v-tabs-items {
  background: unset !important;
}
.reveal_item {
  display: flex;
  justify-content: space-between;
}
.reveal_item_color {
  color: #D89F0E;
  font-size: 14px;
}
.v-list {
  display: block !important;
}
.filter {
  display: flex;
  gap: 16px;
  margin-bottom: 45px;
}
.filter_list {
  display: flex;
  flex-direction: row;
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
.desktop_link_color {
  color: black;
}
.desktop_link_color:hover {
  point: cursor;
  color: #D89F0E;
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
.count_color {
  color: #D89F0E; 
}
@media only screen and (max-width: 600px) {

}
</style>