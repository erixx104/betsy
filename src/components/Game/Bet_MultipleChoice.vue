<template>
  <v-card class="mb-6"
      :color="(bet.type=='quick' && bet.state=='requested')?'brown darken-4':''"
      :outlined="(bet.state!='requested'&&bet.state!='running')?true:false"
      :style="(bet.state!='requested'&&bet.state!='running')?'background-color: transparent!important;opacity:0.7':''">
    <!----------------------------- Meta-Data Small layout ----------------->
    <span style="position:absolute;right:7px;top:2px" class="overline grey--text d-flex d-sm-none">Wette von {{ $store.getters['players/getPlayer'](bet.created_by).name }}</span>
    <span v-if="false" style="position:absolute;right:138px;bottom:-27px;color:#555;font-weight:bolder;font-size:104pt;z-index:1">{{ bet.pts }}</span>

    <!----------------------------- Bet Title ----------------->
    <v-card-title class="teal--text text--lighten-3" style="z-index:2;position:relative">
      <v-icon class="mr-3" v-if="bet.type=='quick'">mdi-clock-fast</v-icon>
      <v-icon class="mr-3" v-if="bet.type!=='quick'">mdi-format-list-checks</v-icon>
      {{ bet.q }}
    </v-card-title>

    
    <v-card-text class="white--text d-flex flex-row justify-space-between" style="z-index:2;position:relative">

      <div class="flex-column">
      <!----------------------------- Multiple-choice area ----------------->
        <div class="d-flex row ml-1">
          <v-radio-group v-model="sel[bet.id]" class="ml-0 pl-0 mt-0 pt-0 mb-0 pb-0" style="width:100%" v-if="bet.state=='requested' && ( !('selection' in bet)||!(userID in bet.selection) )">
            <v-radio v-for="(answer, i) in bet.a" :key="i" hide-details class="shrink mr-2 mt-0" :value="i" :label="(i+1)+'. '+answer" >
              <template v-slot:label>
                {{ (i+1)+'. '+answer }}
                <span v-for="(value, id) in bet.selection" :key="id">
                  <v-chip v-if="value==i" class="ml-2" text-color="#222" small :color="$store.getters['players/list'].find(x => x.id==id).color">{{ $store.getters['players/list'].find(x => x.id==id).name }}</v-chip>
                </span>
              </template>
            </v-radio>
          </v-radio-group>
          <ol class="body-1 white--text" v-if="((bet.state!='running')&&(bet.state!='requested')) || (bet.state=='running') || ( ('selection' in bet)&&(userID in bet.selection) )">
            <li v-for="(answer, i) in bet.a" :key="i"
                style="font-color:rgba(255, 255, 255, 1.0)!important"
                class="mt-1 mb-1">
                <span v-if="bet.state=='requested'||bet.state=='running'">{{ answer }}</span>
                <span v-else :style="(('winnerAnswer' in bet) && (i==bet.winnerAnswer))?'font-weight:bolder;color:#fff':'font-weight:lighter;color:#ccc'">{{ answer }}</span>
              <span v-for="(value, id) in bet.selection" :key="id">
                <v-chip v-if="value==i"  class="ml-2" text-color="#222" small style="font-weight:normal" :color="$store.getters['players/list'].find(x => x.id==id).color">{{ $store.getters['players/list'].find(x => x.id==id).name }}</v-chip>
              </span>
            </li>
          </ol>
        </div>
        <div class="d-flex row ml-3">
          <v-row>
            <div v-if="bet.state=='declined'">  Kein Gewinner - Niemand wollte mitwetten</div>
            <div v-if="bet.state=='agreed'">    Kein Gewinner - Alle haben das gleiche getippt</div>
            <div v-if="bet.state=='noWinner'">  Kein Gewinner - Niemand hat die richtige Antwort gewählt</div>
            <div v-if="bet.state=='winner'">    Gewinner: <span v-for="id in bet.winner" :key="id">{{ $store.getters['players/getPlayer'](id).name }}&nbsp;</span></div>
          </v-row>
        </div>

      </div>
      <!-------------------------------------------------------------------->
      
      <div class="flex-column justify-center align-end d-sm-flex d-none">
        <div class="d-block justify-center">
          
          <!----------------------------- Meta-Data Large layout ----------------->
          <div class="d-block mb-1 overline grey--text text-center">
            Wette von {{ $store.getters['players/getPlayer'](bet.created_by).name }}
          </div>

          <!----------------------------- Action buttons Large layout ----------------->
          <div class="d-block text-center">
            <v-btn  v-if="bet.state=='requested' && ( !('selection' in bet)||!(userID in bet.selection) )" 
                    :disabled="sel[bet.id]==null"
                    small color="secondary"
                    @click="join(bet.id,sel[bet.id],bet.pts)">
              einsteigen
            </v-btn>
            <v-btn v-else-if="bet.state=='running'" 
                   :disabled="!(userID in bet.selection)"
                   :class="Object.keys(bet.selection).length>0?'':'deep-orange accent-3'"
                   small color="light-blue darken-3"
                   @click="resolve(bet.id)">
              auflösen
            </v-btn>
            <v-btn  v-else
                    class="mb-1" small outlined color="light-blue darken-3"
                    @click="replay(bet.id)">
              nochmal wetten
            </v-btn>
          </div>

          <!----------------------------- Misc information area ----------------------->
          <div class="d-block text-center overline grey--text mt-1" v-if="bet.state=='running'">
            gelöst: 
            <v-progress-circular :value="100*(bet.nVerdicts/Math.ceil(Object.keys(bet.selection).length*0.51))" size="30" color="light-blue darken-5" :class="bet.nVerdicts==0?'':'deep-orange--text text--accent-2'">
              {{ Math.ceil(Object.keys(bet.selection).length*0.51) }}
            </v-progress-circular>                    
          </div>

        </div>
      </div>
    </v-card-text>

    <v-card-actions class="d-flex d-sm-none" >
      <!----------------------------- Action buttons Small layout ----------------->
      <v-btn  v-if="bet.state=='requested' && ( !('selection' in bet)||!(userID in bet.selection) )"
              :disabled="sel[bet.id]==null"
              class="mb-3" small outlined block color="secondary"
              @click="join(bet.id,sel[bet.id],bet.pts)">
          einsteigen
      </v-btn>
      <v-btn  v-else-if="bet.state=='running'" 
              :disabled="!(userID in bet.selection)"
              class="mb-1" small outlined block color="light-blue darken-3"
              :class="Object.keys(bet.selection).length>0?'':'deep-orange accent-3'"
              @click="resolve(bet.id)">
          auflösen ({{bet.nVerdicts?bet.nVerdicts:0}}/{{(Object.keys(bet.selection).length)}})
      </v-btn>
      <v-btn  v-else
              class="mb-3" small outlined block color="light-blue darken-3"
              @click="replay(bet.id)">
          nochmal wetten
      </v-btn>
    </v-card-actions>

    <!----------------------------- Progress bar ----------------->
    <v-progress-linear v-if="'pbWidth' in bet" :value="bet.pbWidth" :color="bet.color" absolute bottom ></v-progress-linear>
  </v-card>
</template>


<script>
    export default{
        data: () => ({
          sel : [] //selection in join bet dialog
        }),
        props : { bet : Object, 
                  join:     { type: Function},
                  resolve:  { type: Function},
                  replay:   { type: Function},
                },
        created (){

        },
        methods: {

        },
        
        computed: {
            userID () {
                return this.$store.getters.userID
            },

        },
        
        watch: {
   
        }
    }
</script>