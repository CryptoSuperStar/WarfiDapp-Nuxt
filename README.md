

## Usage

### Run Development server

```sh
npm run dev
```

Go to [http://localhost:7000](http://localhost:7000)

### Build/Run SSR enabled application

```sh
npm run build
npm start
```

### Static Generation

[![Netlify Status](https://api.netlify.com/api/v1/badges/e5bf3478-1cb8-44c4-8aeb-040083bd39ca/deploy-status)](https://nuxt-ts-template.netlify.com/)

```sh
npm run generate #=> Then distribute /dist
```

## FAQ

- Q. How about providing sample usage of "xyz" (The name of OSS which you want to use)?
  - A. Recommend running into [create-nuxt-app](https://github.com/nuxt/create-nuxt-app). This template aims to provide a minimal sample that follows the latest version of Nuxt.js and [@nuxt/typescript](https://github.com/nuxt/typescript). 
- Q. I think the usage of Vuex is not typed enough...?
  - A. We know! We desire the next major version of Vuex (v4) saves our bacon.

## How to deploy Dapp?
- For testnet
isTest: true in nuxt.config.js file
- For mainnet
isTest: false in nuxt.config.js file
- change presale address
change preslae and busd in the address.js

*** for payment token please change "createPreSale" function in the presale.ts
with test busd, allowance
  const tx = await this.$contracts.erc20(addresses.busd).connect(holder as Signer).approve(addresses.presale, BigNumber.from('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')); // for testnet with BUSD
with main busd, allowance
  const tx = await this.$contracts.erc20(addresses.wavax).connect(holder as Signer).increaseAllowance(addresses.presale, price.mul(amount)) //for mainnet with BUSD
## How to deploy contract?

```bash
$ npm install # Or alternatively, `yarn`
$ npx hardhat run scripts/presale-deploy.ts  --network testnet(or mainnet)`
``

