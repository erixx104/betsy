<template>
  <div>
    <v-navigation-drawer class="d-md-flex d-none teal lighten-5" light
      absolute
      permanent
      right
          >

         <v-list disabled>
            <v-subheader>Scoreboard</v-subheader>
            <v-list-item-group color="primary">
              <v-list-item
                v-for="(user) in this.$store.getters['players/listActive']"
                :key="user.id"
              :class="user.id == userID ? 'teal lighten-3':''">
                <v-list-item-avatar :color="user.color" class="caption" size="24">
                  {{user.initials}}
                </v-list-item-avatar>  
                <v-list-item-content>
                  <v-list-item-title v-text="user['name']"></v-list-item-title>
                </v-list-item-content>
                <v-list-item-content class="right">
                  <v-list-item-title v-text="user['score']" class="text-right"></v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
          
          <!-- Debug-Infos -->
          <v-expansion-panels class="overline ml-1 mr-1 mt-50" v-if="this.$store.getters.isAdmin">
            <v-expansion-panel :key="1">
              <v-expansion-panel-header class="overline">Debug Info loaded Game</v-expansion-panel-header>
              <v-expansion-panel-content>
                {{ this.$store.getters.loadedGame }}
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel :key="2">
              <v-expansion-panel-header class="overline">Debug Info players</v-expansion-panel-header>
              <v-expansion-panel-content>
                {{ this.$store.getters['players/list'] }}
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel :key="3">
              <v-expansion-panel-header class="overline">Debug Info bets</v-expansion-panel-header>
              <v-expansion-panel-content>
                {{ this.$store.getters['bets/list'] }}
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel :key="4">
              <v-expansion-panel-header class="overline">Debug Info current user</v-expansion-panel-header>
              <v-expansion-panel-content>
                {{ this.$store.getters.user }}
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
          

    </v-navigation-drawer>
    
    <v-container class="d-flex d-md-none fill-height">
      <v-row
        align="center"
        justify="center"
      >
        <v-btn
          color="secondary"
                dark
                small
                absolute
                top
                left
                fab
          @click.stop="drawer = !drawer"
          style="z-index:10" class="mt-1"
        >
          <v-icon>mdi-view-headline</v-icon>
        </v-btn>
      </v-row>
    </v-container>
    
    <v-navigation-drawer class="d-flex d-md-none teal lighten-5" light
       v-model="drawer"
        absolute
        temporary
          >

         <v-list disabled>
            <v-subheader>Scoreboard</v-subheader>
            <v-list-item-group color="primary">
              <v-list-item
                v-for="(user) in this.$store.getters['players/listActive']"
                :key="user.id"
              :class="user.id == userID ? 'teal lighten-3':''">
                <v-list-item-avatar :color="user.color" class="caption" size="24">
                  {{user.initials}}
                </v-list-item-avatar>  
                <v-list-item-content>
                  <v-list-item-title v-text="user['name']"></v-list-item-title>
                </v-list-item-content>
                <v-list-item-content class="right">
                  <v-list-item-title v-text="user['score']" class="text-right"></v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
    </v-navigation-drawer>
  </div>  
</template>


<script>
    export default{
        data: () => ({
          drawer : false
        }),
        created (){
        },
        
        computed: {
          userGame () {
            return this.$store.getters.activeGame
          },
          
          userID () {
            return this.$store.getters.userID
          },
        },
    
        methods: {
        }
    }
</script>