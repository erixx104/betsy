<template>
  <v-container>
    <v-layout row wrap>
      <v-flex xs12 sm8 offset-sm2>
        <h3>Welcome!! Join or create a new game</h3>

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
          
          <v-text-field
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
    <v-layout mt-6>
      <v-flex class="caption" xs12 sm8 offset-sm2>
        Try ABCDE or FGHIJ as games...
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
      this.startup()
    },

    methods: {
      async startup() {
        await this.$store.dispatch('games/openDBChannel',{where: [['active','==',true]]}).catch(console.error)
        this.started = true
        this.$store.dispatch('loaderOff') 
      },
      
      async enterGameButton () {
        if (this.$refs.form.validate()) {
          
          
          try {
            this.$store.dispatch('loaderOn') 
            await this.$store.dispatch('players/closeDBChannel', {clearModule: true})
            await this.$store.dispatch('players/setPathVars',{gameID: this.$store.getters['games/getIdForLink'](this.gameID)})
            const newUser = await this.$store.dispatch('registerUser', {gameID: this.$store.getters['games/getIdForLink'](this.gameID), playerName:this.playerName})
            console.log("--------------")
            console.log(newUser)
            await this.$store.dispatch('players/insert', Object.assign(this.$store.getters.user, {score:10, last_online:Date.now()}) )
            this.$store.dispatch('enterGame')
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
      userGame () {
        return this.$store.getters.activeGame && this.$store.getters.gameEntered && this.started
      }
    },
    watch: {
      // convert Game-IDs to uppercase and A-Z0-9 only
      gameID: function () {
        this.gameID=this.gameID.replace(/[\W_]/g, '')
        this.gameID=this.gameID.toUpperCase()
        
      },
      
      // check if user has successfully entered the game -> "has an active Game"
      userGame (value) {
        if(value){
          
          //close connection to games overview
          this.$store.dispatch('games/closeDBChannel')

          console.log("Let's go inside.....")
          this.$router.push({ path: `/MyGame` })  
          
        }
      }
    }
  }

</script>