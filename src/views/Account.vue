<template>
  <v-layout align-center justify-center>
    <v-flex xs12 sm11 md10>
      <h2>My Profile</h2>
      <!-- Account information -->
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-text-field prepend-icon="alternate_email" name="email" label="Return code" type="text" v-model="code" required disabled
                      messages="Please take note of this code in a safe location. You can use it to return to this survey in case you have to close it before finishing it. (Note: this is NOT the completion code to be submitted to MTurk.)"></v-text-field>
        <v-text-field ref="name" prepend-icon="person" name="name" label="Display name" type="text" v-model="name" :rules="[v => !!v || 'Display name is required']" required validate-on-blur :disabled="endSurveyDone"
                      hint="This nickname may be showed to the researchers and other participants in the platform. Please avoid using any information that could be used to identify you, to keep your anonymity. Please note that offensive or sensitive words are not permitted."></v-text-field>
        <v-checkbox v-model="agreement" required disabled
                    label="I am 15 years or older and with full knowledge of all foregoing, I agree, of my own free will, to participate in this study."
                    hint="You have to agree to participate in this study. If you wish to withdraw your participation, please select Complete Sudy in the menu and proceed to the end of the questionnaire." persistent-hint
        ></v-checkbox>
        <v-checkbox v-model="quotations" :disabled="endSurveyDone"
                    label="I agree to the use of anonymous quotations from my open text responses in any publication that comes of this research."
        ></v-checkbox>
      </v-form>
      <!-- Avatar -->
      <v-card class="elevation-1">
        <v-card-text>
          <p class="heading">Please select your avatar:</p>
          <v-container grid-list-xl fluid>
            <v-layout justify-center row wrap>
              <v-flex xs4 md2 lg1 v-for="avatar in avatarList" :key="avatar">
                <v-badge :value="selectedAvatar === avatar || locked(avatar)" overlap>
                  <v-icon slot="badge" dark>{{ selectedAvatar === avatar ? 'check' : 'lock' }}</v-icon>
                  <v-avatar class="avatar" :color="selectedAvatar === avatar ? 'grey lighten-2' : ''" tile size="64" @click="selectedAvatar = avatar">
                    <img :src="require('../assets/avatars/'+avatar+'.png')">
                  </v-avatar>
                </v-badge>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
      </v-card>
      <p class="p-a-1"></p>
      <!-- Game Elements -->
      <v-expansion-panel>
        <v-expansion-panel-content>
          <div slot="header">Game Elements (cannot be changed):</div>
          <v-list three-line>
            <v-list-tile v-for="element in gameElements" :key="element.id">
              <v-list-tile-avatar>
                <img :src="require('../assets/icons/'+element.icon+'.png')">
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title>{{ element.title }}</v-list-tile-title>
                <v-list-tile-sub-title>{{ element.description }}</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <p class="p-a-1"></p>
      <!-- Buttons -->
      <p v-if="!endSurveyDone">
        <!--<v-btn color="error" @click="deleteAccount">Delete account</v-btn>-->
        <v-btn @click="reset">Reset</v-btn>
        <v-btn color="primary" :disabled="!valid" @click="save">Save changes</v-btn>
      </p>
      <v-alert :value="endSurveyDone" type="success">
        You have already completed your participation in this study, so you cannot update your profile anymore.<br>
        <!-- Uncomment the following line if recruiting participants from Mechanical Turk. -->
        <!--Go to <router-link to="/completed">HIT completion</router-link> to obtain the HIT completion code for Mechanical Turk.-->
      </v-alert>
      <v-snackbar v-model="successAlert" top multi-line color="success">
        Your changes were saved!
        <v-btn dark flat @click="successAlert = false">Close</v-btn>
      </v-snackbar>
      <v-snackbar v-model="errorAlert" top multi-line color="error">
        An unexpected error has occurred. Please try again latter or contact the researchers for assistance.
        <v-btn dark flat @click="errorAlert = false">Close</v-btn>
      </v-snackbar>
    </v-flex>
    <!-- AVATAR DIALOG -->
    <v-dialog v-model="dialog" max-width="400" persistent>
      <v-card>
        <v-card-title class="headline">Unlock Avatar?</v-card-title>
        <v-card-text>
          <p class="text-xs-center">
            <v-avatar class="avatar" tile size="64">
              <img :src="require('../assets/avatars/'+selectedAvatar+'.png')">
            </v-avatar>
          </p>
          <p class="text-xs-center">You have selected a locked Avatar!</p>
          <p class="text-xs-center font-weight-bold">Cost: <v-icon color="amber" title="Coins" small>attach_money</v-icon> {{ avatarCost }}</p>
          <p class="text-xs-center" v-if="avatarCost <= points">
            You currently have <v-icon color="amber" title="Coins" small>attach_money</v-icon> {{ points }}.<br>
            Would you like to use <v-icon color="amber" title="Coins" small>attach_money</v-icon> {{ avatarCost }} to unlock this avatar?
          </p>
          <p class="text-xs-center" v-if="avatarCost > points">
            You currently have <v-icon color="amber" title="Coins" small>attach_money</v-icon> {{ points }}.<br>
            Sadly, you do not have enough coins. Tag more images to earn more coins and come back here later to unlock this avatar!
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" :disabled="avatarCost > points" @click="unlockAvatarAndSave">Unlock</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import Vue from 'vue'
import avatars from '../model/avatars.json'
import gameElements from '../model/game-elements.json'
import DatabaseService from '../services/DatabaseService'
import UserService from '../services/UserService'
import logBuilder from "../logBuilder";
export default {
  name: 'Account',
  data () {
    return {
      valid: true,
      email: this.$store.state.user.email,
      code: this.$store.state.user.code,
      name: this.$store.state.user.name,
      agreement: this.$store.state.user.agreement,
      quotations: this.$store.state.user.quotations,
      selectedAvatar: this.$store.state.user.avatar,
      endSurveyDone: this.$store.state.user.endSurveyDone,
      avatarList: this.loadAvatars(),
      successAlert: false,
      errorAlert: false,
      dialog: false
    }
  },
  computed: {
    gameElements: function() {
      return gameElements.filter((element) => this.$store.state.user.gameElements.indexOf(element.id) !== -1);
    },
    points: function() {
      return this.$store.state.user.points
    },
    avatarCost: function() {
      if (this.selectedAvatar !== '') {
        return avatars.premium.indexOf(this.selectedAvatar) === -1 ? 100 : 200
      } else {
        return 0
      }
    }
  },
  methods: {
    reset (e) {
      e.preventDefault()
      this.successAlert = false
      this.errorAlert = false
      this.code = this.$store.state.user.code
      this.email = this.$store.state.user.email
      this.name = this.$store.state.user.name
      this.agreement = this.$store.state.user.agreement
      this.quotations = this.$store.state.user.quotations
      this.selectedAvatar = this.$store.state.user.avatar
      Vue.nextTick(() => this.$refs.form.validate() )
    },
    save (e) {
      e.preventDefault()
      this.successAlert = false
      this.errorAlert = false
      this.dialog = false
      if (this.$refs.form.validate() && this.selectedAvatar !== '') {
        if (this.locked(this.selectedAvatar)) {

          logBuilder.buildLog("avatarAttemptToPurchase", logBuilder.avatarParser(this.selectedAvatar, this.avatarCost, this.points))

          this.dialog = true
        } else {

          logBuilder.buildLog("avatarChange", logBuilder.avatarParser(this.selectedAvatar, this.avatarCost, this.points))

          this.doSave()
        }
      }
    },
    doSave() {
      DatabaseService.updateUser(this.name, this.quotations, this.selectedAvatar).then(() => {
        this.dialog = false
        this.successAlert = true
      }).catch(() => {
        this.errorAlert = true
      })
    },
    unlockAvatarAndSave(e) {
      e.preventDefault()
      let updatedUser = UserService.usePoints(this.$store.state.user, this.avatarCost)
      if (updatedUser.unlockedAvatars == null) { updatedUser.unlockedAvatars = [] }
      updatedUser.unlockedAvatars.push(this.selectedAvatar)
      DatabaseService.unlockAvatar(updatedUser.points, updatedUser.unlockedAvatars).then(() => {
        this.dialog = false
        this.doSave()
      }).catch(() => {
        this.errorAlert = true
      })

      logBuilder.buildLog("avatarUnlock",logBuilder.avatarParser(this.selectedAvatar, this.avatarCost, this.points))
    },
    deleteAccount (e) {
      e.preventDefault()
      // TODO implement this
    },
    locked(avatar) {
      let user = this.$store.state.user
      return (avatars.free.indexOf(avatar) === -1) && (user.unlockedAvatars == null || user.unlockedAvatars.indexOf(avatar) === -1)
    },
    loadAvatars() {
      let avatarList = avatars.free.slice(0)
      if (this.$store.state.user.useUnlocks()) {
        avatars.paid.forEach((avatar) => avatarList.push(avatar))
        avatars.premium.forEach((avatar) => avatarList.push(avatar))
      }
      return avatarList
    }
  },
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