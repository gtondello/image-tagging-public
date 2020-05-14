<template>
  <v-layout align-center justify-center>
    <v-flex xs12 sm11 md10>
      <h2>Challenges</h2>
      <v-snackbar v-model="successAlert" top multi-line color="success">
        Challenge claimed!
        <v-btn dark flat @click="successAlert = false">Close</v-btn>
      </v-snackbar>
      <v-snackbar v-model="errorAlert" top multi-line color="error">
        An unexpected error has occurred. Please try again latter or contact the researchers for assistance.
        <v-btn dark flat @click="errorAlert = false">Close</v-btn>
      </v-snackbar>
      <div class="elevation-1" style="background-color:#fff">
        <v-list :two-line="!isSmallScreen" :three-line="isSmallScreen">
          <template v-for="(item, index) in challenges">
            <v-list-tile :key="item.challenge.id" :class="{'claimed': item.claimed}">
              <v-list-tile-content>
                <v-list-tile-title>{{ item.challenge.name }}</v-list-tile-title>
                <v-list-tile-sub-title>{{ item.challenge.description }}</v-list-tile-sub-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <div class="custom-action">
                  <div class="value"><v-icon color="amber">star</v-icon><span>{{ item.challenge.value }}</span></div>
                  <v-btn small :disabled="submitting" v-if="item.completed && !item.claimed" @click.prevent="claimOneChallenge(item)">Claim</v-btn>
                  <div v-else class="spacer"><span v-if="item.claimed">CLAIMED!</span></div>
                </div>
              </v-list-tile-action>
            </v-list-tile>
            <v-divider v-if="index + 1 < challenges.length" :key="index"></v-divider>
          </template>
        </v-list>
      </div>
    </v-flex>
  </v-layout>
</template>

<script>
import ChallengeDatabaseService from '../services/ChallengeDatabaseService'
import logBuilder from "../logBuilder"
export default {
  name: 'Challenges',
  data () {
    return {
      challenges: [],
      submitting: false,
      errorAlert: false,
      successAlert: false,
      isSmallScreen: false
    }
  },
  methods: {
    claimOneChallenge (challenge) {
      this.errorAlert = false
      this.successAlert = false
      this.submitting = true
      // Claim the challenge (update the challenge and the user in the database)...
      ChallengeDatabaseService.claimOneChallenge(challenge).then(() => {
        // ... then show the success message
        this.submitting = false
        this.successAlert = true
        logBuilder.buildLog("challengeClaim", logBuilder.challengeParser(challenge))
        // ... and reload the challenges
        ChallengeDatabaseService.loadChallenges((items) => {
          this.challenges = items
        })
      }).catch((error) => {
        // ... or show error alert if the operation fails
        console.log(error)
        this.submitting = false
        this.errorAlert = true
      })
    },
    handleResize () {
      this.isSmallScreen = window.innerWidth <= 768
    }
  },
  created() {
    ChallengeDatabaseService.loadChallenges((items) => {
      this.challenges = items

      for (let challenge of this.challenges){
        logBuilder.buildLog("challengeStatus", logBuilder.challengeParser(challenge))
      }
    })
    this.handleResize()
    window.addEventListener("resize", this.handleResize)
  },
  destroyed() {
    window.removeEventListener("resize", this.handleResize);
  }
}
</script>

<style scoped>
div.claimed {
  background-color: #eee;
}
div.custom-action {
  display: flex;
  flex-direction: row;
}
div.custom-action div.value {
  margin-right: 10px;
}
div.custom-action div.spacer {
  width: 88px;
  font-style: italic;
}
div.custom-action span {
  line-height: 28px;
}
@media screen and (max-width: 768px) {
  div.custom-action {
    padding-left: 5px;
    flex-direction: column;
  }
  div.custom-action div.value {
    margin-right: 0;
  }
  div.custom-action button {
    min-width: 75px;
  }
  div.v-list__tile__action {
    width: 75px;
    min-width: 75px;
  }
  div.custom-action div.spacer {
    width: 75px;
    min-width: 75px;
  }
  div.v-list__tile__avatar {
    min-width: 42px;
  }
}
</style>