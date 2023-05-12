<!-- <template>
  <div class="main_container">
    <div class="main_content">
      <span class="top-title">
        CHERRY RUBY LOTTERY
      </span>
      <span class="top-desc">
        Take your ticket and try to win the Unique Cherry Ruby Mint ♦️ 3.60% Daily
        <br/>
        <br/>

        <span class="strong-price">{{charityBalance}}</span> Already Raised for the LM
      </span>
      <span class="top-desc2">
        Lottery Wallet : 0x0550329F29AeEEeC1DcF0022a78C20d452dC9A91
        <br/>
        <br/>
        Funds will be directly send to the Liquidity Manager
        <br/>
        - 1 ticket = 10 $BUSD
        <br/>
        - 20 Tickets Paid = +1 Ticket Free
        <br/> 
        - 40 Tickets Paid = +5 Tickets Free
        <br/>  
      </span>
      <br>
      <div class="charity-div mt-2">
        <div class="send-div">
          <DataTable
            v-for="(item, i) in balances"
            :key="`${item.title}-${i}`"
            :title="item.title"
            :icon="item.icon"
            :price="item.price"
            :percentage="item.percentage"
          />
        </div>
      </div> 
      <div class="charity-div mt-2">
        <div class="send-div">
          <span>
            {{$t('amount')}}
          </span>
          <VTextField
            v-model.number="amount"
            class="centered-input"        
            type="number"
            hide-details="false"
            @input="onchange"
            dense
          />
        </div>        
      </div>
      <div class="charity-div mt-2" v-if="error == true">
        <v-alert          
          color="red"
          type="error"
          width="20%" 
          
        >
        <strong>{{$t(err)}}
        </strong>
        </v-alert>
      </div>
      <br>
      <div class="charity-div mt-2">
        <v-btn
          dark
          x-large
          elevation="0"
          @click="sendbusd"
          class="btn_wrapper"
        >
          <span class="btn_color">{{$t('send_busd')}}</span>
        </v-btn>
      </div>
    </div>
  </div>

</template>

<script lang="ts">
import { Component } from "nuxt-property-decorator";
import WalletReactiveFetch, {
  IReactiveFetch,
} from "~/mixins/wallet-reactive-fetch";
import addresses from "~/config/addresses";
import * as ethers from "ethers";
const formatEther = ethers.utils.formatEther;
import axios from 'axios';

@Component
export default class Dashboard
  extends WalletReactiveFetch
  implements IReactiveFetch
{
  public loadingData: boolean = false;
  public walletConnect : boolean = false;
  public connectWallet: boolean = false;
  public whitelisted: boolean = false;  
  public amount: number = 0;
  public busdBalance: any = 0;
  public charityBalance : any = 0;
  public error: boolean = false;
  public err: string = '';
  
  mounted() {
    this.$i18n.locale = localStorage.getItem('locale') ?? 'en';
  }

  get walletConnected() {
    return this.isWalletConnected;
  }
  async reactiveFetch() {
    // ]);
    if (this.isWalletConnected)
    {      
      await this.$store.dispatch("tokens/loadBalance", addresses.busd);
      await this.$store.dispatch("tokens/loadCharityBalance", addresses.busd);
      this.busdBalance = parseFloat(formatEther(this.$store.state.tokens.balance[addresses.busd])).toFixed(2);
      this.charityBalance = parseFloat(formatEther(this.$store.state.tokens.charityBalance)).toFixed(2);
      this.loadingData = true;
    }
    this.walletConnect = true;
  }
  
  async sendbusd() {
    if(this.amount < 10) {
      this.error = true;
      this.err = "Ticket is minimum 10 $BUSD";
      return;
    } else if (this.amount > this.busdBalance) {
      this.error = true;
      this.err = "amounterror2";
      return;
    }
    await  this.$store.dispatch("tokens/sendBusd", {
      token: addresses.busd, 
      address: addresses.charity, 
      amount:this.amount
    }).then(async ()=>{
      await this.$store.dispatch("tokens/loadCharityBalance", addresses.busd);
      this.charityBalance = parseFloat(formatEther(this.$store.state.tokens.charityBalance)).toFixed(2);
    });
  }

  public onchange() {
    this.err = "amounterror1";
    this.error = false;
  }
}
</script>
<style scoped>
.main_content {
  display: flex;
  flex-direction : column;
  width : 100%;
  height : 100%;
  justify-content: center;
}

.top-title {
  margin-top : 100px;
  font-size : 60px;
  font-weight: 700;
  text-align: center;
}
.lol {
  padding-top: 50px;
  margin-left: auto;
  margin-right: auto;
  width: 65%;
}

.top-desc {
  margin-top : 15px;
  font-size : 24px;
  padding : 10px 10px;
  text-align : center;
}
.top-desc2 {
  margin-top : 15px;
  font-size : 15px;
  padding : 10px 10px;
  text-align : center;
}
.strong-price {
  color: #D89F0E !important;
  font-weight : 900;
}
.charity-div {
  display: flex;  
  justify-content: center;
}

.btn_wrapper {
  margin-left: 64px;
  background: #D89F0E !important;
  padding: 10px 16px 10px 16px;
  border-radius: 4px;
  height: 40px !important;
}

.send-div {  
  display : flex;
  width: 35%;
  gap : 10px !important;
  align-items : baseline;
}

.address-input >>> input {
  width: 100%;
  text-align: center;
  font-size: 18px;  
  color: white !important;
  border-bottom: 1px solid #fff;  
}

.centered-input >>> input {
  text-align: center;
  font-size: 24px;  
  color: white !important;
  border-bottom: 1px solid #fff;  
}

@media only screen and (max-width: 600px) {
  .main_container {
    padding: 64px 0px 81px 0px;
  }
  .send-div {      
    width: 80%;    
  }
  .top-title {
    margin-top: 20px;
    font-size : 40px;    
  }
  .top-desc {
    margin-top : 15px;
    font-size : 18px;
  }
  .top-desc2 {
    margin-top : 15px;
    font-size : 14px;
  }
  .title_description {
    width: 100%;
    padding: 0px 20px;
  }
  .description_plot {
    flex-wrap: wrap;
    margin-top: 64px;
    padding: 0px 20px;
  }
  .desciption_title {
    font-size: 24px;
  }
  .desciption_content {
    font-size: 16px;
  }
  .invest_title {
    width: 100%;
  }
  .seed_data {
    margin-top: 32px;
    padding: 0px 20px;
  }
  .node_data {
    margin-bottom: 56px;
    padding: 0px 20px;
  }
  .main_title {
    padding: 0px 20px;
  }
  .plot_list {
    padding: 0px 20px;
  }
  /* .plot_card {
    display: block;
    margin-top: 0px;
    padding: 0px 20px;
    gap: 16px;
    width: 100%;
  } */
  .invest_description {
    margin-top: 64px;
    padding: 0px 20px;
  }
  .invest_title > span:nth-child(1) {
    font-size: 24px;
  }
  .invest_title > span :nth-child(2) {
    font-size: 16px;
  }
  .invest_item {
    margin-top: 64px;
    flex-direction: column;
    gap: 32px;
  }
  .item_description {
    width: 100%;
    gap: 16px;
    margin-right: 0px;
  }
  .booster_item {
    flex-direction: column;
    width: 100%;
    gap: 16px;
  }
  .tree_plot {
    display: none;
  }
  .description_plot {
    justify-content: center;
    margin-bottom: 15px;
  }
}

@media only screen and (max-width: 1300px) {
  .invest_item {
    flex-wrap: wrap;
  }
  .item_description {
    width: 100%;
  }
  .dash_header {
    flex-direction: column;
    gap: 5px;
  }
  .spr_buy {
    padding: 0px 20px;
  }
}
</style> -->
