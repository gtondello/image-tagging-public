<template>
  <v-layout align-center justify-center>
    <v-flex xs12 sm11 md10>
      <h2>Post-study information letter and survey</h2>
      <p>Thank you for helping with our research! In the next sections, we will ask you about your experience with the motivational game elements used in this image classification platform. We appreciate if you could take the additional minutes to tell us about your experience, which will provide us with valuable data for our research.</p>
      <p><em>Note:</em> You will not be able to classify more images after you complete the study. Thus, only proceed after you have finished classifying as many images as you want.</p>
      <v-stepper v-model="e1" id="tabs">
        <v-stepper-header>
          <v-stepper-step :complete="e1 > 1" step="1">Intrinsic Motivation Inventory</v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step :complete="e1 > 2" step="2">Additional Questions</v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step step="3">Post-study Information</v-stepper-step>
        </v-stepper-header>

        <v-stepper-items>
          <v-stepper-content step="1">
            <!-- Step 1: Intrinsic Motivation Inventory -->
            <LikertScale v-bind:scale="imiQuestions" v-model="imiItems"/>
            <v-btn color="primary" @click="updateStepper(2)">Next</v-btn>
          </v-stepper-content>

          <v-stepper-content step="2">
            <!-- Step 2: Additional Questions -->
            <div style="text-align:left">
              <p>Overall, how do you describe your experience with the image classification activities you just completed?<br>
                <v-textarea solo name="overall" v-model="overall"></v-textarea></p>
              <p>How do you describe the experience of selecting game elements to customize the platform for you?<br>
                <v-textarea solo name="experienceSelection" v-model="experienceSelection"></v-textarea></p>
              <p>How do you rate the experience of selecting game elements to customize the platform for you?<br>
                <v-radio-group v-model="rating" column class="hidden-md-and-up"><!-- This is the layout for small devices -->
                  <v-radio label="very negative" :value="1"/><v-radio label="negative" :value="2"/><v-radio label="neutral" :value="3"/>
                  <v-radio label="positive" :value="4"/><v-radio label="very positive" :value="5"/>
                </v-radio-group>
                <v-radio-group v-model="rating" row class="hidden-sm-and-down"><!-- And this is the layout for large devices -->
                  <v-radio label="very negative" :value="1"/><v-radio label="negative" :value="2"/><v-radio label="neutral" :value="3"/>
                  <v-radio label="positive" :value="4"/><v-radio label="very positive" :value="5"/>
                </v-radio-group>
              </p>
              <p>Were you satisfied with the selection of game elements provided by the system? Why?<br>
                <v-textarea solo name="satisfiedOffered" v-model="satisfiedOffered"></v-textarea></p>
              <p>Were you able to select game elements that matched your preferences? Why?<br>
                <v-textarea solo name="satisfiedSelected" v-model="satisfiedSelected"></v-textarea></p>
              <p>How much do you feel that the selection of game elements you used to customize the platform for you influenced your enjoyment of the image classification tasks? Why?<br>
                <v-textarea solo name="enjoyment" v-model="enjoyment"></v-textarea></p>
              <p>Now that you have used this system, which one was your preferred game element to use?
                <v-select solo name="preferredElement" v-model="preferredElement" :items="elementsList"></v-select></p>
              <p>Please explain why it was your preferred element.
                <v-textarea solo name="whyElement" v-model="whyElement"></v-textarea></p>
              <p>Now that you have used this system, which game element do you feel most influenced how you tagged images?
                <v-select solo name="preferredElement" v-model="mostInfluential" :items="elementsList"></v-select></p>
              <p>Which game element motivated you more to tag images?
                <v-select solo name="preferredElement" v-model="motivatedMore" :items="elementsList"></v-select></p>
            </div>

            <v-btn color="primary" @click="updateStepper(3)">Next</v-btn>
          </v-stepper-content>

          <v-stepper-content step="3">
            <!-- Step 3: Post-study Information -->
            <PostStudyLetter/>
            <div style="text-align:left">
              <h2>Post-debriefing Consent Form</h2>
              <v-checkbox v-model="read" label="I have read this Post-Study Information page." :error-messages="readError"></v-checkbox>
              <p>I give my permission for the researchers to use my data and/or the information I provided through the online survey for this study. This includes permission to use all the data I provided: pre-study survey answers, post-study survey answers, microtask completion data, and record of my interactions with the motivational game elements in the platform.</p>
              <v-radio-group v-model="permission" row :error-messages="permissionError">
                <v-radio label="Yes" :value="true"/>
                <v-radio label="No" :value="false"/>
              </v-radio-group>
              <p>Note: you will receive an additional ticket for the gift card draw whether you give us permission to use the provided data or not.</p>
              <p>If you have questions about the use of deception in this study, please contact the researcher Gustavo Tondello at <a href="mailto:gfortestondello@uwaterloo.ca">gfortestondello@uwaterloo.ca</a> or +1 (519) 888-4567 ext. 37616 and we would be happy to answer any questions.</p>
            </div>
            <v-btn color="primary" @click="validatePostStudy()">Finish</v-btn>
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
import ImiQuestions from '../model/imi-questions.json'
import LikertScale from '@/components/LikertScale.vue'
import PostStudyLetter from '@/components/PostStudyLetter.vue'
import DatabaseService from '../services/DatabaseService'
export default {
  name: 'EndSurvey',
  components: {
    LikertScale, PostStudyLetter
  },
  data () {
    return {
      e1: 1,
      imiItems: Array(32).fill(0),
      imiQuestions: ImiQuestions,
      overall: '',
      experienceSelection: '',
      satisfiedOffered: '',
      satisfiedSelected: '',
      enjoyment: '',
      preferredElement: '',
      whyElement: '',
      mostInfluential: '',
      motivatedMore: '',
      rating: null,
      read: false,
      permission: null,
      readError: '',
      permissionError: '',
      submitting: false,
      alert: false,
      elementsList: ['Badges', 'Challenges', 'Gifting', 'Leaderboards', 'Levels', 'Moderating role', 'Power-ups', 'Random Coins', "Unlockable content"] 
    }
  },
  methods: {
    validatePostStudy () {
      this.readError = this.read ? '' : 'You must confirm that you have read this page before you proceed.'
      this.permissionError = this.permission !== null ? '' : 'You must state if you give us permission or not before you proceed.'
      if (this.readError === '' && this.permissionError === '') {
        this.save()
      }
    },
    save () {
      this.submitting = true
      // Save the data to the database...
      DatabaseService.saveEndSurvey(this.imiItems, this.overall, this.experienceSelection, this.satisfiedOffered, this.satisfiedSelected, 
                                    this.enjoyment, this.rating, this.preferredElement, this.whyElement, this.mostInfluential, this.motivatedMore, this.read, this.permission).then(() => {
        // ... then forward to image tagging view
        this.submitting = false
        this.$router.push({ name: 'Completed' })
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
    if (!this.$store.state.user.surveyDone) {
      // If the initial Survey is not done yet, then the user needs to complete it first
      this.$router.push({ name: 'Survey' })
    } else if (!this.$store.state.user.customized) {
      // If the game elements Customization is not done yet, then the user needs to complete it first
      this.$router.push({ name: 'Customization' })
    } else if (this.$store.state.user.endSurveyDone) {
      // If the End Survey is already done, then the study is completed
      this.$router.push({ name: 'Completed' })
    }
  }
}
</script>
