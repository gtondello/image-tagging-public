<template>
    <v-layout align-center justify-center>
      <v-flex xs12 sm8 md4>
        <v-card class="elevation-4">
          <v-toolbar dark color="primary">
            <v-toolbar-title>Welcome</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <p>Are you a returning participant or a new participant?</p>
            <p>I am a new participant:</p>
            <v-btn color="primary" @click="register">Please sign me up!</v-btn>
            <v-divider class="divider"></v-divider>
            <p>I am a returning participant:</p>
            <v-form ref="form" v-model="valid" lazy-validation @submit.prevent.native="handleSubmit">
              <v-text-field prepend-icon="alternate_email" name="email" label="Return code" type="text" v-model="code" :rules="codeRules" required validate-on-blur
                            hint="Enter the code provided to you when you signed up for this study to continue your participation." append-outer-icon="chevron_right" @click:append-outer="handleSubmit"></v-text-field>
            </v-form>
            <v-alert :value="isDev" type="warning" outline>
              This server is for test and development only. If you wish to participate in this study, do not proceed and contact the <a href="https://hcigames.com/">HCI Games Group</a>.
            </v-alert>
            <v-snackbar v-model="alert" top multi-line color="error">
              {{ message }}
              <v-btn dark flat @click="alert = false">Close</v-btn>
            </v-snackbar>
            <v-snackbar v-model="resetAlert" top multi-line color="info">
              {{ message }}
              <v-btn dark flat @click="resetAlert = false">Close</v-btn>
            </v-snackbar>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
</template>

<script>
import firebase from 'firebase/app'
import 'firebase/auth'
import { DOMAIN, IS_DEV } from '../config.js'
import DatabaseService from '../services/DatabaseService'
import logBuilder from '../logBuilder'

export default {
  name: 'Login',
  data() {
    return {
      alert: false,
      resetAlert: false,
      e1: true,
      code: '',
      codeRules: [
        v => !!v || 'Return code is required',
      ],
      valid: true,
      message: '',
      resetMode: false,
      isDev: IS_DEV
    }
  },
  methods : {
    register() {
      this.$router.push({name: 'Register'})
    },
    handleSubmit (e) {
      e.preventDefault()
      this.alert = false
      this.resetAlert = false
      if (this.$refs.form.validate()) {
        let email = this.code.toLowerCase() + DOMAIN.toLowerCase()
        let pwd = this.code.toUpperCase()
        firebase.auth().signInWithEmailAndPassword(email, pwd).then((authData) => {
          DatabaseService.login(this.code.toUpperCase(), authData).then(() => {
            // Logged in
            this.$emit('loggedIn')
            if (this.$route.params.nextUrl != null){
              this.$router.push(this.$route.params.nextUrl)
            } else {
              this.$router.push('/')
            }
          }).catch(() => {
            // An error occurred in the database service
            this.message = 'An unexpected error has occurred. Please try again latter or contact the researchers for assistance.'
            this.alert = true
          })
        }).catch(() => {
          // An error occurred on Firebase Auth
          this.message = 'Invalid return code.' //'Invalid email address or password.'
          this.alert = true
        })
        logBuilder.buildLog("login")
      }
    }
  }
}

</script>

<style scoped>
.divider {
  margin-top: 16px;
  margin-bottom: 16px;
}
</style>