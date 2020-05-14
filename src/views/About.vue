<template>
  <div class="about">
    <InformationLetter/>
    <v-layout align-center justify-center>
      <v-flex xs12 sm11 md10>
        <PostStudyLetter v-if="user.endSurveyDone"/>
        <v-alert :value="!user.endSurveyDone" type="success">
          You have already agreed to participate of this study.
          Go to <router-link to="/tagging">Tag Images</router-link> to begin completing tasks.
        </v-alert>
        <v-alert :value="user.endSurveyDone" type="success">
          You have already completed your participation in this study. Thank you!
          <!-- Uncomment the following line if recruiting participants from Mechanical Turk. -->
          <!--Go to <router-link to="/completed">HIT completion</router-link> to obtain the HIT completion code for Mechanical Turk.-->
        </v-alert>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import InformationLetter from '@/components/InformationLetter.vue'
import PostStudyLetter from '@/components/PostStudyLetter.vue'
export default {
  name: 'About',
  components: {
    InformationLetter, PostStudyLetter
  },
  computed: {
    user: function() {
      return this.$store.state.user
    }
  }
}
</script>

<style scoped>
.v-alert.success a {
  color: #39f0ff;
}
</style>