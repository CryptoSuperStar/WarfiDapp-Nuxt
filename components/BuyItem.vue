<template>
  <div>
    <div v-if="!selectToken && !treeRequired" class="buy_item_container">
      <div class="buy_list">
        <img
          class="green_arrow_icon"
          src="~/assets/image/green_arrow_icon.svg"
          @click="closeDialog"
        />
        <span>{{$t('buy')}} {{ $t(name) }} </span>
      </div>
      <div class="buy_content">
        <img :src="video" class="node-video" alt="">
        <!-- <span class="buy_details">View Details</span> -->
        <span class="buy_counter">{{$t('howmanydays')}}</span>
        <div v-if="!isBooster" class="node-card__content inline-block">
          <div class="mt-6 mb-1 d-flex justify-center items-center">
            <VBtn
              min-width="40px"
              min-height="40px"
              radius="4px"
              color="#D89F0E"
              dark
              @click="onRemove"
            >
              -
            </VBtn>
            <div class="mx-auto">
              <VTextField
                v-model.number="quantity"
                class="centered-input"
                dense
              />
            </div>
            <VBtn
              min-width="40px"
              min-height="40px"
              radius="4px"
              color="#D89F0E"
              dark
              @click="onAdd"
            >
              +
            </VBtn>
          </div>
        </div>
        <span v-if="!isBoosterItem" class="item_price"
          >{{ selectedTokenSymbol == 'BUSD' ? (cost * quantity * sprPrice).toFixed(2) : cost * quantity}}
          <!-- <img src="~/assets/image/dashboard/spring_token.svg" /> -->
        </span>
        <div v-else class="flex flex-col justify-center items-center">
          <span class="text-[64px]">{{ _totalBuyCounter }}</span>
          <div class="flex mb-[50px]">
            
            <!-- <img src="~/assets/image/dashboard/spring_token.svg" /> -->
            <span>  {{ boosterTotalItemPrice ? ( selectedTokenSymbol == 'BUSD' ? (boosterTotalItemPrice * sprPrice).toFixed(2) : boosterTotalItemPrice) : 0 }}</span>
          </div>
        </div>
        <div
          v-if="isBoosterItem"
          :class="
            _totalBuyCounter > 0
              ? `pay_token py-[36px]`
              : `pay_token py-[36px] bg-[#EF4444]`
          "
          @click="selectTree"
        >
          <div>
            <svg
              width="13"
              height="16"
              viewBox="0 0 13 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.16663 15.5V11.95C4.77496 12.0917 4.35829 12.1667 3.91663 12.1667C1.83329 12.1667 0.166626 10.5 0.166626 8.41667C0.166626 7.35833 0.583293 6.40833 1.29996 5.725C1.10829 5.275 0.999959 4.775 0.999959 4.25C0.999959 2.16667 2.66663 0.5 4.74996 0.5C6.04996 0.5 7.19996 1.16667 7.87496 2.16667C7.94163 2.16667 8.00829 2.16667 8.08329 2.16667C8.68518 2.16667 9.28118 2.28522 9.83726 2.51555C10.3933 2.74589 10.8986 3.08349 11.3242 3.50909C11.7498 3.9347 12.0874 4.43996 12.3177 4.99603C12.5481 5.55211 12.6666 6.14811 12.6666 6.75C12.6666 7.35189 12.5481 7.94789 12.3177 8.50397C12.0874 9.06004 11.7498 9.5653 11.3242 9.99091C10.8986 10.4165 10.3933 10.7541 9.83726 10.9844C9.28118 11.2148 8.68518 11.3333 8.08329 11.3333C7.66663 11.3333 7.24996 11.275 6.83329 11.1583V15.5H5.16663Z"
                :fill="_totalBuyCounter < 1 ? `white` : `#D89F0E`"
              />
            </svg>
            <span>{{$t('fortrees')}}</span>
          </div>
          <div class="justify-end">
            <span v-if="_totalBuyCounter < 1" class>{{$t('freerequired')}}</span>
            <span v-else class="text-[#D89F0E]"
              >{{ _totalBuyCounter }} {{$t('treeadded')}}</span
            >
            <svg
              width="6"
              height="10"
              viewBox="0 0 6 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M0.292894 9.70711C-0.0976307 9.31658 -0.0976307 8.68342 0.292894 8.29289L3.58579 5L0.292893 1.70711C-0.0976311 1.31658 -0.0976311 0.683418 0.292893 0.292894C0.683418 -0.0976312 1.31658 -0.0976312 1.70711 0.292894L5.70711 4.29289C6.09763 4.68342 6.09763 5.31658 5.70711 5.70711L1.70711 9.70711C1.31658 10.0976 0.683418 10.0976 0.292894 9.70711Z"
                :fill="_totalBuyCounter < 1 ? `white` : `#D89F0E`"
              />
            </svg>
          </div>
        </div>

        <div class="pay_token" @click="selectToken = !selectToken">
          <!-- <div class="pay_token"> -->
          <div>
            <img src="~/assets/image/dashboard/pay_with_icon.svg" />
            <span>{{$t('paywith')}}</span>
          </div>
          <div class="justify-end">
            <span>{{ selectedTokenSymbol }}</span>
            <img class="token_icon" src="~/assets/image/chevron_right.svg" />
          </div>
        </div>
        <div class="pay_token">
          <div>
            <img src="~/assets/image/dashboard/creator_code_icon.svg" />
            <span>{{$t('creatorcode')}}</span>
          </div>
          <VTextField v-model="creatorCode" dark :placeholder = "$t('optionalcode')"/>
        </div>
        <div
          :class="isBoosterItem || itemType == 'plot' ? `hidden` : `pay_token`"
        >
          <div>
            <img src="~/assets/image/dashboard/gift_icon.svg" />
            <span>{{$t('giftfriend')}}</span>
          </div>
          <VTextField
            v-model="otherUser"
            dark
            :placeholder="$t('optional_address')"
          />
        </div>
        <div :class="itemType != 'Fertilizer' ? `hidden` : `pay_token`">
          <div>
            <img src="~/assets/image/dashboard/pay_with_icon.svg" />
            <div class="r_flex">{{$t('globallimit')}}</div>
          </div>
          {{createdGlobalAmount}}/{{ fertilizerGlobalLimit }}
        </div>
        <!-- <div :class="itemType != 'Fertilizer' ? `hidden` : `pay_token`">
          <div>
            <img src="~/assets/image/dashboard/gift_icon.svg" />
            <span>Node Limit:</span>
          </div>
          {{createdNodeAmount}}/{{ fertilizerNodeLimit ? fertilizerNodeLimit : 0 }}
        </div>
        <div :class="itemType != 'Fertilizer' ? `hidden` : `pay_token`">
          <div>
            <img src="~/assets/image/dashboard/gift_icon.svg" />
            <span>UserNodeType Limit:</span>
          </div>
          {{createdPerNodeTokenId ? createdPerNodeTokenId : 0}}/{{ fertilizerUserNodeTypeLimit ? fertilizerUserNodeTypeLimit : 0 }}
        </div> -->
        <VBtn
          min-width="100%"
          min-height="60px"
          radius="4px"
          color="#D89F0E"
          :loading="isBtnLoading"
          :disabled="canCreate == false && _totalBuyCounter == 0"
          @click="
            () => {
              buyListItem();
            }
          "
        >
          <span class="text_white">{{$t('buy')}}</span>
        </VBtn>
        <span class="mt-[5px] color_red">{{ error }}</span>
        <div class="wallet_balance">
          <span>{{$t('yourbalance', {token : selectedTokenSymbol})}}</span>
          <div>
            <span>{{ tokenBalance }}</span>
          </div>
        </div>
        <div class="wallet_balance">
          <span>{{$t('springrewards')}}</span>
          <div>
            <span>{{ rewardPending }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-if="!selectToken && treeRequired" class="apply_item_container">
      <div class="apply_list">
        <img
          class="arrow_icon hover:cursor-pointer"
          src="~/assets/image/green_arrow_icon.svg"
          @click="treeRequired = false"
        />
        <span>{{$t('apply')}} {{ name }}</span>
      </div>
      <div
        v-if="treenfts.length == 0"
        class="text-[#D89F0E] text-[24px] text-center"
      >
        {{$t('notree')}}
      </div>
      <div v-for="(tree, id) in treenfts" class="tree_list align-center">
        <div class="flex flex-col gap-[5px] w-[200px]">
          <div class="flex gap_5 aligins_center">
            <span>{{ tree.nodeType }}</span>
            <div v-if="tree.attribute != ''" class="tree_name">
              {{ tree.attribute }}
            </div>
          </div>
          <div>
            <span>{{$t('nftid')}} {{ getNFTID(tree.tokenId) }} </span>
          </div>
        </div>
        <div class="flex flex-col items-center gap-[7px]">
          <div class="flex gap-[5px] items-end">
            <svg
              class="hover: cursor-pointer"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              @click="onRemoveTreeCounter(id)"
            >
              <path
                d="M0 4C0 1.79086 1.79086 0 4 0H16C18.2091 0 20 1.79086 20 4V16C20 18.2091 18.2091 20 16 20H4C1.79086 20 0 18.2091 0 16V4Z"
                fill="#D89F0E"
              />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M3 10C3 9.44772 3.44772 9 4 9L16 9C16.5523 9 17 9.44772 17 10C17 10.5523 16.5523 11 16 11L4 11C3.44772 11 3 10.5523 3 10Z"
                fill="#E3FFE4"
              />
            </svg>
            <span>{{ treeBoostCounter[id] }}</span>
            <svg
              class="hover: cursor-pointer"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              @click="onAddTreeCounter(id)"
            >
              <path
                d="M0 4C0 1.79086 1.79086 0 4 0H16C18.2091 0 20 1.79086 20 4V16C20 18.2091 18.2091 20 16 20H4C1.79086 20 0 18.2091 0 16V4Z"
                fill="#D89F0E"
              />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M10 3C10.5523 3 11 3.44772 11 4V9H16C16.5523 9 17 9.44772 17 10C17 10.5523 16.5523 11 16 11H11V16C11 16.5523 10.5523 17 10 17C9.44772 17 9 16.5523 9 16V11H4C3.44772 11 3 10.5523 3 10C3 9.44771 3.44772 9 4 9L9 9V4C9 3.44772 9.44772 3 10 3Z"
                fill="white"
              />
            </svg>
          </div>
          <div class="flex items-center">
            
            <!-- <img src="~/assets/image/dashboard/spring_token.svg" /> -->
            <span>$KILL {{
              boosterItemPrice(tree, id) ? boosterItemPrice(tree, id) : 0
            }}</span>
          </div>
        </div>
      </div>
      <VBtn
        v-if="treenfts.length != 0"
        min-width="100%"
        min-height="60px"
        radius="4px"
        color="#D89F0E"
        :loading="isBtnLoading"
        :disabled="!canCreate"
        @click="treeRequired = !treeRequired"
      >
        <span class="text_white">{{$t('continue')}}({{ _totalBuyCounter }} {{$t('applied')}})</span>
      </VBtn>
    </div>
    <div v-if="selectToken && !treeRequired" class="buy_item_container">
      <div class="buy_list">
        <img
          class="green_arrow_icon"
          src="~/assets/image/green_arrow_icon.svg"
          @click="selectToken = !selectToken"
        />
        <span>{{$t('selectpaymenttype')}}</span>
      </div>
      <!-- <div class="pay_pendings">Pay With Pending Rewards</div> -->

      <div class="token_list">
        <div
          v-for="(token, i) in payWithTokens"
          :key="`${i}-${token}`"
          v-model="selectedToken"
        >
          <div v-if="token.value == selectedToken" class="selectedToken_icon">
            <div class="r_flex gap_5">
              <span> {{ token.text }} </span>
            </div>
            <img src="~/assets/image/check_icon.svg" />
          </div>
          <div
            v-else
            class="unselectedToken_icon"
            @click="tokenSelect(token.value, token.text)"
          >
            <div class="r_flex gap_5">
              <span> {{ token.text }} </span>
            </div>
            <img
              v-if="token.value == selectedToken"
              src="~/assets/image/check_icon.svg"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "nuxt-property-decorator";
import * as ethers from "ethers";
import * as NodeType from "~/models/NodeType";
import { ItemType } from "~/models/itemTypes";
import { BigNumber } from "ethers";
import {
  NAME_TO_URL,
  NODENAME_TO_IMAGE,
  NODENAME_TO_VIDEO,
  PLOT_VIDEOS,
  PLOT_IMAGES,
  BOOSITEM_VIDEOS,
  LUCKY_BOX_IMAGES
} from "~/models/constants";
import WalletReactiveFetch, {
  IReactiveFetch,
} from "~/mixins/wallet-reactive-fetch";
import addresses from "~/config/addresses";
import { BoosterItemName } from "~/models/types";

const formatEther = ethers.utils.formatEther;
const ADDRESS_REGEX = /^0x[0-9a-fA-F]{40}$/;
@Component({
  props: {
    index: { type: Number },
    name: { type: String },
    cost: [String, Number],
    dialogOpen: { type: Boolean },
    seedNFT: { type: Boolean },
    plot: { type: Boolean },
    itemType: { type: String },
  },
  watch: {
    selectedToken: { handler: "onSelectedTokenChange" },
    // isBooster: { handler: "onSelectBooster" },
  },
})
export default class BuyItem
  extends WalletReactiveFetch
  implements IReactiveFetch
{
  private quantity = 1;
  private selectedToken = addresses.Token;
  private selectedTokenSymbol = "$KILL";
  private isBtnLoading = false;
  private isOtherUser = false;
  private otherUser = "";
  private isCreatorCode = false;
  private creatorCode: string | null = null;
  private selectToken: boolean = false;
  public isBooster: boolean = false;
  public treeRequired: boolean = false;
  public headers = ["qwe", "Qweqweqweqwe", "asdasdas", "Asdasd"];
  public treeBoostCounter: any = [];
  public totalTreeTokenId: any = [];
  public selectedTreeItem: any = [];
  public slectedNodeTypeName: any = [];

  public watermItem: any = [];
  public waterlItem: any = [];
  public fertilizemItem: any = [];
  public fertilizelItem: any = [];
  public _totalBuyCounter: number = 0;

  public error: string = "";
  public tokenSelect(token, symbole) {
    this.error = "";
    this.selectedToken = token;
    this.selectToken = !this.selectToken;
    this.selectedTokenSymbol = symbole;
  }

  get image(): any {
    return (PLOT_IMAGES as any)[this.$props.name];
  }

  get video(): any {
    let url;
    const tempType = this.$props.itemType;
    switch (tempType) {
      case ItemType.seed:
        url = (LUCKY_BOX_IMAGES as any)[this.$props.name];
        break;
      // case ItemType.fertilizer:
      //   url = (BOOSITEM_VIDEOS as any)[ItemType.fertilizer];
      //   break;
      case ItemType.waterPack:
        url = (BOOSITEM_VIDEOS as any)[ItemType.waterPack];
        break;
      // case ItemType.plot:
      //   url = (PLOT_VIDEOS as any)[this.$props.name];
      //   break;
      default:
        break;
    }
    return url;
  }

  get tokenBalance() {
    const result = this.$store.getters["tokens/balanceForToken"](
      this.selectedToken
    );
    console.log(result,"!!!!!!!!")
    return result != null ? parseFloat(formatEther(result)).toFixed(3) : 0;
  }

  get rewardPending() {
    const result = this.$store.getters["nodes/totalPendingRewards"];
    return result != null ? parseFloat(formatEther(result)).toFixed(3) : 0;
  }

  get otherUserValid() {
    return ADDRESS_REGEX.test(this.otherUser);
  }

  get canCreate() {
    return (
      this.quantity >= 1 &&
      (this.isOtherUser ? ADDRESS_REGEX.test(this.otherUser) : true)
    );
  }

  get payWithTokens() {
    console.log(Object.values(this.$store.state.tokens.tokens).map((token: any) => {
      return {
        text: token.symbol,
        value: token.address,
      };
    }),"pppppppppp")
    return Object.values(this.$store.state.tokens.tokens).map((token: any) => {
      return {
        text: token.symbol,
        value: token.address,
      };
    });
  }

  get isApprove() {
    return !this.$store.getters["tokens/hasEnoughSwapperAllowance"](
      this.selectedToken,
      this.totalCost
    );
  }

  get totalCost() {
    return this.$props.cost
      ? ethers.BigNumber.from(parseInt(this.$props.cost)).mul(this.quantity)
      : ethers.BigNumber.from(0);
  }

  get luckyBox() {
    return this.$store.getters["luckyboxes/typeById"](this.$props.index);
  }

  get isBoosterItem() {
    if (
      this.$props.itemType == ItemType.waterPack ||
      this.$props.itemType == ItemType.fertilizer
    )
      this.isBooster = true;
    else this.isBooster = false;
    return this.isBooster;
  }

  get treenfts() {
    this.totalTreeTokenId = [];
    this.slectedNodeTypeName = [];
    this.$store.getters["nft/myNFTsByCreationDateDesc"].map((tree) => {
      this.totalTreeTokenId.push(tree.tokenId);
      this.slectedNodeTypeName.push(tree.nodeType);
    });
    return this.$store.getters["nft/myNFTsByCreationDateDesc"];
  }

  get waterpackType() {
    return this.$store.state.booster.waterpackTypes ?? [];
  }

  get fertilizerType() {
    return this.$store.state.booster.fertilizerType ?? [];
  }
  get boosterTotalItemPrice() {
    let totalPrice = 0;
    this.treenfts.map((tree, id) => {
      const tem = this.boosterItemPrice(tree, id)
        ? this.boosterItemPrice(tree, id)
        : 0;
      totalPrice += tem;
    });
    return totalPrice;
  }

  get fertilizerGlobalLimit() {
    const fertilizerType = this.$store.state.booster.fertilizerType ?? [];
    const result = fertilizerType.find(
      (item, id) => {
      return  item.name == this.$props.name}
    );
    if(result)
      return result.globalLimit.toNumber() ? result.globalLimit.toNumber() : 0;
    else
      return 0;
  }

  get fertilizerNodeLimit() {
    const fertilizerType = this.$store.state.booster.fertilizerType ?? [];
    const result = fertilizerType.find(
      (item, id) => {return  item.name == this.$props.name}
    );
    if(result)
      return result.nodeLimit.toNumber() ? result.nodeLimit.toNumber() : 0;
    else
      return 0
    
  }

  get fertilizerUserNodeTypeLimit() {
    const fertilizerType = this.$store.state.booster.fertilizerType ?? [];
    const result = fertilizerType.find(
      (item, id) =>  {return item.name == this.$props.name}
    );
    if(result)
      return result.userNodeTypeLimit.toNumber()
        ? result.userNodeTypeLimit.toNumber()
        : 0;
    else
      return 0;
  }

  get createdGlobalAmount() {
    return this.$store.state.booster.totalCreatedPerType;
  }

  get createdNodeAmount() {
    return this.$store.state.booster.totalCreatedPerUserPerType
  }

  get createdPerNodeTokenId() {
     return this.$store.state.booster.totalCreatedPerNodeTokenId;
  }

  get sprPrice() {
    return  this.$store.state.coingecko.price
  }

  get soundOption() {
    return this.$store.state.setting.sound_option
  }

  public boosterItemPrice(tree, id) {
    const price = parseInt(
      formatEther(
        this.$store.getters["booster/byNodetype"](
          this.$props.name,
          tree.nodeType
        )
          ? this.$store.getters["booster/byNodetype"](
              this.$props.name,
              tree.nodeType
            ).price
          : 0
      )
    );
    let itemPrice = price;
    switch (this.$props.name) {
      case BoosterItemName.waterMedium:
        itemPrice = price * this.watermItem[id];
        break;
      // case BoosterItemName.waterLarge:
      //   itemPrice = price * this.waterlItem[id];
      //   break;
      // case BoosterItemName.fertilizeMedium:
      //   itemPrice = price * this.fertilizemItem[id];
      //   break;
      // case BoosterItemName.fertilizeLarge:
      //   itemPrice = price * this.fertilizelItem[id];
      //   break;
      default:
        break;
    }
    return itemPrice;
  }

  public getNFTID(tokenId) {
    return parseInt(tokenId._hex);
  }

  public selectTree() {
    this.error = "";
    this.treeRequired = !this.treeRequired;
    this.selectToken = !this.selectedToken;
  }

  public async onApprove() {
    try {
      this.isBtnLoading = true;
      await this.$store.dispatch(
        "tokens/requestSwapperAllowance",
        this.selectedToken
      );
    } finally {
      this.isBtnLoading = false;
    }
  }
  public onRemove() {
    this.error = "";
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  public onAdd() {
    this.error = "";
    this.quantity++;
  }

  public onRemoveTreeCounter(id) {
    this.error = "";
    const temp = this.treeBoostCounter;
    if (temp[id] > 0) {
      temp[id]--;
      this.treeBoostCounter = [...temp];
    }
    switch (this.$props.name) {
      case BoosterItemName.waterMedium:
        if (this.watermItem[id] > 0) {
          const tmpwatermItemy = this.watermItem;
          tmpwatermItemy[id]--;
          this.watermItem = [...tmpwatermItemy];
          this._totalBuyCounter--;
        }

        break;
      // case BoosterItemName.waterLarge:
      //   if (this.waterlItem[id] > 0) {
      //     const tmpwaterlItem = this.waterlItem;
      //     tmpwaterlItem[id]--;
      //     this.waterlItem = [...tmpwaterlItem];
      //     this._totalBuyCounter--;
      //   }

        break;
      // case BoosterItemName.fertilizeMedium:
      //   if (this.fertilizemItem[id] > 0) {
      //     const tmpfertilizeMedium = this.fertilizemItem;
      //     tmpfertilizeMedium[id]--;
      //     this.fertilizemItem = [...tmpfertilizeMedium];
      //     this._totalBuyCounter--;
      //   }
      //   break;
      // case BoosterItemName.fertilizeLarge:
      //   if (this.fertilizelItem[id] > 0) {
      //     const tmpfertilizelItem = this.fertilizelItem;
      //     tmpfertilizelItem[id]--;
      //     this.fertilizelItem = [...tmpfertilizelItem];
      //     this._totalBuyCounter--;
      //   }
      //   break;
      default:
        break;
    }
  }

  public onAddTreeCounter(id) {
    this.error = "";
    this._totalBuyCounter++;
    const temp = this.treeBoostCounter;
    temp[id]++;
    this.treeBoostCounter = [...temp];
    switch (this.$props.name) {
      case BoosterItemName.waterMedium:
        const tmpwatermItemy = this.watermItem;
        tmpwatermItemy[id]++;
        this.watermItem = [...tmpwatermItemy];
        break;
      // case BoosterItemName.waterLarge:
      //   const tmpwaterlItem = this.waterlItem;
      //   tmpwaterlItem[id]++;
      //   this.waterlItem = [...tmpwaterlItem];
      //   break;
      // case BoosterItemName.fertilizeMedium:
      //   const tmpfertilizeMedium = this.fertilizemItem;
      //   tmpfertilizeMedium[id]++;
      //   this.fertilizemItem = [...tmpfertilizeMedium];
      //   break;
      // case BoosterItemName.fertilizeLarge:
      //   const tmpfertilizelItem = this.fertilizelItem;
      //   tmpfertilizelItem[id]++;
      //   this.fertilizelItem = [...tmpfertilizelItem];
      //   break;
      default:
        break;
    }
  }
  async onSelectedTokenChange() {
    await this.$store.dispatch("tokens/loadAllowance", this.selectedToken);
  }

  public closeDialog() {
    this.$emit("close");
  }

  public async buyListItem() {
    this.error = "";
    switch (this.$props.itemType) {
      case ItemType.seed:
        try {
          this.isBtnLoading = true;
          await this.$store.dispatch("luckyboxes/buy", {
            luckyBox: this.luckyBox,
            amount: this.quantity,
            withToken: this.selectedToken,
            user: this.otherUser ? this.otherUser : this.walletAddress,
            sponso: this.creatorCode ? this.creatorCode.trim() : null,
          });
        } catch (e : any) {
          this.error = e;
        }
        this.isBtnLoading = false;
        if (this.error == "") {
          this.$emit("close");
          this.$router.push("myCollection");
        }
        break;
      case ItemType.plot:
        try {
          this.isBtnLoading = true;
          await this.$store.dispatch("plot/buyPlot", {
            plotTypeName: this.$props.name,
            amount: this.quantity,
            withToken: this.selectedToken,
            user: this.isOtherUser ? this.otherUser : this.walletAddress,
            sponso: this.creatorCode ? this.creatorCode.trim() : null,
          });
          // this.$router.push('e/mynft')
          // this.$emit("close");
          // this.$router.push("myCollection");
        } catch (e : any) {
          this.error = e;
        }
        this.isBtnLoading = false;
        if (this.error == "") {
          this.$emit("close");
          this.$router.push("myCollection");
        }
        break;
      case ItemType.waterPack:
        try {
          this.isBtnLoading = true;
          await this.$store.dispatch("booster/buywaterpackItem", {
            withToken: this.selectedToken,
            amount:
              this.$props.name == BoosterItemName.waterMedium
                ? this.watermItem
                : this.waterlItem,
            tokenIds: this.totalTreeTokenId,
            boosterTypeName: this.$props.name,
            sponso: this.creatorCode ? this.creatorCode.trim() : null,
          });
        } catch (e : any) {
          this.error = e;
        }
        this.isBtnLoading = false;
        if (this.error == "") {
          this.$emit("close");
          this.$router.push("myCollection");
        }
        break;
      case ItemType.fertilizer:
        try {
          this.isBtnLoading = true;
          await this.$store.dispatch("booster/buyfertilizerItem", {
            withToken: this.selectedToken,
            amount:
              this.$props.name == BoosterItemName.fertilizeMedium
                ? this.fertilizemItem
                : this.fertilizelItem,
            tokenIds: this.totalTreeTokenId,
            name: this.$props.name,
            boosterTypeName: this.$props.name,
            sponso: this.creatorCode ? this.creatorCode.trim() : null,
            nodeType: this.slectedNodeTypeName,
          });
        } catch (e : any) {
          this.error = e;
        }
        this.isBtnLoading = false;
        if (this.error == "") {
          this.$emit("close");
          this.$router.push("myCollection");
        }
        break;
      default:
        break;
    }
  }

  @Watch("dialogOpen")
  public async initDialog() {
    this.quantity = 1;
    this.selectToken = false;
    this.treeRequired = false;
    this._totalBuyCounter = 0;
    this.error = "";
    await this.$store.dispatch("booster/loadBoosterPrice", {
      boostertype: this.$props.itemType,
      name: this.$props.name,
    });

    await this.$store.dispatch(
      "booster/loadTotalCreatedNodeAomunt",
      this.$props.name
    );
    // await this.$store.dispatch(
    //   "booster/loadTotalCreatedPerNodeTokenId",
    //   this.totalTreeTokenId
    // );
    await this.$store.dispatch("booster/loadBoosterItemType");

    for (let i = 0; i < this.treenfts.length; i++) {
      this.treeBoostCounter[i] = 0;
      this.watermItem[i] = 0;
      this.waterlItem[i] = 0;
      this.fertilizemItem[i] = 0;
      this.fertilizelItem[i] = 0;
    }
    this.isBooster = this.isBoosterItem;
  }

  async created() {
    for (let i = 0; i < this.treenfts.length; i++) {
      this.treeBoostCounter[i] = 0;
      this.watermItem[i] = 0;
      this.waterlItem[i] = 0;
      this.fertilizemItem[i] = 0;
      this.fertilizelItem[i] = 0;
    }
    this._totalBuyCounter = 0;
    await this.$store.dispatch(
      "booster/loadTotalCreatedNodeAomunt",
      this.$props.name
    );
    // await this.$store.dispatch(
    //   "booster/loadTotalCreatedPerNodeTokenId",
    //   this.totalTreeTokenId
    // );
    await this.$store.dispatch("booster/loadBoosterItemType");
  }

  async reactiveFetch() {
    if (this.isWalletConnected) {
      await Promise.all(
        this.payWithTokens.map(
          async (token, id) =>
            await this.$store.dispatch("tokens/loadBalance", token.value)
        )
      );
       await this.$store.dispatch(
      "booster/loadTotalCreatedNodeAomunt",
      this.$props.name
    );
    // await this.$store.dispatch(
    //   "booster/loadTotalCreatedPerNodeTokenId",
    //   this.totalTreeTokenId
    // );
    }
    await this.$store.dispatch("nft/loadMyNFTs");
    
    await this.$store.dispatch("booster/loadBoosterPrice", {
      boostertype: this.$props.itemType,
      name: this.$props.name,
    });
  }
}
</script>

<style scoped>
.buy_item_container {
  background: #001802;
}
.apply_item_container {
  background: #001802;
  padding: 26px 20px;
}
.green_arrow_icon {
  position: absolute;
  left: 24px;
  top: 30px;
}
.green_arrow_icon:hover {
  cursor: pointer;
}
.arrow_icon {
  position: absolute;
  left: 4px;
  top: 25px;
}
.buy_list {
  height: 72px;
  position: relative;
  padding: 26px 44px;
  text-align: center;
}
.apply_list {
  height: 60px;
  position: relative;
  text-align: center;
  padding: 18px 0px;
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
.tree_counter_center >>> input {
  text-align: center;
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
.tree_list {
  background: #2a4733;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  padding: 16px 20px;
  /* height: 52px; */
  margin-bottom: 5px;
}
.pay_token {
  background: #2a4733;
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
  width: 64%;
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
.pay_pendings {
  background: #D89F0E;
  width: 100%;
  padding: 20px 70px;
}
.pay_pendings:hover {
  cursor: pointer;
}
.token_list {
  padding: 24px 20px 60px 20px;
}
.token_list > div {
  display: flex;
  padding: 3px;
  justify-content: space-between;
  padding: 16px 0px;
}
.token_list > div:hover {
  cursor: pointer;
}
.selectedToken_icon {
  background: #2a4733;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 16px 20px;
}
.unselectedToken_icon {
  padding: 0px 20px;
  width: 100%;
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
.node-video {
  width: 100%;
  height: 280px;
  border-radius: 14px;
  object-fit: cover;
}
.v-text-field input {
  text-align: center !important;
  color: white !important;
}

.counter_btn {
  width: 20px;
  height: 20px;
  background: #D89F0E;
  border-radius: 4px;
  align-items: center;
}
.text_white {
  color: white !important;
}
.tree_name {
  width: 80px;
  height: 14px;
  background: #fcd34d;
  border-radius: 2px;
  color: #d97706;
  padding: 0px 3px;
  align-items: center;
  font-size: 10px;
  text-align: center;
}
.color_red {
  color: red;
}
@media only screen and (max-width: 600px) {
  .token_list {
    height: 100vh;
  }
  .apply_item_container {
    height: 100vh;
  }
  .node-image {
    width: 100%;
  }
}

/* .token_list_icon {
  display: flex;
  gap: 4px;
} */
</style>
