<template>
  <v-container mt-0 pt-0>
         
      

    <v-layout>
      <v-flex xs9 md9 mt-4 pr-3>
        
          <join-bet ref="joinBet"></join-bet>
          <resolve-bet ref="resolveBet"></resolve-bet>
          <new-bet class="mb-6"></new-bet>
          
          <v-subheader v-if="(this.requestedBets.length)">Angebotene Wetten</v-subheader>
          <v-banner class="mb-2" elevation="2" icon="mdi-alert-decagram-outline" single-line v-for="(requestedBet) in this.requestedBets" :key="requestedBet.id">
            <v-row>
              <v-col>
                {{ requestedBet.q }}<!-- - {{ requestedBet.age }}s-->
              </v-col>
              <v-col>
                <div v-if="'wager' in requestedBet">
                  <v-tooltip bottom  v-for="(value, id) in requestedBet.wager" :key="id">
                    <template v-slot:activator="{ on }">
                      <v-list-item-avatar v-on="on" class="mt-0 mr-0 mb-0 ml-0" :color="$store.getters['players/list'].find(x => x.id==id).color" size="28" :key="id">
                        {{ $store.getters['players/list'].find(x => x.id==id).initials }}     
                      </v-list-item-avatar> 
                    </template>
                    <span>{{ $store.getters['players/list'].find(x => x.id==id).name }}</span>
                  </v-tooltip>
                </div>
              </v-col>
            </v-row>
            <template v-slot:actions>
              <v-btn class="mb-1" small depressed @click="join(requestedBet.id)" v-if="!('wager' in requestedBet)||!(userID in requestedBet.wager)">
                einsteigen
              </v-btn>
            </template>
            <v-progress-linear :value="requestedBet.pbWidth" :color="requestedBet.color" absolute bottom ></v-progress-linear>
          </v-banner>
          
          <v-subheader>Aktive Wetten</v-subheader>
          <v-banner class="mb-2" elevation="2" single-line v-for="(runningBet) in this.runningBets" :key="runningBet.id">
            <v-row>
              <v-col>
                {{ runningBet.q }}
                <ol class="body-2">
                  <li v-for="(answer, i) in runningBet.a" :key="i">{{ answer }}
                    <span v-for="(value, id) in runningBet.selection" :key="id">
                      <v-tooltip bottom v-if="value==i">
                        <template v-slot:activator="{ on }">
                          <v-list-item-avatar v-on="on" class="mt-0 mr-1 mb-0 ml-0 overline" :color="$store.getters['players/list'].find(x => x.id==id).color" size="10" :key="id">
                          </v-list-item-avatar> 
                        </template>
                        <span>{{ $store.getters['players/list'].find(x => x.id==id).initials }}</span>
                      </v-tooltip>
                    </span>
                  </li>
                </ol>
              </v-col>
            </v-row>
            <v-row class="caption mt-0 pt0">
              
            </v-row>
            
            <template v-slot:actions>
              
              <v-progress-circular :value="100*(runningBet.nVerdicts/Math.ceil(Object.keys(runningBet.wager).length*0.51))" size="30" color="grey">{{ Math.ceil(Object.keys(runningBet.wager).length*0.51) }}</v-progress-circular>
              
              <v-btn :disabled="!(userID in runningBet.wager)" class="mb-1" small color="secondary" @click="resolve(runningBet.id)">
                auflösen
              </v-btn>

              
            </template>
          </v-banner>
          
      </v-flex>
      <v-flex md3>
        <scoreboard></scoreboard>
      </v-flex>
    </v-layout> 
  </v-container>
</template>

<script>
  import NewBet from './NewBet.vue'
  import JoinBet from './JoinBet.vue'
  import ResolveBet from './ResolveBet.vue'
  import AwardBet from './AwardBet.vue'
  import Scoreboard from './Scoreboard.vue'

  export default {
    props: ['id'],
    data: ()=>({
      now : Date.now(),
      requestedBets : [],
      runningBets : [],
      watchdogInterval : null,
      started : false
      
    }),
    components:{
         'new-bet':NewBet,
         'join-bet':JoinBet,
         'resolve-bet':ResolveBet,
         'award-bet':AwardBet,
         'scoreboard':Scoreboard
     },
     
     beforeCreate () {
        this.$store.dispatch('loaderOn') 
     },

    created () {

      if(this.initialized)
        this.startup()

    },
    
    beforeDestroy () {
      clearInterval(this.watchdogInterval)
    },
    
    methods: {
      
      async startup () {
        
        if(!this.$store.getters.activeGame){
          console.log("redirect to home..")
          this.$router.push({ path: `/` })
          return
        }
        
        console.log("Startup page..")
        //open connection to game-specific bets....
        await this.$store.dispatch('bets/openDBChannel',{gameID: this.$store.getters.activeGame})
        
        //open connection to game-specific players....
        await this.$store.dispatch('players/openDBChannel',{gameID: this.$store.getters.activeGame})
        console.log(this.$store.getters['players/listActive'])
        this.watchdog()
        this.watchdogInterval = setInterval(() => {this.watchdog()}, 1000)
        this.started = true
        this.$store.dispatch('loaderOff') 
      },
      
      join (value) {
        this.$refs.joinBet.content=this.$store.getters['bets/listActiveState'].find(x => x.id==value)
        this.$refs.joinBet.dialog=1
        console.log(this.$refs.joinBet.content)
      },
      
      resolve (value) {
        this.$refs.resolveBet.content=this.$store.getters['bets/listActiveState'].find(x => x.id==value)
        this.$refs.resolveBet.dialog=1
        console.log(this.$refs.resolveBet.content)
      },
      
      
      watchdog () {
        
        if(((Date.now()-this.$store.getters['players/getUserLastOn'](this.$store.getters.userID)) / 1000) > 30){
          console.log("Alive! "+Date.now())
          this.$store.dispatch('players/set', {id : this.$store.getters.userID, last_online : Date.now() })
            .catch(console.error)
            .then(() =>{})
        }
        
        this.requestedBets = []
        this.runningBets = []
        
        const betTime = 60
        var age = null
        var betCreated = null
        
        // clean bets (decline, if not enough users)
        for(var bet of this.$store.getters['bets/listActiveState']){
          
          //hack for different timestamp format directly after insert and on receive
          if("seconds" in bet.created_at && (bet.created_at.seconds!=null || bet.created_at.seconds!=undefined))
            betCreated=bet.created_at.seconds
          else
            betCreated=Date.parse(bet.created_at)/1000

          age=(Math.round(Date.now()/ 1000)-betCreated)
          if(bet.state=="requested" && age>betTime){
            if(!("wager" in bet)){
              console.log("Keiner hat geboten auf '"+bet.q+"'")
              this.$store.dispatch('bets/patch', {id : bet.id, state:'declined'})
            }else{
              console.log("Bieter: '"+bet.q+"': "+Object.keys(bet.wager).length)
              if(Object.keys(bet.wager).length<2){
                this.$store.dispatch('bets/patch', {id : bet.id, state:'declined'})
                //for(player)
              }else{
                this.$store.dispatch('bets/patch', {id : bet.id, state:'running'})
              }
            }
          }          
        }
        
        // sort bets in active, requested bets
        for(bet of this.$store.getters['bets/listActiveState']){
          
          //hack for different timestamp format directly after insert and on receive
          if("seconds" in bet.created_at && (bet.created_at.seconds!=null || bet.created_at.seconds!=undefined))
            betCreated=bet.created_at.seconds
          else
            betCreated=Date.parse(bet.created_at)/1000
            
          age=(Math.round(Date.now()/ 1000)-betCreated)
          if(bet.state=="requested"){
            
            var pbWidth = Math.max(betTime-age,0)/betTime*100
            var color = "#29B6F6"

            if(pbWidth<17)
              color="#FF3D00"
            else if(pbWidth<33)
              color="#FFCA28"

            this.requestedBets.push(Object.assign(bet, {age,color,pbWidth}))
          }
          else if(bet.state=="running"){
            this.runningBets.push(Object.assign(bet, {age:(Math.round(Date.now()/ 1000)-bet.created_at.seconds), nVerdicts: ("verdict" in bet)?Object.keys(bet.verdict).length:null }))
          }
          else
            console.log("That shouldn't happen: "+bet)
        }
      },
      
      playSound (sound) {
      if(sound) {
        var audio = new Audio(sound);
        audio.play();
      }
    }
    },
    
    computed: {
      userID () {
        return this.$store.getters.userID
      },
      
      activeStateBetsGetter () {
        return this.$store.getters['bets/listActiveState']  
      },
      
      verdicts() {
        var verdictList = []
        for(var bet of this.$store.getters['bets/listActiveState']){
          if(bet.state=="running"){
            if("verdict" in bet)
              verdictList[bet.id]=Object.keys(bet.verdict).length
            else
              verdictList[bet.id]=0
          }
        }
        
        return verdictList
      },
      
      initialized () {
        return this.$store.getters.isInitialized
      }
      

    },
    
    watch: {
      
      initialized (value) {
        if(value)
          this.startup()
      },
      
      activeStateBetsGetter() {
        // there could have been an update on the bets -> recalculate => watchdog
        //this.playSound(require('@/assets/sound5.mp3'))
        this.watchdog()
      },
      
      verdictList: {
          handler: function(newVal, oldVal) {
              console.log(newVal)
              console.log(oldVal)
          },
          deep: true
      }
      
    }
  }
</script>