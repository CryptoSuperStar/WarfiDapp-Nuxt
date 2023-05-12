<template>
  <v-dialog
    v-model="dialog"
    width="375"
  >
    <template #activator="{ on, attrs }">
      <div class="btn_container ">
        <div v-if="!isLoggedIn" class="mt-0">
          <v-btn
            x-large
            elevation="0"
            v-bind="attrs"
            v-on="on"
            class="btn_wrapper"
          >
            <span class="btn_color">{{$t('connectwallet')}}</span>
          </v-btn>
        </div>
        <div v-if="isLoggedIn" class="mt-0">
          <v-btn
            x-large
            elevation="0"
            v-bind="attrs"
            class="btn_wrapper"
            @click="logout"
          >
            <div class="flex flex-row justify-center mx-[34px] normal-case">
              <img class="mr-[10px]" :src="require('../assets/img/wallet.svg')" alt="">
              <span class="text-[14px] text-white py-[12px] font-semibold cursor-pointer">{{ walletAddress.slice(0, 5) + '...'+ walletAddress.slice(-4, walletAddress.length) }}</span>
            </div>
          </v-btn>
        </div>
      </div>
    </template>

    <v-card class="bg-[#001802] rounded-[4px] border-[0]">
      <div class="text-center text-white rounded-[50px] px-[10px] py-[20px]">
        <v-card-text>
          <div class="text-[24px] mb-[10px] font-bold">
            {{ $t("connectwallet") }}
          </div>
        </v-card-text>
        <v-btn
          x-large
          class="bg-[#D89F0E] relative justify-start mb-[10px] text-[20px] rounded-[4px]  w-[280px] normal-case"
          @click="requestMetamask"
        >
          <img class="w-[32px] h-[32px] mr-[10px]" src="~/assets/img/metamask-logo.svg"><span class="text-white">
            {{$t('metamask')}}</span><img
            class="absolute right-[-15px]"
            src="~/assets/img/fleche-wallet.svg"
          >
        </v-btn>

        <v-btn
          x-large
          class="bg-[#D89F0E] relative justify-start mb-[10px] text-[20px] rounded-[4px] w-[280px] normal-case"
          @click="requestWalletConnect"
        >
          <img class="w-[32px] h-[32px] mr-[10px]" src="~/assets/img/walletconnect.svg"><span class="connection_color">
            {{$t('walletconnect')}}</span><img
            class="absolute right-[-15px]"
            src="~/assets/img/fleche-wallet.svg"
          >
        </v-btn>
      </div>
      <v-divider />
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import { Component } from 'nuxt-property-decorator';
import WalletReactiveFetch, {IReactiveFetch}  from '~/mixins/wallet-reactive-fetch';

@Component
export default class ConnectionBtn extends WalletReactiveFetch implements IReactiveFetch  {
  private isTestnet = false;
  private isBtnLoading = false;

  created () {
    this.isTestnet = !!process.env.isTestnet;
  }

  // get canMintPolar () {
  //   return !this.$store.state.tokens.gotToken;
  // }

  get walletAddress () {
    return this.$store.getters['wallet/address'];
  }

  get isLoggedIn () {
    return this.$store.getters['wallet/hasAddress'];
  }

  private dialog = false;

  logout () {
    if (this.$store.getters['wallet/isConnected']) {
      this.$store.dispatch('wallet/logout');
    }
  }

  async requestMetamask () {
    try {
      await this.$store.dispatch('wallet/requestMetamask');
    } finally {
      this.dialog = false;
    }
  }

  async requestWalletConnect () {
    try {
      await this.$store.dispatch('wallet/requestWalletConnect');
    } finally {
      this.dialog = false;
    }
  }

  async mintPolar () {
    try {
      this.isBtnLoading = true;
      await this.$store.dispatch('tokens/getPolarToken');
    } finally {
      this.isBtnLoading = false;
    }
  }

  async reactiveFetch () {
    // if (this.isLoggedIn) {
    //   await this.$store.dispatch('tokens/fetchGotToken');
    // }
  }
}
</script>
<style scoped>

.btn_wrapper{
  background: #D89F0E !important;
  padding: 10px 16px 10px 16px;
  border-radius: 4px;
  height: 40px !important;
}
.btn_wrapper > span {
  color: white;
  font-size: 14px;
}
.btn_color {
  color: white;
}
.connection_color {
  color: white !important;
}
.btn_container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 24px;
    gap: 16px
}
@media only screen and (max-width: 600px) {
  .btn_wrapper{
    min-width: 335px !important
  }
  .btn_container {
    margin-top: 5px;
  }
}
</style>
