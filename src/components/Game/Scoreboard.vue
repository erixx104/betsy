<template>
    <v-navigation-drawer
            permanent
            right
          >

         <v-list disabled>
            <v-subheader>Scoreboard</v-subheader>
            <v-list-item-group color="primary">
              <v-list-item
                v-for="(user) in this.$store.getters['players/listActive']"
                :key="user.id"
              :class="user.id == userID ? 'grey lighten-4':''">
                <v-list-item-avatar :color="user.color" size="28">
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
          <v-expansion-panels class="overline ml-1 mr-1 mt-10">
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
</template>


<script>
    export default{
        data: () => ({
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