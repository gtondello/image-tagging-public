<template>
  <v-layout align-center justify-center>
    <v-flex xs12 sm11 md10>
      <!-- Uncomment the following section if recruiting participants from Mechanical Turk. -->
      <!--
      <h1>HIT completion</h1>
      <p>Please go back to Mechanical Turk and submit the following code to complete this HIT and receive your remuneration:</p>
      <h2 v-if="!isDev">{{ hitCode }}</h2>
      <v-alert :value="isDev" type="warning" outline>
        This server is for test and development only. So, there is no completion code.
      </v-alert>
      -->
      <h1>Thank you!</h1>
      <p>Your data was saved and your gift card draw tickets were generated.</p>
      <p>Please check the <a href="https://hcigames.com/">HCI Games Group</a> website if you wish to hear more about this and other studies.</p>
    </v-flex>
  </v-layout>
</template>

<script>
import { IS_DEV } from '../config.js'
export default {
  name: 'Completed',
  data() {
    return {
      isDev: IS_DEV
    }
  },
  computed: {
    hitCode: function() {
      return this.$store.state.user.hitCode
    }
  },
  created () {
    if (!this.$store.state.user.surveyDone) {
      // If the Survey is not done yet, then the user needs to complete it first
      this.$router.push({ name: 'Survey' })
    } else if (!this.$store.state.user.customized) {
      // If the game elements Customization is not done yet, then the user needs to complete it first
      this.$router.push({ name: 'Customization' })
    } else if (!this.$store.state.user.endSurveyDone) {
      // If the End Survey is not done yet, redirect the user to the tagging page
      this.$router.push({ name: 'ImageTagging' })
    }
  }
}
</script>
