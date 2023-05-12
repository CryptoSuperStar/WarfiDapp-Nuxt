<template>
<div class="c_flex gap_10">
  <div class="r_flex flex_wrap gap_10 multi_btn">
      <div v-if="tokenCount > 0" class="r_flex aligins_center gap_5">
        <span class="count_color">{{tokenCount}} {{$t('seeds')}} </span><span> {{$t('selected')}}</span>
      </div>
    <v-btn
      v-if="tokenCount != 0"
      dark
      x-large
      elevation="0"
      :disabled="seeds.length == 0"
      :loading = "isRevealAllBtnLoading"
      class="btn_wrapper"
      @click="onRevalAll"
    >
      {{tokenCount == 0 ? this.$t('revealallitem') : this.$t('revealselected')}}
    </v-btn>
    <div v-if="claimTreeCount > 0" class="r_flex aligins_center gap_5">
      <span class="count_color">{{claimTreeCount}} {{$t('tree')}} </span><span> {{$t('selected')}}</span>
    </div>
    <v-btn
      dark
      x-large
      elevation="0"
      :disabled="pendingReward == 0"
      :loading="isClaimAllBtnLoading"
      class="btn_wrapper"
      @click="onSelectAll"
    >
     {{this.$t('selectall')}}
    </v-btn>
    <v-btn
      v-if="claimTreeCount != 0"
      dark
      x-large
      elevation="0"
      :disabled="pendingReward == 0"
      :loading="isClaimAllBtnLoading"
      class="btn_wrapper"
      @click="onClaimAll"
    >
     {{claimTreeCount == 0 ? this.$t('claimall') : this.$t('claimselected')}}
    </v-btn>
  </div>
  <v-row>
    <v-col
      v-for="(nft, id) in preOrderNFTList"
      :key="`${nft}-${id}`"
      cols="12"
      md="4"
      lg="3"
      class="reveal_btn"
    >
    <img :src="video_preOrder(nft)" alt="" class="node-video" /> 
      <!-- <img :src="image(collection)" alt="" class="node-video" />  -->
        <!-- <v-checkbox
        :key = "id"
        name="check"
        v-model="isChecked[id]"
        color="success"
        hide-details
        class="item_check"
        @click.native="onCheck(collection)"
      ></v-checkbox>  -->
      <div class="reveal_hover">
        <v-btn
          elevation="0"
          class="btn_wrapper"
          :loading="isRevealItemBtn"
          @click="onPreOrderReveal(nft)"
        >
          <span class="btn_color">{{$t('revealitem')}}</span>
        </v-btn>
      </div>
      <div class="reveal_item">
        <span>{{ $t(nft) }}</span>
        <div class="reveal_item_color" @click="onPreOrderReveal(nft)">
          {{$t('revealitem')}}
        </div>
      </div>
    </v-col>
    <v-col
      v-for="(collection, id) in seeds"
      :key="`seed-${id}`"
      cols="12"
      md="4"
      lg="3"
      class="reveal_btn"
    >
    <img :src="image(collection)" alt="" class="node-video" /> 
      <div class="reveal_hover">
        <v-btn
          elevation="0"
          class="btn_wrapper"
          :loading="isRevealItemBtn"
          @click="onReveal(collection, id)"
        >
          <span class="btn_color">{{$t('revealitem')}}</span>
        </v-btn>
      </div>
      <div class="reveal_item">
        <span>{{ $t(collection.type) }}</span>
        <div class="reveal_item_color" @click="onReveal(collection, id)">
          {{$t('revealitem')}}
        </div>
      </div>
    </v-col>
    <v-col
      v-for="(tree, id) in treenfts"
      :key="`tree-${id}`"
      cols="12"
      md="4"
      lg="3"
      class="relative"
    >
     
      <div  class="nft_hover">
        <img :src="image_tree(tree)" alt="" class="node-video" @click="selectNFT(tree)" />
         <v-checkbox
        color="success"
        v-model="isCheckedClaim[id]"
        hide-details
        class="item_check"
        @click="onClaimCheck(tree)"
      ></v-checkbox>
        <div class="flex justify-between mt-[8px]"  @click="selectNFT(tree)">
          <div class="flex align-center gap-[3px]">
          <!--<v-tooltip top v-if="rewardLevel(tree) == 0">
            <template v-slot:activator="{ on, attrs }">
              <div class="reward-green" 
                  v-bind="attrs"
                  v-on="on">
              </div>
            </template>
            <span>100%</span>
          </v-tooltip>-->
          <!-- <v-tooltip top v-if="rewardLevel(tree) == 1">
            <template v-slot:activator="{ on, attrs }">
              <div class="reward-yellow"></div>
            </template>
            <span>50%</span>
          </v-tooltip> -->
          <!--<v-tooltip top v-if="rewardLevel(tree) == 2">
            <template v-slot:activator="{ on, attrs }">
              <div class="reward-red" 
               v-bind="attrs"
               v-on="on"></div>
            </template>
            <span>50%</span>
          </v-tooltip>-->
          <!--<v-tooltip top v-if="rewardLevel(tree) == 3">
            <template v-slot:activator="{ on, attrs }">
              <div class="reward-gray" 
               v-bind="attrs"
               v-on="on"></div>
            </template>
            <span>5%</span>
          </v-tooltip>-->
            <span class="ml-1">{{ $t(tree.nodeType) }}#{{tree.tokenId}}</span>
            <div v-if="tree.feature != ''" class="tree_name">
              {{ $t(tree.feature) }}
            </div>
          </div>
          <div class="flex justify-end gap_5">
            $KILL 
            <!-- <img src="~assets/image/dashboard/spring_token.svg" alt=""/> -->
            <span class="text-[#D89F0E]">{{ pendingReward(tree) }}</span>
          </div>
        </div>
        <div class="r_flex gap_5"  @click="selectNFT(tree)">
          <div class="r_flex gap_3 items-center">
            <img src="~/assets/image/ammo-little.png" alt="" />
              <span>{{
                getUsedAmmoCount(tree)
              }}</span>
            <div class="w-[20px] h-[20px] rounded-full bg-[green] ml-2" v-if="rewardLevel(tree) == 0"></div>
            <div class="w-[20px] h-[20px] rounded-full bg-[yellow] ml-2" v-else-if="rewardLevel(tree) == 1"></div>
            <div class="w-[20px] h-[20px] rounded-full bg-[red] ml-2" v-else-if="rewardLevel(tree) == 2"></div>
            <div class="w-[20px] h-[20px] rounded-full bg-[gray] ml-2" v-else-if="rewardLevel(tree) == 3"></div>
          </div>
        </div>
      </div>
    </v-col>
     <video v-if="seedOpenvideo"  autoplay loop webkit-playsinline playsinline style="width: 100vw; height: 100vh; position: fixed; top:0; left: 0; z-index: 999" @ended="onVideoEnd">
          <source :src="seedOpenvideo" type="video/mp4">
         {{$t('videotag')}}
        </video>
    <TreeNFTDetails
      :detail_dialog="details"
      :treeNFT="selectedNFT"
      @close="close"
    />
  </v-row>
</div>
  
</template>
<script lang="ts">
import { Vue, Component } from "nuxt-property-decorator";
import { LuckyBox } from "~/models/luckybox";
import { NFT } from "~/models/nft";
import {
  NAME_TO_URL,
  NODENAME_TO_IMAGE,
  PLOT_VIDEOS,
  BOOSITEM_VIDEOS,
  LUCKY_BOX_IMAGES,
  // LUCKYBOX_OPENVIDEO_BY_TYPE
} from "~/models/constants";
import * as ethers from "ethers";
import { NodeNftNames } from '~/models/types'

const formatEther = ethers.utils.formatEther;

interface PreOrderView {
    itemName : string,
    amount : number;
    lockedValue: number;

}

@Component({
  props: {
    seeds: Array as () => LuckyBox[],
    treenfts: Array as () => NFT[],
    prenfts: Array as() => PreOrderView[]
  },
})
export default class NFTList extends Vue {
  public details: boolean = false;
  public selectedNFT: NFT | object = {};
  public isClaimAllBtnLoading: boolean = false;
  public isRevealAllBtnLoading : boolean = false;
  public selectedSeed : any = [];
  public selectedTree : any = [];
  public isChecked : any  = [];
  public isCheckedClaim : any = [];
  public error:boolean = false;
  public seedOpenvideo: string | null = null;
  public isRevealItemBtn : boolean = false;
  public preOrderNFTList : any = []
  public getUsedAmmoCount(treeNFT) {
    return this.$store.getters['nft/usedAmmosByTokenId'](treeNFT.tokenId ?? ethers.BigNumber.from(0)) ?? 0;
  }
  public waterMActiveCount(treeNFT) {
    const result = this.$store.getters["booster/waterMReaminingTime"](treeNFT.tokenId? treeNFT.tokenId : ethers.BigNumber.from(0));
    return result.totalActiveItem;
  }

  public waterLActiveCount(treeNFT) {
    const result = this.$store.getters["booster/waterLReaminingTime"](treeNFT.tokenId? treeNFT.tokenId : ethers.BigNumber.from(0));
   return result.totalActiveItem;
  }

  public fertilizerMActiveCount(treeNFT) {
    const result = this.$store.getters["booster/fertilizerMReaminingTime"](treeNFT.tokenId? treeNFT.tokenId : ethers.BigNumber.from(0));
   return result.totalActiveItem;
  }

  public rewardLevel(treeNFT) {
    return this.$store.getters['nft/rewardLevelByTokenId'](treeNFT.tokenId)  ? this.$store.getters['nft/rewardLevelByTokenId'](treeNFT.tokenId)  : 0;
  }

  public fertilizerLActiveCount(treeNFT) {
    const result = this.$store.getters["booster/fertilizerLReaminingTime"](treeNFT.tokenId? treeNFT.tokenId : ethers.BigNumber.from(0));
   return result.totalActiveItem;
  }
  public selectNFT(tree) {
    this.details = !this.details;
    this.selectedNFT = tree;
  }
  public image(collection) {
    if (collection.attribute == "")
      return (LUCKY_BOX_IMAGES as any)[collection.type];
  }
  public video(collection) {
    if (collection.attribute == "")
      return (LUCKY_BOX_IMAGES as any)[collection.type];
    else
      return (LUCKY_BOX_IMAGES as any)[
        collection.nodeType + " " + collection.attribute
      ];
  }

  public video_preOrder(collection) {
    return (LUCKY_BOX_IMAGES as any)[collection]
  }
  public video_tree(collection) {
    if (collection.attribute == "")
      return (NODENAME_TO_IMAGE as any)[collection.nodeType];
    else
      return (NODENAME_TO_IMAGE as any)[
        collection.nodeType + " " + collection.attribute
      ];
  }
  public image_tree(collection) {
    if (collection.attribute == "")
      return (NODENAME_TO_IMAGE as any)[collection.nodeType];
    else
      return (NODENAME_TO_IMAGE as any)[
        collection.nodeType + " " + collection.attribute
      ];
  }
  public pendingReward(tree) {
    return parseFloat(formatEther(tree.userPendingRewards)).toFixed(3);
  }
  async onPreOrderReveal(nftName) {
    let index;
    switch(nftName) {
      case 'Infantry Tent':
        index = 0;
        break;
      case 'Rocketeer Tent':
        index = 1;
        break;
      case 'Heavy Gunner Tent':
        index = 2;
        break;
      case 'Sniper Tent':
        index = 3;
        break;
    }

    try {
      await this.$store.dispatch('luckyboxes/preOrderReveal',index)
    }
    catch(e) {
      this.error = true
    } finally {
       this.isRevealItemBtn = false
    }
    //  if(!this.error)
    //   this.seedOpenvideo = (LUCKYBOX_OPENVIDEO_BY_TYPE as any)[nftName + ' ' + 'Seed']
  }
  async onReveal(luckyBox: LuckyBox, index: number) {
    const { tokenId, type } = luckyBox;
    
    try {
      this.isRevealItemBtn = true
      await this.$store.dispatch("luckyboxes/reveal", [tokenId]);
    } catch(e) {
      this.error = true
    } finally {
       this.isRevealItemBtn = false
    }
    // if(!this.error)
    //   this.seedOpenvideo = (LUCKYBOX_OPENVIDEO_BY_TYPE as any)[type]
  }
  public nftCreateTime(tree) {
    let nftTime = new Date(tree.obtainingTime);
    return nftTime.toLocaleDateString("en-us", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }



  async onClaimAll() {
    try {
      this.isClaimAllBtnLoading = true;      
      if(this.selectedTree.length == 0)
        await this.$store.dispatch("nft/claimRewards",this.$props.treenfts);
      else
         await this.$store.dispatch("nft/claimRewards",this.selectedTree);
    } finally {
      this.selectedTree = [];
      for(let i = 0 ; i < this.$props.treenfts.length ; i++)
        this.isCheckedClaim[i] = false
      this.isClaimAllBtnLoading = false;
    }
  }

  async onRevalAll() {
    try {
      let tokenIds :ethers.BigNumber[] = [];
      this.$props.seeds.map((nft,id) => tokenIds.push(nft.tokenId))
      this.isRevealAllBtnLoading = true;
      if(this.selectedSeed.length == 0)
        await this.$store.dispatch("luckyboxes/reveal",tokenIds);
      else
        await this.$store.dispatch("luckyboxes/reveal",this.selectedSeed);
    } finally {
      this.isRevealAllBtnLoading = false;
      this.selectedSeed = [];
      for(let i = 0 ; i < this.$props.seeds.length ; i++)
        this.isChecked[i] = false
    }
  }
  
  onVideoEnd () {
    this.seedOpenvideo = null;
    const el = this.$refs.table;
    if (el) {
      (el as any).scrollIntoView({ behavior: 'smooth' });
    }

  }
  public onCheck(collection) {
     for(let i = 0 ; i < this.$props.seeds.length ; i++)
     {
      this.isCheckedClaim[i] =  false
       this.selectedTree = [];

     }
    const result = this.selectedSeed.findIndex((seed,id) => collection.tokenId.eq(seed))
    if(result == -1)
      this.selectedSeed.push(collection.tokenId)
    else
      this.selectedSeed.splice(result,1)
  }

  public onSelectAll() {
    for(let i = 0 ; i < this.$props.seeds.length ; i++)
    {
      this.isChecked[i] = false
    }
    this.selectedTree = [];
    for(let i = 0 ; i < this.$props.treenfts.length ; i++) {
      this.isCheckedClaim[i] = true;
      this.selectedTree.push(this.$props.treenfts[i]);
    }
    this.details = false;
  }

  public onClaimCheck(collection) {
    for(let i = 0 ; i < this.$props.seeds.length ; i++)
    {
      this.isChecked[i] = false
      this.selectedSeed = [];
    }
    this.details = false;
    const result = this.selectedTree.findIndex((seed,id) => collection.tokenId.eq(seed.tokenId))
    if(result == -1)
      this.selectedTree.push(collection)
    else
      this.selectedTree.splice(result,1)
  }

  public close() {
    this.details = false;
  }

  get tokenCount() {
    return this.selectedSeed.length ? this.selectedSeed.length : 0;
  }

  get claimTreeCount() {
    return this.selectedTree.length ? this.selectedTree.length : 0;
  }
  get soundOption() {
    return this.$store.state.setting.sound_option
  }

  public amountNumber (bn: ethers.BigNumber) {
    return parseInt(bn._hex)
  }

  created() {
    this.$props.prenfts.map((item:any) => {
      for(var i = 0 ; i < this.amountNumber(item.amount) ; i++)
        this.preOrderNFTList.push(item.itemName)
    })
    this.selectedSeed = [];
    this.selectedTree = [];
    for(let i = 0 ; i < this.$props.seeds.length ; i++)
      this.isChecked[i] = false
    for(let i = 0 ; i < this.$props.treenfts.length ; i++)
      this.isCheckedClaim[i] = false
  }
}
</script>
<style scoped>
.node-video {
  width: 100%;
  border-radius: 14px;
  object-fit: cover;
  opacity: 1;
}
.node-video:hover {
  /* border: #D89F0E;
  border-style: solid;
  border-width: 2px; */
  cursor: pointer;
  /* opacity: 0.8; */
}
.seed_collection_card {
  border-radius: 24px;
  width: 100%;
  object-fit: fill;
}

.reveal_item {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  flex-wrap: wrap;
}
.reveal_item_color {
  color: #D89F0E;
  font-size: 14px;
}
.reveal_item_color:hover {
  cursor: pointer;
}
.tree_name {
  width: 70px;
  height: 14px;
  background: #fcd34d;
  border-radius: 2px;
  color: #d97706;
  padding: 0px 3px;
  align-items: center;
  font-size: 10px;
  text-align: center;
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
.reveal_btn {
  position: relative;
}
.reveal_btn:hover > .reveal_hover {
  display: flex;
}
.reveal_hover {
  position: absolute;
  display: none;
  justify-content: flex-end;
  right: 0;
  margin-top: -62px;
  padding: 0px 27px;
  align-items: center;
  width: 100%;
}
.nft_hover :hover {
  cursor: pointer;
}
.boosterItem {
  width: 21px;
  height: 21px;
}
.item_check {
  position: absolute;
  top: 6px;
  right:0px;
  margin-right: 15px;
}
.count_color {
  color: #D89F0E; 
}
.multi_btn {
  justify-content: flex-end;
}
.buy_dialog_mobile {
    display:none;
}
.buy_dialog_desktop {
  display: block;
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
  .multi_btn {
   justify-content: flex-start;
  }
  .buy_dialog_mobile {
    display:block;
  }
  .buy_dialog_desktop {
    display: none;
  }
}
</style>
