<template>
  <v-layout align-center justify-center>
    <v-flex xs12 sm11 md10>
      <h2>Initial Survey</h2>
      <p>Please provide the following information before you begin classifying images.</p>
      <v-stepper v-model="e1" id="tabs">
        <v-stepper-header>
          <v-stepper-step :complete="e1 > 1" step="1">Demographic Information</v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step :complete="e1 > 2" step="2">Gamification Preferences</v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step step="3">Personality</v-stepper-step>
        </v-stepper-header>

        <v-stepper-items>
          <v-stepper-content step="1">
            <!-- Step 1: Demographic Information -->
            <v-text-field prepend-icon="public" name="countryFrom" label="Which country are you from?" type="text" v-model="countryFrom" clearable></v-text-field>
            <v-text-field prepend-icon="public" name="countryLive" label="In which country do you live now?" type="text" v-model="countryLive" clearable></v-text-field>
            <v-text-field prepend-icon="calendar_today" name="age" label="What is your age?" type="number" mask="###" v-model="age" clearable></v-text-field>
            <p class="gender">
              <v-icon>people</v-icon>
              &nbsp;Are you...?
            </p>
            <v-checkbox v-model="gender" label="Man" value="Man" hide-details></v-checkbox>
            <v-checkbox v-model="gender" label="Woman" value="Woman" hide-details></v-checkbox>
            <v-layout align-center>
              <v-checkbox v-model="gender" value="Other" hide-details class="shrink"></v-checkbox>
              <v-text-field :disabled="disableOtherGender" label="Something else (please specify)" v-model="otherGender" clearable></v-text-field>
            </v-layout>
            <v-btn color="primary" @click="updateStepper(2)">Next</v-btn>
          </v-stepper-content>

          <v-stepper-content step="2">
            <!-- Step 2: Gamification Preferences -->
            <LikertScale v-bind:scale="hexadQuestions" v-model="hexadItems"/>
            <v-btn color="primary" @click="updateStepper(3)">Next</v-btn>
          </v-stepper-content>

          <v-stepper-content step="3">
            <!-- Step 3: Personality -->
            <LikertScale v-bind:scale="personalityQuestions" v-model="personalityItems"/>
            <v-btn color="primary" :disabled="submitting" @click="save">Finish</v-btn>
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>

      <v-snackbar v-model="alert" top multi-line color="error">
        An unexpected error has occurred. Please try again latter or contact the researchers for assistance.
        <v-btn dark flat @click="alert = false">Close</v-btn>
      </v-snackbar>
    </v-flex>
  </v-layout>
</template>

<script>
import HexadQuestions from '../model/hexad-questions.json'
import PersonalityQuestions from '../model/personality-questions.json'
import DatabaseService from '../services/DatabaseService'
import LikertScale from '@/components/LikertScale.vue'
export default {
  name: 'Survey',
  components: {
    LikertScale
  },
  data () {
    return {
      e1: 1,
      countryFrom: '',
      countryLive: '',
      age: '',
      gender: [],
      otherGender: '',
      hexadItems: Array(25).fill(0),
      personalityItems: Array(10).fill(0),
      hexadQuestions: HexadQuestions,
      personalityQuestions: PersonalityQuestions,
      submitting: false,
      alert: false
    }
  },
  computed: {
    disableOtherGender () {
      return this.gender.find((g) => g === 'Other') === undefined
    }
  },
  methods: {
    save (e) {
      e.preventDefault()
      this.submitting = true
      // Save the data to the database...
      DatabaseService.saveSurvey(this.countryFrom, this.countryLive, this.age, this.gender, this.otherGender, this.hexadItems, this.personalityItems).then(() => {
        // ... then forward to image tagging view
        this.submitting = false
        this.$router.push({ name: 'Customization' })
      }).catch(() => {
        // ... or show error alert if the operation fails
        this.submitting = false
        this.alert = true
      })
    },
    updateStepper(step) {
      this.e1 = step
      let that = this
      setTimeout(function() { that.$vuetify.goTo('#tabs') } , 100)
    }
  },
  created() {
    if (this.$store.state.user.surveyDone) {
      // If the survey is already done, move forward...
      if (this.$store.state.user.customized) {
        // ...to the Image tagging tasks if the game elements are already customized
        this.$router.push({ name: 'ImageTagging' })
      } else {
        // ...or to the Customization page if it is not completed yet
        this.$router.push({ name: 'Customization' })
      }
    }
  }
}
</script>

<style scoped>
p.gender {
  margin-top: 16px;
  font-size: 16px;
  text-align: left;
}
</style>