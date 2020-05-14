<template>
  <v-layout align-center justify-center>
    <v-flex xs12 sm11 md10>
      <h2>Gifts</h2>
      <v-snackbar v-model="successAlert" top multi-line color="success">
        {{ message }}
        <v-btn dark flat @click="successAlert = false">Close</v-btn>
      </v-snackbar>
      <v-snackbar v-model="errorAlert" top multi-line color="error">
        An unexpected error has occurred. Please try again latter or contact the researchers for assistance.
        <v-btn dark flat @click="errorAlert = false">Close</v-btn>
      </v-snackbar>
      <v-tabs class="elevation-1">  
        <v-tab key="receive">Receive</v-tab>
        <v-tab key="send">Send</v-tab>
        <v-tab-item key="receive">
          <div class="text-xs-center" style="background-color:#fff"><v-btn :disabled="submitting || receiveItems.length==0" @click.prevent="receiveAllGifts">Receive All</v-btn></div>
          <v-alert :value="receiveItems.length==0" type="info">You don't have any gift to receive at this moment. Come back tomorrow for more gifts!</v-alert>
          <v-list two-line>
           <template v-for="(item, index) in receiveItems">
            <v-list-tile :key="item.code" avatar>
              <v-list-tile-avatar size="36px" v-if="item.avatar"><img :src="require('../assets/avatars/'+item.avatar+'.png')"></v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title>{{ item.name }}</v-list-tile-title>
                <v-list-tile-sub-title>
                  <v-icon small color="amber">star</v-icon> {{ item.totalPoints }} &nbsp;
                  <v-icon small color="blue">signal_cellular_alt</v-icon> {{ item.level }}
                  <img v-if="badge(item.badge)" class="small_badge" :src="require('../assets/badges/'+badge(item.badge).image+'.png')" :title="badge(item.badge).name" style="vertical-align:top">
                </v-list-tile-sub-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <div class="custom-action">
                <v-icon color="amber">star</v-icon><span>{{ item.value }}</span> &nbsp;&nbsp;
                <v-btn small :disabled="submitting" @click.prevent="receiveOneGift(item)">Receive</v-btn>
                </div>
              </v-list-tile-action>
            </v-list-tile>
            <v-divider inset v-if="index + 1 < receiveItems.length" :key="index"></v-divider>
           </template>
          </v-list>
        </v-tab-item>
        <v-tab-item key="send">
          <div class="text-xs-center" style="background-color:#fff"><v-btn :disabled="submitting || sendItems.length==0" @click.prevent="sendAllGifts">Send All</v-btn></div>
          <v-alert :value="sendItems.length==0" type="info">You cannot send any gift at this moment. Come back tomorrow to send more gifts!</v-alert>
          <v-list two-line>
           <template v-for="(item, index) in sendItems">
            <v-list-tile :key="item.code" avatar>
              <v-list-tile-avatar size="36px" v-if="item.avatar"><img :src="require('../assets/avatars/'+item.avatar+'.png')"></v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title>{{ item.name }}</v-list-tile-title>
                <v-list-tile-sub-title>
                  <v-icon small color="amber">star</v-icon> {{ item.totalPoints }} &nbsp;
                  <v-icon small color="blue">signal_cellular_alt</v-icon> {{ item.level }}
                  <img v-if="badge(item.badge)" class="small_badge" :src="require('../assets/badges/'+badge(item.badge).image+'.png')" :title="badge(item.badge).name" style="vertical-align:top">
                </v-list-tile-sub-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <div class="custom-action">
                <v-icon color="amber">star</v-icon><span>{{ item.value }}</span> &nbsp;&nbsp;
                <v-btn small :disabled="submitting" @click.prevent="sendOneGift(item)">Send</v-btn>
                </div>
              </v-list-tile-action>
            </v-list-tile>
            <v-divider inset v-if="index + 1 < sendItems.length" :key="index"></v-divider>
           </template>
          </v-list>
        </v-tab-item>
      </v-tabs>
    </v-flex>
  </v-layout>
</template>

<script>
import Badges from '../model/badges.js'
import GiftDatabaseService from '../services/GiftDatabaseService'
import logBuilder from "../logBuilder"

export default {
  name: 'Gifting',
  data () {
    return {
      receiveItems: [],
      sendItems: [],
      submitting: false,
      errorAlert: false,
      successAlert: false,
      message: ''
    }
  },
  methods: {
    badge: function(id) {
      if (id != null && id != '') {
        for (let i = 0; i < Badges.length; i++) {
          if (Badges[i].id === id) {
            return Badges[i]
          }
        }
      }
      return null
    },
    receiveOneGift (gift) {
      this.errorAlert = false
      this.successAlert = false
      this.submitting = true
      logBuilder.buildLog("receiveGift", logBuilder.giftParser(gift))
      // Receive the gift (update the gift and the user in the database)...
      GiftDatabaseService.receiveOneGift(gift).then(() => {
        // ... then show the success message
        this.submitting = false
        this.message = 'Gift received!'
        this.successAlert = true
      }).catch((error) => {
        // ... or show error alert if the operation fails
        console.log(error)
        this.submitting = false
        this.errorAlert = true
      })
    },
    receiveAllGifts () {
      this.errorAlert = false
      this.successAlert = false
      this.submitting = true
      for (let item of this.sendItems){
        console.log(item)
        logBuilder.buildLog("receiveAllGifts", logBuilder.giftParser(item))
      }

      // Receive the gifts (update the gifts and the user in the database)...
      GiftDatabaseService.receiveAllGifts(this.receiveItems).then(() => {
        // ... then show the success message
        this.submitting = false
        this.message = 'Gifts received!'
        this.successAlert = true
      }).catch((error) => {
        // ... or show error alert if the operation fails
        console.log(error)
        this.submitting = false
        this.errorAlert = true
      })
    },
    sendOneGift (gift) {
      this.errorAlert = false
      this.successAlert = false
      this.submitting = true
      // Send the gift (create the gift in the database)...
      GiftDatabaseService.sendOneGift(gift).then(() => {
        // ... then show the success message
        this.submitting = false
        this.message = 'Gift sent!'
        this.successAlert = true

        logBuilder.buildLog("sendGift", logBuilder.giftParser(gift))

      }).catch((error) => {
        // ... or show error alert if the operation fails
        console.log(error)
        this.submitting = false
        this.errorAlert = true
      })
    },
    sendAllGifts () {
      this.errorAlert = false
      this.successAlert = false
      this.submitting = true

      for (let item of this.sendItems){
        console.log(item)
        logBuilder.buildLog("sendAllGifts", logBuilder.giftParser(item))
      }

      // Send the gifts (create the gifts in the database)...
      GiftDatabaseService.sendAllGifts(this.sendItems).then(() => {
        // ... then show the success message

        this.submitting = false
        this.message = 'Gifts sent!'
        this.successAlert = true



      }).catch((error) => {
        // ... or show error alert if the operation fails
        console.log(error)
        this.submitting = false
        this.errorAlert = true
      })
    }
  },
  created() {
    GiftDatabaseService.loadPendingGifts((items) => {
      this.receiveItems = items
    })
    GiftDatabaseService.generateGiftsToSend((items) => {
      this.sendItems = items
    })
  }
}
</script>

<style scoped>
td, th {
  padding: 0 10px !important;
}
div.custom-action {
  display: flex;
  flex-direction: row;
}
div.custom-action span {
  line-height: 28px;
}
@media screen and (max-width: 768px) {
  div.v-list__tile__avatar {
    min-width: 42px;
  }
}
</style>