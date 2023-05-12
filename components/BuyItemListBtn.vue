<template>
  <div v-if="isLoggedIn">
    <div
      class="btn_container"
    >
      <div class="mt-0">
        <v-btn
          dark
          x-large
          elevation="0"
          class="btn_wrapper buy_dialog_desktop"
          @click="dialog = !dialog"
        >
          <span class="btn_color">{{$t('buyitem')}}</span>
        </v-btn>
        <v-btn
          dark
          x-large
          elevation="0"
          class="btn_wrapper buy_dialog_mobile"
          @click="clickBuyItem_mini"
        >
          <span class="btn_color">{{$t('buyitem')}}</span>
        </v-btn>
      </div>
    </div>
    <v-dialog v-model="dialog" width="375">
      <v-tabs background-color="#001802" color="white">
        <v-tabs-slider color="unset"></v-tabs-slider>
        <v-tab v-for="item in tabItems" :key="item">
          {{ $t(item) }}
        </v-tab>
        <v-tab-item>
          <div class="item_content buy_dialog_desktop">
            <span
              v-for="(item, id) in luckyBoxesList"
              :key="`${item.name}-${id}`"
              @click="selectedItem(item, id, `mysterySeed`)"
              >{{ $t(item.name) }}</span
            >
          </div>
        </v-tab-item>
        <v-tab-item>
          <div class="item_content buy_dialog_desktop">
            <span
              v-for="(item, id) in waterpackType"
              :key="`${item.name}-${id}`"
              @click="selectedItem(item, id, `Waterpack`)"
              >{{$t('waterpackstr')}} {{ $t(item.name) }}</span
            >
            <span
              v-for="(item, id) in fertilizerType"
              :key="`${item.name}-${id}`"
              @click="selectedItem(item, id, `Fertilizer`)"
              >{{$t('fertilizerstr')}} {{ $t(item.name) }}</span
            >
          </div>
        </v-tab-item>
        <v-tab-item>
          <div class="item_content buy_dialog_desktop">
            <span
              v-for="(item, id) in plotList"
              :key="`${item.name}-${id}`"
              @click="selectedItem(item, id, `plot`)"
              >{{ $t(item.name) }}</span
            >
          </div>
        </v-tab-item>
      </v-tabs>
    </v-dialog>
    <v-dialog v-model="dialog1" fullscreen>
      <v-tabs background-color="#001802" color="white">
        <v-tabs-slider color="unset"></v-tabs-slider>
        
        <v-tab v-for="item in tabItems" :key="item">
          {{ $t(item) }}
        </v-tab>
     
        <v-tab-item>
        <div class="resourece_list" @click="()=>{dialog1 = !dialog1}" ><img class="arrow_icon" src="~/assets/image/arrow_icon.svg" alt="">Back
        </div>
          <div class="item_content">
            <span
              v-for="(item, id) in luckyBoxesList"
              :key="`${item.name}-${id}`"
              @click="selectedItem_mini(item, id, `mysterySeed`)"
              >{{ $t(item.name) }}</span
            >
          </div>
        </v-tab-item>
        <v-tab-item>
          <div class="resourece_list" @click="dialog1 = !dialog1" ><img class="arrow_icon" src="~/assets/image/arrow_icon.svg" alt="">Back
        </div>
          <div class="item_content">
            <span
              v-for="(item, id) in waterpackType"
              :key="`${item.name}-${id}`"
              @click="selectedItem_mini(item, id, `Waterpack`)"
              >{{ $t(item.name) }}</span
            >
            <span
              v-for="(item, id) in fertilizerType"
              :key="`${item.name}-${id}`"
              @click="selectedItem_mini(item, id, `Fertilizer`)"
              >{{ $t(item.name) }}</span
            >
          </div>
        </v-tab-item>
        <v-tab-item>
          <div class="resourece_list" @click="dialog1 = !dialog1" ><img class="arrow_icon" src="~/assets/image/arrow_icon.svg" alt="">Back
        </div>
          <div class="item_content">
            <span
              v-for="(item, id) in plotList"
              :key="`${item.name}-${id}`"
              @click="selectedItem_mini(item, id, `plot`)"
              >{{ $t(item.name) }}</span
            >
          </div>
        </v-tab-item>
      </v-tabs>
    </v-dialog>

    <v-dialog v-model="dialog2" width="375">
      <BuyItem
        :index="selectedItemIndex"
        :name="itemselected.name"
        :cost="orderCost"
        :dialogOpen="dialog2"
        :itemType="selectedItemType"
        class="buy_dialog_desktop"
        @close="() => (dialog2 = false)"
      />
    </v-dialog>
    <v-dialog v-model="dialog3" fullscreen>
      <BuyItem
        :index="selectedItemIndex"
        :name="itemselected.name"
        :cost="orderCost"
        :dialogOpen="dialog3"
        :itemType="selectedItemType"
        class="buy_dialog_mobile"
        @close="() => (dialog3 = false)"
      />
    </v-dialog>
  </div>
</template>
<script lang="ts">
import { Component } from "nuxt-property-decorator";
import { ItemType} from "~/models/itemTypes"
import WalletReactiveFetch, {
  IReactiveFetch,
} from "~/mixins/wallet-reactive-fetch";
import * as ethers from "ethers";
const formatEther = ethers.utils.formatEther;
@Component
export default class BuyItemListBtn
  extends WalletReactiveFetch
  implements IReactiveFetch
{
  private dialog = false;
  private dialog1 = false;
  private dialog2 = false;
  private dialog3 = false;
  private itemSelected = false;
  private selectedItemIndex: number = 0;
  public itemselected: any = [];
  public whitelisted: boolean = false;
  public tabItems =  ['mysteryseeds', 'items', 'plots'];;
  public selectedItemType = "";
  public orderCost = 0;

  mounted() {
    this.$i18n.locale = localStorage.getItem('locale') ?? 'en';    
  }

  public selectedItem(item, index, itemType) {
    this.dialog2 = !this.dialog2;
    this.dialog = false;
    this.dialog1 = false;
    this.itemselected = item;
    this.selectedItemIndex = index;

    this.selectedItemType = itemType;
    if(itemType == ItemType.fertilizer|| itemType == ItemType.waterPack)
      this.orderCost = 0;
    else
      this.orderCost = parseInt(formatEther(item.price? item.price : 0));
  }
  public selectedItem_mini(item, index, itemType) {

    this.dialog3 = !this.dialog3;
    this.dialog = false;
    this.dialog1 = false;
    this.dialog2 = false;
    this.itemselected = item;
    this.selectedItemIndex = index;

    this.selectedItemType = itemType;
    if(itemType == ItemType.fertilizer|| itemType == ItemType.waterPack)
      this.orderCost = 0;
    else
      this.orderCost = parseInt(formatEther(item.price? item.price : 0));
  }
  public clickBuyItem_mini() {
    this.dialog1 = !this.dialog1;
    this.$emit("hiddenBtn");
  }

  dialogBack() {
    this.dialog1 = false;
    this.$emit("showbtn");
  }

  get isLoggedIn() {
    return this.$store.getters["wallet/hasAddress"];
  }

  get plotList() {
    return this.$store.state.plot.plotTypes ?? [];
  }

  get luckyBoxesList() {
    return this.$store.state.luckyboxes.luckyBoxTypes ?? [];
  }

  get waterpackType() {
    return this.$store.state.booster.waterpackTypes ?? [];
  }

  get fertilizerType() {
    return this.$store.state.booster.fertilizerType ?? [];
  }

  get nodeType() {
    return this.$store.getters["nodes/nodeTypeByName"](this.$props.name);
  }

  async reactiveFetch() {
    await Promise.all([
      this.$store.dispatch("coingecko/loadCoinData"),
      this.$store.dispatch("luckyboxes/loadLuckyBoxTypes"),
      this.$store.dispatch("plot/loadPlotTypes"),
      this.$store.dispatch("plot/loadTotalPlot"),
    ]);
    if (this.isWalletConnected)
      await this.$store.dispatch("nodes/loadNodeTypes");
  }
}
</script>
<style scoped>
.item_container {
  background: #001802;
}
.item_list {
  height: 68px;
  position: relative;
  padding: 26px 44px;
  text-align: center;
}
.resourece_list {
  background: #D89F0E;
  height: 40px;
  padding: 10px 20px;
  display: flex;
  gap: 8px;
}
.item_content {
  background: #001802;
  display: flex;
  flex-direction: column;
  padding: 40px;
  gap: 40px;
  color: white;
}
.item_content :hover {
  cursor: pointer;
  color: #D89F0E;
}
.btn_wrapper {
  background: #D89F0E !important;
  padding: 10px 16px 10px 16px;
  border-radius: 4px;
  height: 40px !important;
}
.btn_container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 24px;
  gap: 16px
}
.buy_dialog_mobile {
  display: none;
}

.v-tab {
  color: #557a60 !important;
  width: 100% !important;
  background: #2a4733;
}
.v-tab--active {
  color: #D89F0E !important;
  background: #001802 !important;
}
@media only screen and (max-width: 600px) {
  .buy_dialog_mobile {
    display: block;
  }
  .item_select_mini {
    display: flex;
  }
  .buy_dialog_desktop {
    display: none;
  }
  .btn_wrapper {
    min-width: 335px !important;
  }
  .item_container {
    height: 100%;
  }
  .v-tabs-bar {
    height: 100px !important;
  }
  .item_content {
    height: 100vh;
  }
  .btn_container {
    margin-top: 5px;
  }


}
</style>
