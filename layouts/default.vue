<template>
  <v-app>
  <!-- <v-alert
  dismissible
  color="green"
  type="info"
  width="100%" 
  
>

<strong>

Cherry Ruby Lottery ♦️
<br>
Only 1 Mint, 3,60% Daily
<br>
You can buy your Ticket <a href="https://app.spring.game/lottery"> Here</a>
<br>
<br>
$50 GIVEAWAY RT + COMMENT this<a href="https://twitter.com/spring_gamefi/status/1571178239401287681" target="_blank">Tweet</a>
<br>
<br>
#SeedNation🌿 
<br>
We are working on the Spring Game Protocol v3👀
<br>
Starting Sunday night, no more First Generation of Trees and Plots will be available for Sale😨
<br>
This is your last chance to get First Generation Trees and Plots🤯
<br>
$100 GIVEAWAY on this <a href="https://twitter.com/spring_gamefi/status/1571916437673119745" target="_blank">Tweet</a>

</strong>

</v-alert> -->
    <v-app-bar
      max-height="80px"
      color="unset"
      elevation="0"
      class="app_bar"
    >

      <img class="spring_icon" src="~/assets/image/logo.png" @click="$router.push('/dashboard')">
      <div class="btn_group">
        <div class="r_flex tabList aligins_center">
          <v-list color="unset">
            <v-list-item
              v-for="(item, i) in items"              
              :key="`${item.title}-${i}`"
              :to="item.to"
              router
              exact
              color="white"
            >
              <v-list-item-content>
                <v-list-item-title v-text=$t(item.title) />
              </v-list-item-content>
            </v-list-item>
          </v-list>
          <v-menu offset-y>
            <template #activator="{ on, attrs }">
              <div
                class="resource_btn"
                v-bind="attrs"
                v-on="on"
              >
                {{$t('resources')}}
              </div>
            </template>
            <v-list class="resource_list" color="white">
              <v-list-item
                v-for="(item, index) in resource_items"
                :key="index"
                color="white"
              >
                <a :href="item.to" target="_blank"><v-list-item-title class="desktop_link_color" v-text=$t(item.title) /></a>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-menu offset-y>
            <template #activator="{ on, attrs }">
              <div
                class="resource_btn"
                v-bind="attrs"
                v-on="on"
              >
                {{$t('language')}}
              </div>
            </template>
            <v-list min-width="200px" class="resource_list" color="white">
              <v-list-item
                v-for="(item, index) in $i18n.locales"
                :key="index"
                color="white"
                :class="selectedlang == item.code ? 'selected_lang' : ''"
              >
              <div class="lang_list" @click="selectLang(item.code)">
                <img :src="item.img" class="country_flag" alt="">
                <span class="lang_color">{{item.name}}</span>
              </div>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-menu offset-y>
            <!-- <template #activator="{ on, attrs }">
              <div
                class="resource_btn"
                v-bind="attrs"
                v-on="on"
              >
                {{$t('Sound')}}
              </div>
            </template> -->
            <v-list min-width="150px" class="resource_list" color="white">
              <v-list-item
                v-for="(item, index) in sound_option"
                :key="index"
                color="white"
                :class="soundOption == item.title ? 'selected_lang' : ''"
              >
              <div class="lang_list" @click="selectSoundOption(item.title)">
                <img :src="item.icon" class="country_flag" alt="">
                <span class="lang_color">{{$t(item.title)}}</span>
              </div>
              </v-list-item>
            </v-list>
          </v-menu>
          <!-- <img src="~assets/image/sound-medium.svg" alt="" /> -->
        </div>
        <div class="connection_btn">
          <BuyItemListBtn />
          <ConnectionBtn />
        </div>
      </div>
      <!-- <v-spacer /> -->
      <v-btn
        icon
        class="mini_menu"
        @click.stop="rightDrawer = !rightDrawer"
      >
        <img class="mini_menu" src="~/assets/image/mini_menu.svg">
      </v-btn>
    </v-app-bar>
    <v-main>
      <!-- <v-alert
        v-if="displayError"
        v-model="displayError"
        class="alert-component mt-4"
        type="error"
        dismissible
        transition="scale-transition"
      >
        {{ error }}
      </v-alert> -->
      <transition name="scale-transition" mode="out-in">
        <Nuxt />
      </transition>
    </v-main>
    <v-navigation-drawer
      v-model="rightDrawer"
      temporary
      fixed
      right
      width="100%"
      color="3001802"
    >
      <div class="spring_mini_icon">
        <img class="spring_navigation_icon" src="~/assets/image/logo.png">
        <VIcon class="drawer_close_icon" color="#D89F0E" @click="closeNavigation">
          mdi-close
        </VIcon>
      </div>
      <div v-if="!viewResource && !viewLanguage && !viewSoundOption">
        <v-list class="mini_menu_list">
          <v-list-item
            v-for="(item, i) in items"
            :key="`${item.title}-${i}`"
            :to="item.to"
            router
            exact
            color="white"
            height="100%"
          >
            <v-list-item-content>
              <v-list-item-title v-text=$t(item.title) />
            </v-list-item-content>
          </v-list-item>
          <span class="resource_btn" @click="viewResource = !viewResource"> {{$t('resources')}}</span>
          <span class="resource_btn" @click="viewLanguage = !viewLanguage"> {{$t('language')}}</span>
          <span class="resource_btn" @click="viewSoundOption = !viewSoundOption"> {{$t('Sound')}}</span>
        </v-list>
      </div>
      </div>
      <div v-if="viewLanguage" class="mini_resourece_list_h" >
        <div class="resourece_list" @click="viewLanguage = !viewLanguage" ><img class="arrow_icon" src="~/assets/image/arrow_icon.svg" alt=""> {{$t('resources')}}
        </div>
        <v-list v-if="viewLanguage" class="mini_menu_resource">
          <v-list-item
            v-for="(item, index) in $i18n.locales"
            :key="index"
            class="lang_list_width"
            :class="selectedlang == item.code ? 'selected_lang' : ''"
          >
            <v-list-item-content>
              <div class="lang_list" @click="selectLang(item.code)">
                <img :src="item.img" class="country_flag" alt="">
                <span class="lang_color">{{item.name}}</span>
              </div>
            </v-list-item-content>
            <!-- <div class="lang_list" @click="selectLang(item.code)">
              <img :src="item.img" class="country_flag" alt="">
              <span class="lang_color">{{item.name}}</span>
            </div> -->
          </v-list-item>
        </v-list>
      </div>
      <div v-if="viewSoundOption" class="mini_resourece_list_h" >
        <div class="resourece_list" @click="viewSoundOption = !viewSoundOption" ><img class="arrow_icon" src="~/assets/image/arrow_icon.svg" alt=""> {{$t('resources')}}
        </div>
        <v-list min-width="150px" class="resource_list" color="unset">
          <v-list-item
            v-for="(item, index) in sound_option_mobile"
            :key="index"
            color="unset"
            :class="soundOption == item.title ? 'selected_lang' : ''"
          >
          <div class="lang_list" @click="selectSoundOption(item.title)">
            <img :src="item.icon" class="country_flag" alt="">
            <span class="lang_color">{{$t(item.title)}}</span>
          </div>
          </v-list-item>
        </v-list>
      </div>
      <div v-if="viewResource" class="mini_resourece_list_h" >
        <div class="resourece_list" @click="viewResource = !viewResource" ><img class="arrow_icon" src="~/assets/image/arrow_icon.svg" alt=""> {{$t('resources')}}
        </div>
        <v-list v-if="viewResource" class="mini_menu_resource">
          <v-list-item
            v-for="(item, i) in resource_items"
            :key="`${item.title}-${i}`"
          >
            <v-list-item-content>
              <a :href="item.to" target="_blank"><v-list-item-title class="link_color" v-text=$t(item.title) /></a>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </div>
      <div v-if="(viewResource == false  || btnhidden == true) && viewLanguage == false && viewSoundOption == false"  class="flex flex-col gap-1 justify-center">
        <!-- <BuyItemListBtn @hiddenBtn="closeNavigation" @showbtn="rightDrawer = !rightDrawer" /> -->
        <ConnectionBtn />
      </div>
    </v-navigation-drawer>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';
const IF_INCLUDE_ERROR_MSG = {
  'User denied transaction signature': 'You must accept the transaction',
  'Global limit reached': 'Global limit reached',
  'Creation with pending limit reached for user': 'Creation with pending limit reached for user',
  'Balance too low for creation': 'Balance too low for creation',
  'Not enough pending': 'You don\'t have enough pending rewards to create a new node',
  'contract call run out of gas': 'Contract call run out of gas, the transaction was reverted',
};
@Component({
  transition: 'scale-transition',
})
export default class Default extends Vue {
  public rightDrawer : boolean = false;
  public viewResource: boolean = false;
  public btnhidden: boolean = false;
  public dialog : boolean = false;
  public dialog1 : boolean = false;
  public selectedlang : string = "";
  public selectedSoundOption : string = "";
  public name;
  public viewLanguage = false;
  public viewSoundOption = false;
  public sound_option = [
    {
      icon : require("../assets/image/sound-medium.svg"),
      title: 'ON'
    },
     {
      icon : require("../assets/image/sound-off.svg"),
      title: 'OFF'
    }
  ]

  public sound_option_mobile = [
    {
      icon : require("../assets/image/soundOnM.svg"),
      title: 'ON'
    },
     {
      icon : require("../assets/image/soundOffM.svg"),
      title: 'OFF'
    }
  ]
  public resource_items = [
      {
      icon: 'mdi-apps',
      title: "Website",
      to: 'https://warfi.games/'
    },
      {
      icon: 'mdi-apps',
      title: "Documentation",
      to: 'https://chechenchaserorganization.gitbook.io/warfi-p2e/'
    },
    {
      icon: 'mdi-apps',
      title: this.$t('twitter'),
      to: 'https://twitter.com/WarFiP2e'
    },
    {
      icon: 'mdi-chart-bubble',
      title: this.$t('discord'),
      to: 'https://discord.com/invite/bqs3JG8ghx'
    },
    // {
    //   icon: 'mdi-chart-bubble',
    //   title: this.$t('springchart'),
    //   to: 'https://dexscreener.com/bsc/0x138d6cfd3085be40a37701d0e8362966517928f3'
    // },
    {
      icon: 'mdi-chart-bubble',
      title: this.$t('disclaimer'),
      to: 'https://warfi.games/disclaimer.pdf'
    },
    {
      icon: 'mdi-chart-bubble',
      title: this.$t('buyspr'),
      to: 'https://pancakeswap.finance/swap?outputCurrency=0xF2FAB804C4Bbd38CdbbF20394dfD223095edA0ae&inputCurrency=0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56'
    }
  ]
  public items = [
    {
      icon : 'mdi-chart-bubble',
      title : 'mycollection',
      to : '/myCollection'
    },
    // {
    //   icon: 'mdi-chart-bubble',
    //   title: 'Market',
    //   to: '/market'
    // },
    // {
    //   icon: 'mdi-chart-bubble',
    //   title: 'Lottery',
    //   to: '/lottery'
    // },
    {
      icon: 'mdi-chart-bubble',
      title: 'Presale',
      to: '/presale'
    },
  ];

  private error: string | false = false;

  mounted() {    
    this.$i18n.locale = localStorage.getItem('locale') ?? 'en';
    this.selectedlang = this.$i18n.locale
    this.$store.dispatch('setting/loadOption')
    // if(localStorage.getItem('sound') !=null)
    //   this.selectedSoundOption  = localStorage.getItem('sound') ?? 'ON'
    // else
    //   {
    //     localStorage.setItem('sound', 'ON')
    //     this.selectedSoundOption = "ON"
    //   }
  }
  
  get displayError () {
    return this.error !== false;
  }

  get soundOption() {
    console.log(this.$store.state.setting.sound_option,"this.$store.state.setting.sound_option")
    return this.$store.state.setting.sound_option;
  }
  set displayError (display: boolean) {
    if (!display) {
      this.error = false;
    }
  }

  public selectedItem (selectedName) {
    this.dialog1 = !this.dialog1;
    this.dialog = false;
    this.name = selectedName;
  }
  public selectLang(code) {
    this.$i18n.locale = code;
    localStorage.setItem("locale",code);
    this.selectedlang = this.$i18n.locale;
    this.rightDrawer = false;
  }

  public selectSoundOption(option) {
    localStorage.setItem("sound",option);
    this.$store.dispatch("setting/setSoundOption", {option : option})
    // this.selectedSoundOption = option;
    this.rightDrawer = false;
  }

  errorCaptured (error: any) {
    console.error(error);
    if (error?.code === -32603 && error?.data?.message) {
      this.error = error.data.message;
    } else {
      this.error = error?.message ?? error;
    }

    const replaced = Object.entries(IF_INCLUDE_ERROR_MSG).find(([key]) => (this.error as string).toLowerCase().includes(key.toLowerCase()));
    if (replaced) {
      this.error = replaced[1];
    }

    return false;
  }

  closeNavigation() {
    this.rightDrawer = !this.rightDrawer;
    this.viewResource = false;
    this.viewLanguage = false;
    this.viewSoundOption = false;
  }

}
</script>

<style scoped>

.alert-component {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  margin: auto;
  width: 320px;
  z-index: 10;
}
.app_bar {
  padding: 0px 200px;
}
.spring_icon {
  height: 85px;
  width: 170px;
  margin-right: 32px;
}
.spring_icon:hover{
  cursor: pointer;
}
.spring_navigation_icon {
  height: 80px;
  width: 150px;
  margin-left: 0px;
  margin-top: 50px;
}
.mini_menu {
  display: none !important;
}

.spring_mini_icon {
  display: flex;
  padding: 0px 20px;
}

.drawer_close_icon {
  cursor: pointer;
  margin-top: 38px;
  margin-left: auto !important;
}

.mini_menu_list {
  align-items: center;
  padding-top: 46%;
  margin-bottom: 58%;
}

.mini_menu_resource {
  align-items: center;
  padding-top: 30%;
}
.connection_btn {
  display: flex !important;
  gap: 16px;
  align-items: center;
}
.resourece_list {
  background: #D89F0E;
  height: 40px;
  padding: 10px 20px;
  display: flex;
  gap: 8px;
  margin-top: 20px;
}
.link_color {
  color: white;
}
.desktop_link_color {
  color: black;
}
.desktop_link_color:hover {
  point: cursor;
  color: #D89F0E;
}
.link_color:hover {
  point: cursor;
  color: #D89F0E;
}
.resource_list {
  flex-direction: column;
  background: white;
}
.resource_btn {
  padding: 17px;
  color: white;
}
.resource_btn:hover {
  color: #D89F0E;
}
.v-list-item--link:before {
  background:none !important;
}
.v-list-item__content:hover {
  color: #D89F0E !important;
}
.v-list-item__content {
  color: white !important;
}
.v-footer {
  padding: 0px !important;
}
.footer {
  display: none;
}
.item_container {
  background: #001802;
}
.item_list {
    height: 68px;
    position: relative;
    padding: 26px 44px;
    text-align: center;
}
.item_content {
    display: flex;
    flex-direction: column;
    padding: 40px;
    gap: 40px;
}
.item_content :hover {
  cursor: pointer;
  color: #D89F0E
}

.btn_group {
  display: flex;
  justify-content: space-between;
  width: 100%;
}
.lang_list {
  display: flex;
  gap: 5px;
}
.lang_list:hover{
  cursor: pointer;
}
.country_flag {
  width: 20px;
}
.lang_color {
  color: #001202;
}
.selected_lang {
  background : #D89F0E;
}
@media only screen and (max-width: 600px) { 

  .app_bar {
    padding: 0px 20px;
  }
  .spring_icon {
    margin-left: 0px;
    margin-top: 37px;
  }
  .tabList {
    display: none !important;
  }
  .mini_menu {
    display: block !important;
    margin-top: 13px;
  }
  .connection_btn {
    display: none !important;
  }
  .footer {
    display: block;
    background: #31ad35;
    height: 70px;
    text-align: center;
    width: 100%;
    padding: 20px 0px;
  }
  .item_container {
    height: 100%;
  }
  .lang_color {
    color: white;
  }
  .lang_list_width {
    width: 200px;
  }
}
</style>
