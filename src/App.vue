<template>
  <v-app>
    <v-app-bar app class="teal darken-4">
      <v-toolbar-title class="headline text-uppercase">
        <span class="mr-2">Betsy</span>
        <span class="font-weight-light subtitle-2">alpha 0.5</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn 
          v-if='this.$store.getters.activeGame'
          @click='onLeaveGame()'
          text>
          <v-icon small left>mdi-exit-run</v-icon>
          <span class="d-md-flex d-none">Leave game</span>
        </v-btn>
      </v-toolbar-items>
    </v-app-bar>
    
    <div class="text-center">
      <v-overlay :value="this.$store.getters.loader">
        <v-progress-circular indeterminate size="64"></v-progress-circular>
      </v-overlay>
    </div>

    <v-content class="mt-0 ml-0 mr-0">
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<script>
  export default {
    data: () => ({
      
      //
    }),
    
    created () {
    },

    methods: {
      async onLeaveGame () {
        this.$store.dispatch('loaderOn')   
        await this.$store.dispatch('leaveGame')
        await this.$store.dispatch('players/closeDBChannel', {clearModule: true})
        await this.$store.dispatch('bets/closeDBChannel', {clearModule: true})
        //this.$router.push({ path: `/` })
        window.location.href = '/'
         //this.$store.dispatch('loaderOff') 
      }
    }
  };
</script>
