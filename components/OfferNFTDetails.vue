<template>
  <div>
    <v-dialog
      v-model="detail_dialog"
      fullscreen
      transition="dialog-bottom-transition"
    >
      <div class="flex flex-col h-[100%] md:h-max">
        <div class="text-end bg-[#000000bf]">
          <v-btn icon dark height="56px" color @click="closeDialog()">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <div class="tree_nft_container">
          <div class="tree_content">
            <div class="tree_nft_header">
              <div class="r_flex gap_5 aligns_end">
                <span class="tree_nft_header_name">{{ $t(treeName) }}</span>
                <div v-if="treeNFT.attribute != ''" class="tree_name">
                  {{ treeNFT.attribute }}
                </div>
              </div>
              <div class="r_flex gap_10">
                <div class="r_flex aligins_center">
                  <img
                    src="~/assets/image/ammo-little.png"
                    class="booster_img"
                    alt=""
                  />
                  <span class="text_black">{{
                    waterMActiveCount ? waterMActiveCount : 0
                  }}</span>
                </div>
                <div class="r_flex aligins_center">
                  <img
                    src="~/assets/image/ammo-little.png"
                    class="booster_img"
                    alt=""
                  />
                  <span class="text_black">{{
                    waterLActiveCount ? waterLActiveCount : 0
                  }}</span>
                </div>
                <!-- <div class="r_flex aligins_center">
                  <img
                    src="~/assets/image/dashboard/fertilpack.svg"
                    class="booster_img"
                    alt=""
                  />
                  <span class="text_black">{{
                    fertilizerMActiveCount ? fertilizerMActiveCount : 0
                  }}</span>
                </div> -->
                <!-- <div class="r_flex aligins_center">
                  <img
                    src="~/assets/image/dashboard/fertilpack.svg"
                    class="booster_img"
                    alt=""
                  />
                  <span class="text_black">{{
                    fertilizerLActiveCount ? fertilizerLActiveCount : 0
                  }}</span>
                </div> -->
                <div class="flex aligins_center">
                  <v-tooltip top v-if="rewardLevel == 0">
                    <template v-slot:activator="{ on, attrs }">
                      <div class="reward-green" 
                          v-bind="attrs"
                          v-on="on">
                      </div>
                    </template>
                    <span>100%</span>
                  </v-tooltip>
                  <v-tooltip top v-if="rewardLevel == 1">
                    <template v-slot:activator="{ on, attrs }">
                      <div class="reward-yellow"  
                        v-bind="attrs"
                          v-on="on"></div>
                    </template>
                    <span>100%</span>
                  </v-tooltip>
                  <v-tooltip top v-if="rewardLevel == 2">
                    <template v-slot:activator="{ on, attrs }">
                      <div class="reward-red" 
                          v-bind="attrs"
                          v-on="on"></div>
                    </template>
                    <span>50%</span>
                  </v-tooltip>
                  <v-tooltip top v-if="rewardLevel == 3">
                      <template v-slot:activator="{ on, attrs }">
                        <div class="reward-gray" 
                        v-bind="attrs"
                        v-on="on"></div>
                      </template>
                      <span>5%</span>
                  </v-tooltip>
                </div>
                <countdown :time="leftTime ? leftTime : 0">
                  <template slot-scope="props">
                    <span class="remain_time_count">
                      {{ props.days < 10 ? "0" + props.days : props.days }}
                      :
                      {{ props.hours < 10 ? "0" + props.hours : props.hours }}
                      :
                      {{
                        props.minutes < 10 ? "0" + props.minutes : props.minutes
                      }}
                      :
                      {{
                        props.seconds < 10 ? "0" + props.seconds : props.seconds
                      }}
                      left</span
                    >
                  </template>
                </countdown>
              </div>
            </div>
            <div class="flex justify-end gap-[32px] align-center">
              <v-dialog
                v-model="placeBid"
                width="375"
                class="buy_dialog_desktop"
              >
                <BuyNFTItem @close="() => {placeBid = false;}" :d_dialog="placeBid" :offer="offer" />
              </v-dialog>
              <div class="flex justify-end gap-[3px]">
                $KILL
                <!-- <img src="~assets/image/dashboard/spring_token.svg" alt="" /> -->
                <span class="tree_nft_header_name">{{$t('actualpending')}}</span>
                <span class="text-[#D89F0E]">{{
                  treependingReward ? treependingReward : 0
                }}</span>
              </div>              
              <v-btn
                dark
                x-large
                elevation="0"
                class="btn_wrapper"
                @click="placeBid=!placeBid"
              >
                <span class="btn_color" v-if="offer.type=='offer'">{{$t('buytree')}}</span>
                <span class="btn_color" v-if="offer.type=='auction'">{{$t('placebid')}}</span>
              </v-btn>
            </div>
          </div>
          <img :src="image" class="node-video" alt="">
          <!-- <div v-if="soundOption == 'ON'">
            <video  class="details_video" :key="video" autoplay loop webkit-playsinline playsinline>
              <source :src="video" type="video/mp4" />
              {{$t('videotag')}}
            </video>
          </div>
          <div v-if="soundOption == 'OFF'">
            <video  class="details_video" :key="video" autoplay muted loop webkit-playsinline playsinline>
              <source :src="video" type="video/mp4" />
              {{$t('videotag')}}
            </video>
          </div> -->
         
          <div class="tree_details">
            <div class="tree_details_info">
              <span class="tree_details_title">{{$t('treedetails')}}</span>
              <span class="tree_nft_id"
                >{{$t('nftid')}} {{ tokenId ? tokenId : 0 }}</span
              >
              <div class="details_container">
                <div class="details_group">
                  <span class="group_title">{{$t('dates')}}</span>
                  <div class="group_table">
                    <div class="table_colum flex-1">
                      <span class="table_title">{{$t('lastclaimdate')}}</span>
                      <span class="table_content">{{ lastClaimDate }}</span>
                    </div>
                    <div class="table_colum flex-1">
                      <span class="table_title">{{$t('purchasedate')}}</span>
                      <span class="table_content">{{ obtainingTime }}</span>
                    </div>
                    <div class="table_colum flex-1">
                      <span class="table_title">{{$t('roidate')}}</span>
                      <!-- <span class="table_content">{{ roidate }}</span> -->
                      <div class="flex aligins_center">
                        <v-tooltip top v-if="roidatelevel == 1">
                          <template v-slot:activator="{ on, attrs }">
                            <div class="reward-green" 
                                v-bind="attrs"
                                v-on="on">
                            </div>
                          </template>
                        </v-tooltip>
                        <v-tooltip top v-if="roidatelevel == 0">
                          <template v-slot:activator="{ on, attrs }">
                            <div class="reward-red"  
                              v-bind="attrs"
                                v-on="on"></div>
                          </template>
                        </v-tooltip>                        
                      </div>
                    </div>
                  </div>
                </div>
                <div class="details_group">
                  <span class="group_title">{{$t('rate')}}</span>
                  <div class="group_table">
                    <div class="table_colum flex-1">
                      <span class="table_title">{{$t('roiperday')}}</span>
                      <span class="table_content">{{ roi }}%</span>
                    </div>
                    <div class="table_colum flex-1">
                      <span class="table_title">{{$t('taxbeforeroi')}}</span>
                      <span class="table_content">{{ claimTax + globalTax }}%</span>
                    </div>
                    <div class="table_colum flex-1">
                      <span class="table_title">{{$t('taxafterroi')}}</span>
                      <span class="table_content">{{ globalTax }}%</span>
                    </div>
                  </div>
                </div>
                <div class="details_group">
                  <span class="group_title">{{$t('activeitems')}}</span>
                  <div class="group_table justify_between aligins_center">
                    <div class="r_flex gap_5 justify_center">                      
                      <img
                        src="~/assets/image/dashboard/ammo.png"
                        class="boosterItem"
                        alt=""
                      />
                      <div class="c_flex gap_5">
                        <div class="table_content">{{$t('waterpack1')}}</div>
                        <span class="table_title"
                          >{{$t('regainbooster',[waterMboosterduration])}}</span>
                      </div>
                    </div>
                    <div class="c_flex gap_5 justify_center  time_remaining">
                      <span class="table_title">{{$t('timeremaining')}}</span>
                      <countdown :time="waterMRemainingTime ? waterMRemainingTime : 0">
                        <template slot-scope="props">
                          <span class="time_countdown"
                            >{{
                              props.days < 10 ? "0" + props.days : props.days
                            }}
                            :
                            {{
                              props.hours < 10 ? "0" + props.hours : props.hours
                            }}
                            :
                            {{
                              props.minutes < 10
                                ? "0" + props.minutes
                                : props.minutes
                            }}
                            :
                            {{
                              props.seconds < 10
                                ? "0" + props.seconds
                                : props.seconds
                            }}</span
                          >
                        </template>
                      </countdown>
                    </div>
                  </div>
                  <div class="group_table justify_between aligins_center">
                    <div class="r_flex gap_5 justify_center">                      
                      <img
                        src="~/assets/image/dashboard/ammo.png"
                        class="boosterItem"
                        alt=""
                      />
                    </div>
                  </div>
                  <div class="group_table justify_between aligins_center">
                    <!-- <div class="r_flex gap_5 justify_center">                      
                      <img
                        src="~/assets/image/dashboard/fertilpack.svg"
                        class="boosterItem"
                        alt=""
                      />
                      <div class="c_flex gap_5">
                        <span class="table_content">{{$t('fertilizerpack')}}</span>
                        <span class="table_title"
                          >{{$t('give_tree_reward1', [fertilizerMboosterduration])}}</span
                        >
                      </div>
                    </div> -->
                    <!-- <div class="c_flex gap_5 justify_center time_remaining">
                      <span class="table_title">{{$t('timeremaining')}}</span>
                      <countdown :time="fertilizerMRemainingTime ? fertilizerMRemainingTime : 0">
                        <template slot-scope="props">
                          <span class="time_countdown"
                            >{{
                              props.days < 10 ? "0" + props.days : props.days
                            }}
                            :
                            {{
                              props.hours < 10 ? "0" + props.hours : props.hours
                            }}
                            :
                            {{
                              props.minutes < 10
                                ? "0" + props.minutes
                                : props.minutes
                            }}
                            :
                            {{
                              props.seconds < 10
                                ? "0" + props.seconds
                                : props.seconds
                            }}</span
                          >
                        </template>
                      </countdown>
                    </div> -->
                  </div>
                  <!-- <div class="group_table justify_between aligins_center">
                    <div class="r_flex gap_5 justify_center">                      
                      <img
                        src="~/assets/image/dashboard/fertilpack.svg"
                        class="boosterItem"
                        alt=""
                      />
                      <div class="c_flex gap_5">
                        <span class="table_content"
                          >{{$t('super_boost')}}</span
                        >
                        <span class="table_title"
                          >{{$t('give_tree_reward2', [fertilizerLboosterduration])}}</span
                        >
                      </div>
                    </div>
                    <div class="c_flex gap_5 justify_center time_remaining">
                      <span class="table_title">{{$t('timeremaining')}}</span>
                      <countdown :time="fertilizerLRemainingTime ? fertilizerLRemainingTime : 0">
                        <template slot-scope="props">
                          <span class="time_countdown"
                            >{{
                              props.days < 10 ? "0" + props.days : props.days
                            }}
                            :
                            {{
                              props.hours < 10 ? "0" + props.hours : props.hours
                            }}
                            :
                            {{
                              props.minutes < 10
                                ? "0" + props.minutes
                                : props.minutes
                            }}
                            :
                            {{
                              props.seconds < 10
                                ? "0" + props.seconds
                                : props.seconds
                            }}</span
                          >
                        </template>
                      </countdown>
                    </div>
                  </div> -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </v-dialog>
    <v-dialog
      v-model="addBoostDialog"
      width="375"
    >
      <BuyDetailsBoostItem
        :name="addBoostName"
        :itemType="addBoostItemType"
        :nodeType="addBoostNodeType"
        :dialogOpen="addBoostDialog"
        :tokenId="addBoostTokenId"
        class="buy_dialog_desktop"
        @close="() => (addBoostDialog = false)"
      />
    </v-dialog>
    <v-dialog
      v-model="addBoostDialog_mobile"
      fullscreen
    >
      <BuyDetailsBoostItem
        :name="addBoostName"
        :itemType="addBoostItemType"
        :nodeType="addBoostNodeType"
        :dialogOpen="addBoostDialog_mobile"
        :tokenId="addBoostTokenId"
        class="buy_dialog_mobile"
        @close="() => (addBoostDialog_mobile = false)"
      />
    </v-dialog>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Watch } from "nuxt-property-decorator";
import { NFT } from "~/models/nft";
import { Node } from "~/models/Node";
import * as NodeType from "~/models/NodeType";
import addresses from "~/config/addresses";
import * as ethers from "ethers";
import VueCountdown from "@chenfengyuan/vue-countdown";
Vue.component(VueCountdown.name, VueCountdown);
import {
  NAME_TO_URL,
  NODENAME_TO_IMAGE,
  NODENAME_TO_VIDEO,
  PLOT_VIDEOS,
  BOOSITEM_VIDEOS,
  LUCKY_BOX_VIDEOS,
  LUCKY_BOX_IMAGES,
} from "~/models/constants";
import { ItemType } from "~/models/itemTypes";
import { BoosterItemName } from "~/models/types";

const formatEther = ethers.utils.formatEther;

@Component({
  props: {
    detail_dialog: { type: Boolean },
    offer: { type: Object },
  },
})
export default class OfferNFTDetails extends Vue {
  public d_detail: boolean = false;
  public treeNFT: any = {};
  public placeBid: boolean = false;
  public node: any;
  public isClaimAllBtnLoading: boolean = false;
  public treependingReward: any = "";
  public waterLcounter: number = 0;
  public waterMcounter: number = 0;
  public fertilizerMcounter: number = 0;
  public fertilizerLcounter: number = 0;
  public boosterEndTime: number = 0;

  public waterMEndTime: number = 0;
  public waterLEndTime: number = 0;
  public fertilizerMEndTime: number = 0;
  public fertilizerLEndTime: number = 0;

  public addBoostDialog: boolean = false;
  public addBoostDialog_mobile: boolean = false;
  public addBoostName : string = "";
  public addBoostItemType : string ="";
  public addBoostNodeType : string = "";
  public addBoostTokenId : ethers.BigNumber = ethers.BigNumber.from(0);
  @Watch("detail_dialog")
  public async initDialog() {
    console.log("offer detail", this.$props.offer)
    this.treeNFT = this.$props?.offer.nft;
    this.treependingReward = this.pendingReward;
    await this.$store.dispatch("nft/loadSpecialROI", [
      this.treeNFT.tokenId,
    ]);
    await this.$store.dispatch('nft/loadByTokenId', this.treeNFT?.tokenId)
    // await this.$store.dispatch('booster/loadBoosterItemLog',[this.treeNFT?.tokenId])
    await this.$store.dispatch('booster/loadTotalCreatedPerUserPerType',this.treeNFT.nodeType)
    await this.$store.dispatch('booster/loadTotalCreatedPerNodeTokenId',this.treeNFT?.tokenId)
    let nodes = this.$store.getters["nodes/myNodesByNodeType"](
      this.treeNFT.nodeType
    );
    if (nodes) {
      nodes.map((item) => {
        if (item.tokenId.eq(this.treeNFT?.tokenId)) {
          this.node = item;
        }
      });
    }
  }
  async created() {
    this.treependingReward = this.pendingReward;
    this.$store.dispatch('setting/loadOption')

  }
  get treeName() {
    return this.treeNFT.nodeType;
  }

  get video() {
    if (this.treeNFT.attribute == "")
      return (NODENAME_TO_VIDEO as any)[this.treeName];
    else
      return (NODENAME_TO_VIDEO as any)[
        this.treeName + " " + this.treeNFT.attribute
      ];
  }

  get rewardLevel() {
    return this.treeNFT.rewardLevel;
  }

  get plot() {
    if (!this.treeNFT.tokenId) {
      return null;
    }
    let plot = this.$store.getters["plot/byTokenId"](
      this.treeNFT.tokenId
    );
    return;
  }

  get nodeType() {
    if (!this.treeNFT.nodeType) {
      return null;
    }
    return this.$store.getters["nodes/nodeTypeByName"](
      this.treeNFT.nodeType
    );
  }

  get lastLifetime() {
    let nftTime = new Date(this.treeNFT.lastClaimTime);
    return nftTime.toLocaleDateString("en-us", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  get lastRewardUpdateTime() {
    let nftTime = new Date(this.treeNFT.lastRewardUpdateTime);
    return nftTime.toLocaleDateString("en-us", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  // get leftTime() {
  //   return new Date(this.$props.offer.end).getTime() - new Date().getTime();
  // }

  get leftTime() {
    //return this.$store.getters['nft/leftTimebyTokenId'](this.$props.treeNFT.tokenId)  ? this.$store.getters['nft/leftTimebyTokenId'](this.$props.treeNFT.tokenId)  : 0;
    //return this.$store.getters['nft/leftTimebyTokenId'](this.treeNFT.tokenId)  ? this.$store.getters['nft/leftTimebyTokenId'](this.treeNFT.tokenId)  : 0;
    return this.treeNFT.leftTime;
  }

  get leftTime_temp() {
    let tmpTime =
      new Date(this.treeNFT.plotAdditionalLifetime).getTime() +
      new Date(this.treeNFT.lastLifetime).getTime() -
      (Math.floor(Date.now()) -
        new Date(this.treeNFT.lastRewardUpdateTime).getTime());
    return tmpTime;
  }

  get tokenId() {
    const temp = this.treeNFT.tokenId
      ? parseInt(this.treeNFT.tokenId._hex)
      : 0;
    return temp;
    // return parseInt(formatEther(this.treeNFT?.tokenId?this.treeNFT.tokenId : ethers.BigNumber.from(0))) ? parseInt(formatEther(this.treeNFT.tokenId)) : 0;
  }

  get plotAdditionalLifetime() {
    let nftTime = new Date(this.treeNFT.plotAdditionalLifetime);
    return nftTime.toLocaleDateString("en-us", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  get lastClaimDate() {
    let nftTime = new Date(this.treeNFT.lastClaimTime);
    return nftTime.toLocaleDateString("en-us", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  get roidate() {
    let tmep = new Date(this.treeNFT.timeRoi);
    return tmep.toLocaleDateString("en-us", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  get roidatelevel() {    
    if(this.treeNFT?.userPendingRewards.add(this.treeNFT?.totalClaimedRewards).gt(this.treeNFT?.price)) {
      return 1;
    } else {
      return 0;
    }
  }
  get obtainingTime() {
    let nftTime = new Date(this.treeNFT.obtainingTime);
    return nftTime.toLocaleDateString("en-us", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  get claimTax() {
    if (!this.treeNFT.nodeType) {
      return "0";
    }
    return this.nodeType.claimTax;
  }

  get globalTax() {
    if (!this.treeNFT.nodeType) {
      return "0";
    }
    return this.nodeType.globalTax;
  }

  get roi() {
    if (!this.nodeType) {
      return "0";
    }
    return this.treeNFT.attribute != ""
      ? (
          NodeType.roi(this.nodeType) +
          (NodeType.roi(this.nodeType) *
            this.$store.getters["nft/spROIByTokenID"](
              this.treeNFT.tokenId
            )) /
            10000
        ).toFixed(2)
      : NodeType.roi(this.nodeType).toFixed(2);
  }

  get waterMRemainingTime() {
    const result = this.$store.getters["booster/waterMReaminingTime"](
      this.treeNFT.tokenId
        ? this.treeNFT.tokenId
        : ethers.BigNumber.from(0)
    );
    return result.totalRemainingTime ? result.totalRemainingTime : null;
  }
  get waterMActiveCount() {
    const result = this.$store.getters["booster/waterMReaminingTime"](
      this.treeNFT.tokenId
        ? this.treeNFT.tokenId
        : ethers.BigNumber.from(0)
    );
    return result.totalActiveItem;
  }

  get waterLActiveCount() {
    const result = this.$store.getters["booster/waterLReaminingTime"](
      this.treeNFT.tokenId
        ? this.treeNFT.tokenId
        : ethers.BigNumber.from(0)
    );
    return result.totalActiveItem;
  }

  get fertilizerMRemainingTime() {
    const result = this.$store.getters["booster/fertilizerMReaminingTime"](
      this.treeNFT.tokenId
        ? this.treeNFT.tokenId
        : ethers.BigNumber.from(0)
    );
    return result.totalRemainingTime ? result.totalRemainingTime : null;
  }

  get fertilizerMActiveCount() {
    const result = this.$store.getters["booster/fertilizerMReaminingTime"](
      this.treeNFT.tokenId
        ? this.treeNFT.tokenId
        : ethers.BigNumber.from(0)
    );
    return result.totalActiveItem;
  }

  get fertilizerLRemainingTime() {
    const result = this.$store.getters["booster/fertilizerLReaminingTime"](
      this.treeNFT.tokenId
        ? this.treeNFT.tokenId
        : ethers.BigNumber.from(0)
    );
    return result.totalRemainingTime ? result.totalRemainingTime : null;
  }

  get fertilizerLActiveCount() {
    const result = this.$store.getters["booster/fertilizerLReaminingTime"](
      this.treeNFT.tokenId
        ? this.treeNFT.tokenId
        : ethers.BigNumber.from(0)
    );
    return result.totalActiveItem;
  }

  public closeDialog() {
    this.$emit("close");
  }

  get waterMboosterduration() {
    const config = this.$store.getters["booster/boosterConfigByName"](
      ItemType.waterPack,
      BoosterItemName.waterMedium
    );
    return config?.ratioOfGRP ? config?.ratioOfGRP.toNumber() / 100 : 0;
  }

  // get waterLboosterduration() {
  //   const config = this.$store.getters["booster/boosterConfigByName"](
  //     ItemType.waterPack,
  //     BoosterItemName.waterLarge
  //   );
  //   return config?.ratioOfGRP ? config?.ratioOfGRP.toNumber() / 100 : 0;
  // }

  get fertilizerMboosterduration() {
    const config = this.$store.getters["booster/boosterConfigByName"](
      ItemType.fertilizer,
      BoosterItemName.fertilizeMedium
    );
    return config?.durationEffect ? config?.durationEffect.toNumber() / 60 / 60 / 24 : 0;
  }

  get fertilizerLboosterduration() {
    const config = this.$store.getters["booster/boosterConfigByName"](
      ItemType.fertilizer,
      BoosterItemName.fertilizeLarge
    );
    return config?.durationEffect ? config?.durationEffect.toNumber() / 60 / 60 / 24 : 0;
  }

  get pendingReward() {
    return this.treeNFT?.userPendingRewards
      ? parseFloat(
          formatEther(this.treeNFT?.userPendingRewards)
        ).toFixed(3)
      : 0;
  }

  get soundOption() {
    return this.$store.state.setting.sound_option
  }

  public onAddBoostItems(itemType : string) {
    this.addBoostDialog = !this.addBoostDialog;
    switch(itemType) {
      case 'waterMedium':
        this.addBoostName = BoosterItemName.waterMedium;
        this.addBoostItemType = ItemType.waterPack;
        break;
      // case 'waterLarge':
      //   this.addBoostName = BoosterItemName.waterLarge;
      //   this.addBoostItemType = ItemType.waterPack;
      //   break;
      // case 'fertilizerMedium':
      //   this.addBoostName = BoosterItemName.fertilizeMedium;
      //   this.addBoostItemType = ItemType.fertilizer;
      //   break;
      // case 'fertilizerLarge':
      //   this.addBoostName = BoosterItemName.fertilizeLarge;
      //   this.addBoostItemType = ItemType.fertilizer;
      //   break;
    }
    this.addBoostNodeType  = this.treeNFT.nodeType;
    this.addBoostTokenId = this.treeNFT.tokenId;
  }

  public onAddBoostItems_mobile(itemType : string) {
    this.addBoostDialog_mobile = !this.addBoostDialog_mobile;
    switch(itemType) {
      case 'waterMedium':
        this.addBoostName = BoosterItemName.waterMedium;
        this.addBoostItemType = ItemType.waterPack;
        break;
      // case 'waterLarge':
      //   this.addBoostName = BoosterItemName.waterLarge;
      //   this.addBoostItemType = ItemType.waterPack;
      //   break;
      // case 'fertilizerMedium':
      //   this.addBoostName = BoosterItemName.fertilizeMedium;
      //   this.addBoostItemType = ItemType.fertilizer;
      //   break;
      // case 'fertilizerLarge':
      //   this.addBoostName = BoosterItemName.fertilizeLarge;
      //   this.addBoostItemType = ItemType.fertilizer;
      //   break;
    }
    this.addBoostNodeType  = this.treeNFT.nodeType;
    this.addBoostTokenId = this.treeNFT.tokenId;
  }
}
</script>
<style scoped>
.tree_nft_container {
  background: white !important;
  padding: 20px 25%;
}
.tree_nft_header {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.tree_nft_header_name {
  color: #1f2937;
  font-size: 14px;
  font-weight: bold;
}
.tree_content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 3px;
  flex-wrap: wrap;
}
.tree_details {
  display: flex;
  gap: 20px;
}
.tree_details_info {
  display: flex;
  flex-direction: column;
  gap: 32px;
  width: 100%;
}
.tree_details_title {
  font-size: 32px;
  color: black;
}
.tree_nft_id {
  font-size: 14px;
  color: #4b5563;
}
.tree_nft_date {
  display: flex;
  font-size: 14px;
  margin-top: 4px;
  background: #c9c3c3;
  padding: 6px;
  width: 100%;
  border-radius: 8px;
}
.claim_date {
  font-size: 18px;
  color: #959697;
}
.date_style {
  font-size: 28px;
  color: #34373b;
}
.rate_style {
  font-size: 18px;
  color: #959697;
}
.btn_wrapper {
  background: #D89F0E !important;
  padding: 10px 16px 10px 16px;
  border-radius: 4px;
  height: 40px !important;
}
.list_btn {
  background: #E5E7EB !important;
  border-radius: 4px;
  padding: 10px 16px;
  height: 40px !important;
}
.list_btn_color {
  color: #4B5563;
}
.btn_container {
  width: 100%;
}
.tree_name {
  background: #fcd34d;
  border-radius: 2px;
  color: #d97706;
  padding: 3px 3px;
  align-items: center;
  font-size: 10px;
  text-align: center;
}

.buy_sell {
  background: #c9c3c3;
  padding: 10px 16px;
  border-radius: 4px;
  color: #4b5563;
  font-size: 14px;
  font-weight: 600;
}
.buy_sell:hover {
  color: #D89F0E;
  cursor: pointer;
}
.details_video {
  width: 100%;
  border-radius: 16px !important;
  margin-top: 15px;
}
.details_container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.details_group {
  display: flex;
  flex-direction: column;
}
.group_title {
  color: black;
  font-size: 20px;
}
.group_table {
  display: flex;
  flex-wrap: wrap;
  background: #f1efef;
  border-radius: 6px;
  padding: 20px;
  margin-bottom: 10px;
}
.table_colum {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.table_title {
  font-size: 12px;
  color: #4e4949b3;
}
.table_content {
  font-size: 14px;
  color: black;
}
.boosterItem {
  width: 64px;
  height: 64px;
}
.remain_time_count {
  color: #24d7ff;
  font-size: 12px;
}
.time_countdown {
  color: black;
  font-size: 24px;
}
.no_active {
  color: black;
}
.text_black {
  color: black;
}
.booster_img {
  width: 25px;
  height: 25px;
}
.add_BoostItems {
  background: #D89F0E;
  border-radius: 4px;
  width: 20px;
  height: 22px;
  text-align: center;
}
.add_BoostItems:hover {
  cursor: pointer;
}
.time_remaining {
  flex-wrap: wrap;
  align-items: end;
}
.buy_dialog_desktop {
  display: block;
}
.buy_dialog_mobile {
  display: none;
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
@media only screen and (max-width: 600px) {
  .tree_nft_container {
    padding: 20px 20px;
  }
  .time_remaining {
    align-items: start;
  }
  .buy_dialog_desktop {
    display: none !important ;
  }
  .buy_dialog_mobile {
    display: block;
  }
}
</style>
