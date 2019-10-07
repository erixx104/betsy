<template>
  <v-container class="pl-0 pr-0 mt-3 pt-0 mb-0 pb-0">
    <v-form
      ref="newBetForm"
      v-model="valid"
      @submit.prevent.native="submitBet"
      lazy-validation>
      <v-card class="mt-3">
        <v-card-title class="teal--text text--lighten-3 mb-0 pb-0" style="z-index:2;position:relative">
          <v-text-field v-model="q" :rules="QuestionRules" class="mt-0 pt-0 mb-0 pb-0" label="Neue Wette eingeben" validate-on-blur required single-line color="teal lighten-3"></v-text-field>
        </v-card-title>
                  
        <v-card-text class="white--text mt-0 pt-0 mb-0 pb-0" style="z-index:2;position:relative">
          <v-col v-show="q!=''" class="mt-0 pt-0 mb-0 pb-0" cols="12">

            <div class="d-flex flex-row">
              <v-radio-group v-model="selection" :rules="SelectionRules" class="pl-2 pr-2 mt-0 pt-0 mb-0 pb-0" style="width:100%">
                <v-row align="center">
                  <v-radio hide-details class="shrink mr-2 mt-0" :value="1" :disabled="a[1]==''"></v-radio>
                  <v-text-field :rules="AnswerRules" v-model="a[1]" label="Antwort 1*" required hint="Antwort 1" class="mt-3 pt-0"></v-text-field>
                </v-row>
                <v-row align="center">
                  <v-radio hide-details class="shrink mr-2 mt-0" :value="2" :disabled="a[2]==''"></v-radio>
                  <v-text-field :rules="AnswerRules" v-model="a[2]" label="Antwort 2*" required hint="Antwort 2" ></v-text-field>
                </v-row>
                <v-row align="center">
                  <v-radio hide-details class="shrink mr-2 mt-0" :value="3" :disabled="a[3]==''"></v-radio>
                  <v-text-field v-model="a[3]" label="Antwort 3" hint="Antwort 3" ></v-text-field>
                </v-row>
                <v-row align="center" v-if="a[3]==''?false:true">
                  <v-radio hide-details class="shrink mr-2 mt-0" :value="4" :disabled="a[4]==''"></v-radio>
                  <v-text-field v-model="a[4]" label="Antwort 4" hint="Antwort 4"></v-text-field>
                </v-row>
                <v-row align="center" v-if="a[4]==''?false:true">
                  <v-radio hide-details class="shrink mr-2 mt-0" :value="5" :disabled="a[5]==''"></v-radio>
                  <v-text-field v-model="a[5]" label="Antwort 5" hint="Antwort 5"></v-text-field>
                </v-row>
              </v-radio-group>  
            </div>
          
          </v-col>
          


          <v-col v-show="q!=''" cols="12">
            <!--
            <v-row style="min-width:300px">
              <v-slider
                v-model="pts"
                step="5"
                min="5"
                max="25"
                :tick-labels=[5,10,15,20,25]
                ticks="always"
                color="deep-orange"
                tick-size="4"
                 class="pl-2 pr-2"
                  ></v-slider>
            </v-row>-->
            <v-row>
              <v-switch v-model="quickBet" label="Quickbet (reduced Join-Timer)" prepend-icon="mdi-clock-fast"></v-switch>
            </v-row> 
            <v-row>
              <v-btn color="deep-orange accent-2" text @click="resetBet">Cancel</v-btn>
              <v-btn color="primary" type="submit">Submit!</v-btn>
              
            </v-row>
          </v-col>
                    
                  
                  
        </v-card-text>

      </v-card>
    </v-form>
  </v-container>
</template>


<script>
    export default{
        data: () => ({
            a : [],
            q : '',
            quickBet : false,
            selection : null,
            pts : 10,
            dialog: true,
            valid: true,
            QuestionRules: [
                v => !!v || 'Bitte Wette eingeben, z.B. "Das nächste Fieldgoal erzielt..."'
              ],
            AnswerRules: [
                v => !!v || 'Mindestens 2 Antwortmöglichkeiten sind notwendig',
              ],
            SelectionRules: [
                v => !!v || 'Bitte deinen Tipp abgeben',
              ],
        }),
        created (){
            for (var i = 1; i < 10; i++) {
              this.a[i] = '';
            }
        },
        methods: {
          
          resetBet () {
            this.q = ''
            for (var i = 1; i < 10; i++) {
              this.a[i] = '';
            }
            this.valid = true
            this.pts = 10
            this.selection = null  
            this.quickBet = false
            //this.$refs.newBetForm.reset()
            this.$refs.newBetForm.resetValidation()
          },
          
          submitBet () {
            if (this.$refs.newBetForm.validate()) {
              
                // clean answers: dismiss empty answers
                var cleanedA = []
                for (let i of this.a) {
                   if(i!='' && i!= undefined && i!= null)
                    cleanedA.push(i)
                }
                
                // prepare bet-document
                const bet = {
                    q : this.q,
                    a : cleanedA,
                    pts : this.pts,
                    type : (this.quickBet)?"quick":"standard",
                    state : 'requested',
                    selection : { [this.$store.getters.userID] : this.selection-1 }, // -1 since IDs are different in select an DB
                    created_at : Date.now()
                }
                
                console.log(bet)
                this.$store.dispatch('bets/insert', bet)
                .catch(console.error)
                .then(() =>{
                  
                    // clean overlay
                    for (var i = 1; i < 10; i++) {
                      this.a[i] = '';
                    }
                    this.q = ''
                    this.valid = true
                    this.quickBet = false
                    this.pts = 10
                    this.selection = null

                })
                
            }
          },
        },
        
        watch: {
      
          // if dialog opens, reset it!
          dialog (value) {
            if(value==1){
              for (var i = 1; i < 10; i++) {
                this.a[i] = '';
              }
              this.q = ''
              this.pts = 10
              this.valid = true
              this.selection = null
            }
          },
          
        }
    }
</script>