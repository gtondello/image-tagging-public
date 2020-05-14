<template>
  <div>
    <InformationLetter/>

    <v-layout align-center justify-center>
      <v-flex xs12 sm11 md10>
        <v-card class="elevation-2">
          <v-toolbar dark color="primary">
            <v-toolbar-title>Consent to Participate</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <p class="text-xs-left consent">By indicating your consent, you are not waving your legal rights or releasing the investigators or involved institution from their legal and professional responsibilities.</p>
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-text-field prepend-icon="alternate_email" name="code" label="Return code" type="text" v-model="code" :rules="codeRules" required validate-on-blur readonly
                            messages="Please take note of this code in a safe location. You will need to use it to return to this survey each time you close your browser and open it again."></v-text-field>
              <v-text-field prepend-icon="person" name="name" label="Display name" type="text" v-model="name" :rules="nameRules" required validate-on-blur
                            hint="This nickname may be showed to the researchers and other participants in the platform (for example, on a leaderboard). Please avoid using any information that could be used to identify you, to keep your anonymity. Please note that offensive or sensitive words are not permitted."></v-text-field>
              <v-text-field prepend-icon="email" name="contactEmail" label="Email address" type="text" v-model="contactEmail" :rules="emailRules" required validate-on-blur
                            hint="This email address will only be used to notify you to fill out the survey after the study period, to allow you to recover your return code, and for entering you into the gift card draw."></v-text-field>
              <v-checkbox v-model="agreement" required
                :rules="[v => !!v || 'You must agree to continue']"
                label="I am 15 years or older and with full knowledge of all foregoing, I agree, of my own free will, to participate in this study."
              ></v-checkbox>
              <v-checkbox v-model="quotations"
                label="I agree to the use of anonymous quotations from my open text responses in any publication that comes of this research."
              ></v-checkbox>
            </v-form>
            <v-alert :value="isDev" type="warning" outline>
              This server is for test and development only. If you wish to participate in this study, do not proceed and contact the <a href="https://hcigames.com/">HCI Games Group</a>.
            </v-alert>
            <v-snackbar v-model="alert" top multi-line color="error">
              {{ message }}
              <v-btn dark flat @click="alert = false">Close</v-btn>
            </v-snackbar>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click="cancel">Cancel</v-btn>
            <v-btn color="primary" :disabled="!valid" @click="handleSubmit">Continue</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import firebase from "firebase/app";
import 'firebase/auth'
import { DOMAIN, IS_DEV } from '../config.js'
import DatabaseService from '../services/DatabaseService'
import Util from '../services/Util'
import InformationLetter from '@/components/InformationLetter.vue'
export default {
  name: 'Register',
  components: {
    InformationLetter
  },
  data() {
    return {
      alert: false,
      e1: true,
      code: Util.generateCode(6),
      name: '',
      contactEmail: '',
      agreement: false,
      quotations: false,
      codeRules: [
        v => !!v || 'Code is required',
      ],
      nameRules: [
        v => !!v || 'Display name is required',
      ],
      emailRules: [
        v => !!v || 'E-mail address is required',
        v => /.+@.+/.test(v) || 'E-mail must be valid'
      ],
      valid: true,
      message: '',
      isDev: IS_DEV
    }
  },
  methods : {
    cancel() {
      this.$router.push('/')
    },
    handleSubmit(e){
      e.preventDefault()
      this.alert = false;
      if (this.$refs.form.validate()) {
        let email = this.code.toLowerCase() + DOMAIN.toLowerCase()
        let pwd = this.code.toUpperCase()
        firebase.auth().createUserWithEmailAndPassword(email, pwd).then((authData) => {
          DatabaseService.createUser(email, this.code, this.name, this.contactEmail, this.agreement, this.quotations, authData).then(() => {
            this.$emit('loggedIn')
            if (this.$route.params.nextUrl != null){
              this.$router.push(this.$route.params.nextUrl)
            } else {
              this.$router.push('/')
            }
          }).catch(() => {
            this.message = 'An unexpected error has occurred. Please try again latter or contact the researchers for assistance.'
            this.alert = true
          })
        }).catch((error) => {
          //console.error(error.message)
          if (error.code == 'auth/email-already-in-use' || error.code == 'auth/invalid-email' || error.code == 'auth/weak-password') {
            this.message = error.message
          } else {
            this.message = 'An unexpected error has occurred. Please try again latter or contact the researchers for assistance.'
          }
          this.alert = true
        })
      }
    }
  }
}
</script>

<style scoped>
p.consent {
  padding-bottom: 10px;
}
</style>