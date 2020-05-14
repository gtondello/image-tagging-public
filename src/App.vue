<template>
  <v-app>
    <v-navigation-drawer app fixed :mini-variant="miniVariant" :clipped="clipped" v-model="drawer" v-if="isAuthenticated">
      <v-toolbar flat>
        <v-list>
          <v-list-tile>
            <v-list-tile-avatar v-if="user.avatar">
              <img :src="require('./assets/avatars/'+user.avatar+'.png')">
            </v-list-tile-avatar>
            <v-list-tile-title class="title">
              <span>{{ user.name }}</span>
              <img v-if="badge" class="badge" :src="require('./assets/badges/'+badge.image+'.png')" :title="badge.name">
            </v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-toolbar>

      <v-divider v-if="user.usePoints() || user.useProgress()"></v-divider>
      <div style="padding:10px" v-if="user.usePoints()">
          <div style="flex-direction:row; justify-content:center">
            <v-icon color="amber" title="Coins" size="20px" v-if="user.useUnlocks()">attach_money</v-icon>
            <span style="margin-left:5px" v-if="user.useUnlocks()"><b>{{ user.points }}</b></span>
            <v-icon color="amber" style="margin-left:20px" title="Points" size="20px" v-if="user.usePoints()">star</v-icon>
            <span style="margin-left:5px" v-if="user.usePoints()"><b>{{ user.totalPoints }}</b></span>
            <v-icon color="blue" style="margin-left:20px" title="Level" size="20px" v-if="user.useLevels()">signal_cellular_alt</v-icon>
            <span style="margin-left:5px" v-if="user.useLevels()"><b>{{ user.level }}</b></span>
            <v-icon color="green" style="margin-left:20px" title="Images tagged" size="20px" v-if="user.useProgress()">assignment_turned_in</v-icon>
            <span style="margin-left:5px" v-if="user.useProgress()"><b>{{ user.countTaggedImages() }}/{{ totalImages }}</b></span>
          </div>
      </div>
  
      <v-divider></v-divider>
      <v-list dense class="pt-0">
        <v-list-tile
          v-for="item in items"
          :key="item.title"
          :to="{path: item.url}"
        >
          <v-list-tile-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-tile-action>
  
          <v-list-tile-content>
            <v-list-tile-title>
              <v-badge :value="item.badge && item.badge() > 0" class="custom-badge">
                <span>{{ item.title }}</span>
                <span slot="badge" v-if="item.badge != null">{{ item.badge() }}</span>
              </v-badge>
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile @click="logout">
          <v-list-tile-action>
            <v-icon>exit_to_app</v-icon>
          </v-list-tile-action>
  
          <v-list-tile-content>
            <v-list-tile-title>Sign out</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>

    <v-toolbar fixed app :clipped-left="clipped">
      <v-toolbar-side-icon @click.stop="drawer = !drawer" v-if="isAuthenticated"></v-toolbar-side-icon>
      <!--
      <v-btn icon @click.stop="miniVariant = !miniVariant">
        <v-icon v-html="miniVariant ? 'chevron_right' : 'chevron_left'"></v-icon>
      </v-btn>
      <v-btn icon @click.stop="clipped = !clipped">
        <v-icon>web</v-icon>
      </v-btn>
      -->
      <v-layout row wrap>
        <v-flex xs12>
          <v-toolbar-title class="font-weight-bold">Image Classification</v-toolbar-title>
        </v-flex>
        <v-flex xs12>
          <span>A research study by the <a href="https://hcigames.com/">HCI Games Group</a></span>
        </v-flex>
      </v-layout>
    </v-toolbar>

    <v-content>
      <v-container fluid>
        <v-fade-transition mode="out-in">
            <router-view></router-view>
        </v-fade-transition>
      </v-container>
    </v-content>

    <v-footer app>
      <v-layout justify-center>
        <div>&copy; 2019 – <a href="https://hcigames.com/">HCI Games Group</a></div>
      </v-layout>
    </v-footer>
  </v-app>
</template>

<script>
import firebase from "firebase/app";
import 'firebase/auth'
import imageList from '@/assets/images/image-list.json'
import Badges from './model/badges.js'
import DatabaseService from './services/DatabaseService'
import GiftDatabaseService from './services/GiftDatabaseService'
import ChallengeDatabaseService from './services/ChallengeDatabaseService'
import logBuilder from './logBuilder'

export default {
  name: 'App',
  data() {
    return {
      clipped: false,
      drawer: null,
      miniVariant: false,
      gifts: 0,
      challenges: 0,
      monitoringGifts: false,
      monitoringChallenges: false,
      totalImages: imageList.length
    }
  },
  computed: {
    isAuthenticated: function () {
      return this.$store.getters.isAuthenticated
    },
    user: function() {
      return this.$store.state.user
    },
    items: function() {
      return this.createMenuItems()
    },
    badge: function() {
      let id = this.$store.state.user.badge
      if (id != null && id != '') {
        for (let i = 0; i < Badges.length; i++) {
          if (Badges[i].id === id) {
            return Badges[i]
          }
        }
      }
      return null
    }
  },
  methods: {
    logout: function () {
      logBuilder.buildLog('logout')

      firebase.auth().signOut().then(() => {
        DatabaseService.logout()
        this.$emit('loggedOut')
        this.$router.push('/login')
      })
    },
    createMenuItems: function() {
      let user = this.$store.state.user
      let items = []
      if (user == null) { return items }
      //items.push({ title: 'Home', icon: 'dashboard', url: '/' })
      if (!user.endSurveyDone) {
        items.push({ title: 'Tag Images', icon: 'assignment', url: '/tagging' })
      }
      if (user.useLeaderboard()) {
        items.push({ title: 'Leaderboard', icon: 'list', url: '/leaderboard' })
      }
      if (user.useGifting()) {
        if (!this.monitoringGifts) {
          GiftDatabaseService.loadPendingGifts((gifts) => {
            this.gifts = gifts.length
          })
          this.monitoringGifts = true
        }
        items.push({ title: 'Gifts', badge: () => { return this.gifts }, icon: 'redeem', url: '/gifting' })
      }
      if (user.useChallenges()) {
        if (!this.monitoringChallenges) {
          ChallengeDatabaseService.getNumberChallengesClaimable((number) => {
            this.challenges = number
          })
          this.monitoringChallenges = true
        }
        items.push({ title: 'Challenges', badge: () => { return this.challenges }, icon: 'check_box', url: '/challenges' })
      }
      if (user.useBadges()) {
        items.push({ title: 'Badges', icon: 'brightness_5', url: '/badges' })
      }
      items.push({ title: 'My Profile', icon: 'person', url: '/account' })
      //items.push({ title: 'Change Password', icon: 'lock', url: '/changepassword' })
      items.push({ title: 'About', icon: 'question_answer', url: '/about' })
      if (user.customized && !user.endSurveyDone && user.enableEndSurvey()) {
        items.push({ title: 'Complete Study', icon: 'done_outline', url: '/endsurvey' })
      }
      return items
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

a {
  text-decoration: none;
}

img.badge {
  width: 24px;
  height: 24px;
  vertical-align: middle;
  margin-left: 5px;
}

img.small_badge {
  width: 20px;
  height: 20px;
  vertical-align: middle;
  margin-left: 5px;
}

.custom-badge .v-badge__badge {
  top: 0px;
  height: 15px;
  width: 15px;
  font-size: 10px;
}

.custom-badge .v-badge__badge span {
  margin-top: -0.4em;
}
</style>
