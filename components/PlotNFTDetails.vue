<template>
  <div>
    <v-dialog
      v-model="detail_dialog"
      fullscreen
      transition="dialog-bottom-transition"
    >
      <div class="plot_container">
        <div class="text-end bg-[#000000bf]">
          <v-btn icon dark height="56px" color @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <div class="nft_details">
          <div class="nft_details_head">
            <div class="flex align-center gap-[3px]">
              <span class="nft_details_head_name">{{ $t(plotName) }}</span>
            </div>
            <div class="claim_btn">
              <div class="flex justify-end gap-[3px] mr-[10px]">
                $KILL 
              <!-- <img src="~assets/image/dashboard/spring_token.svg" alt="" /> -->
                <span class="text-[#D89F0E]">{{
                  _pendingRewards ? _pendingRewards : 0
                }}</span>
              </div>
              <v-btn
                dark
                x-large
                elevation="0"
                class="btn_wrapper"
                :loading="isClaimAllBtnLoading"
                @click="onClaimPotReward"
              >
                <span class="btn_color">{{$t('claim_plot_rewards')}}</span>
              </v-btn>
            </div>
            <!-- <div class="flex justify-end gap-[3px]">
              <img src="~assets/image/dashboard/spring_token.svg" alt="" />
              <span class="text-[#D89F0E]">{{ _pendingRewards ? _pendingRewards : 0}}</span>
            </div>
            <div class="claim_btn">
              <v-btn dark x-large elevation="0" class="btn_wrapper">
                <span class="btn_color" @click="onClaimPotReward"
                  >Claim Plot Rewards</span
                >
              </v-btn>
            </div> -->
          </div>
          <div v-if="soundOption == 'ON'" >
            <img v-if="plotName == 'Genesis'" class="plot_detail" :src="image" />
            <video v-else :src="video" class="plot_detail" autoplay loop webkit-playsinline playsinline>
              <source :src="video" type="video/mp4" />
              {{$t('videotag')}}
            </video>
          </div>
          <div v-if="soundOption == 'OFF'" >
            <img v-if="plotName == 'Genesis'" class="plot_detail" :src="image" />
            <video v-else :src="video" class="plot_detail" autoplay loop muted webkit-playsinline playsinline>
              <source :src="video" type="video/mp4" />
              {{$t('videotag')}}
            </video>
          </div>
          
          <div class="detail_content">
            <span class="plot_details">{{$t('plot_details')}}</span>
            <span class="nft_id"
              >{{$t('nftid')}}{{ tokenId }} {{ treeCount }}/{{
                treeMaxCount
              }}
              {{$t('trees')}}</span
            >
            <!-- <div v-for="(tree,id) in plotNFT.treeNodes" :key="`${id}`">
              {{treeNameByTokenID(tree)}}
            </div> -->

            <v-expansion-panels class="mb-6">
              <v-expansion-panel
                v-for="(tree, i) in plotNFT.treeNodes"
                :key="`${i}`"
              >
                <v-expansion-panel-header expand-icon="mdi-menu-down">
                  <div class="tree_nft_header">
                    <span class="tree_nft_header_name">{{
                      $t(treeNameByTokenID(tree))
                    }}#{{tree}}</span>
                    <div v-if="treeAttribute(tree) != ''" class="tree_name">
                      {{ $t(treeAttribute(tree)) }}
                    </div>
                  </div>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <div class="group_table">
                    <div class="table_colum flex-1">
                      <span class="table_title">{{$t('lastclaimdate')}}</span>
                      <span class="table_content">{{
                        lastClaimDate(tree)
                      }}</span>
                    </div>
                    <div class="table_colum flex-1">
                      <span class="table_title">{{$t('purchasedate')}}</span>
                      <span class="table_content">{{
                        obtainingTime(tree)
                      }}</span>
                    </div>
                    <div class="table_colum flex-1">
                      <span class="table_title">{{$t('roidate')}}</span>
                      <!-- <span class="table_content">{{ roidate(tree) }}</span> -->
                      <div class="flex aligins_center">
                        <v-tooltip top v-if="roidatelevel(tree) == 1">
                          <template v-slot:activator="{ on, attrs }">
                            <div class="reward-green" 
                                v-bind="attrs"
                                v-on="on">
                            </div>
                          </template>
                        </v-tooltip>
                        <v-tooltip top v-if="roidatelevel(tree) == 0">
                          <template v-slot:activator="{ on, attrs }">
                            <div class="reward-red"  
                              v-bind="attrs"
                                v-on="on"></div>
                          </template>
                        </v-tooltip>                        
                      </div>
                    </div>
                  </div>
                  <div class="details_group">
                    <span class="group_title">{{$t('rate')}}</span>
                    <div class="group_table">
                      <div class="table_colum flex-1">
                        <span class="table_title">{{$t('roiperday')}}</span>
                        <span class="table_content"
                          >{{ roi(tree) ? roi(tree) : 0 }}%</span
                        >
                      </div>
                      <div class="table_colum flex-1">
                        <span class="table_title">{{$t('tasbeforeroi')}}</span>
                        <span class="table_content">{{ claimTax(tree) + globalTax(tree) }}%</span>
                      </div>
                      <div class="table_colum flex-1">
                        <span class="table_title">{{$t('taxafterroi')}}</span>
                        <span class="table_content"
                          >{{ globalTax(tree) }}%</span
                        >
                      </div>
                    </div>
                  </div>
                  <div class="details_group">
                    <span class="group_title">{{$t('activeitems')}}</span>
                    <div class="group_table justify_between aligins_center">
                      <div class="r_flex gap_5 justify_center">
                         <div
                        class="add_BoostItems buy_dialog_desktop"
                        @click="onAddBoostItems('waterMedium',tree)"
                      >
                        +
                      </div>
                      <div
                        class="add_BoostItems buy_dialog_mobile"
                        @click="onAddBoostItems_mobile('waterMedium',tree)"
                      >
                        +
                      </div>
                        <img
                          src="~/assets/image/dashboard/ammo.png"
                          class="boosterItem"
                          alt=""
                        />
                        <div class="c_flex gap_5">
                          <span class="table_content">{{$t('waterpack1')}}</span>
                          <span class="table_title"
                            >{{$t('regainbooster',[waterMboosterduration])}}</span
                          >
                        </div>
                      </div>
                      <div class="c_flex gap_5 justify_center time_remaining">
                        <span class="table_title">{{$t('timeremaining')}}</span>
                        <countdown :time="waterMRemainingTime(tree)">
                          <template slot-scope="props">
                            <span class="time_countdown"
                              >{{
                                props.days < 10 ? "0" + props.days : props.days
                              }}
                              :
                              {{
                                props.hours < 10
                                  ? "0" + props.hours
                                  : props.hours
                              }}
                              :
                              {{
                                props.minutes < 10
                                  ? "0" + props.days
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
                        <div
                        class="add_BoostItems buy_dialog_desktop"
                        @click="onAddBoostItems('waterLarge',tree)"
                      >
                        +
                      </div>
                      <div
                        class="add_BoostItems buy_dialog_mobile"
                        @click="onAddBoostItems_mobile('waterLarge',tree)"
                      >
                        +
                      </div>
                        <img
                          src="~/assets/image/dashboard/ammo.png"
                          class="boosterItem"
                          alt=""
                        />
                        <!-- <div class="c_flex gap_5">
                          <span class="table_content">{{$t('waterpack2')}}</span>
                          <span class="table_title"
                            >{{$t('regainbooster',[waterLboosterduration])}}</span
                          >
                        </div> -->
                      </div>
                    </div>
                    <div class="group_table justify_between aligins_center">
                      <div class="r_flex gap_5 justify_center">
                         <div
                        class="add_BoostItems buy_dialog_desktop"
                        @click="onAddBoostItems('fertilizerMedium',tree)"
                      >
                        +
                      </div>
                      <div
                        class="add_BoostItems buy_dialog_mobile"
                        @click="onAddBoostItems_mobile('fertilizerMedium',tree)"
                      >
                        +
                      </div>
                        <!-- <img
                          src="~/assets/image/dashboard/fertilpack.svg"
                          class="boosterItem"
                          alt=""
                        /> -->
                        <!-- <div class="c_flex gap_5">
                          <span class="table_content">{{$t('fertilizerpack')}}</span>
                          <span class="table_title"
                            >{{$t('give_tree_reward1', [fertilizerMboosterduration])}}</span
                          >
                        </div> -->
                      </div>
                      <div class="c_flex gap_5 justify_center time_remaining">
                        <span class="table_title">{{$t('timeremaining')}}</span>
                        <countdown :time="fertilizerMRemainingTime(tree)">
                          <template slot-scope="props">
                            <span class="time_countdown"
                              >{{
                                props.days < 10 ? "0" + props.days : props.days
                              }}
                              :
                              {{
                                props.hours < 10
                                  ? "0" + props.hours
                                  : props.hours
                              }}
                              :
                              {{
                                props.minutes < 10
                                  ? "0" + props.days
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
                       <div
                        class="add_BoostItems buy_dialog_desktop"
                        @click="onAddBoostItems('fertilizerLarge',tree)"
                      >
                        +
                      </div>
                      <div
                        class="add_BoostItems buy_dialog_mobile"
                        @click="onAddBoostItems_mobile('fertilizerLarge',tree)"
                      >
                        +
                      </div>
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
                        <span class="table_title">Time Remaining</span>
                        <countdown :time="fertilizerLRemainingTime(tree)">
                          <template slot-scope="props">
                            <span class="time_countdown"
                              >{{
                                props.days < 10 ? "0" + props.days : props.days
                              }}
                              :
                              {{
                                props.hours < 10
                                  ? "0" + props.hours
                                  : props.hours
                              }}
                              :
                              {{
                                props.minutes < 10
                                  ? "0" + props.days
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
                  </div>
                  <v-btn dark x-large elevation="0" class="btn_wrapper">
                    <span class="btn_color" @click="onSelectNFT(tree)"
                      >{{$t('move_plot')}}</span
                    >
                  </v-btn>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
        </div>
      </div>
    </v-dialog>
    <v-dialog v-model="plot_choose_dialog" width="375px">
      <div class="plot_select_diage">
        <div class="plot_list_header">
          <span> {{$t('select_plot')}} </span>
        </div>

        <div class="plot_list">
          <div
            v-for="(data, i) in myPlot"
            :key="`${data.plot.name}-${i}`"
            class="list_name"
            @click="onChoosePlot(data)"
          >
            <div
              :class="
                data.plot.name == selectedPlotName
                  ? `selectedPlot_icon`
                  : `unselectedPlot_icon`
              "
            >
              <span> {{ data.plot.name }} </span>
              <img
                v-if="data.plot.name == selectedPlotName"
                src="~/assets/image/check_icon.svg"
              />
            </div>
          </div>
          <span class="error_msg">{{ erroMSG ? erroMSG : "" }}</span>
          <v-btn
            dark
            x-large
            elevation="0"
            class="btn_wrapper"
            width="100%"
            :loading="isContinue"
            :disabled="plotName == selectedPlotName"
            @click="onMovePlot"
          >
            <span class="btn_color">{{$t('continue')}}</span>
          </v-btn>
        </div>
      </div>
    </v-dialog>
    <v-dialog v-model="addBoostDialog" width="375">
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
import { PLOT_VIDEOS, PLOT_IMAGES } from "~/models/constants";
import { BigNumber } from "ethers";
import { ItemType } from "~/models/itemTypes";
import { BoosterItemName } from "~/models/types";
const formatEther = ethers.utils.formatEther;
@Component({
  props: {
    detail_dialog: { type: Boolean },
    plotNFT: { type: Object },
  },
})
export default class PlotNFTDetails extends Vue {
  public sellDiaglog: boolean = false;
  public plot_choose_dialog: boolean = false;
  public node: any;
  public isClaimAllBtnLoading: boolean = false;
  public isContinue: boolean = false;
  public selectedPlotName = this.plotName;
  public selectedPlot: any;
  public selectedTree: any;
  public _pendingRewards: any = "";
  public erroMSG: string = "";

  public addBoostDialog: boolean = false;
  public addBoostDialog_mobile: boolean = false;
  public addBoostName: string = "";
  public addBoostItemType: string = "";
  public addBoostNodeType: string = "";
  public addBoostTokenId: ethers.BigNumber = ethers.BigNumber.from(0);

  get plotName() {
    return this.$props?.plotNFT.plot ? this.$props?.plotNFT.plot.name : "";
  }

  get treeMaxCount() {
    return this.$props?.plotNFT.plot ? this.$props?.plotNFT.plot.maxNodes : 0;
  }

  get treeCount() {
    return this.$props?.plotNFT.treeNodes
      ? this.$props?.plotNFT.treeNodes.length
      : 0;
  }

  get nodeType() {
    if (!this.$props?.plotNFT.nodeType) {
      return null;
    }
    return this.$store.getters["nodes/nodeTypeByName"](
      this.$props?.plotNFT.nodeType
    );
  }

  get tokenId() {
    return parseInt(this.$props?.plotNFT.tokenId);
  }

  get image(): any {
    return this.$props?.plotNFT.plot
      ? (PLOT_IMAGES as any)[this.$props?.plotNFT.plot.name]
      : "";
  }

  get video(): any {
    return this.$props?.plotNFT.plot
      ? (PLOT_VIDEOS as any)[this.$props?.plotNFT.plot.name]
      : "";
  }

  get myPlot() {
    return this.$store.state.plot.myPlot ?? [];
  }

  public treeNameByTokenID(tree) {
    const result = this.$store.getters["nft/nftByTokenID"](tree);
    return result.nodeType ? result.nodeType : "";
  }

  public treeAttribute(tree) {
    const result = this.$store.getters["nft/nftByTokenID"](tree);
    return result.attribute ? result.attribute : "";
  }

  get pendingRewards() {
    let rewards = 0;
    const treeNodes = this.$props.plotNFT.treeNodes;
    treeNodes?.map((tree, id) => {
      const tmpNFT = this.$store.getters["nft/nftByTokenID"](tree);
      rewards = rewards + parseFloat(formatEther(tmpNFT.userPendingRewards));
    });

    return rewards.toFixed(3);
  }

  get plotNFTList() {
    let treelist: any = [];
    this.$props.plotNFT.treeNodes.map((tree, id) =>
      treelist.push(this.$store.getters["nft/nftByTokenID"](tree))
    );
    return treelist;
  }

  get soundOption() {
    return this.$store.state.setting.sound_option
  }

  public lastClaimDate(tree) {
    const nft = this.$store.getters["nft/nftByTokenID"](tree);
    let nftTime = new Date(nft.lastClaimTime);
    return nftTime.toLocaleDateString("en-us", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  public obtainingTime(tree) {
    const nft = this.$store.getters["nft/nftByTokenID"](tree);

    let nftTime = new Date(nft.obtainingTime);
    return nftTime.toLocaleDateString("en-us", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  public roidate(tree) {
    const nft = this.$store.getters["nft/nftByTokenID"](tree);
    let tmep = new Date(nft.timeRoi);
    return tmep.toLocaleDateString("en-us", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  public roi(tree) {
    const nft = this.$store.getters["nft/nftByTokenID"](tree);
    const nodeType = this.$store.getters["nodes/nodeTypeByName"](nft.nodeType);

    if (!nodeType) {
      return "0";
    }
    return nft.attribute != ""
      ? (
          NodeType.roi(nodeType) +
          (NodeType.roi(nodeType) *
            this.$store.getters["nft/spROIByTokenID"](nft.tokenId)) /
            10000
        ).toFixed(2)
      : NodeType.roi(nodeType).toFixed(2);
  }

  public claimTax(tree) {
    const nft = this.$store.getters["nft/nftByTokenID"](tree);
    const nodeType = this.$store.getters["nodes/nodeTypeByName"](nft.nodeType);

    if (!nft.nodeType) {
      return "0";
    }
    return nodeType.claimTax;
  }

  public globalTax(tree) {
    const nft = this.$store.getters["nft/nftByTokenID"](tree);
    const nodeType = this.$store.getters["nodes/nodeTypeByName"](nft.nodeType);
    if (!nft.nodeType) {
      return "0";
    }
    return nodeType.globalTax;
  }

  public treeNFTID(tree) {
    return parseInt(tree);
  }
  public closeDialog() {
    this.$emit("close");
  }
  async onMovePlot() {
    try {
      this.isContinue = true;
      await this.$store.dispatch("plot/moveToPlot", {
        tokenId: this.selectedTree,
        plotId: this.selectedPlot.tokenId,
      });
      this.isContinue = false;
      this.plot_choose_dialog = !this.plot_choose_dialog;
      this.$emit("close");
    } catch (e : any) {
      this.erroMSG = e;
      this.isContinue = false;
    }
  }
  public onChoosePlot(plot) {
    this.selectedPlot = plot;
    this.selectedPlotName = plot.plot.name;
    this.erroMSG = "";
  }
  public onSelectNFT(tree) {
    this.selectedTree = tree;
    this.plot_choose_dialog = !this.plot_choose_dialog;
    this.erroMSG = "";
  }

  public onAddBoostItems(itemType: string, tokenId: BigNumber) {
    this.addBoostDialog = !this.addBoostDialog;
    switch (itemType) {
      case "waterMedium":
        this.addBoostName = BoosterItemName.waterMedium;
        this.addBoostItemType = ItemType.waterPack;
        break;
      // case "waterLarge":
      //   this.addBoostName = BoosterItemName.waterLarge;
      //   this.addBoostItemType = ItemType.waterPack;
      //   break;
      // case "fertilizerMedium":
      //   this.addBoostName = BoosterItemName.fertilizeMedium;
      //   this.addBoostItemType = ItemType.fertilizer;
      //   break;
      // case "fertilizerLarge":
      //   this.addBoostName = BoosterItemName.fertilizeLarge;
      //   this.addBoostItemType = ItemType.fertilizer;
      //   break;
    }
    const nft = this.$store.getters["nft/nftByTokenID"](tokenId);
    const nodeType = this.$store.getters["nodes/nodeTypeByName"](nft.nodeType);
    this.addBoostNodeType = nodeType.name;

    this.addBoostTokenId = tokenId;
  }

    public onAddBoostItems_mobile(itemType: string, tokenId: BigNumber) {
    this.addBoostDialog_mobile = !this.addBoostDialog_mobile;
    switch (itemType) {
      case "waterMedium":
        this.addBoostName = BoosterItemName.waterMedium;
        this.addBoostItemType = ItemType.waterPack;
        break;
      // case "waterLarge":
      //   this.addBoostName = BoosterItemName.waterLarge;
      //   this.addBoostItemType = ItemType.waterPack;
      //   break;
      // case "fertilizerMedium":
      //   this.addBoostName = BoosterItemName.fertilizeMedium;
      //   this.addBoostItemType = ItemType.fertilizer;
      //   break;
      // case "fertilizerLarge":
      //   this.addBoostName = BoosterItemName.fertilizeLarge;
      //   this.addBoostItemType = ItemType.fertilizer;
      //   break;
    }
    const nft = this.$store.getters["nft/nftByTokenID"](tokenId);
    const nodeType = this.$store.getters["nodes/nodeTypeByName"](nft.nodeType);
    this.addBoostNodeType = nodeType.name;

    this.addBoostTokenId = tokenId;
  }

  async onClaimPotReward() {
    try {
      this.isClaimAllBtnLoading = true;
      await this.$store.dispatch("nft/claimRewards", this.plotNFTList);
      this.$forceUpdate();
      this.$emit("close");
    } finally {
      this.isClaimAllBtnLoading = false;
    }
  }

  public waterMRemainingTime(tree) {
    const result = this.$store.getters["booster/waterMReaminingTime"](
      tree ? tree : ethers.BigNumber.from(0)
    );
    return result.totalRemainingTime;
  }

  public fertilizerMRemainingTime(tree) {
    const result = this.$store.getters["booster/fertilizerMReaminingTime"](
      tree ? tree : ethers.BigNumber.from(0)
    );
    return result.totalRemainingTime;
  }

  public fertilizerLRemainingTime(tree) {
    const result = this.$store.getters["booster/fertilizerLReaminingTime"](
      tree ? tree : ethers.BigNumber.from(0)
    );
    return result.totalRemainingTime;
  }

  public roidatelevel(tree) { 
    const nft = this.$store.getters["nft/nftByTokenID"](tree);
    console.log(nft,"plotNft")
    if(nft.userPendingRewards.add(nft.totalClaimedRewards).gt(nft.price)) {
      return 1;
    } else {
      return 0;
    }
  }

  get waterMboosterduration() {
    const config = this.$store.getters["booster/boosterConfigByName"](
      ItemType.waterPack,
      BoosterItemName.waterMedium
    );
    return config?.ratioOfGRP.toNumber() / 100;
  }

  // get waterLboosterduration() {
  //   const config = this.$store.getters["booster/boosterConfigByName"](
  //     ItemType.waterPack,
  //     BoosterItemName.waterLarge
  //   );
  //   return config?.ratioOfGRP.toNumber() / 100;
  // }

  get fertilizerMboosterduration() {
    const config = this.$store.getters["booster/boosterConfigByName"](
      ItemType.fertilizer,
      BoosterItemName.fertilizeMedium
    );
    return config?.durationEffect.toNumber() / 60 / 60 / 24;
  }

  get fertilizerLboosterduration() {
    const config = this.$store.getters["booster/boosterConfigByName"](
      ItemType.fertilizer,
      BoosterItemName.fertilizeLarge
    );
    return config?.durationEffect.toNumber() / 60 / 60 / 24;
  }

  @Watch("detail_dialog")
  public async initDialog() {
    this._pendingRewards = this.pendingRewards;

    await this.$store.dispatch(
      "nft/loadSpecialROI",
      this.$props.plotNFT.treeNodes
    );
    await this.$store.dispatch("plot/loadMyPlot");
    await this.$store.dispatch("nft/loadMyNFTs");

    this.selectedPlotName = this.plotName;

  }

  async created() {
    this.selectedPlotName = this.plotName;
    this._pendingRewards = this.pendingRewards;
  }
}
</script>
<style type="postcss" scoped>
.plot_container {
  display: flex;
  flex-direction: column;
}
.plot_container:hover {
  cursor: pointer;
}
.btn_wrapper {
  background: #D89F0E !important;
  padding: 10px 16px 10px 16px;
  border-radius: 4px;
  height: 40px !important;
}
.btn_container {
  width: 100%;
}
.nft_details {
  background: white !important;
  padding: 0px 25%;
  height: 100%;
}
.plot_name {
  width: 35px;
  height: 14px;
  background: #fcd34d;
  border-radius: 2px;
  color: #d97706;
  padding: 0px 3px;
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
.plot_detail {
  width: 100%;
  border-radius: 16px;
  margin-top: 15px;
}
.nft_details_head {
  display: flex;
  justify-content: space-between;
  margin-top: 35px;
  align-items: center;
}
.nft_details_head_name {
  color: #1f2937;
  font-size: 14px;
  font-weight: bold;
}
.detail_content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}
.plot_details {
  font-size: 32px;
  color: black;
  margin-top: 16px;
}
.nft_id {
  font-size: 14px;
  color: #4b5563;
}
.trees {
  font-size: 30px;
  color: #34373b;
}
.tree_id {
  display: flex;
  margin-top: 16px;
  padding: 5px;
  width: 100%;
  justify-content: space-between;
}
.tree_details {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.details_content {
  display: flex;
  flex-direction: column;
}
.node-video {
  height: 280px;
  border-radius: 14px;
  object-fit: cover;
}
.plot_list_header {
  height: 72px;
  position: relative;
  padding: 26px 44px;
  text-align: center;
  font-size: 24px;
}
.plot_list {
  padding: 0px 20px 60px 20px;
}
.plot_list > div {
  display: flex;
  padding: 3px;
  justify-content: space-between;
  padding: 16px 0px;
}
.plot_list > div:hover {
  cursor: pointer;
}
.plot_select_diage {
  background: #001802;
}
.list_name {
  display: flex;
  justify-content: space-between;
  gap: 5px;
}
.selectedPlot_icon {
  background: #2a4733;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 16px 20px;
}
.unselectedPlot_icon {
  padding: 0px 20px;
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
.time_countdown {
  color: black;
  font-size: 24px;
}
.tree_nft_header {
  display: flex;
  padding: 17px 0px;
  gap: 3px;
  align-items: center;
}
.tree_nft_header_name {
  color: #D89F0E;
  font-size: 14px;
  font-weight: bold;
}
.tree_name {
  width: 35px;
  padding: 2px !important;
  background: #fcd34d;
  border-radius: 2px;
  color: #d97706;
  padding: 0px 3px;
  align-items: center;
  font-size: 10px;
  text-align: center;
}
.error_msg {
  color: red;
  margin: 5px 0px;
}
.add_BoostItems {
  background: #D89F0E;
  border-radius: 4px;
  width: 20px;
  height: 22px;
  text-align: center;
  color: white;
}
.add_BoostItems:hover {
  cursor: pointer;
}
.claim_btn {
  display: flex;
  align-items: center;
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
@media only screen and (max-width: 600px) {
  .nft_details {
    padding: 0px 20px;
  }
  .time_remaining {
    align-items: start;
  }
  .nft_details_head {
    align-items: unset;
    flex-direction: column;
  }
   .buy_dialog_desktop {
    display: none !important ;
  }
  .buy_dialog_mobile {
    display: block;
  }
}
</style>
