<template>
  <div class="booster_card">
    <img
      v-if="isWaterPack"
      src="~/assets/image/dashboard/ammo.png"
      class="booster-image"
      alt=""
    />
    <!-- <img
      v-else
      src="~/assets/image/dashboard/fertilpack.svg"
      class="booster-image"
      alt=""
    /> -->

    <span class="card_name">{{ $t(boostItem.name) }}</span>

    <span v-if="isWaterPack" class="card_description">
      {{$t('boosterdesc1',[$t(boostItem.name),ratioGRP])}}
      </span>
    <span v-else class="card_description">
      {{$t('fertilizerbooster',[rewardBoost])}}
    </span>
    <v-dialog v-model="boosterBuyDailog" width="375" class="buy_dialog_desktop">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          dark
          x-large
          elevation="0"
          class="btn_wrapper buy_dialog_desktop"
          v-bind="attrs"
          v-on="on"
        >
          <span class="btn_color">{{$t('buy')}}</span>
        </v-btn>
      </template>
      <BuyItem
        :name="boostItem.name"
        :dialogOpen="boosterBuyDailog"
        :itemType="selectedBoosterType"
        @close="() => (boosterBuyDailog = false)"
      />
    </v-dialog>
        <v-dialog v-model="boosterBuyDailog1" fullscreen class="buy_dialog_mobile">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          dark
          x-large
          elevation="0"
          class="btn_wrapper buy_dialog_mobile"
          v-bind="attrs"
          v-on="on"
        >
          <span class="btn_color">Buy</span>
        </v-btn>
      </template>
      <BuyItem
        :name="boostItem.name"
        :dialogOpen="boosterBuyDailog"
        :itemType="selectedBoosterType"
        @close="() => (boosterBuyDailog1 = false)"
      />
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "nuxt-property-decorator";
import * as eth from "ethers";
import * as NodeType from "~/models/NodeType";
import { NAME_TO_URL, NODENAME_TO_IMAGE } from "~/models/constants";
import { ItemType } from "~/models/itemTypes";
const formatEther = eth.utils.formatEther;

@Component({
  props: {
    boostItem: Array as () => String[],
    isWaterPack: { type: Boolean },
  },
})
export default class NodeNft extends Vue {
  public boosterBuyDailog: boolean = false;
  public boosterBuyDailog1: boolean = false;

  get durationEffect() {
    return parseInt(this.$props.boostItem.durationEffect._hex);
  }

  get ratioGRP() {
    return parseInt(this.$props.boostItem.ratioOfGRP._hex) / 100;
  }

  get rewardBoost() {
    return parseInt(this.$props.boostItem.rewardBoost._hex) / 100;
  }

  get selectedBoosterType() {
    return this.$props.isWaterPack ? ItemType.waterPack : ItemType.fertilizer;
  }

  get nodeType() {
    return this.$store.getters["nodes/nodeTypeByName"](this.$props.name);
  }

  get dailyEarnings() {
    return parseFloat(
      formatEther(NodeType.dailyRewardPerNode(this.nodeType))
    ).toFixed(2);
  }

  get cost() {
    return formatEther(this.nodeType.cost);
  }

  get claimTax() {
    return this.nodeType.claimTax;
  }

  get globalTax() {
    return this.nodeType.globalTax;
  }

  public translate(card_name) {
    console.log(card_name,"card_name");
    console.log(this.$t(card_name), "card_name_tran");
    return this.$t(card_name);
  }
}
</script>

<style scoped>
.booster-image {
  width: 180px;
  height: 150px;
  margin-left: auto;  
  margin-right: auto;  
}
.booster_card {
  text-align: center;
  display: flex;
  flex-direction: column;
  background: #2a4733;
  border: 2px solid #557a60;
  border-radius: 24px;
  padding: 24px;
  gap: 16px;
  width: 354px;
}
.card_name {
  font-size: 16px;
}
.card_description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}
.card_price {
  color: #D89F0E;
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
.buy_dialog_desktop {
  display: block;
}
.buy_dialog_mobile {
  display: none;
}
@media only screen and (max-width: 600px) {
  .booster_card {
    width: 100%;
  }
    .buy_dialog_desktop {
    display: none !important ;
  }
    .buy_dialog_mobile {
    display: block;
  }
}
</style>
