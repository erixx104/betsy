import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

export default new Vuetify({
  icons: {
    iconfont: 'mdi',
  },
  theme: {
    dark: true,
    themes: {
      dark: {
        primary: '#00897B',
        secondary: '#E64A19', // deep orange darken 2
        accent: '#8c9eff',
        error: '#FF5722',
      },
    },
  },
});
