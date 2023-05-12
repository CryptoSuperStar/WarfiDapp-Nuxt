/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import * as ethers from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';

import { Store } from 'vuex';
import { Plugin } from '@nuxt/types';
import WalletConnectProvider from '@walletconnect/web3-provider';
import addresses from '~/config/addresses';
import { abi as SPRING_ABI } from '~/hardhat/artifacts/contracts/SpringTestnet.sol/SpringTestnet.json';//for testnet
import { abi as HANDLER_ABI} from '~/hardhat/artifacts/contracts/Handler.sol/Handler.json';
import { abi as HANDLER_ADMINFacet_ABI} from '~/hardhat/artifacts/contracts/handler/AdministrationFacet.sol/Handler_AdministrationFacet.json';
import { abi as HANDLER_GAMELOGICFACET_ABI} from '~/hardhat/artifacts/contracts/handler/GameLogicFacet.sol/Handler_GameLogicFacet.json';
import { abi as HANDLER_ADDONSFACET_ABI} from '~/hardhat/artifacts/contracts/handler/AddonsFacet.sol/Handler_AddonsFacet.json';
import { abi as HANDLER_NFTFACET_ABI} from '~/hardhat/artifacts/contracts/handler/NFTFacet.sol/Handler_NFTFacet.json';
import { abi as HANDLER_PRESALEFACET_ABI} from '~/hardhat/artifacts/contracts/handler/PreSaleFacet.sol/Handler_PreSaleFacet.json';


import { abi as SPRING_LUCKY_BOX_ABI } from '~/hardhat/artifacts/contracts/SpringLuckyBox.sol/SpringLuckyBox.json'
import { abi as SWAPPER_ABI } from '~/hardhat/artifacts/contracts/Swapper.sol/Swapper.json';
import { abi as SPRING_PLOT_ABI } from '~/hardhat/artifacts/contracts/SpringPlot.sol/SpringPlot.json';
import { abi as SPRING_NODE_ABI} from '~/hardhat/artifacts/contracts/SpringNode.sol/SpringNode.json';
import { abi as ERC_721_ABI } from '~/hardhat/artifacts/@openzeppelin/contracts/token/ERC721/ERC721.sol/ERC721.json';
import { abi as ERC_20_ABI } from '~/hardhat/artifacts/contracts/ERC20.sol/ERC20.json';
import { abi as NODE_TYPE_ABI} from  '~/hardhat/artifacts/contracts/NodeType.sol/NodeType.json';
import { abi as SPRING_PRESALE_ABI } from '~/hardhat/artifacts/contracts/PreSale.sol/PreSale.json';
import { abi as SPRING_MARKETPLACE_ABI } from '~/hardhat/artifacts/contracts/SpringMarketPlace.sol/SpringMarketPlace.json';
import { abi as FAKE_BUSD } from '~/hardhat/artifacts/contracts/FakeBUSD.sol/FakeBUSD.json';
export interface ContractsPlugin {
  $contracts?: {
    spring: ethers.Contract;
    handlerAdministrationFacet: ethers.Contract;
    handlerGameLogicFacet: ethers.Contract;
    handlerAddonsFacet: ethers.Contract;
    handlerNFTFacet: ethers.Contract;
    handlerPresalFacet: ethers.Contract;
    presale: ethers.Contract;
    luckyBoxes: ethers.Contract;
    swapper: ethers.Contract;
    springPlot: ethers.Contract;
    springNode: ethers.Contract;
    marketplace: ethers.Contract;
    // fakebusd: ethers.Contract;
    
    nodeTypeByName: (name: string) => Promise<ethers.Contract>;
    erc721: (address: string) => ethers.Contract;
    erc20: (address: string) => ethers.Contract;
  },
  $register: {
    metamask: () => Promise<void>;
    walletConnect: () => Promise<void>; 
  },
  $logout?: () => Promise<void>;
  $web3Provider?: ethers.providers.Web3Provider;
  $addresses: typeof addresses
}

declare module 'vue/types/vue' {
  // this.$myInjectedFunction inside Vue components
  interface Vue extends ContractsPlugin {}
}

declare module '@nuxt/types' {
  // nuxtContext.app.$myInjectedFunction inside asyncData, fetch, plugins, middleware, nuxtServerInit
  interface NuxtAppOptions extends ContractsPlugin {}
  // nuxtContext.$myInjectedFunction
  interface Context extends ContractsPlugin {}
}

declare module 'vuex/types/index' {
  // this.$myInjectedFunction inside Vuex stores
  interface Store<S> extends ContractsPlugin {}
}

async function registerMetamask () {
  const provider: any = await detectEthereumProvider({
    mustBeMetaMask: true,
  });

  if (!provider) {
    throw new Error('Metamask not detected');
  }

  await provider.request({ method: 'eth_requestAccounts' });
  return new ethers.providers.Web3Provider(provider);
}

async function registerWalletConnect () {
  const walletConnect = new WalletConnectProvider({
    rpc: {
      97: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
      56: 'https://bsc-dataseed1.binance.org/',
    },
    bridge: 'https://bridge.walletconnect.org',
    qrcodeModalOptions: {
      mobileLinks: [
        'metamask',
        'trust',
      ],
    },
  });

  await walletConnect.enable();
  return new ethers.providers.Web3Provider(walletConnect);
}

function setupListeners (w3p: ethers.providers.Web3Provider, store: Store<any>) {
  const eth = w3p.provider as any;
  eth.on('accountsChanged', (accounts: string[]) => {
    if (accounts.length) {
      store.commit('wallet/setAddress', accounts[0]);
    } else {
      store.commit('wallet/setAddress', null);
    }
  });

  eth.on('chainChanged', (networkId: number) => {
    store.commit('wallet/setChainId', networkId);
  });

  eth.on('disconnect', () => store.dispatch('wallet/logout'));
}

function checkConnection (makePlugin: (provider: ethers.providers.Web3Provider, isSigned : boolean) => Promise<void>) {  
  if (window.ethereum) {
    makePlugin(new ethers.providers.Web3Provider(window.ethereum, 'any'), false);
  }
}

async function switchNetwork (provider: ethers.providers.Web3Provider, isTestnet: boolean) {
  const network = await provider.getNetwork();
  const chainId = network.chainId;
  if (chainId === (isTestnet ? 0x61 : 0x38)) {
    return;
  }

  //Avalanche Network
  
  // const testnetParams = {
  //   chainId: '0xA869',
  //   chainName: 'Avalanche Test Network',
  //   rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
  //   blockExplorerUrls: ['https://testnet.snowtrace.io/'],
  //   nativeCurrency: {
  //     name: 'AVAX',
  //     symbol: 'AVAX',
  //     decimals: 18,
  //   },
  // };

  const testnetParams = {
    chainId: '0x61',
    chainName: 'Localhost 8545',
    rpcUrls: ['http://127.0.0.1:8545/'],
    blockExplorerUrls: [''],
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
  }

  // const mainnetParams = {
  //   chainId: '0xa86a',
  //   chainName: 'Avalanche Network',
  //   rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
  //   blockExplorerUrls: ['https://snowtrace.io/'],
  //   nativeCurrency: {
  //     name: 'AVAX',
  //     symbol: 'AVAX',
  //     decimals: 18,
  //   },
  // };

  // BSC Network
  // const testnetParams = {
  //   chainId: '0x61',
  //   chainName: 'TBSC',
  //   rpcUrls: ['https://data-seed-prebsc-1-s3.binance.org:8545/'],
  //   blockExplorerUrls: ['https://testnet.bscscan.com/'],
  //   nativeCurrency: {
  //     name: 'TBNB',
  //     symbol: 'TBNB',
  //     decimals: 18,
  //   },
  // };

  const mainnetParams = {
    chainId: '0x38',
    chainName: 'Binance Smart Chain',
    rpcUrls: ['https://bsc-dataseed.binance.org/'],
    blockExplorerUrls: ['https://bscscan.com/'],
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
  };
  await (provider.provider as any).request({
    method: 'wallet_addEthereumChain',
    params: [(isTestnet ? testnetParams : mainnetParams)],
  });
}

const ethersPlugin: Plugin = ({ store, env }, inject) => {
  const makePlugin = async (provider: ethers.providers.Web3Provider | null, isSigned : boolean | false) => {
    if (!provider) {
      inject('web3Provider', null);
      inject('contracts', null);
      inject('logout', null);
      return;
    }

    inject('web3Provider', provider);

    // TODO: why this 👇 ???
    // const mainnetProvider = new ethers.providers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
    // const testnetProvider = new ethers.providers.JsonRpcProvider('https://api.avax-test.network/ext/bc/C/rpc');

    // const signer = isSigned ? provider.getSigner() : env.isTestnet ? testnetProvider : mainnetProvider;

    const signer = provider.getSigner();
    const nameContractsMap: Record<string, ethers.Contract> = {};

    const contracts: ContractsPlugin['$contracts'] = {
      spring: new ethers.Contract(addresses.Token, SPRING_ABI, signer),
      handlerAdministrationFacet: new ethers.Contract(addresses.Handler, HANDLER_ADMINFacet_ABI, signer),
      handlerGameLogicFacet: new ethers.Contract(addresses.Handler, HANDLER_GAMELOGICFACET_ABI, signer),
      handlerAddonsFacet:new ethers.Contract(addresses.Handler, HANDLER_ADDONSFACET_ABI, signer),
      handlerNFTFacet: new ethers.Contract(addresses.Handler, HANDLER_NFTFACET_ABI, signer),
      handlerPresalFacet : new ethers.Contract(addresses.Handler, HANDLER_PRESALEFACET_ABI, signer),
      presale: new ethers.Contract(addresses.presale, SPRING_PRESALE_ABI, signer),
      luckyBoxes: new ethers.Contract(addresses.SpringLuckyBox, SPRING_LUCKY_BOX_ABI, signer),
      swapper: new ethers.Contract(addresses.Swapper, SWAPPER_ABI, signer),
      springPlot : new ethers.Contract(addresses.SpringPlot, SPRING_PLOT_ABI, signer),
      springNode : new ethers.Contract(addresses.SpringNode, SPRING_NODE_ABI, signer),
      marketplace : new ethers.Contract(addresses.springMarketPlace, SPRING_MARKETPLACE_ABI, signer),
      // fakebusd: new ethers.Contract(addresses.fakeBUSD, FAKE_BUSD, signer),
      erc721 (address: string) {
        return new ethers.Contract(address, ERC_721_ABI, signer);
      },
      erc20 (address: string) {
        return new ethers.Contract(address, ERC_20_ABI, signer);
      },
      async nodeTypeByName (name: string) {
        if (!nameContractsMap[name]) {
          const address = await this.handlerAdministrationFacet.getNodeTypesAddress(name);
          nameContractsMap[name] = new ethers.Contract(address, NODE_TYPE_ABI, signer);
        }

        return nameContractsMap[name];
      },
    };

    inject('contracts', contracts);

    await switchNetwork(provider, env.isTestnet);
    setupListeners(provider, store);
    const { address, network } = {
      address: await provider.getSigner().getAddress(),
      network: await provider.getNetwork(),
    };

    store.commit('wallet/setAddress', address);
    store.commit('wallet/setChainId', network.chainId);

    inject('logout', () => {
      store.commit('wallet/logout');
      makePlugin(null, false);
    });
  };

  const register = {
    metamask: async () => await makePlugin(await registerMetamask(), true),
    walletConnect: async () => await makePlugin(await registerWalletConnect(), true),
  };

  inject('register', register);
  inject('addresses', addresses);

  checkConnection(makePlugin);
};

export default ethersPlugin;
