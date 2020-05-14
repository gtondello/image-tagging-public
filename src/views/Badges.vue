<template>
  <v-layout align-center justify-center>
    <v-flex xs12 sm11 md10>
      <h2>Badges</h2>
      <v-snackbar v-model="successAlert" top multi-line color="success">
        Badge selected!
        <v-btn dark flat @click="successAlert = false">Close</v-btn>
      </v-snackbar>
      <v-snackbar v-model="errorAlert" top multi-line color="error">
        An unexpected error has occurred. Please try again latter or contact the researchers for assistance.
        <v-btn dark flat @click="errorAlert = false">Close</v-btn>
      </v-snackbar>
      <div class="elevation-1" style="background-color:#fff">
        <v-list :two-line="!isSmallScreen" :three-line="isSmallScreen">
          <template v-for="(item, index) in badges">
            <v-list-tile :key="item.badge.id">
              <v-list-tile-avatar>
                <img class="large_badge" :src="require('../assets/badges/'+item.badge.image+(item.acquired?'':'_grey')+'.png')">
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title>{{ item.badge.name }}</v-list-tile-title>
                <v-list-tile-sub-title>{{ item.badge.description }}</v-list-tile-sub-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <div class="custom-action" v-if="item.acquired">
                  <div class="spacer"><span v-if="item.acquired">OBTAINED!</span></div>
                  <v-btn small v-if="item.badge.id == user.badge" disabled>In Use</v-btn>
                  <v-btn small v-else :disabled="submitting" @click.prevent="setBadge(item.badge)">Use in Profile</v-btn>
                </div>
              </v-list-tile-action>
            </v-list-tile>
            <v-divider v-if="index + 1 < badges.length" :key="index"></v-divider>
          </template>
        </v-list>
      </div>
    </v-flex>
  </v-layout>
</template>

<script>
import BadgeDatabaseService from '../services/BadgeDatabaseService'
import logBuilder from "../logBuilder"
export default {
  name: 'Badges',
  data () {
    return {
      badges: [],
      submitting: false,
      errorAlert: false,
      successAlert: false,
      isSmallScreen: false
    }
  },
  computed: {
    user: function () {
        return this.$store.state.user
    }
  },
  methods: {
    setBadge (badge) {
      this.errorAlert = false
      this.successAlert = false
      this.submitting = true
      // Sets the user's display badge on the DB
      BadgeDatabaseService.setBadge(badge.id).then(() => {
        // ... then show the success message
        this.submitting = false
        this.successAlert = true

      }).catch(() => {
        // ... or show error alert if the operation fails
        this.submitting = false
        this.errorAlert = true
      })
    },
    handleResize () {
      this.isSmallScreen = window.innerWidth <= 768
    }
  },
  created: function () {
    BadgeDatabaseService.loadBadges((items) => {
      this.badges = items

      for (let badge of this.badges){
        logBuilder.buildLog("badgeStatus",logBuilder.badgeParser(badge))
      }
    });

    this.handleResize()
    window.addEventListener("resize", this.handleResize)
  },
  destroyed() {
    window.removeEventListener("resize", this.handleResize);
  }
}

</script>

<style scoped>
img.large_badge {
  width: 36px;
  height: 36px;
}
img.large_badge .grey {
  -webkit-filter: grayscale(85%);
  filter: grayscale(85%);
}
div.custom-action {
  display: flex;
  flex-direction: row;
}
div.custom-action button {
  min-width: 120px;
}
div.custom-action div.spacer {
  margin-right: 20px;
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
  div.v-list__tile__action {
    width: 125px;
    min-width: 125px;
  }
  div.custom-action div.spacer {
    margin-right: 0;
    text-align: center;
    width: 120px;
  }
  div.v-list__tile__avatar {
    min-width: 42px;
  }
}
</style>