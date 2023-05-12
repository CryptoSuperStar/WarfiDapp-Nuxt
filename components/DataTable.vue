<template>
  <v-card
    class="card_container"
  >
    <v-card-title class="card">
        <img class="img_icon" alt="">
        <div class="card_title">
            <span class="title">{{ _title }}</span>
            <!-- <span>{{ _price}}</span> -->
            <span class="price" v-if="_title == this.$t('mydeposit')" >{{ _price}}/{{_maxUserTVL}}</span>
            <span v-else class="price">{{ _price}}</span>
        </div>

    </v-card-title>
  </v-card>
</template>
<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';
import * as eth from 'ethers';
import { BigNumber } from 'ethers';

@Component({
  props: {
    title: {
      type: String,
      required: true,
    },
    // icon: {
    //   type: String,
    //   required: true,
    // },
    price: {
      type: [String,Number, BigNumber],
    },
    perUserTVL : { type: BigNumber },
  },
})
export default class DataTable extends Vue {
  get _title () {
    return this.$props.title;
  }

  // get _icon () {
  //   return this.$props.icon;
  // }

  get _price () {
    if (BigNumber.isBigNumber(this.$props.price)) {
      return eth.utils.formatEther(this.$props.price);
    }

    return this.$props.price;
  }

  get _maxUserTVL () {
    return eth.utils.formatEther(this.$props.perUserTVL)
  }
  get _percentage () {
    return this.$props.percentage;
  }
}
</script>
<style scoped>
.card_container {
  background: rgba(255, 255, 255, 0.1);;
  box-shadow: inset 0px 0px 16px 4px rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  flex: 1;
  height: 72px;
  border: unset;
  min-width: 130px;
}
.img_icon {
  background: rgba(0, 24, 2, 0.5);
  border-radius: 4px;
  padding: 8px;
  margin-right: 8px;
}
.card {
  /* display: flex;
  flex-wrap: wrap; */
  line-height: 24px !important;
  min-width: 100px;
  flex-wrap: nowrap;
}
.card_title {
  display: flex;
  flex-direction: column;
}
.title {
  color:  rgba(255, 255, 255, 0.7) !important;
  font-size: 12px !important;
  line-height: 10px !important;
}
.price {
  color: white !important;
  font-size: 16px !important;
}

@media only screen and (max-width: 600px) {
  .v-card__title {
    padding: 12px !important;
  }
  .card_container {
    height: 68px;
  }

}

@media only screen and (max-width: 390px) { 
    .card_container {
    min-width: 150px;
  }
}
</style>
