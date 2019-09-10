import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false



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