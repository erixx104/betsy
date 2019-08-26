<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title class="headline text-uppercase">
        <span class="mr-2">Betsy</span>
        <span class="font-weight-light">alpha 0.2</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn 
          v-if='this.$store.getters.activeGame'
          @click='onLeaveGame()'
          text>
          <v-icon small left>mdi-exit-run</v-icon>
          Leave game
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

    methods: {
      onLeaveGame () {
        this.$store.dispatch('leaveGame')
      }
    }
  };
</script>
