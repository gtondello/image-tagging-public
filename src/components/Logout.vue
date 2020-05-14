<template>
  <div></div>
</template>
<script>
import firebase from "firebase/app";
import 'firebase/auth'
import DatabaseService from '../services/DatabaseService'
export default {
  created() {
    firebase.auth().signOut().then(() => {
      DatabaseService.logout()
      this.$emit('loggedOut')
      this.$router.push('/login')
    })
  }
}
</script>