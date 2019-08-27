<template>
  <v-dialog v-model="dialog" persistent max-width="600px">
    <v-form
        ref="resolveForm"
        v-model="valid"
        @submit.prevent.native="resolveBet"
        lazy-validation>  
        <v-card>
          <v-card-title>
            <span class="headline">{{ content.q }}</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-subheader>Die richtige Antwort lautet:</v-subheader>
              </v-row>
              <v-row>
                <v-radio-group v-model="userAnswer" class="pl-2 pr-2 mt-0 pt-0 mb-0 pb-0">
                  <v-radio
                    v-for="(answer, i) in content.a" 
                    :key="i"
                    :label="answer"
                    :value="i"
                    ></v-radio>
                </v-radio-group>
              </v-row>
            </v-container>

          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="dialog = false">Abbrechen</v-btn>
            <v-btn color="blue darken-1" text type="submit">OK</v-btn>
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
            bet : null
        }),
        created (){

        },
        methods: {
          resolveBet () {
            var verdict = {}
            verdict[this.$store.getters.userID]=this.userAnswer
            this.$store.dispatch('bets/patch', {id : this.content.id, verdict })
            .catch(console.error)
            .then(() =>{
              // reset overlay
              this.dialog = false
              this.userAnswer = null
              this.valid = true
              
              // if enough verdicts available --> Judge
            })

          }
 
        },
        
        watch: {
          
          // if dialog opens, reset it!
          dialog (value) {
            if(value==1){
              this.q = ''
              this.valid = true
              this.userAnswer = null
            }
          },          
   
          
        }
    }
</script>