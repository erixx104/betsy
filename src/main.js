import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'


Vue.config.productionTip = false

const moment = require('moment')
require('moment/locale/de')

Vue.use(require('vue-moment'), {moment})

Vue.mixin({
  methods: {
    playSound (sound) {
      if(sound) {
        var audio = new Audio(sound);
        audio.play();
      }    
    }
  }
  
})


//--------------------------------------

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App),
  created () {
  },
}).$mount('#app')