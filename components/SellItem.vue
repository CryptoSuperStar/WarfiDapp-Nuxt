<template>
  <div class="see_item_container">
    <div class="sell_list">
      <img
        class="green_arrow_icon"
        src="~/assets/image/green_arrow_icon.svg"
        @click="closeDialog"
      />
      <span>{{$t('sell')}}</span>
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
      <div class="sell_fixprice">
        <v-checkbox
          :value="isFixedPrice"
          class="bidcheckbx"
          label="Fixed Price"
          color="success"
          hide-details
          dark
          @change="changeSellMode($event, 'fixed')"
        />
        <VTextField  v-if="isFixedPrice" class="ml-[8px] align-center pt-[0px] mt-[0px] text-end" :min="minimumPrice" v-model="fixedPrice" dark placeholder="`Buy Now` Pirce" type="number" hide-details />
      </div>
      <div class="sell_fixprice flex-column">
        <div class="flex">
          <v-checkbox
            :value="isAuction"
            label="Auction"
            color="success"
            hide-details
            dark
          @change="changeSellMode($event, 'auction')"
          />
          
        </div>
        <div v-if="isAuction" class="flex">
          <span class="w-1/2">{{$t('minimumbid')}}</span>
          <VTextField class="ml-[8px] align-center pt-[0px] mt-[4px] text-end" :min="minimumPrice" v-model="minimumBid" dark placeholder="MinimumBid Price" type="number" hide-details/>
        </div>
        <div class="block">
          <v-menu
            v-if="isAuction"
            v-model="datepickerMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="auto"
            dark
          >
            <template #activator="{ on, attrs }">
              <VTextField
                v-model="dateFormatted"
                dark
                clearable
                label="Auction end date"
                persistent-hint
                prepend-icon="mdi-calendar"
                v-bind="attrs"
                @blur="date = parseDate(dateFormatted)"
                @click:clear="date = null"                
                v-on="on"
              />
            </template>
            <v-date-picker
              v-model="date"
              no-title
              :min="isoToday"
              @input="datepickerMenu = false"
            />
          </v-menu>
          <v-menu
              v-if="isAuction && date"
              ref="timePickerMenu"
              v-model="timePickerMenu"
              :close-on-content-click="false"
              :nudge-right="40"
              :return-value.sync="time"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="290px"
            >
              <template #activator="{ on, attrs }">
                <VTextField
                  v-model="time"
                  dark
                  label="Picker in menu"
                  prepend-icon="mdi-clock-time-four-outline"
                  readonly
                  clearable
                  v-bind="attrs"
                  v-on="on"
                />
              </template>
              <v-time-picker
                v-if="timePickerMenu"
                v-model="time"
                format="24hr"
                full-width
                @click:minute="$refs.timePickerMenu.save(time)"
              />
          </v-menu>
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
        <span class="list_btn">{{ isApprove ? 'Approve' : 'List' }}</span>
      </VBtn>
      <div class="wallet_balance">
        <span>{{$t('yourwalletspring')}}</span>
        <div>
          <span>{{ tokenBalance }}</span>
        </div>
      </div>
      <div class="wallet_balance">
        <span>{{$t('yourrewardspring')}}</span>
        <div>
         <span>{{ pendingReward }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from "nuxt-property-decorator";
import { NFTType } from '~/models/marketplace';
import WalletReactiveFetch, { IReactiveFetch } from '~/mixins/wallet-reactive-fetch';
import addresses from "~/config/addresses";
import * as ethers from "ethers";
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
    nft: Object,
  },
})
export default class SellItem extends WalletReactiveFetch implements IReactiveFetch {
  public selectedSellMode: SellMode | null = null;
  public isBtnLoading = false;

  private minimumBid = 0;
  private fixedPrice = 0;
  private minimumPrice = 0;
  public date: string | null = null;
  public datepickerMenu = false;
  public timePickerMenu = false;
  public time: string | null = null;
  public error : string = '';

  get video() {
    if (this.$props.nft.attribute == "")
      return (NODENAME_TO_VIDEO as any)[this.$props.nft.nodeType];
    else
      return (NODENAME_TO_VIDEO as any)[
        this.$props.nft.nodeType + " " + this.$props.nft.attribute
      ];
  }
  get isFixedPrice() {
    return this.selectedSellMode === "fixed";
  }

  get isAuction() {
    return this.selectedSellMode === "auction";
  }

  get isApprove() {
    return !this.$store.getters["marketplace/isApprovedForNFTType"](
      NFTType.Node
    );
  }

  get nodeType () {
    return this.$store.getters['nodes/nodeTypeByName'](this.$props.nft.nodeType);
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
    return this.$props?.nft?.userPendingRewards
      ? parseFloat(
          formatEther(this.$props?.nft?.userPendingRewards)
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
      let dateNow = new Date(date);
      let offset = dateNow.getTimezoneOffset();    
      let currentUTCTime = dateNow.getTime() + offset * 60 * 1000;
      return ~~(currentUTCTime / 1000) + timeTimestamp;
    } else {
      let now = new Date();
      let offset = now.getTimezoneOffset();
      let currentUTCTime = now.getTime() + offset * 60 * 1000;
      return ~~(currentUTCTime / 1000) + 604800; // now + 1 week
    }
    
  }

  get dateFormatted (): string | null {
    const { date, formatDate } = this;

    if (!date) {
      return null;
    }
    return formatDate(date);
  }

  get canSell () {
    console.log(this.$props.nft.attribute !== '',"33333333")
    return this.$props.nft.attribute == ''
  }

  async onApprove() {
    try {
      this.isBtnLoading = true;
      await this.$store.dispatch("marketplace/approveForNftType", NFTType.Node);
    } finally {
      this.isBtnLoading = false;
    }
  }

  get tokenBalance() {
    const result = this.$store.getters["tokens/balanceForToken"](
      addresses.Token
    );
    return result != null ? parseFloat(formatEther(result)).toFixed(3) : 0;
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

  created() {
    this.fixedPrice = parseInt(formatEther(this.$store.getters["nodes/nodeTypeByName"](this.$props.nft.nodeType).cost));
    this.minimumBid = parseInt(formatEther(this.$store.getters["nodes/nodeTypeByName"](this.$props.nft.nodeType).cost));
    this.minimumBid = this.minimumBid + (30/100*this.minimumBid);
    this.minimumPrice = parseInt(formatEther(this.$store.getters["nodes/nodeTypeByName"](this.$props.nft.nodeType).cost));
    this.minimumPrice = this.minimumPrice + (30/100*this.minimumPrice);
  }

  async onList() {
    if (!this.selectedSellMode) {
      return;
    }
    
    try {
      this.isBtnLoading = true;

      if (this.selectedSellMode === "fixed") {
        console.log(this.nft,"marketNFT");
        await this.$store.dispatch("marketplace/sellOffer", {
          nftType: NFTType.Node,
          tokenId: this.nft.tokenId,
          price: this.fixedPrice,
        });
      } else {
        await this.$store.dispatch("marketplace/sellAuction", {
          nftType: NFTType.Node,
          tokenId: this.nft.tokenId,
          price: this.minimumBid,
          end: this.getAuctionDate(),
        });
      }

      this.$router.push("/market");
    } catch(err : any) {
      if (JSON.stringify(err).indexOf("Not open") >= 0)
      {
        this.error = 'Marketplace is not opened yet.';
      }      
      console.log(this.error, "error");
    } finally {
      this.isBtnLoading = false;
    }
  }

  async reactiveFetch () {    
    if (this.isWalletConnected) {
      await Promise.all([
        this.$store.dispatch('marketplace/loadApproveForNftType', NFTType.Node),
      ]);
    }
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
