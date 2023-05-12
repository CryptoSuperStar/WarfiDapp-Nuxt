<template>
  <div v-if="loadingData" class="main_container">
    <div class="main_title flex justify-between">
      <div>{{$t('presale_mystery')}}</div>
      <div v-if="whitelisted" class="flex justify-end">
        <img src="~/assets/image/verified-badge.svg" alt="">
        <span>{{$t('whitelist')}}</span>
      </div>
    </div>    
    <div @click="openPreOrder">{{$t('open_preorder')}}</div>
     <div class="node_data">
      <DataTable
        v-for="(item, i) in protocolStats"
        :key="i"
        :title="item.title"
        :icon="item.icon"
        :price="item.price"
        :percentage="item.percentage"
        :perUserTVL="maxUserTVL"
      />
    </div>
    <div class="seed_data">
      <SeedTablePreSale
        v-for="(item, index) of orderItemList"
        :key="`${item.name}-${index}`"
        :index="index"
        :name="item.name"
        :regularCost="item.priceRegular"
        :whitelistCost="item.priceWhitelisted"
        :dropRate="seedDropRate[index]"
      />
    </div>
  </div>
  <div v-else>
    <v-container style="height: 400px;">
      <v-row
        class="fill-height"
        align-content="center"
        justify="center"
      >
        <v-col
          class="text-subtitle-1 text-center"
          cols="12"
        >
          {{$t('getting_data')}}
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

</template>

<script lang="ts">
import { Component } from 'nuxt-property-decorator';
import WalletReactiveFetch, { IReactiveFetch } from '~/mixins/wallet-reactive-fetch';

import addresses from '~/config/addresses';
import { LuckyBoxType } from '~/models/luckybox-type';
@Component
export default class presale extends WalletReactiveFetch implements IReactiveFetch  {
  public loadingData : boolean = false;
  public connectWallet : boolean = false;
  public whitelisted : boolean = false;
  get seedDropRate() {
    return [
      [
        {
          seed:'Black Infantry',
          rate: 75
        },{
          seed:'Silver Infantry',
          rate: 15
        },{
          seed:'Gold Infantry',
          rate: 10
        },{
          seed:'Ruby Infantry',
          rate: 5
        }
      ],[
      {
          seed:'Black Rocketeer',
          rate: 75
        },{
          seed:'Silver Rocketeer',
          rate: 15
        },{
          seed:'Gold Rocketeer',
          rate: 10
        },{
          seed:'Ruby Rocketeer',
          rate: 5
        }
      ],[
      {
          seed:'Black Heavy Gunner',
          rate: 75
        },{
          seed:'Silver Heavy Gunner',
          rate: 15
        },{
          seed:'Gold Heavy Gunner',
          rate: 10
        },{
          seed:'Ruby Heavy Gunner',
          rate: 5
        }
      ],[
      {
          seed:'Black Sniper',
          rate: 75
        },{
          seed:'Silver Sniper',
          rate: 15
        },{
          seed:'Gold Sniper',
          rate: 10
        },{
          seed:'Ruby Sniper',
          rate: 5
        }
      ]
    ]
  }
  get protocolStats () {
    return [
      {
        title: this.$t('sprprice'),
        price: '$1',
      },
      {
        title: this.$t('totaldeposit'),
        price: this.$store.state.presale.totalLockedValue ? this.$store.state.presale.totalLockedValue : 0 ,
      },
      {
        icon: require('../assets/image/dashboard/market_cap.svg'),
        title: this.$t('mydeposit'),
        price: this.isWalletConnected ? this.$store.state.presale.lockedValueByUser : 0,
      },
    ];
  }

  get orderItemList () { 
    return this.$store.state.presale.orderItemView ?? [];
  }

  get maxUserTVL() {
    if(this.whitelisted)
      return this.$store.state.presale.whitelistedTVL ? this.$store.state.presale.whitelistedTVL : 0
    else
      return this.$store.state.presale.regularTVL ? this.$store.state.presale.regularTVL : 0
  }

  public openPreOrder() {
      this.$store.dispatch('presale/openPreOrder');
  }
  async reactiveFetch () {    
    this.loadingData = true;

    await Promise.all([
      this.$store.dispatch('coingecko/loadCoinData'),
      this.$store.dispatch('presale/loadTotalLockedValue'),
      this.$store.dispatch('presale/loadOrderItemView'),
      this.$store.dispatch('presale/loadUserMaxTVL'),
      
    ]);

    if(this.isWalletConnected)
    {   
      this.whitelisted = await this.$store.dispatch('presale/whitelisted')
      await this.$store.dispatch('presale/loadLockedValueByUser')      
    }
      
  }

   created () {
    const interval = setInterval(() => {
      this.$fetch()
    }, 10000)

    this.$once('hook:beforeDestroy', () => {
      clearInterval(interval)
    })
  }
  
}
</script>
<style scoped>
.main_container {
  padding: 64px 200px;
  max-width: 1920px;
}
.main_title {
  font-size: 24px;
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
.title_description {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 16px;
  width: 45%;
}
.seed_data {
  display: flex;
  flex-direction: column;
  gap: 64px;
  margin-top: 64px;
}

@media only screen and (max-width: 600px) {
  .main_container {
    padding: 64px 20px 81px 20px;
  }

  .seed_data {
    margin-top: 32px;
  }
  .node_data{
    margin-bottom: 56px;
  }
  .title_description {
    width: 100%;
  }
}
</style>
