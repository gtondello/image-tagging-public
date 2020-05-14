<template>
  <v-layout align-center justify-center>
    <v-flex xs12 sm11 md10>
      <h2>Change Password</h2>
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-text-field prepend-icon="lock" name="currentPassword" label="Current Password" id="currentPassword" v-model="currentPassword" :rules="currentPasswordRules" required
                      :append-icon="e1 ? 'visibility' : 'visibility_off'" @click:append="() => (e1 = !e1)" :type="e1 ? 'password' : 'text'"></v-text-field>
        <v-text-field prepend-icon="lock" name="newPassword" label="New Password" id="newPassword" v-model="newPassword" :rules="newPasswordRules" required min="6" hint="At least 6 characters"
                      :append-icon="e2 ? 'visibility' : 'visibility_off'" @click:append="() => (e2 = !e2)" :type="e2 ? 'password' : 'text'"></v-text-field>
      </v-form>
      <p>
        <v-btn @click="reset">Reset</v-btn>
        <v-btn color="primary" :disabled="!valid" @click="save">Save changes</v-btn>
      </p>
      <v-snackbar v-model="successAlert" top multi-line color="success">
        Your new password was saved!
        <v-btn dark flat @click="successAlert = false">Close</v-btn>
      </v-snackbar>
      <v-snackbar v-model="errorAlert" top multi-line color="error">
        An unexpected error has occurred or your current password was invalid. Please try again or contact the researchers for assistance.
        <v-btn dark flat @click="errorAlert = false">Close</v-btn>
      </v-snackbar>
    </v-flex>
  </v-layout>
</template>

<script>
import firebase from "firebase/app";
import 'firebase/auth'
export default {
  name: 'ChangePassowrd',
  data () {
    return {
      valid: false,
      e1: true,
      e2: true,
      currentPassword: '',
      newPassword: '',
      successAlert: false,
      errorAlert: false,
      currentPasswordRules: [
        v => !!v || 'Password is required'
      ],
      newPasswordRules: [
        v => !!v || 'Password is required',
        v => (!!v && v.length >= 6) || 'Password must have at least 6 characters'
      ],
    }
  },
  methods: {
    reset (e) {
      e.preventDefault()
      this.successAlert = false
      this.errorAlert = false
      this.currentPassword = ''
      this.newPassword = ''
    },
    save (e) {
      e.preventDefault()
      this.successAlert = false
      this.errorAlert = false
      if (this.$refs.form.validate()) {
        let user = firebase.auth().currentUser
        const credential = firebase.auth.EmailAuthProvider.credential(this.$store.state.user.email, this.currentPassword)
        user.reauthenticateAndRetrieveDataWithCredential(credential).then(() => {
          // User re-authenticated
          user.updatePassword(this.newPassword).then(() => {
            // Update successful
            this.successAlert = true
            this.currentPassword = ''
            this.newPassword = ''
          }).catch(() => {
            // An error happened
            this.errorAlert = true
          })
        }).catch(() => {
          // An error happened (probably wrong current password)
          this.errorAlert = true
        })
      }
    }
  }
}
</script>
