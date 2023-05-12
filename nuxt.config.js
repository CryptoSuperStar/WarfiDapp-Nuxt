import colors from 'vuetify/es5/util/colors';
import i18n from './config/i18n';
export default {
  env: {
    isTestnet: false
  },
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,
  server: {
    port: (process.env.APP_TARGET == "DEV" ? 7500 : 8500), // default: 3000
    host: '0.0.0.0', // default: localhost
  }, // other configs
  generate: {
    minify: false,
  },
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: '%s - dApp.warfi.games',
    title: 'dApp.warfi.games',
    htmlAttrs: {
      lang: 'en',
    },
    meta: [{
      charset: 'utf-8',
    },
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1',
    },
    {
      hid: 'description',
      name: 'description',
      content: '',
    },
    {
      name: 'format-detection',
      content: 'telephone=no',
    },
    ],
    link: [{
      rel: 'icon',
      type: 'image/x-icon',
      href: '/favicon.ico',
    }],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '@/assets/css/main.scss',
    '@/assets/css/global.css',
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    { src: '~/plugins/ethers', mode: 'client' },
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',
    [
      'nuxt-i18n',
      {
        vueI18nLoader: true,
        defaultLocale: 'en',
        locales: [{
          code: 'en',
          name: 'English',
          img : 'https://twemoji.maxcdn.com/v/13.1.1/svg/1f1fa-1f1f8.svg',
        },
        {
          code: 'fr',
          name: 'Français',
          img : 'https://twemoji.maxcdn.com/v/13.1.1/svg/1f1eb-1f1f7.svg',
        },
        {
          code: 'ja',
          name: '日本語',
          img : 'https://twemoji.maxcdn.com/v/13.1.1/svg/1f1ef-1f1f5.svg'
        },
        {
          code: 'de',
          name: 'Deutsch',
          img : 'https://twemoji.maxcdn.com/2/svg/1f1e9-1f1ea.svg',
        },
        {
          code: 'cn',
          name: '中国',
          img : 'https://twemoji.maxcdn.com/v/latest/svg/1f1e8-1f1f3.svg',
        },
      ],
        vueI18n: i18n,
      },
    ],
    '@nuxt/typescript-build',
    '@nuxt/postcss8',
    '@nuxtjs/device',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [],
  // i18n: {
  //   locales: [
  //     {
  //       code: "en",
  //       name: "English"
  //     },
  //     {
  //       code: "ja",
  //       name: "Japnese"
  //     },
  //     {
  //       code: "fr",
  //       name: "France"
  //     }
  //   ],
  //   defaultLocale: "en",
  //   vueI18n: {
  //     fallbackLocale: "en",
  //     messages: {
  //       en,
  //       ja,
  //       fr
  //     }
  //   }
  // },
  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: [],
    theme: {
      dark: false,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3,
        },
      },
    },
    treeShake: true,
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    postcss: {
      plugins: {
        tailwindcss: {},
        autoprefixer: {},
      },
    },
  },
};
