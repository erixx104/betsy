<template>
  <v-dialog v-model="dialog" persistent max-width="600px">
    <v-form
        ref="joinBetForm"
        v-model="valid"
        @submit.prevent.native="submitBet"
        lazy-validation>  
        <v-card>
          <v-card-title>
            <span class="headline">{{ content.q }}</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-subheader>Deine Antwort:</v-subheader>
              </v-row>
              <v-row>
                <v-radio-group v-model="userAnswer" :rules="AnswerRules" class="pl-2 pr-2 mt-0 pt-0 mb-0 pb-0">
                  <v-radio
                    v-for="(answer, i) in content.a" 
                    :key="i"
                    :label="answer"
                    :value="i"
                    ></v-radio>
                </v-radio-group>
              </v-row>
            </v-container>
              
            <v-container>
              <v-row>
                <v-subheader>Dein Einsatz: <h3 style="margin-top:-2px;margin-left:4px">{{bet}}</h3></v-subheader>
              </v-row>
              <v-row>
                <v-slider
                  v-model="bet"
                  step="5"
                  min="5"
                  max="25"
                  ticks
                   class="pl-2 pr-2"
                    ></v-slider>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="dialog = false">Close</v-btn>
            <v-btn color="blue darken-1" text type="submit">Save</v-btn>
          </v-card-actions>
        </v-card>
    </v-form>
  </v-dialog>
</template>


<script>
    export default{
        data: () => ({
            content : {q : "", a : []},
            dialog: false,
            valid: true,
            userAnswer : null,
            bet : null,
            AnswerRules: [
                v => v!=null || 'Antwortmöglichkeit auswählen',
              ],
        }),
        created (){

        },
        methods: {
          submitBet () {
            if (this.$refs.joinBetForm.validate()) {
              
              var wager = {}
              var selection = {}
              
              wager[this.$store.getters.userID]=this.bet
              selection[this.$store.getters.userID]=this.userAnswer
              
              this.$store.dispatch('bets/patch', {id : this.content.id, wager, selection })
                .catch(console.error)
                .then(() =>{
                    this.dialog = false
                    this.$store.dispatch('addUserScore', {user: this.$store.getters.userID, score: -this.bet})
  
                })
                  
              }
          }
 
        },
        
        watch: {
   
          
        }
    }
</script>