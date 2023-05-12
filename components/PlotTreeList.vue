<template>
  <div>
    <div
      class="plot_tree_container buy_dialog_desktop"
      @click="selectedPlot"
    >
      <div class="">
        <video v-if="soundOption == 'ON'"  class="node-video"  autoplay loop webkit-playsinline playsinline>
          <source :src="video" type="video/mp4" />
          {{$t('videotag')}}
        </video>
        <video v-if="soundOption == 'OFF'"  class="node-video"  autoplay loop muted webkit-playsinline playsinline>
          <source :src="video" type="video/mp4" />
          {{$t('videotag')}}
        </video>
      </div>
      <div class="flex flex-col gap-[5px] items-center mt-[15px]">
        <span text-center>{{ $t(name) }}</span>
         <v-btn
          dark
          x-large
          elevation="0"
          class="btn_wrapper"
        >
          <span class="btn_color">{{$t('buyfor')}}{{ price }}</span>
        </v-btn>
      </div>
    </div>
    <div
      class="plot_tree_container buy_dialog_mobile"
      @click="mini_selectedPlot"
    >
        <img class="node-video"  :src="image" alt="">
      <div class="flex flex-col gap-[5px] items-center mt-[15px]">
        <span text-center>{{ name }}</span>
        <v-btn
          dark
          x-large
          elevation="0"
          class="btn_wrapper"
        >
          <span class="btn_color">{{$t('buyfor')}} {{ price }}</span>
        </v-btn>
      </div>
    </div>
    <v-dialog v-model="dialog" width="375">
      <BuyItem
        :index="index"
        :name="name"
        :cost="price"
        :dialogOpen="dialog"
        :itemType="`plot`"
        class="buy_dialog_desktop"
        @close="() => (dialog = false)"
      />
    </v-dialog>
    <v-dialog v-model="dialog1" fullscreen>
      <BuyItem
        :index="index"
        :name="name"
        :cost="price"
        :dialogOpen="dialog1"
        :itemType="`plot`"
        class="buy_dialog_mobile"
        @close="() => (dialog1 = false)"
      />
    </v-dialog>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from "nuxt-property-decorator";
import * as eth from "ethers";
import { PLOT_VIDEOS,PLOT_IMAGES } from '~/models/constants';
const formatEther = eth.utils.formatEther;

@Component({
  props: {
    index: { type: Number },
    name: { type: String },
    cost: { type: eth.BigNumber },
  },
})
export default class PlotTreeList extends Vue {
  public dialog: boolean = false;
  public dialog1: boolean = false;
  private selectedItemIndex: number = 0;

  // get nodeType() {
  //   return this.$store.getters["nodes/nodeTypeByName"](this.$props.name);
  // }

  get price() {
    return formatEther(this.$props.cost);
  }

  get video (): any {
    return (PLOT_VIDEOS as any)[this.$props.name];
  }

  get image (): any {
    return (PLOT_IMAGES as any)[this.$props.name];
  }

  get soundOption() {
    console.log(this.$store.state.setting.sound_option,"vvvvvvvvvv")
    return this.$store.state.setting.sound_option
  }

  public selectedPlot() {
    this.dialog = !this.dialog;
  }

  public mini_selectedPlot() {
    this.dialog1 = !this.dialog1;
  }
}
</script>
<style scoped>
.plot_tree_container {
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: center;
}
.node-video {
  width: 100%;
  /* height: 280px; */
  border-radius: 14px;
  object-fit: cover;
}
.node-video {
  cursor: pointer;
}
.plot_img {
  /* background: radial-gradient(
      59.64% 59.64% at 50% 50%,
      rgba(164, 189, 62, 0.6) 0%,
      rgba(0, 0, 0, 0) 100%
    ),
    rgba(255, 255, 255, 0.05);
  box-shadow: inset 0px 0px 16px 4px rgba(255, 255, 255, 0.05); */
  border-radius: 24px;
}
.buy_dialog_desktop {
  display: block;
}
.buy_dialog_mobile {
  display: none !important;
}
.btn_wrapper{
  background: #D89F0E !important;
  padding: 10px 16px 10px 16px;
  border-radius: 4px;
  height: 40px !important;
}
.btn_color {
  color: white;
  font-size: 14px;
  display: flex;
  gap: 4px;
  align-items: center;
}
@media only screen and (max-width: 600px) {
  .plot_img {
    width: 100%;
  }
  .buy_dialog_desktop {
    display: none !important ;
  }
  .buy_dialog_mobile {
    display: block !important;
  }
  .plot_tree_container {
    margin: 15px 0px;
  }
}
</style>
