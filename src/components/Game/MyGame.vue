<template>
  <v-container mt-0 pt-0>
         
    <h1 v-if="$store.getters['games/getTitle']($store.getters.activeGame) && 0">{{ $store.getters['games/getTitle']($store.getters.activeGame) }}</h1>
    <scoreboard></scoreboard>
    <v-layout>
      <v-flex xs12 md9 mt-4 pr-3>
        
          <award-bet ref="awardBet"></award-bet>
          <resolve-bet ref="resolveBet"></resolve-bet>
          <new-bet ref="newBet" class="mb-6"></new-bet>
          
          <v-subheader v-if="(this.requestedBets.length)">Angebotene Wetten</v-subheader>
          
          <!-- ----------------------------------------------- Requested Bets here -------------------------------------------------------------------------->
          <v-card
              v-for="(requestedBet) in this.requestedBets" :key="requestedBet.id"
              class="mb-6"  :color="(requestedBet.type=='quick')?'brown darken-4':''"
            >
            <span style="position:absolute;right:7px;top:2px" class="overline grey--text d-flex d-sm-none">Wette von {{ $store.getters['players/getPlayer'](requestedBet.created_by).name }}</span>
            <span v-if="false" style="position:absolute;right:138px;bottom:-27px;color:#555;font-weight:bolder;font-size:104pt;z-index:1">{{ requestedBet.pts }}</span>
            <v-card-title class="teal--text text--lighten-3" style="z-index:2;position:relative">
              <v-icon class="mr-3" v-if="requestedBet.type=='quick'">mdi-clock-fast</v-icon>
              <v-icon class="mr-3" v-if="requestedBet.type!=='quick'">mdi-format-list-checks</v-icon>
              {{ requestedBet.q }}
            </v-card-title>
      
            <v-card-text class="white--text d-flex flex-row justify-space-between" style="z-index:2;position:relative">
              <div class="d-flex">
                
                <v-radio-group v-model="sel[requestedBet.id]" class="ml-0 pl-0 mt-0 pt-0 mb-0 pb-0" style="width:100%" v-if="!('selection' in requestedBet)||!(userID in requestedBet.selection)">
                  <v-radio v-for="(answer, i) in requestedBet.a" :key="i" hide-details class="shrink mr-2 mt-0" :value="i" :label="(i+1)+'. '+answer" >
                    <template v-slot:label>
                      {{ (i+1)+'. '+answer }}
                      <span v-for="(value, id) in requestedBet.selection" :key="id" class="mr-1">
                        <v-chip v-if="value==i" text-color="#222" small :color="$store.getters['players/list'].find(x => x.id==id).color">{{ $store.getters['players/list'].find(x => x.id==id).name }}</v-chip>
                      </span>
                    </template>
                  </v-radio>
                </v-radio-group>
                <ol class="body-1 white--text" v-if="('selection' in requestedBet)&&(userID in requestedBet.selection)">
                  <li v-for="(answer, i) in requestedBet.a" :key="i" style="font-color:rgba(255, 255, 255, 1.0)!important" class="mt-1 mb-1">{{ answer }}
                    <span v-for="(value, id) in requestedBet.selection" :key="id" class="mr-1">
                      <v-chip v-if="value==i" text-color="#222" small :color="$store.getters['players/list'].find(x => x.id==id).color">{{ $store.getters['players/list'].find(x => x.id==id).name }}</v-chip>
                    </span>
                  </li>
                </ol>
              </div>
              
              <div class="flex-column justify-center align-end d-sm-flex d-none">
                <div class="d-block justify-center">
                
                  <div class="d-block mb-1 overline grey--text text-center">
                    Wette von {{ $store.getters['players/getPlayer'](requestedBet.created_by).name }}
                  </div>
                  
                  <div class="d-block text-center">
                    <v-btn small color="secondary" @click="join(requestedBet.id,sel[requestedBet.id],requestedBet.pts)" v-if="!('selection' in requestedBet)||!(userID in requestedBet.selection)" :disabled="sel[requestedBet.id]==null">
                      einsteigen
                    </v-btn>
                  </div>
                  
                  
                </div>
                
              </div>
            </v-card-text>

            <v-card-actions class="d-flex d-sm-none" >
              <v-btn class="mb-3" small outlined block color="secondary" @click="join(requestedBet.id,sel[requestedBet.id],requestedBet.pts)" v-if="!('selection' in requestedBet)||!(userID in requestedBet.selection)" :disabled="sel[requestedBet.id]==null">
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
            <span v-if="false" style="position:absolute;right:138px;bottom:-27px;color:#555;font-weight:bolder;font-size:104pt;z-index:1">{{ runningBet.pts }}</span>
            <v-card-title class="teal--text text--lighten-3" style="z-index:2;position:relative">
              <v-icon class="mr-3" v-if="runningBet.type=='quick'">mdi-clock-fast</v-icon>
              <v-icon class="mr-3" v-if="runningBet.type!=='quick'">mdi-format-list-checks</v-icon>
              {{ runningBet.q }}
            </v-card-title>
      
            <v-card-text class="white--text d-flex flex-row justify-space-between" style="z-index:2;position:relative">
              <div class="d-flex">
                <ol class="body-1 white--text">
                  <li v-for="(answer, i) in runningBet.a" :key="i" style="font-color:rgba(255, 255, 255, 1.0)!important" class="mt-1 mb-1">{{ answer }}
                    <span v-for="(value, id) in runningBet.selection" :key="id" class="mr-1">
                      <v-chip v-if="value==i" style="font-weight:normal" text-color="#222" small :color="$store.getters['players/list'].find(x => x.id==id).color">{{ $store.getters['players/list'].find(x => x.id==id).name }}</v-chip>
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
                    <v-btn :disabled="!(userID in runningBet.selection)" class="mb-1" :class="Object.keys(runningBet.selection).length>0?'':'deep-orange accent-3'" small color="light-blue darken-3" @click="resolve(runningBet.id)">
                      auflösen
                    </v-btn>
                  </div>
                  <div class="d-block text-center overline grey--text">
                    gelöst: 
                    <v-progress-circular :value="100*(runningBet.nVerdicts/Math.ceil(Object.keys(runningBet.selection).length*0.51))" size="30" color="light-blue darken-5" :class="runningBet.nVerdicts==0?'':'deep-orange--text text--accent-2'">
                      {{ Math.ceil(Object.keys(runningBet.selection).length*0.51) }}
                    </v-progress-circular>                    
                  </div>
                </div>
              </div>
            </v-card-text>

            <v-card-actions class="d-flex d-sm-none" >
              <v-btn :disabled="!(userID in runningBet.selection)" class="mb-1" small outlined block color="light-blue darken-3" :class="Object.keys(runningBet.selection).length>0?'':'deep-orange accent-3'" @click="resolve(runningBet.id)">
                auflösen ({{runningBet.nVerdicts?runningBet.nVerdicts:0}}/{{(Object.keys(runningBet.selection).length)}})
              </v-btn>
            </v-card-actions>

          </v-card>
          
          
          <v-subheader class="mt-12">Abgeschlossene Wetten</v-subheader>
          <!-- ------------------------------------ Finished bets  here------------------------------------------------------------------------------------------------------->
          <v-card
              v-for="(finishedBet) in this.finishedBets" :key="finishedBet.id"
              class="mb-6"  outlined style="background-color: transparent!important;opacity:0.7"
            >
            <span style="position:absolute;right:7px;top:2px" class="overline grey--text d-flex d-sm-none">Wette von {{ $store.getters['players/getPlayer'](finishedBet.created_by).name }}</span>
            <span v-if="false" style="position:absolute;right:138px;bottom:-27px;color:#555;font-weight:bolder;font-size:104pt;z-index:1">{{ finishedBet.pts }}</span>
            <v-card-title class="teal--text text--lighten-3" style="z-index:2;position:relative">
              <v-icon class="mr-3" v-if="finishedBet.type=='quick'">mdi-clock-fast</v-icon>
              <v-icon class="mr-3" v-if="finishedBet.type!=='quick'">mdi-format-list-checks</v-icon>
              {{ finishedBet.q }}
            </v-card-title>
      
            <v-card-text class="white--text d-flex flex-row justify-space-between" style="z-index:2;position:relative">
              <div class="d-flex">
                <v-container class="mb-0 mt-0 pb-0 pt-0">
                  <v-row class="mb-0 mt-0 pb-0 pt-0">
                    <ol class="body-1 white--text">
                      <li v-for="(answer, i) in finishedBet.a" :key="i" :style="(('winnerAnswer' in finishedBet) && (i==finishedBet.winnerAnswer))?'font-weight:bolder;color:#fff':'font-weight:lighter;color:#ccc'" class="mt-1 mb-1">{{ answer }}
                        <span v-for="(value, id) in finishedBet.selection" :key="id" class="mr-1">
                          <v-chip v-if="value==i" style="font-weight:normal;opacity:0.7" text-color="#222" small :color="$store.getters['players/list'].find(x => x.id==id).color">{{ $store.getters['players/list'].find(x => x.id==id).name }}</v-chip>
                        </span>
                      </li>
                    </ol>
                  </v-row>
                  <v-row class="mt-2">
                    <div v-if="finishedBet.state=='declined'">
                      Kein Gewinner - Niemand wollte mitwetten
                    </div>
                    <div v-if="finishedBet.state=='agreed'">
                      Kein Gewinner - Alle haben das gleiche getippt
                    </div>
                    <div v-if="finishedBet.state=='noWinner'">
                      Kein Gewinner - Niemand hat die richtige Antwort gewählt
                    </div>
                    <div v-if="finishedBet.state=='winner'">
                      Gewinner: <span v-for="id in finishedBet.winner" :key="id">{{ $store.getters['players/getPlayer'](id).name }}&nbsp;</span>
                    </div>
                  </v-row>
                </v-container>
              </div>
              
              <div class="flex-column justify-center align-end d-sm-flex d-none">
                <div class="d-block justify-center">
                  <div style="right:7px;top:2px" class="d-block mb-1 overline grey--text text-center">
                    Wette von {{ $store.getters['players/getPlayer'](finishedBet.created_by).name }}
                  </div>
                  <div class="d-block text-center">
                    <v-btn class="mb-1" small outlined color="light-blue darken-3" @click="replay(finishedBet.id)">
                      nochmal wetten
                    </v-btn>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
          
      </v-flex>
      
    </v-layout> 
  </v-container>
</template>

<script>
  import NewBet from './NewBet.vue'
  import ResolveBet from './ResolveBet.vue'
  import AwardBet from './AwardBet.vue'
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
      sel : [] //selection in join bet dialog
      
    }),
    components:{
         'new-bet':NewBet,
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
            request_timer = 10
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
            
            var pbWidth = Math.max((-age/request_timer*100),0)
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