<template>
  <v-dialog v-model="dialog" persistent max-width="600px" :fullscreen="$vuetify.breakpoint.xs">
    <v-card>
        <v-card-title>
            <span class="headline">{{ dc.title }}</span>
        </v-card-title>
        <v-card-text>
            <v-container>
                <v-row class="subtitle-1 mt-5">
                    Wette
                </v-row>
                <v-row class="headline white--text">
                    {{ dc.q }}
                </v-row>
                <v-row class="subtitle-1 mt-5">
                    Antwort
                </v-row>
                <v-row class="headline white--text">
                    {{ dc.a }}
                </v-row>
                <v-row class="subtitle-1 mt-5">
                    Gewinner
                </v-row>
                <v-row v-for="(id, name) in dc.winner" class="title white--text" :key="name">
                    {{ $store.getters['players/getPlayer'](id).name }}&nbsp;
                </v-row>
            </v-container>
        </v-card-text>
        <v-card-actions>
            <v-btn color="deep-orange accent-2" text @click="dialog = false">Close</v-btn>            
        </v-card-actions>
    </v-card>
  </v-dialog>
</template>


<script>
    export default{
        data: () => ({
            dialog : false,
            dc : [] //dialog content
        }),
        created (){

        },
        methods: {

        },
        
        computed: {
          finishedBets () {
            let betStateList = []
            for (let entry of this.$store.getters['bets/list']) {
                betStateList[entry.id]= entry.state
            }
            return betStateList
          },
        },
        
        watch: {
            finishedBets: {
                handler: function(newVal, oldVal) {
                    for (let [key, value] of Object.entries(newVal)){
                        if(value!=oldVal[key] && oldVal[key]=='running' && value=="winner"){ // Transition: running -> winner 
                            console.log(key+" --> NewState = "+value)
                            let bet = this.$store.getters['bets/bet'](key)
                            this.dc.title = "Gewinner!!" 
                            this.dc.q = bet.q
                            this.dc.a = bet.a[bet.winnerAnswer]
                            this.dc.winner = bet.winner
                            this.playSound(require('@/assets/sound2.mp3'))
                            this.dialog = true

                        }
                    }
                }
            }
   
        }
    }
</script>