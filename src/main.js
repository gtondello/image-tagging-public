import '@babel/polyfill'
import 'es6-promise/auto'
import firebase from "firebase/app";
import 'firebase/auth'
import 'firebase/database'
import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import router from './router'
import store from './store'
import { FIREBASE_CONFIG } from './config'
import DatabaseService from './services/DatabaseService'
import GiftDatabaseService from './services/GiftDatabaseService'
import ChallengeDatabaseService from './services/ChallengeDatabaseService'
import BadgeDatabaseService from './services/BadgeDatabaseService'
import LogDatabaseService from './services/LogDatabaseService'
import StorageService from './services/StorageService'

// Initialize Firebase
firebase.initializeApp(FIREBASE_CONFIG)
DatabaseService.initialize()
GiftDatabaseService.initialize(DatabaseService.db)
ChallengeDatabaseService.initialize(DatabaseService.db)
BadgeDatabaseService.initialize(DatabaseService.db)
LogDatabaseService.initialize(DatabaseService.db)
StorageService.initialize()

// Initialize Vue
Vue.config.productionTip = false

let app

// Delay Vue initialization until Firebase Auth has initialized
firebase.auth().onAuthStateChanged(async authUser => {
  if (!app) {
    if (authUser) {
      try {
        //console.log('MAIN LOGIN')
        await DatabaseService.login(authUser.email.substring(0,6).toUpperCase(), authUser)
      } catch (e) {
        //console.log('MAIN LOGIN ERROR - so logging out')
        await firebase.auth().signOut()
        await DatabaseService.logout()
      }
    } else {
      //console.log('MAIN LOGOUT')
      await DatabaseService.logout()
    }
    app = new Vue({
      router,
      store,
      render: h => h(App)
    }).$mount('#app')
  }
})
