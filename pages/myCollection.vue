 <template>
  <div v-if="loadingData" class="main_container">
    <span class="main_title">{{$t('mycollection')}}</span>

    <div class="node_data">
      <DataTable
        v-for="(item, i) in protocolStats"
        :key="`${item.title}-${i}`"
        :title="item.title"
        :icon="item.icon"
        :price="item.price"
        :percentage="item.percentage"
      />
    </div>
    <v-tabs color="unset" background-color="unset" @change="tabChanged">
      <v-tabs-slider color="#D89F0E"></v-tabs-slider>
      <v-tab>
        <div class="flex justify-center">
          <span
            :class="!treesTab ? 'text-[white]' : `text-[#D89F0E]`"
            style="margin-left: 6px"
            >{{$t('mytree')}}</span
          >
        </div>
      </v-tab>
      <!-- <v-tab>
        <div class="flex justify-center">
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15.6667 0.666687H2.33335C1.41669 0.666687 0.666687 1.41669 0.666687 2.33335V15.6667C0.666687 16.5834 1.41669 17.3334 2.33335 17.3334H15.6667C16.5834 17.3334 17.3334 16.5834 17.3334 15.6667V2.33335C17.3334 1.41669 16.5834 0.666687 15.6667 0.666687ZM2.33335 2.33335H5.66669V10.6667H2.33335V2.33335ZM2.33335 15.6667V12.3334H5.66669V15.6667H2.33335ZM15.6667 15.6667H7.33335V7.33335H15.6667V15.6667ZM15.6667 5.66669H7.33335V2.33335H15.6667V5.66669Z"
              :fill="treesTab ? 'white' : '#D89F0E'"
              fill-opacity="0.7"
            />
          </svg>
          <span
            :class="treesTab ? 'text-[white]' : `text-[#D89F0E]`"
            style="margin-left: 6px"
            >{{$t('myplot')}}</span
          >
        </div>
      </v-tab> -->
      <v-tab-item class="tab_color">
        <MyCollectionTable :seeds="luckyBoxes" :nfts="treenfts" :preorderList="preSaleList"/>
      </v-tab-item>
      <!-- <v-tab-item class="tab_color">
        <v-row>
          <v-col
            v-for="(plot, id) in plotList"
            :key="`${id}`"
            cols="12"
            md="4"
            lg="3"
            @click="selectPlot(plot)"
          > 
            <div class="hover: cursor-pointer">
              <img  class="node-video buy_dialog_mobile" :src="image(plot.plot.name)" alt="">
              <div v-if="soundOption == 'ON'">
                <img v-if="plot.plot.name == 'Genesis'" class="node-video buy_dialog_desktop" :src="image(plot.plot.name)" alt="">
                <video
                  v-else
                  class="node-video buy_dialog_desktop"
                  autoplay loop webkit-playsinline playsinline
                >
                  <source :src="video(plot.plot.name)" type="video/mp4" />
                  {{$t('videotag')}}
                </video>
              </div>
              <div v-if="soundOption == 'OFF'">
                <img v-if="plot.plot.name == 'Genesis'" class="node-video buy_dialog_desktop" :src="image(plot.plot.name)" alt="">
                <video
                  v-else
                  class="node-video buy_dialog_desktop"
                  autoplay loop muted webkit-playsinline playsinline
                >
                  <source :src="video(plot.plot.name)" type="video/mp4" />
                  {{$t('videotag')}}
                </video>
              </div>

              
              <div class="flex justify-between mt-[8px]">
                <span>{{ $t(plot.plot.name) }}#{{plot.tokenId}}</span>
                <div class="flex justify-end align-center gap-2">
                  <svg
                    width="11"
                    height="12"
                    viewBox="0 0 11 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4.66656 12V9.16C4.35323 9.27333 4.0199 9.33333 3.66656 9.33333C1.9999 9.33333 0.666565 8 0.666565 6.33333C0.666565 5.48667 0.999898 4.72667 1.57323 4.18C1.4199 3.82 1.33323 3.42 1.33323 3C1.33323 1.33333 2.66656 0 4.33323 0C5.37323 0 6.29323 0.533333 6.83323 1.33333C6.88657 1.33333 6.9399 1.33333 6.9999 1.33333C7.48141 1.33333 7.95821 1.42817 8.40307 1.61244C8.84793 1.79671 9.25214 2.06679 9.59262 2.40728C9.93311 2.74776 10.2032 3.15197 10.3875 3.59683C10.5717 4.04169 10.6666 4.51849 10.6666 5C10.6666 5.48151 10.5717 5.95831 10.3875 6.40317C10.2032 6.84803 9.93311 7.25224 9.59262 7.59273C9.25214 7.93321 8.84793 8.20329 8.40307 8.38756C7.95821 8.57183 7.48141 8.66667 6.9999 8.66667C6.66656 8.66667 6.33323 8.62 5.9999 8.52667V12H4.66656Z"
                      fill="#D89F0E"
                    />
                  </svg>
                  <span
                    >{{ currentTreeCounter(plot) }}/{{
                      plot.plot.maxNodes
                    }}
                    {{$t('trees')}}</span
                  >
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-tab-item> -->
    </v-tabs>
    <!-- <PlotNFTDetails
      :detail_dialog="detail_plot"
      :plotNFT="selectedPlot"
      @close="closePlot"
    /> -->
  </div>
  <div v-else>
    <v-container style="height: 400px">
      <v-row class="fill-height" align-content="center" justify="center">
        <v-col
          class="text-subtitle-1 text-center"
          cols="12"
        >
          {{$t('getcollection')}}
        </v-col>
        <!-- <v-col v-else class="text-subtitle-1 text-center" cols="12">
          Please Connect your wallet for getting collection
        </v-col>  -->
         <!-- <v-col cols="6">
          <v-progress-linear
            color="deep-purple accent-4"
            indeterminate
            rounded
            height="6"
          ></v-progress-linear>
        </v-col> -->
      </v-row>
    </v-container>
  </div> 
</template>

<script lang="ts">
import { Component } from "nuxt-property-decorator";
import WalletReactiveFetch, {
  IReactiveFetch,
} from "~/mixins/wallet-reactive-fetch";
import addresses from "~/config/addresses";
// import { Plot } from "~/models/plot";
import {
  NAME_TO_URL,
  NODENAME_TO_IMAGE,
  NODENAME_TO_VIDEO,
  // PLOT_VIDEOS,
  BOOSITEM_VIDEOS,
  LUCKY_BOX_VIDEOS,
  LUCKY_BOX_IMAGES,
  // PLOT_IMAGES

} from "~/models/constants";

const formatEther = ethers.utils.formatEther;
import * as ethers from "ethers";
@Component
export default class Mynft
  extends WalletReactiveFetch
  implements IReactiveFetch
{
  private loadingData: boolean = false;
  private walletConnect: boolean = false;
  private treesTab: boolean = false;
  // public detail_plot: boolean = false;
  // public selectedPlot: Plot | object = {};
  public totalTreeTokenId : any = [];

  mounted() {
    this.$i18n.locale = localStorage.getItem('locale') ?? 'en';
  }

  onScrollToTable() {
    const el = this.$refs.table;

    if (el) {
      (el as any).scrollIntoView({ behavior: "smooth" });
    }
  }

  get protocolStats() {
    return [
      {
        icon: require("../assets/image/dashboard/total_trees.svg"),
        title: this.$t('mytree'),
        price: this.treenfts.length,
        percentage: this.$store.state.coingecko.percentage24h,
      },
      // {
      //   icon: require("../assets/image/dashboard/total_plots.svg"),
      //   title: this.$t('myplot'),
      //   price: this.$store.state.plot.myPlot ? this.$store.state.plot.myPlot.length : 0,
      //   percentage: null,
      // },
      {
        icon: require("../assets/image/dashboard/gift_icon_yellow.svg"),
        title: this.$t('pending_rewards'),
        price: this.$store.getters["nodes/totalPendingRewards"] ?  parseFloat(formatEther(this.$store.getters["nodes/totalPendingRewards"])).toFixed(3) : 0,
        percentage: null,
      },
      {
      //   icon: require("../assets/image/dashboard/gift_icon_yellow.svg"),
      //   title: this.$t('rewardsperday'),
      //   price: this.$store.getters["nodes/totalPendingRewards"] ?  parseFloat(formatEther(this.$store.getters["nodes/totalPendingRewards"])).toFixed(3) : 0,
      //   percentage: null,
      // },
      // {
        title: this.$t('spring_balance'),
        price: this.$store.getters["tokens/balanceForToken"](addresses.Token) ? parseFloat(formatEther(this.$store.getters["tokens/balanceForToken"](addresses.Token))).toFixed(3) : 0,
        percentage: null,
      },
    ];
  }

  // public selectPlot(plot) {
  //   this.detail_plot = !this.detail_plot;
  //   this.selectedPlot = plot;
  // }

  get preOrderItemList() {
    return this.$store.state.presale.myPreOrderList ?? [];
  }

  get luckyBoxes() {
    return this.$store.state.luckyboxes.myLuckyBoxes ?? [];
  }

  get preSaleList() {
    return this.$store.state.presale.myPreOrderList ?? [];
  }

  // get plotList() {
  //   return this.$store.state.plot.myPlot ?? [];
  // }

  get treenfts() {
    this.totalTreeTokenId = [];
    const result = this.$store.getters["nft/myNFTsByCreationDateDesc"];
    result.map((data, id) => {
      this.totalTreeTokenId.push(data.tokenId)
    })
    return result;
  }

  get soundOption() {
    console.log(this.$store.state.setting.sound_option,"this.$store.state.setting.sound_option")
    return this.$store.state.setting.sound_option
  }

  // public video (collection) {
  //   return (PLOT_VIDEOS as any)[collection];
  // }

  // public image (collection) {
  //   return (PLOT_IMAGES as any)[collection];
  // }

  public tabChanged() {
    this.treesTab = !this.treesTab;
  }

  // public currentTreeCounter(plot) {
  //   return plot.treeNodes.length;
  // }

  // public closePlot() {
  //   this.detail_plot = false;
  // }

  async reactiveFetch() {
    this.totalTreeTokenId = [];
    this.loadingData = true;
    this.$store.dispatch('setting/loadOption')
    this.loadingData = true;
    if (this.isWalletConnected) {
      this.walletConnect = true;
      const result = this.$store.getters["nft/myNFTsByCreationDateDesc"];
      result.map((data, id) => {
        this.totalTreeTokenId.push(data.tokenId)
      })
      await this.$store.dispatch('booster/loadBoosterItemLog',this.totalTreeTokenId)
      await {
        // myPlot: await this.$store.dispatch("plot/loadMyPlot"),
        myLbs: await this.$store.dispatch("luckyboxes/loadMyLuckyBoxes"),
        springBalance: await this.$store.dispatch(
          "tokens/loadBalance",
          addresses.Token
        ),
        myNFTs: await (async () => {
          await this.$store.dispatch('nodes/loadNodeTypes')
          await this.$store.dispatch("nft/loadMyNFTs");
          await this.$store.dispatch("nft/loadNFTRewardLevel")
        })(),
        allNodes: await this.$store.dispatch('nodes/loadAllNodes'),
        boosterItemType : await this.$store.dispatch("booster/loadBoosterItemType"),
        preOrderList :  await this.$store.dispatch('presale/loadMyPreOrderItems'),
      };
      await this.$store.dispatch("nft/loadSpecialROI",this.totalTreeTokenId)
      await  this.$store.dispatch("tokens/loadBalance", addresses.Token);
      await  this.$store.dispatch("tokens/loadBalance", addresses.busd);
    }
    this.loadingData = true;
  }

}
</script>
<style scoped>
.main_container {
  display: flex;
  flex-direction: column;
  padding: 64px 200px;
}
.tabs_background > .v-tabs-bar {
  background-color: black !important;
}
.v-tab {
  width: 50% !important;
  max-width: unset !important;
  color: white !important;
}
.node_data {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 32px;
  margin-bottom: 96px;
}
.main_title {
  font-size: 24px;
}
.title_description {
  width: 60%;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 16px;
  margin-bottom: 64px;
}
.seed_collection_card {
  height: 280px;
  background: radial-gradient(
      59.64% 59.64% at 50% 50%,
      rgba(164, 189, 62, 0.6) 0%,
      rgba(0, 0, 0, 0) 100%
    ),
    rgba(255, 255, 255, 0.05);
  box-shadow: inset 0px 0px 16px 4px rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  width: 100%;
  object-fit: fill;
}
.node-video {
  width: 100%;
  border-radius: 14px;
  object-fit: cover;
  margin-top: 45px;
}
.buy_dialog_mobile {
    display:none;
}
.buy_dialog_desktop {
  display: block;
}

@media only screen and (max-width: 600px) {
  .main_container {
    padding: 64px 20px;
  }
  .title_description {
    width: 100%;
  }
  .node_data {
    margin-bottom: 56px;
  }
  .buy_dialog_mobile {
    display:block;
  }
  .buy_dialog_desktop {
    display: none;
  }
}
</style> 
