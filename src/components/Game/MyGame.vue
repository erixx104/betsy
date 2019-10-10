<template>
  <v-container mt-0 pt-0>
         
    <h1 v-if="$store.getters['games/getTitle']($store.getters.activeGame) && 0">{{ $store.getters['games/getTitle']($store.getters.activeGame) }}</h1>
    <scoreboard></scoreboard>
    <v-layout>
      <v-flex xs12 md9 mt-4 pr-3>
        
          <award-bet ref="awardBet"></award-bet>
          <resolve-bet ref="resolveBet"></resolve-bet>
          <new-bet ref="newBet" class="mb-6"></new-bet>

          <!-- ----------------------------------------------- Requested Bets here -------------------------------------------------------------------------->          
          <v-subheader v-if="(this.requestedBets.length)">Angebotene Wetten</v-subheader>
          <div v-for="(bet) in this.requestedBets" :key="bet.id">
            <bet-multiplechoice
              v-if="bet.type==undefined || bet.type=='quick' || bet.type=='standard'"
              :bet="bet"
              :join="join"
              :resolve="resolve"
              :replay="replay"
            ></bet-multiplechoice>
          </div>
          
          
          <!-- ----------------------------------------------- Active Bets here -------------------------------------------------------------------------->          
          <v-subheader>Aktive Wetten</v-subheader>
          <div v-for="(bet) in this.runningBets" :key="bet.id">
            <bet-multiplechoice
              v-if="bet.type==undefined || bet.type=='quick' || bet.type=='standard'"
              :bet="bet"
              :join="join"
              :resolve="resolve"
              :replay="replay"
            ></bet-multiplechoice>
          </div>
          
          <!-- ------------------------------------ Finished bets  here------------------------------------------------------------------------------------------------------->
          <v-subheader class="mt-12">Abgeschlossene Wetten</v-subheader>
          <div v-for="(bet) in this.finishedBets" :key="bet.id">
            <bet-multiplechoice
              v-if="bet.type==undefined || bet.type=='quick' || bet.type=='standard'"
              :bet="bet"
              :join="join"
              :resolve="resolve"
              :replay="replay"
            ></bet-multiplechoice>
          </div>
         
      </v-flex>
      
    </v-layout> 
  </v-container>
</template>

<script>
  import NewBet from './NewBet.vue'
  import ResolveBet from './ResolveBet.vue'
  import AwardBet from './AwardBet.vue'
  import Bet_MultipleChoice from './Bet_MultipleChoice.vue'
  import Scoreboard from './Scoreboard.vue'
  const _ = require('lodash');

  export default {
    props: ['id'],
    data: ()=>({
      now : Date.now(),
      requestedBets : [],
      runningBets : [],
      finishedBets : [],
      blockSound_requested : [],
      watchdogInterval : null,
      started : false,

      
    }),
    components:{
         'new-bet':NewBet,
         'resolve-bet':ResolveBet,
         'award-bet':AwardBet,
         'scoreboard':Scoreboard,
         'bet-multiplechoice':Bet_MultipleChoice
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
      
      join (bet, selection, pts) {
        let selObj = {}
        selObj[this.$store.getters.userID]=selection

        this.$store.dispatch('bets/patch', {id : bet, selection : selObj })
                .catch(console.error)
                .then(() =>{
                    this.dialog = false
                    this.$store.dispatch('addUserScore', {user: this.$store.getters.userID, score: -pts})
                })
        console.log(bet + " | " + selection)
      },
      
      resolve (value) {
        this.$refs.resolveBet.content=this.$store.getters['bets/listActiveState'].find(x => x.id==value)
        this.$refs.resolveBet.dialog=1
        console.log(this.$refs.resolveBet.content)
      },

      replay (value) {

        // clear answers
        for (var i = 1; i < 10; i++) {
          this.$refs.newBet.a[i] = '';
        }

        let bet = this.$store.getters['bets/bet'](value)
        this.$refs.newBet.reset
        this.$refs.newBet.q = bet.q
        this.$refs.newBet.pts = bet.pts
        console.log(bet.a)
        for(const [key, value] of Object.entries(bet.a)){
          this.$refs.newBet.a[parseInt(key)+1]=value
          console.log(key + "|" + value)
        }


        if(("type" in bet) && bet.type=="quick")
          this.$refs.newBet.quickBet = true
        else
          this.$refs.newBet.quickBet = false

        window.scrollTo(0,0);
      },
      
      
      watchdog () {
        
        // Keep player Online --> Alive-Ping
        if(((Date.now()-this.$store.getters['players/getUserLastOn'](this.$store.getters.userID)) / 1000) > 30){
          console.log("Alive! "+Date.now())
          this.$store.dispatch('players/patch', {id : this.$store.getters.userID, last_online : Date.now() }).catch(console.error)
        }
        
        this.requestedBets = []
        this.runningBets = []
        this.finishedBets = []
        
        var request_timer = null
        var age = null
        var betCreated = null
        
        // Process all bets
        for(let bet of this.$store.getters['bets/list']){

          // set request timer
          if(!("type" in bet) || bet.type == "standard")
            request_timer = 40
          else if(bet.type == "quick")
            request_timer = 20
          else
            request_timer = 40

          betCreated=Date.parse(bet.created_at)/1000  // to seconds
          
          age=(Math.round(Date.now()/ 1000)-betCreated-request_timer)

          // set alive ping to bet, to keep function hot - but PING only "requested" or "running" bets
          if((bet.state=="requested" || bet.state=="running") && age>=0){
            // console.log(bet.alive_ping+" || "+age)   ///////////////////// Needs to be checked -> never triggered....
            if(!("alive_ping" in bet) || bet.alive_ping+30 < age){
                this.$store.dispatch('bets/patch', {id : bet.id, alive_ping : age})
                console.log("[Bet] Alive! => "+bet.id+ "|" + age)
            }
          }
          
          if(bet.state=="requested"){
            
            var pbWidth = Math.min(Math.max(( (-age/request_timer) *100),0),100)
            var color = "#29B6F6"

            if(age>=-5)
              color="#FF3D00"
            else if(age>=-10)
              color="#FFCA28"
              
            // Check if for specific bet the sound was already played (is on block list) - if not, play sound and add to block list
            if(!this.blockSound_requested.includes(bet.id)){
              this.playSound(require('@/assets/sound1.mp3'))
              this.blockSound_requested.push(bet.id)
            }
            
            this.requestedBets.push(Object.assign(bet, {age,color,pbWidth}))
          }
          else if(bet.state=="running"){
            this.runningBets.push(Object.assign(bet, {age:(Math.round(Date.now()/ 1000)-bet.created_at.seconds), nVerdicts: ("verdict" in bet)?Object.keys(bet.verdict).length:null }))
          }
          else if(bet.state=="declined" || bet.state=="winner" || bet.state=="noWinner" || bet.state=="agreed"){
            this.finishedBets.push(Object.assign(bet, {age:(Math.round(Date.now()/ 1000)-bet.created_at.seconds), nVerdicts: ("verdict" in bet)?Object.keys(bet.verdict).length:null }))
          }else{
            console.log("That shouldn't happen: ")
            console.log(bet)
          }
        }
      },
    },
    
    computed: {
      userID () {
        return this.$store.getters.userID
      },
      
      activeStateBetsGetter () {
        return this.$store.getters['bets/listActiveState']  
      },
      
      verdicts : function() {
        return this.$store.getters['bets/getVerdictList']
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
        //this.watchdog()
      },
      
      verdicts: {
          handler: function(newVal, oldVal) {
              if(oldVal!=undefined && oldVal!=null && !_.isEmpty(oldVal, true) && !_.isEmpty(newVal, true) && !_.isEqual(oldVal,newVal))
                this.playSound(require('@/assets/sound5.mp3'))
              //console.log(newVal)
              //console.log(oldVal)
              
          },
          deep: true
      }
      
    }
  }
</script>