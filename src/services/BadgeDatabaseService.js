import firebase from "firebase/app";
import 'firebase/database'
import store from '../store'
import { UserBadge } from '../model/user-badge-model';
import Badges from '../model/badges'
import logBuilder from "../logBuilder";

const NOW = firebase.database.ServerValue.TIMESTAMP

let BadgeDatabaseService = {
  initialize(db) {
    this.db = db
  },

  findBadge(badgesSnapshot, id) {
    let found = null
    badgesSnapshot.forEach(function(doc) {
      if (doc.key === id) {
        found = doc
      }
    })
    return found
  },

  /**
   * Returns a list of the badges, with details of the status of each badge for the user
   */
  loadBadges(callback) {
    if (callback == null) return // There is no point in making the search if there is no callback to listen to it
    let service = this
    let code = store.state.user.code
    // First, let's get the list of the badges already acquired by this user
    service.db.ref('usersTags/' + code + '/badges').once('value', function(badgesSnapshot) {
      // Now that we have the list of badges acquired for the user,
      // we will actually add all the badges to the return list, with information about acquisition when available
      let result = []
      Badges.forEach(function(badge) {
        let userBadge = new UserBadge(badge)
        let badgeSnapshot = service.findBadge(badgesSnapshot, badge.id)
        if (badgeSnapshot != null) {
          let doc = badgeSnapshot.val()
          userBadge.acquired = doc.acquired
          userBadge.when = (doc.when == null ? null : new Date(doc.when))
        }
        result.push(userBadge)
      })
      callback(result)
    })
  },

  /**
   * Marks one badge as acquired
   * (creates the userBadge document in the database)
   */
  completeOneBadge (badge) {
    if (badge == null) return null
    let service = this
    let code = store.state.user.code
    return new Promise(function (resolve, reject) {
      // Create the user-badge in the database
      service.db.ref('usersTags/' + code + '/badges/' + badge.id).set({
        acquired: true,
        when: NOW
      }).then(function() {
        resolve()
      }).catch(function(error) {
        reject(error)
      })
    })
  },

  /**
   * Sets the current display badge for the user
   */
  setBadge (badge) {
    logBuilder.buildLog("setBadge", badge)
    let service = this
    let code = store.state.user.code
    return new Promise(function (resolve, reject) {
      service.db.ref('users/' + code).update({  
        badge: badge // the user's display badge
      }).then(function() {
        resolve()
      }).catch(function(error) {
        reject(error)
      })
    })
  }
}

export default BadgeDatabaseService