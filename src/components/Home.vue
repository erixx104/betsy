<template>
  <v-container>
    <v-layout row wrap>
      <v-flex xs12 sm8 offset-sm2>
        <h3>Welcome!! Pick a game and a name!</h3>

        <v-row justify="center">
          <v-col
            v-for="card in this.$store.getters['games/listGames']"
            :key="card.title"
            cols="12"
            md="6"
            lg="4"

          >
            <v-card hover 
              @click="gameID=card.link" 
              :disabled="(Date.now()/1000 > card.event_start.seconds)?false:true"
              :style="(gameID==card.link)?'border:1px solid white':'border:1px solid transparent'"
              :elevation="(gameID==card.link)?'20':'10'">
              <v-img
                :src="card.img"
                class="white--text"
                height="400px"
                gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
              >
                <v-card-title
                  class="fill-height align-end"
                  v-text="card.title"
                ></v-card-title>
              </v-img>

              <v-card-text>
                Starts: soon <!--{{ card.event_start.seconds }}-->
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>


        <v-form
          ref="form"
          v-model="valid"
          @submit.prevent="enterGameButton"
          lazy-validation>
          <v-text-field
            v-model="playerName"
            :rules="playerNameRules"
            label="Player name"
            required
            tabindex="1">
          </v-text-field>

          <v-btn class="primary mb-6 mt-2" v-if="0">Create game</v-btn>
          
          <v-text-field v-show="false"
            v-model="gameID"
            :counter="5"
            :rules="[ checkGameId ]"
            label="Game ID"
            required
            tabindex="2">
            
          </v-text-field>
          <v-btn
            :disabled="!valid"
            color="success"
            class="mr-4"
            tabindex="3"
            type=submit
          >
            Join
          </v-btn>
        </v-form>
      </v-flex>
    </v-layout>
  </v-container>
</template>


<script>

  export default {
    data: () => ({
      valid: true,
      started: false,
      NameDialog: false,
      playerName: '',
      playerNameRules: [
        v => !!v || 'Player name is required',
        v => (v && v.length <= 30) || 'Name must be less than 10 characters',
      ],
      gameID: '',
      gameIDRules: [
        v => !!v || 'Game ID is required',
        v => (v && v.length == 5) || 'Game ID must be 5 characters'
      ]
    }),
    
     beforeCreate() {
        this.$store.dispatch('loaderOn') 
     },
     
     mounted() {
        setTimeout(() => {this.$store.dispatch('loaderOff'), 1000})      
     },    
    
    created() {
      // sync active games for entering
      if(this.initialized)
        this.startup()
    },

    methods: {
      async startup() {
        if(this.$store.getters.activeGame){
          console.log("redirect to game..")
          this.$router.push({ path: `/MyGame` })
          return
        }
        
        await this.$store.dispatch('games/openDBChannel',{where: [['active','==',true]]}).catch(console.error)
        this.started = true
        this.$store.dispatch('loaderOff') 
      },
      
      async enterGameButton () {
        if (this.$refs.form.validate()) {
          
          
          try {
            this.$store.dispatch('loaderOn') 
            await this.$store.dispatch('registerUser', {gameID: this.$store.getters['games/getIdForLink'](this.gameID), playerName:this.playerName})
            console.log("gameID: "+this.$store.getters['games/getIdForLink'](this.gameID))
            console.log(this.$store.state['players']._sync)
            await this.$store.dispatch('players/setPathVars',{gameID: this.$store.getters['games/getIdForLink'](this.gameID)})
            console.log(this.$store.state['players']._sync)
            await this.$store.dispatch('players/insert', Object.assign(this.$store.getters.user, {score:0, last_online:Date.now()}) )
            await this.$store.dispatch('games/closeDBChannel')
            this.$router.push({ path: `/MyGame` })
            this.$store.dispatch('loaderOff')
            
          } catch (e) {
            console.log(e)
          }
          
        }
      },
      checkGameId(value) {
        if(value.length==5){
          if(this.$store.getters['games/gameExists'](value))
            return true
          else
            return "Not a valid Game ID";
        }else{
          return "Game ID must be 5 exactly characters in length"
        }
      }
    },
    computed: {

      initialized () {
        return this.$store.getters.isInitialized
      }
      
    },
    watch: {
      // convert Game-IDs to uppercase and A-Z0-9 only
      gameID: function () {
        this.gameID=this.gameID.replace(/[\W_]/g, '')
        this.gameID=this.gameID.toUpperCase()
        
      },
      
      initialized (value) {
        if(value)
          this.startup()
      },
      
    }
  }

</script>