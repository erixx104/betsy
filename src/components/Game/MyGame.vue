<template>
  <v-container mt-0 pt-0>
         
      
    <scoreboard></scoreboard>
    <v-layout>
      <v-flex xs12 md9 mt-4 pr-3>
        
          <award-bet ref="awardBet"></award-bet>
          <join-bet ref="joinBet"></join-bet>
          <resolve-bet ref="resolveBet"></resolve-bet>
          <new-bet class="mb-6"></new-bet>
          
          <v-subheader v-if="(this.requestedBets.length)">Angebotene Wetten</v-subheader>
          
          <!-- ----------------------------------------------- Requested Bets here -------------------------------------------------------------------------->
          <v-card
              v-for="(requestedBet) in this.requestedBets" :key="requestedBet.id"
              class="mb-6"
            >
            <span style="position:absolute;right:7px;top:2px" class="overline grey--text d-flex d-sm-none">Wette von {{ $store.getters['players/getPlayer'](requestedBet.created_by).name }}</span>
            <v-card-title style="opacity:1.0" class="teal--text text--lighten-3">
              {{ requestedBet.q }}
            </v-card-title>
      
            <v-card-text class="white--text d-flex flex-row justify-space-between" style="opacity:1.0">
              <div class="d-flex">
                <ol class="body-1 white--text">
                  <li v-for="(answer, i) in requestedBet.a" :key="i" style="font-color:rgba(255, 255, 255, 1.0)!important" class="mt-1 mb-1">{{ answer }}</li>
                </ol>
              </div>
              
              <div class="flex-column justify-center align-end d-sm-flex d-none">
                <div class="d-block justify-center">
                
                  <div class="d-block mb-1 overline grey--text text-center">
                    Wette von {{ $store.getters['players/getPlayer'](requestedBet.created_by).name }}
                  </div>
                  
                  <div class="d-block text-center">
                    <v-btn small color="secondary" @click="join(requestedBet.id)" v-if="!('wager' in requestedBet)||!(userID in requestedBet.wager)">
                      einsteigen
                    </v-btn>
                  </div>
                  
                  <div class="d-block text-center mt-2 grey--text" style="min-height:28px">
                    <div v-if="'wager' in requestedBet" >
                      <v-tooltip class="ml-1 mr-1" bottom  v-for="(value, id) in requestedBet.wager" :key="id">
                        <template v-slot:activator="{ on }">
                          <v-list-item-avatar v-on="on" class="mt-0 mr-0 mb-0 ml-0" :color="$store.getters['players/list'].find(x => x.id==id).color" size="28" :key="id">
                            {{ $store.getters['players/list'].find(x => x.id==id).initials }}     
                          </v-list-item-avatar> 
                        </template>
                        <span>{{ $store.getters['players/list'].find(x => x.id==id).name }}</span>
                      </v-tooltip>
                    </div>
                  </div>
                </div>
                
              </div>
            </v-card-text>

            <v-card-actions class="d-flex d-sm-none" >
              <v-btn class="mb-3" small outlined block color="secondary" @click="join(requestedBet.id)" v-if="!('wager' in requestedBet)||!(userID in requestedBet.wager)">
                  einsteigen
                </v-btn>
            </v-card-actions>

            <v-progress-linear :value="requestedBet.pbWidth" :color="requestedBet.color" absolute bottom ></v-progress-linear>
          </v-card>
          
          
          <v-subheader>Aktive Wetten</v-subheader>
          
          <!-- ----------------------------------------------- Active Bets here -------------------------------------------------------------------------->
          <v-card
              v-for="(runningBet) in this.runningBets" :key="runningBet.id"
              class="mb-6" 
            >
            <span style="position:absolute;right:7px;top:2px" class="overline grey--text d-flex d-sm-none">Wette von {{ $store.getters['players/getPlayer'](runningBet.created_by).name }}</span>
            <v-card-title style="opacity:1.0" class="teal--text text--lighten-3">
              {{ runningBet.q }}
            </v-card-title>
      
            <v-card-text class="white--text d-flex flex-row justify-space-between" style="opacity:1.0">
              <div class="d-flex">
                <ol class="body-1 white--text">
                  <li v-for="(answer, i) in runningBet.a" :key="i" style="font-color:rgba(255, 255, 255, 1.0)!important" class="mt-1 mb-1">{{ answer }}
                    <span v-for="(value, id) in runningBet.selection" :key="id">
                      <v-tooltip bottom v-if="value==i">
                        <template v-slot:activator="{ on }">
                          <v-list-item-avatar v-on="on" class="mt-0 mr-1 mb-0 ml-0 overline" :color="$store.getters['players/list'].find(x => x.id==id).color" size="10" :key="id">
                          </v-list-item-avatar> 
                        </template>
                        <span>{{ $store.getters['players/list'].find(x => x.id==id).name }} - Einsatz: {{ $store.getters['bets/bet'](runningBet.id).wager[id] }} </span>
                      </v-tooltip>
                    </span>
                  </li>
                </ol>
              </div>
              
              <div class="flex-column justify-center align-end d-sm-flex d-none">
                <div class="d-block justify-center">
                  <div style="right:7px;top:2px" class="d-block mb-1 overline grey--text text-center">
                    Wette von {{ $store.getters['players/getPlayer'](runningBet.created_by).name }}
                  </div>
                  <div class="d-block text-center">
                    <v-btn :disabled="!(userID in runningBet.wager)" class="mb-1" :class="Object.keys(runningBet.wager).length>0?'':'deep-orange accent-3'" small color="light-blue darken-3" @click="resolve(runningBet.id)">
                      auflösen
                    </v-btn>
                  </div>
                  <div class="d-block text-center overline grey--text">
                    gelöst: 
                    <v-progress-circular :value="100*(runningBet.nVerdicts/Math.ceil(Object.keys(runningBet.wager).length*0.51))" size="30" color="light-blue darken-5" :class="Object.keys(runningBet.wager).length>0?'':'deep-orange--text text--accent-2'">
                      {{ Math.ceil(Object.keys(runningBet.wager).length*0.51) }}
                    </v-progress-circular>                    
                  </div>
                </div>
              </div>
            </v-card-text>

            <v-card-actions class="d-flex d-sm-none" >
              <v-btn :disabled="!(userID in runningBet.wager)" class="mb-1" small outlined block color="light-blue darken-3" :class="Object.keys(runningBet.wager).length>0?'':'deep-orange accent-3'" @click="resolve(runningBet.id)">
                auflösen ({{runningBet.nVerdicts?runningBet.nVerdicts:0}}/{{(Object.keys(runningBet.wager).length)}})
              </v-btn>
            </v-card-actions>

          </v-card>
          <!-- ------------------------------------------------------------------------------------------------------------------------------------------->
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
        
        //only do startup once on page session..
        if(this.started)
          return
        
        console.log("Startup page..")
        
        try{
          //open connection to game-specific bets....
          await this.$store.dispatch('bets/openDBChannel',{gameID: this.$store.getters.activeGame})
          
          //open connection to game-specific players....
          await this.$store.dispatch('players/openDBChannel',{gameID: this.$store.getters.activeGame})
        }catch(e){
          console.log('mööp')
        }
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
          this.$store.dispatch('players/patch', {id : this.$store.getters.userID, last_online : Date.now() })
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