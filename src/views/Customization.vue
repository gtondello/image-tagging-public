<template>
  <v-layout align-center justify-center>
    <v-flex xs12 sm11 md10>
      <h2>Customization</h2>
      <v-stepper v-model="e1">
        <v-stepper-header>
          <v-stepper-step :complete="e1 > 1" step="1">Avatar</v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step step="2">Game Elements</v-stepper-step>
        </v-stepper-header>

        <v-stepper-items>
          <v-stepper-content step="1">
            <!-- Step 1: Avatar -->
            <p class="heading">Please select your avatar:</p>
            <v-container grid-list-xl fluid>
              <v-layout justify-center row wrap>
                <v-flex xs4 md2 lg1 v-for="avatar in avatars.free" :key="avatar">
                  <v-badge :value="selectedAvatar === avatar" overlap>
                    <v-icon slot="badge" dark>check</v-icon>
                    <v-avatar class="avatar" :color="selectedAvatar === avatar ? 'grey lighten-2' : ''" tile size="64" @click="selectedAvatar = avatar">
                      <img :src="require('../assets/avatars/'+avatar+'.png')">
                    </v-avatar>
                  </v-badge>
                </v-flex>
              </v-layout>
            </v-container>
            <v-btn color="primary" :disabled="!selectedAvatar" @click="e1 = 2">Next</v-btn>
          </v-stepper-content>

          <v-stepper-content step="2">
            <!-- Step 2: Game Elements -->
            <p class="text-xs-left" v-if="user.allowSelection()">This platform makes use of some game elements to improve your experience and help you keep track of how many image classification microtasks you completed. To customize your experience, please choose the game elements that you would like to use. Please note that you cannot change your selected game elements later.</p>
            <p class="text-xs-left" v-if="! user.allowSelection()">This platform makes use of some game elements to improve your experience and help you keep track of how many image classification microtasks you completed. This is for your information only. Click Finish when you are ready to proceed.</p>
            <v-list three-line>
              <v-list-tile v-for="element in gameElements" :key="element.id" @click="() => {}">
                <v-list-tile-action v-if="user.allowSelection()">
                  <v-checkbox v-model="selectedGameElements" :value="element.id"></v-checkbox>
                </v-list-tile-action>
                <v-list-tile-avatar>
                  <img :src="require('../assets/icons/'+element.icon+'.png')" @click="(toggleElement(element.id))">
                </v-list-tile-avatar>
                <v-list-tile-content @click="(toggleElement(element.id))">
                  <v-list-tile-title>{{ element.title }}</v-list-tile-title>
                  <v-list-tile-sub-title>{{ element.description }}</v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list>
            <div class="text-xs-right" :class="noteColor" v-if="user.allowSelection()">Selected game elements: {{ selectedGameElements.length }}</div>
            <v-btn color="primary" :disabled="submitting" @click="save">Finish</v-btn>
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>

      <v-snackbar v-model="alert" top multi-line color="error">
        {{ message }}
        <v-btn dark flat @click="alert = false">Close</v-btn>
      </v-snackbar>
    </v-flex>
  </v-layout>
</template>

<script>
import avatars from '../model/avatars.json'
import gameElements from '../model/game-elements.json'
import DatabaseService from '../services/DatabaseService'
import Util from '../services/Util'
export default {
  name: 'Survey',
  data () {
    return {
      e1: 1,
      selectedAvatar: '',
      selectedGameElements: [],
      avatars: avatars,
      gameElements: Util.shuffle(gameElements.slice(0)), // show game elements in randomized order
      submitting: false,
      alert: false,
      message: ''
    }
  },
  computed: {
    user: function() {
      return this.$store.state.user
    },
    noteColor () {
      // For now, we're letting participants select how many elements they want
      return '' //this.selectedGameElements.length === 4 ? '' : 'red--text'
    }
  },
  methods: {
    toggleElement (selectedId) {
      if (!this.user.allowSelection()) return
      let i = this.selectedGameElements.indexOf(selectedId)
      if (i == -1) {
        this.selectedGameElements.push(selectedId)
      } else {
        this.selectedGameElements.splice(i, 1)
      }
    },
    save (e) {
      e.preventDefault()
      // For now, we're letting participants select how many elements they want
      if (this.selectedAvatar !== '') { // && this.selectedGameElements.length === 4) {
        this.submitting = true
        // If the condition is for fixed elements, then just add all of them
        let selection = this.user.allowSelection() ? this.selectedGameElements :
                        this.gameElements.map(e => e.id)
        // Save the data to the database...
        DatabaseService.saveCustomization(this.selectedAvatar, selection).then(() => {
          // ... then forward to image tagging view
          this.submitting = false
          this.$router.push({ name: 'ImageTagging' })
        }).catch(() => {
          // ... or show error alert if the operation fails
          this.submitting = false
          this.message = 'An unexpected error has occurred. Please try again latter or contact the researchers for assistance.'
          this.alert = true
        })
      } else {
        this.message = 'Please select exactly four game elements.'
        this.alert = true
      }
    }
  },
  created() {
    if (this.$store.state.user.customized) {
      // If already customized, move forward to Image tagging tasks
      this.$router.push({ name: 'ImageTagging' })
    } else if (!this.$store.state.user.surveyDone) {
      // But if the survey is not completed yet, forward to the survey before customizing game elements
      this.$router.push({ name: 'Survey' })
    }
  }
}
</script>

<style scoped>
p.heading {
  font-size: 16px;
  font-weight: bold;  
}
.avatar {
  cursor: pointer;
}
</style>