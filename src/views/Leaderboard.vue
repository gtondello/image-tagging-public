<template>
  <v-layout align-center justify-center>
    <v-flex xs12 sm11 md10>
      <h2>Leaderboard</h2>
      <v-data-table :headers="headers" :items="items" :pagination.sync="pagination" hide-actions class="elevation-1">
        <template slot="headerCell" slot-scope="props">
          <v-icon :color="props.header.color" v-if="props.header.icon">{{ props.header.icon}}</v-icon> {{ props.header.text }}
        </template>
        <template slot="items" slot-scope="props">
          <td :class="['text-xs-left', {'font-weight-bold': isUser(props.item)}]">{{ props.index + 1 }}</td>
          <td :class="['text-xs-left', {'font-weight-bold': isUser(props.item)}]">
            <v-avatar size="36px"><img :src="require('../assets/avatars/'+props.item.avatar+'.png')"></v-avatar>
            <span style="margin-left:10px">{{ props.item.name }}</span>
            <img v-if="badge(props.item.badge)" class="badge" :src="require('../assets/badges/'+badge(props.item.badge).image+'.png')" :title="badge(props.item.badge).name">
          </td>
          <td :class="['text-xs-center', {'font-weight-bold': isUser(props.item)}]">{{ props.item.totalPoints }}</td>
          <td :class="['text-xs-center', {'font-weight-bold': isUser(props.item)}]">{{ props.item.level }}</td>
        </template>
      </v-data-table>
    </v-flex>
  </v-layout>
</template>

<script>
import Badges from '../model/badges.js'
import DatabaseService from '../services/DatabaseService'
import logBuilder from "../logBuilder";
export default {
  name: 'Leaderboard',
  data () {
    return {
      headers: [
        { text: '', value: '', align: 'left', sortable: false, icon: '', color: '', width: '10px' },
        { text: 'User', value: 'name', align: 'left', sortable: false, icon: 'person', color: 'gray' },
        { text: 'Points', value: 'totalPoints', align: 'center', sortable: false, icon: 'star', color: 'amber' },
        { text: 'Level', value: 'level', align: 'center', sortable: false, icon: 'signal_cellular_alt', color: 'blue' }
      ],
      items: [],
      pagination: {
        sortBy: 'totalPoints',
        descending: true,
        rowsPerPage: -1
      }
    }
  },
  methods: {
    isUser: function(other) {
      return this.$store.state.user.code === other.code
    },
    badge: function(id) {
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
  created() {
    DatabaseService.loadLeaderboard((items) => {
      this.items = items

      let test = this.items.sort(function(a,b){
        return b.totalPoints - a.totalPoints
      });

      let i = 0
      let currentUser = 0;
      while (i<test.length){
        logBuilder.buildLog("leaderboardStatus", logBuilder.userParser(test[i], i+1))

        if (this.isUser(test[i])){
          currentUser = i+1
        }

        i+=1
      }
      logBuilder.buildLog("leaderboardCurrentRank", currentUser)
    })
  }
}
</script>

<style scoped>
td, th {
  padding: 0 10px !important;
}
</style>