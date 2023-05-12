<template>
<div class="c_flex gap_10">
  <v-row>    
    <v-col
      v-for="(offer, id) in offers"
      :key="`offer-${id}`"
      cols="12"
      md="4"
      lg="3"
      class="reveal_btn"
      @click="selectOffer(offer)"
    >
        <video
          v-if="soundOption=='ON'"
          class="node-video buy_dialog_desktop"
          :key="video_tree(offer.nft)"          
          autoplay loop webkit-playsinline playsinline
        >
        
          <source :src="video_tree(offer.nft)" type="video/mp4" />
          {{$t('videotag')}}
        </video>
        <video
           v-if="soundOption=='OFF'"
          class="node-video buy_dialog_desktop"
          :key="video_tree(offer.nft)"          
          autoplay loop muted webkit-playsinline playsinline
        >
        
          <source :src="video_tree(offer.nft)" type="video/mp4" />
          {{$t('videotag')}}
        </video>
        <div class="reveal_hover">
          <span>{{$t('actions')}}</span>
          <v-btn            
            dark
            x-large
            elevation="0"
            class="btn_wrapper"
            v-if="offer.type!='offer' && !isRecoverButtonEnabled(offer) && calcAuctionTime(offer) > 0"
          >
          <img src="~/assets/image/backet.svg" alt=""  class="boosterItem"/>
          <span class="ml-2" v-if="!isRecoverButtonEnabled(offer) && offer.type!='offer' && calcAuctionTime(offer) > 0">{{$t('placebid')}}</span>
          </v-btn>
          <v-btn            
            dark
            x-large
            elevation="0"
            class="btn_wrapper"
            v-if="offer.type=='offer' && !isRecoverButtonEnabled(offer)"
          >
          <img src="~/assets/image/backet.svg" alt=""  class="boosterItem"/>
          <span class="ml-2">{{$t('buy')}}</span>          
          </v-btn>
          <v-btn            
            dark
            x-large
            elevation="0"
            class="btn_wrapper"
            v-if="isRecoverButtonEnabled(offer)"
          >
          <img src="~/assets/image/backet.svg" alt=""  class="boosterItem"/>
          <span class="ml-2" v-if="isRecoverButtonEnabled(offer)">{{$t('recover')}}</span>         
          </v-btn>
        </div>
      <div  class="nft_hover">
        <img :src="image_tree(offer.nft)" alt="" class="node-video buy_dialog_mobile" />
        <div class="flex justify-between mt-[8px]">
          <div class="flex align-center gap-[3px]">
            <v-tooltip top v-if="offer.nft.rewardLevel == 0">
              <template v-slot:activator="{ on, attrs }">
                <div class="reward-green" 
                    v-bind="attrs"
                    v-on="on">
                </div>
              </template>
              <span>100%</span>
            </v-tooltip>
            <v-tooltip top v-if="offer.nft.rewardLevel == 1">
              <template v-slot:activator="{ on, attrs }">
                <div class="reward-yellow"  
                  v-bind="attrs"
                    v-on="on"></div>
              </template>
              <span>100%</span>
            </v-tooltip>
            <v-tooltip top v-if="offer.nft.rewardLevel == 2">
              <template v-slot:activator="{ on, attrs }">
                <div class="reward-red" 
                    v-bind="attrs"
                    v-on="on"></div>
              </template>
              <span>50%</span>
            </v-tooltip>
            <v-tooltip top v-if="offer.nft.rewardLevel == 3">
                <template v-slot:activator="{ on, attrs }">
                  <div class="reward-gray" 
                   v-bind="attrs"
                  v-on="on"></div>
                </template>
                <span>5%</span>
            </v-tooltip>
            <span>{{ $t(offer.nft.nodeType) }}#{{offer.nft.tokenId}}</span>
            <div v-if="offer.nft.feature != ''" class="tree_name">
              {{ $t(offer.nft.feature) }}
            </div>
          </div>          
          <div class="flex justify-end gap_5">
            $KILL 
            <!-- <img src="~assets/image/dashboard/spring_token.svg" alt=""/> -->
            <span class="text-[#D89F0E]">{{ offer.type=="offer" ? amountNumber(offer.price) : amountNumber(offer.currentPrice) }}</span>
          </div>
        </div>
        <div class="flex justify-end">
          <div class="r_flex gap_5" v-if="offer.type == 'offer'">
            <img src="~/assets/image/clock.svg" alt=""  class="boosterItem"/>
            <span>Fixed</span>
          </div>
          <div class="r_flex gap_5" v-if="offer.type != 'offer'">
            <img src="~/assets/image/clock.svg" alt=""  class="boosterItem"/>
            <span v-if="calcAuctionTime(offer)>0">{{calcAuctionTime(offer)}} {{$t('hoursleft')}}</span>
            <span v-if="calcAuctionTime(offer)<0">{{$t('bidend')}}</span>
          </div>
        </div>        
      </div>
    </v-col>
    <video v-if="seedOpenvideo"  autoplay loop webkit-playsinline playsinline style="width: 100vw; height: 100vh; position: fixed; top:0; left: 0; z-index: 999" @ended="onVideoEnd">
          <source :src="seedOpenvideo" type="video/mp4">
         {{$t('videotag')}}
    </video>
    <OfferNFTDetails
      :detail_dialog="details"
      :offer="selectedOffer"
      @close="close"
    />
  </v-row>
</div>
  
</template>
<script lang="ts">
import { Vue, Component } from "nuxt-property-decorator";
import { LuckyBox } from "~/models/luckybox";
import { Offer,ItemType } from "~/models/marketplace";
import { NFT } from "~/models/nft";

import {
  NAME_TO_URL,
  NODENAME_TO_IMAGE,
  NODENAME_TO_VIDEO,
  PLOT_VIDEOS,
  BOOSITEM_VIDEOS,
  LUCKY_BOX_VIDEOS,
  LUCKY_BOX_IMAGES,
} from "~/models/constants";
import * as ethers from "ethers";
import { NodeNftNames } from '~/models/types'

const formatEther = ethers.utils.formatEther;

interface PreOrderView {
    itemName : string,
    amount : number;
    lockedValue: number;

}

@Component({
  props: {
    offers: Array as () => Offer[],
    userAddress: { type: String },
  },
})
export default class MarketNFTList extends Vue {
  public details: boolean = false;
  public selectedOffer: Offer | object = {};
  public isClaimAllBtnLoading: boolean = false;
  public isRevealAllBtnLoading : boolean = false;  
  public isChecked : any  = [];
  public isCheckedClaim : any = [];
  public error:boolean = false;
  public seedOpenvideo: string | null = null;
  public isRevealItemBtn : boolean = false;
  public preOrderNFTList : any = []
  public walletAddress : string = '';
  public waterMActiveCount(treeNFT) {
    const result = this.$store.getters["booster/waterMReaminingTime"](treeNFT.tokenId? treeNFT.tokenId : ethers.BigNumber.from(0));
    return result.totalActiveItem;
  }

  public waterLActiveCount(treeNFT) {
    const result = this.$store.getters["booster/waterLReaminingTime"](treeNFT.tokenId? treeNFT.tokenId : ethers.BigNumber.from(0));
   return result.totalActiveItem;
  }

  public fertilizerMActiveCount(treeNFT) {
    const result = this.$store.getters["booster/fertilizerMReaminingTime"](treeNFT.tokenId? treeNFT.tokenId : ethers.BigNumber.from(0));
   return result.totalActiveItem;
  }

  public fertilizerLActiveCount(treeNFT) {
    const result = this.$store.getters["booster/fertilizerLReaminingTime"](treeNFT.tokenId? treeNFT.tokenId : ethers.BigNumber.from(0));
   return result.totalActiveItem;
  }
  public async selectOffer(offer) {
    if(!this.isRecoverButtonEnabled(offer)) {
      if(this.calcAuctionTime(offer) < 0) {      
        return;
      }
      this.details = !this.details;
      this.selectedOffer = offer;
    } else {
      try{
        await this.$store.dispatch("marketplace/recover", {
          nft : offer.nft,
          type: offer.type == "offer" ? ItemType.Offer : ItemType.Auction
        });
        this.$router.go(0)
      } catch(err : any) {
        if (JSON.stringify(err).indexOf("Auction not finished yet") >= 0)
        {
          alert("Auction not finished yet");
        }        
      }
      
    }
    
  }
  public image(collection) {
    if (collection.attribute == "")
      return (LUCKY_BOX_IMAGES as any)[collection.type];
  }
  public video(collection) {
    if (collection.attribute == "")
      return (LUCKY_BOX_VIDEOS as any)[collection.type];
    else
      return (LUCKY_BOX_VIDEOS as any)[
        collection.nodeType + " " + collection.attribute
      ];
  }

  public video_preOrder(collection) {
    return (LUCKY_BOX_VIDEOS as any)[collection]
  }
  public video_tree(collection) {
    if (collection.attribute == "")
      return (NODENAME_TO_VIDEO as any)[collection.nodeType];
    else
      return (NODENAME_TO_VIDEO as any)[
        collection.nodeType + " " + collection.attribute
      ];
  }
  public image_tree(collection) {
    if (collection.attribute == "")
      return (NODENAME_TO_IMAGE as any)[collection.nodeType];
    else
      return (NODENAME_TO_IMAGE as any)[
        collection.nodeType + " " + collection.attribute
      ];
  }

  public pendingReward(tree) {
    return parseFloat(formatEther(tree.userPendingRewards)).toFixed(3);
  } 

  public nftCreateTime(tree) {
    let nftTime = new Date(tree.obtainingTime);
    return nftTime.toLocaleDateString("en-us", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  
  onVideoEnd () {
    this.seedOpenvideo = null;
    const el = this.$refs.table;
    if (el) {
      (el as any).scrollIntoView({ behavior: 'smooth' });
    }

  }

  public close() {
    this.details = false;
  }

  get soundOption() {
    return this.$store.state.setting.sound_option
  }

  public isRecoverButtonEnabled (offer) {
    if(offer.nft.owner == this.walletAddress)
      return true;
    else if(offer.end && (this.calcAuctionTime(offer) < 0 && offer.nextOwner == this.walletAddress))
      return true;
    else 
      return false;
  }

  public amountNumber (bn: ethers.BigNumber) {    
    return parseFloat(formatEther(bn)).toFixed(2);
  }

  public calcAuctionTime(offer) {
    var moment = require( 'moment' );
    const endDate = offer.end;    
    let date = new Date();    
    const offset = date.getTimezoneOffset();    
     
    var utcMoment = moment.utc();
    const current = utcMoment.valueOf();
    if(offer.end < current) {
      return -1;
    }
    return Math.ceil((offer.end-current)/1000/3600);
  }

  created() {
    this.walletAddress = this.$props.userAddress;
    console.log(this.walletAddress,"walletAddress")
    console.log("MarketPlaceList", this.$props.offers);
  }
}
</script>
<style scoped>
.node-video {
  width: 100%;
  border-radius: 14px;
  object-fit: cover;
  opacity: 1;
}
.node-video:hover {
  /* border: #D89F0E;
  border-style: solid;
  border-width: 2px; */
  cursor: pointer;
  opacity: 0.8;
}
.seed_collection_card {
  border-radius: 24px;
  width: 100%;
  object-fit: fill;
}

.reveal_item {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  flex-wrap: wrap;
}
.reveal_item_color {
  color: #D89F0E;
  font-size: 14px;
}
.reveal_item_color:hover {
  cursor: pointer;
}
.tree_name {
  width: 45px;
  height: 14px;
  background: #fcd34d;
  border-radius: 2px;
  color: #d97706;
  padding: 0px 3px;
  align-items: center;
  font-size: 10px;
  text-align: center;
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
.reveal_btn {
  position: relative;
}
.reveal_btn:hover > .reveal_hover {
  display: flex;
}
.reveal_hover {
  position: absolute;
  display: none;
  justify-content: space-between;
  right: 0;
  margin-top: -62px;
  padding: 0px 27px;
  align-items: center;
  width: 100%;
}
.nft_hover :hover {
  cursor: pointer;
}
.boosterItem {
  width: 21px;
  height: 21px;
}
.item_check {
  position: absolute;
  top: 6px;
  right:0px;
  margin-right: 15px;
}
.count_color {
  color: #D89F0E; 
}
.multi_btn {
  justify-content: flex-end;
}
.buy_dialog_mobile {
    display:none;
}
.buy_dialog_desktop {
  display: block;
}
@media only screen and (max-width: 600px) {
  .multi_btn {
   justify-content: flex-start;
  }
  .buy_dialog_mobile {
    display:block;
  }
  .buy_dialog_desktop {
    display: none;
  }
}

.reward-green {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: green;
}
.reward-yellow {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: yellow;
}
.reward-red {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: red;
}
.reward-gray {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: gray;
}
</style>
