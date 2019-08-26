<template>
        <v-dialog v-model="dialog" persistent max-width="600px">
          <template v-slot:activator="{ on }">
            <v-btn color="primary" block v-on="on">Neue Wette</v-btn>
          </template>
          <v-form
              ref="newBetForm"
              v-model="valid"
              @submit.prevent.native="submitBet"
              lazy-validation>  
              <v-card>
                <v-card-title>
                  <span class="headline">Neue Wette anbieten</span>
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12">
                        <v-text-field v-model="q" :rules="QuestionRules" label="Wette eingeben *" required></v-text-field>
                      </v-col>
                      <v-col cols="12">
                          <h3>Antwortmöglichkeiten:</h3>
                      </v-col>
                      <v-col cols="11" offset="1">
                        <v-text-field :rules="AnswerRules" v-model="a[1]" label="Bitte eingeben*" required hint="Antwort 1" persistent-hint></v-text-field>
                        <v-text-field :rules="AnswerRules" v-model="a[2]" label="Bitte eingeben*" required hint="Antwort 2" persistent-hint></v-text-field>
                        <v-text-field v-model="a[3]" label="Bitte eingeben" hint="Antwort 3" persistent-hint></v-text-field>
                        <v-text-field v-model="a[4]" label="Bitte eingeben" hint="Antwort 4" persistent-hint></v-text-field>
                        <v-text-field v-model="a[5]" label="Bitte eingeben" hint="Antwort 5" persistent-hint v-show="a[4]==''?false:true"></v-text-field>
                        <v-text-field v-model="a[6]" label="Bitte eingeben" hint="Antwort 6" persistent-hint v-show="a[5]==''?false:true"></v-text-field>
                        <v-text-field v-model="a[7]" label="Bitte eingeben" hint="Antwort 7" persistent-hint v-show="a[6]==''?false:true"></v-text-field>
                        <v-text-field v-model="a[8]" label="Bitte eingeben" hint="Antwort 8" persistent-hint v-show="a[7]==''?false:true"></v-text-field>
                        <v-text-field v-model="a[9]" label="Bitte eingeben" hint="Antwort 9" persistent-hint v-show="a[8]==''?false:true"></v-text-field>
                        <v-text-field v-model="a[10]" label="Bitte eingeben" hint="Antwort 10" persistent-hint v-show="a[9]==''?false:true"></v-text-field>
                      </v-col>
                    </v-row>
                  </v-container>
                  <small>*indicates required field</small>
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
            a : [],
            q : '',
            dialog: false,
            valid: true,
            QuestionRules: [
                v => !!v || 'Bitte Wette eingeben, z.B. "Das nächste Fieldgoal erzielt..."'
              ],
            AnswerRules: [
                v => !!v || 'Mindestens 2 Antwortmöglichkeiten sind notwendig',
              ],  
        }),
        created (){
            for (var i = 1; i < 10; i++) {
              this.a[i] = '';
            }
        },
        methods: {
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
                    state : 'requested'
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
                    this.dialog = false
                    this.players = []
                    
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
              this.valid = true
              this.players = []
            }
          },
          
        }
    }
</script>