<template>
  <div class="see_item_container">
    <div class="sell_list">
      <img
        class="green_arrow_icon"
        src="~/assets/image/green_arrow_icon.svg"
        @click="closeDialog"
      />
      <span>{{$t('buyitem')}}</span>
    </div>
    <div class="sell_content">
      <!-- <div > -->
        <video class="node-video" :key="video" autoplay loop webkit-playsinline playsinline>
          <source :src="video" type="video/mp4" />
          {{$t('videotag')}}
        </video>
         <!-- <img
            class="node_nft"
            src="~/assets/DOSSIER COMPLET/NFT 1 - Bonsai/BONSAI.jpg"
          /> -->
      <!-- </div> -->
      <div class="sell_fixprice mt-2" v-if="isFixedPrice">
        <v-checkbox
          v-model="isFixedPrice"
          class="bidcheckbx"
          label="Fixed Price"
          color="success"
          readonly
          hide-details
          dark
          @change="changeSellMode($event, 'fixed')"
        />
        <VTextField  readonly v-if="isFixedPrice" class="ml-[8px] align-center pt-[0px] mt-[0px]" v-model="fixedPrice" dark placeholder="`Buy Now` Pirce" type="number" hide-details />
      </div>
      <div class="sell_fixprice flex-column mt-2" v-if="isAuction">
        <div class="flex">
          <v-checkbox
            v-model="isAuction"
            label="Auction"
            color="success"
            hide-details
            readonly
            dark
          @change="changeSellMode($event, 'auction')"
          />
          
        </div>
        <div v-if="isAuction" class="block">
          <span>{{$t('currentminimumbid')}} {{amountNumber(offer.currentPrice)}}</span>                    
        </div>
        <div v-if="isAuction" class="block">
          <span>{{$t('enddate')}} {{new Date(offer.end).toLocaleDateString()}}</span>                    
        </div>
        <div v-if="isAuction" class="flex align-center">
          <span class="w-1/2">{{$t('bid')}} </span>
          <VTextField class="ml-[8px] align-center pt-0 mt-4" v-model="minimumBid" dark placeholder="MinimumBid Price" @change="changeAmount()" hide-details type="number" />
        </div>
      </div>
      <div v-if="error != ''" class="flex align-center">
          <span class="err-panel">{{error}} </span>          
      </div>
      <VBtn
        min-width="100%"
        min-height="60px"
        radius="4px"
        color="#D89F0E"
        :loading="isBtnLoading"
        :disabled="canSell"
        @click="() => (isApprove ? onApprove() : onList())"
      >
        <span class="list_btn">{{ isApprove ? $t('approve') : isFixedPrice ? $t('buytree') : $t('placebid') }}</span>
      </VBtn>
      <div class="wallet_balance">
        <span>{{$t('yourwalletspring')}}</span>
        <div>
          <!-- <img src="~/assets/image/dashboard/spring_token.svg" /> -->
          $KILL 
          <span>{{ tokenBalance }}</span>
        </div>
      </div>
      <div class="wallet_balance">
        <span>{{$t('yourrewardspring')}}</span>
        <div>
          <!-- <img src="~/assets/image/dashboard/spring_token.svg" /> -->
          $KILL 
         <span>{{ pendingReward }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Watch } from "nuxt-property-decorator";
import { NFTType } from '~/models/marketplace';
import { NFT } from '~/models/nft';
import { BigNumber } from 'ethers';
import WalletReactiveFetch, { IReactiveFetch } from '~/mixins/wallet-reactive-fetch';
import * as ethers from "ethers";
import addresses from "~/config/addresses";

import {
  NAME_TO_URL,
  NODENAME_TO_IMAGE,
  NODENAME_TO_VIDEO,
  PLOT_VIDEOS,
  BOOSITEM_VIDEOS,
  LUCKY_BOX_VIDEOS,
  LUCKY_BOX_IMAGES,
} from "~/models/constants";
type SellMode = "fixed" | "auction";
const formatEther = ethers.utils.formatEther;
@Component({
  props: {
    d_dialog: { type: Boolean },
    offer: Object,
  },
})
export default class BuyNFTItem extends WalletReactiveFetch implements IReactiveFetch {
  public selectedSellMode: SellMode | null = null;
  public isBtnLoading = false;

  private minimumBid = 100
  private fixedPrice = 100
  public date: string | null = null;
  public datepickerMenu = false;
  public timePickerMenu = false;
  public time: string | null = null;
  public nft: any = {};
  public isFixedPrice : Boolean = false;
  public isAuction : Boolean = false;
  public error : string = '';

  get video() {
    if (this.nft.attribute == "")
      return (NODENAME_TO_VIDEO as any)[this.nft.nodeType];
    else
      return (NODENAME_TO_VIDEO as any)[
        this.nft.nodeType + " " + this.nft.attribute
      ];
  }

  get tokenBalance() {
    const result = this.$store.getters["tokens/balanceForToken"](
      addresses.Token
    );
    return result != null ? parseFloat(formatEther(result)).toFixed(3) : 0;
  }

  // get isFixedPrice() {
  //   return this.selectedSellMode === "fixed";
  // }

  // get isAuction() {
  //   return this.selectedSellMode === "auction";
  // }

  get isApprove() {
    return !this.$store.getters["marketplace/isApprovedForNFTType"](
      NFTType.Node
    );
  }

  get nodeType () {
    return this.$store.getters['nodes/nodeTypeByName'](this.nft.nodeType);
  }
  
  public closeDialog() {
    this.$emit("close");
  }

  get isoToday (): string {
    return new Date().toISOString();
  }
  
  changeSellMode(event: any, mode: "fixed" | "auction") {
    this.selectedSellMode = event ? mode : null;
  }
  get pendingReward() {
    return this.nft?.userPendingRewards
      ? parseFloat(
          formatEther(this.nft?.userPendingRewards)
        ).toFixed(3)
      : 0;
  }

  getAuctionDate(): number {
    const { date, time } = this;

    if (date) {
      const [hour, minute] = time?.split(":") || [];
      const hourNumber = parseInt(hour ?? 0);
      const minuteNumber = parseInt(minute ?? 0);
      const timeTimestamp = hourNumber * 3600 + minuteNumber * 60;

      return ~~(new Date(date).getTime() / 1000) + timeTimestamp;
    }
    return ~~(new Date().getTime() / 1000) + 604800; // now + 1 week
  }

  get dateFormatted (): string | null {
    const { date, formatDate } = this;

    if (!date) {
      return null;
    }
    return formatDate(date);
  }

  get canSell () {
    console.log(this.nft.attribute !== '',"33333333")
    return this.nft.attribute == ''
  }

  async onApprove() {
    try {
      this.isBtnLoading = true;
      await this.$store.dispatch("marketplace/approveForNftType", NFTType.Node);
    } finally {
      this.isBtnLoading = false;
    }
  }

  formatDate (date: string | null): string | null {
    if (!date) { return null; }

    const [year, month, day] = date.split('-');
    return `${month}/${day}/${year}`;
  }

  parseDate (date: string | null): string | null {
    if (!date) { return null; }

    const [month, day, year] = date.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  async onList() {    
    try {
      this.isBtnLoading = true;
      this.error = '';
      if (this.isFixedPrice) {
        console.log(this.nft,"marketNFT");
        await this.$store.dispatch("marketplace/buyNow", {
          nftType: NFTType.Node,
          tokenId: this.nft.tokenId          
        });
      } else {
        await this.$store.dispatch("marketplace/bidAuction", {
          nftType: NFTType.Node,
          tokenId: this.nft.tokenId,
          bid: this.minimumBid
        });
      }
      this.error = '';
      this.$router.go(0);
      
    } catch(err : any) {
      if (JSON.stringify(err).indexOf("New price must be bigger than current one") >= 0)
      {
        this.error = 'New price must be bigger than current one';
      }
      if (JSON.stringify(err).indexOf("You cannot buy your own nft") >= 0)
      {
        this.error = 'You cannot buy your own nft';
      }
      if (JSON.stringify(err).indexOf("Auction already finished") >= 0)
      {
        this.error = 'Auction already finished';
      }
       
      console.log(this.error, "error");
    } finally {
      this.isBtnLoading = false;
    }
  }

  public changeAmount() {
    this.error = '';
  }

  async reactiveFetch () {    
    this.nft = this.$props.offer.nft;
    if(this.$props.offer.type == "offer") {
      this.isFixedPrice = true;
      this.isAuction = false;
      this.selectedSellMode = "fixed";
      this.fixedPrice = parseInt(formatEther(this.$props.offer.price));
    } else {
      this.isAuction = true;
      this.isFixedPrice = false;
      this.minimumBid =  parseInt(formatEther(this.$props.offer.currentPrice));
    }
    this.error = '';
    console.log(this.$props.offer);
    if (this.isWalletConnected) {
      await Promise.all([
        this.$store.dispatch('marketplace/loadApproveForNftType', NFTType.Node),
      ]);
    }
  }

  @Watch("d_dialog")
  public initDialog() {
    console.log('wwwwwwwwwww')
    this.nft = this.$props.offer.nft;
    if(this.$props.offer.type == "offer") {
      this.isFixedPrice = true;
      this.isAuction = false;
      this.selectedSellMode = "fixed";
      this.fixedPrice = parseInt(formatEther(this.$props.offer.price));
    } else {
      this.isAuction = true;
      this.isFixedPrice = false;
      this.minimumBid =  parseInt(formatEther(this.$props.offer.currentPrice));
    }
    console.log(this.$props.offer);
  }

   public amountNumber (bn: ethers.BigNumber) {    
    return parseInt(formatEther(bn));
  }
}
</script>
<style scoped>
.see_item_container {
  background: #001802;
}
.sell_list {
  height: 72px;
  position: relative;
  padding: 26px 44px;
  text-align: center;
}
.green_arrow_icon {
  position: absolute;
  left: 24px;
  top: 30px;
}
.sell_content {
  display: flex;
  flex-direction: column;
  padding: 0px 20px 40px 20px;
  align-items: center;
}
.node-image {
  height: 280px;
  background: radial-gradient(
      59.64% 59.64% at 50% 50%,
      rgba(164, 189, 62, 0.6) 0%,
      rgba(0, 0, 0, 0) 100%
    ),
    rgba(255, 255, 255, 0.05);
  box-shadow: inset 0px 0px 16px 4px rgba(255, 255, 255, 0.05);
  border-radius: 24px;
}
.node_nft{
  width: 100%;
  height: 280px;
  border-radius: 14px;
  object-fit: cover;
  width: 100% !important;
  margin-bottom : 16px
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
.sell_fixprice {
  background: #2a4733;
  border-radius: 4px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 15px 16px;
  margin-bottom: 6px;  
}
.sell_fixprice > div {
  display: flex;  
  align-items: center;
    
}
.pay_token :hover {
  cursor: pointer;
}
.v-input--selection-controls {
  margin-top: 0px !important;
}
.v-label {
  color:white!important;
}

.v-input__slot {
  margin-bottom: 0px !important;
}

.v-text-field {
  margin-top: 0px !important;
}
.node-video {
  width: 100%;
  height: 280px;
  border-radius: 14px;
  object-fit: cover;
}
.v-label.theme--light {
  color: green;
}
.node-image {
  height: 280px;
  background: radial-gradient(
      59.64% 59.64% at 50% 50%,
      rgba(164, 189, 62, 0.6) 0%,
      rgba(0, 0, 0, 0) 100%
    ),
    rgba(255, 255, 255, 0.05);
  box-shadow: inset 0px 0px 16px 4px rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  margin-bottom: 20px;
}
.list_btn {
  color: white;
}
.v-btn--disabled {
  color: white !important;
}
.err-panel {
  color : white !important;
  background: red;
  width: 100%;
  padding : 12px 12px;
  margin-bottom: 6px;
  margin-top: 6px;
}
</style>
