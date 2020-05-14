import firebase from "firebase/app";
import 'firebase/database'
import store from '../store'
import { User } from '../model/user-model'
import { Gift } from '../model/gift-model'
import DatabaseService from './DatabaseService'
import UserService from './UserService'

const NOW = firebase.database.ServerValue.TIMESTAMP

let GiftDatabaseService = {
  initialize(db) {
    this.db = db
  },

  /**
   * Reads a list of users that have the Gifting option
   */
  loadUsersForGifting(callback) {
    if (callback == null) return // There is no point in making the search if there is no callback to listen to it
    let service = this
    let usersRef = service.db.ref('users').orderByChild('gameElements/gifting').equalTo(true)
    usersRef.on('value', function(snapshot) {
      let users = []
      snapshot.forEach(function(doc) {
        let userSnapshot = doc.val()
        let user = new User()
        user.code = doc.id
        service.mapUser(user, userSnapshot)
        users.push(user)
      })
      callback(users)
    })
  },

  /**
   * Returns a list of the gifts that this user has pending for reception
   */
  loadPendingGifts(callback) {
    if (callback == null) return; // There is no point in making the search if there is no callback to listen to it
    let service = this;
    let code = store.state.user.code
    // First, let's get the list of all users that may have sent gifts, so we don't have to query one by one later
    let usersRef = service.db.ref('users').orderByChild('gameElements/gifting').equalTo(true)
    usersRef.on('value', function(usersSnapshot) {
      // Now that we have the list of users, let's query the list of pending gifts
      let giftsRef = service.db.ref('usersGifts').orderByChild('to').equalTo(code)
      //giftsRef.where('to', '==', email).where('received', '==', false).orderBy('timestamp', 'desc').onSnapshot(function(giftsSnapshot) {
      giftsRef.on('value', function(giftsSnapshot) {
        let gifts = []
        giftsSnapshot.forEach(function(doc) {
          let giftSnapshot = doc.val()
          if (!giftSnapshot.received) {
            let gift = new Gift()
            gift.id = doc.key
            gift.code = giftSnapshot.from
            gift.timestamp = (giftSnapshot.timestamp == null ? null : new Date(giftSnapshot.timestamp))
            gift.value = giftSnapshot.value
            gift.received = giftSnapshot.received
            usersSnapshot.forEach(function(userDoc) {
              if (userDoc.key === gift.code) {
                let userSnapshot = userDoc.val()
                gift.name = userSnapshot.name
                gift.totalPoints = userSnapshot.totalPoints
                gift.level = userSnapshot.level
                gift.avatar = userSnapshot.avatar
                gift.badge = userSnapshot.badge
              }
            })
            gifts.push(gift)
          }
        })
        gifts.sort(function(a, b){ return b.timestamp - a.timestamp }) // sort by timestamp desc
        callback(gifts)
      })
    })
  },

  /**
   * Returns a list of the gifts that the user can send today.
   * (Considers that a user can send one gift per other user per day)
   */
  generateGiftsToSend(callback) {
    if (callback == null) return // There is no point in making the search if there is no callback to listen to it
    let service = this
    let code = store.state.user.code
    // First, let's get the list of all other users that this user may send gifts to
    let usersRef = service.db.ref('users').orderByChild('gameElements/gifting').equalTo(true)
    usersRef.on('value', function(usersSnapshot) {
      // Now that we have the list of users, let's query the list of pending gifts, to see if this user has already send gifts today
      let today = new Date()
      today.setHours(0, 0, 0, 0)
      let tomorrow = new Date(today.getTime())
      tomorrow.setDate(tomorrow.getDate() + 1)
      let giftsRef = service.db.ref('usersGifts')//.orderByChild('timestamp').startAt(today.getTime()).endAt(tomorrow.getTime()-1)
      //giftsRef.where('from', '==', email).where('timestamp', '>=', today).where('timestamp', '<', tomorrow).onSnapshot(function(giftsSnapshot) {
      giftsRef.on('value', function(giftsSnapshot) {
        // Now that we have the list of users that we can send gifts to, and the list of gifts already sent today,
        // we will create gift objects just for those users who did not receive a gift today yet
        let gifts = []
        let value = store.state.user.totalPoints >= 10 ? Math.round(store.state.user.totalPoints / 10) : 1 // user will always send 1/10 of their points (or min. 1)
        usersSnapshot.forEach(function(userDoc) {
          if (userDoc.key !== code) { // user cannot send gift to self
            let alreadySent = false
            giftsSnapshot.forEach(function(giftDoc) {
              if (giftDoc.val().from === code && giftDoc.val().to === userDoc.key) {
                alreadySent = true
              }
            })
            if (!alreadySent) {
              let userSnapshot = userDoc.val()
              let gift = new Gift()
              gift.code = userDoc.key
              gift.name = userSnapshot.name
              gift.totalPoints = userSnapshot.totalPoints
              gift.level = userSnapshot.level
              gift.avatar = userSnapshot.avatar
              gift.badge = userSnapshot.badge
              gift.timestamp = NOW
              gift.value = value
              gift.received = false
              gifts.push(gift)
            }
          }
        })
        callback(gifts)
      })
    })
  },

  /**
   * Receives one gift from other user
   * (marks the gift as received, adds the amount of points to the user, and updates the user)
   */
  receiveOneGift (gift) {
    if (gift == null) return null
    let service = this
    let code = store.state.user.code
    return new Promise(function (resolve, reject) {
      let userRef = service.db.ref('users/' + code)
      // Read the user
      return userRef.once('value', function(userDoc) {
        let user = new User()
        user.code = code
        DatabaseService.mapUser(user, userDoc.val())
        // Run these updates in a transaction to ensure atomicity
        let batch = {}
        // Update the gift's received status
        batch['/usersGifts/' + gift.id + '/received'] = true
        // Add points and update the user
        user = UserService.addPoints(user, gift.value)
        batch['/users/' + code + '/points'] = user.points
        batch['/users/' + code + '/totalPoints'] = user.totalPoints
        batch['/users/' + code + '/level'] = user.level
        // do the batch
        service.db.ref().update(batch).then(function() {
          resolve()
        }).catch(function(error) {
          reject(error)
        })
      }, function(error) {
        reject(error)
      })
    })
  },

  /**
   * Receives all gifts from other users
   * (marks the gifts as received, adds the amount of points to the user, and updates the user)
   */
  receiveAllGifts (gifts) {
    if (gifts == null || gifts.length == 0) return null
    let service = this
    let code = store.state.user.code
    return new Promise(function (resolve, reject) {
      let userRef = service.db.ref('users/' + code)
      // Read the user
      return userRef.once('value', function(userDoc) {
        let user = new User()
        user.code = code
        DatabaseService.mapUser(user, userDoc.val())
        // Run these updates in a transaction to ensure atomicity
        let batch = {}
        // Iterate through the list of gifts
        gifts.forEach(function(gift) {
          // Update the gift's received status
          batch['/usersGifts/' + gift.id + '/received'] = true
          // Add points to the user
          // (but do not update yet; the user will be updated only once after all gifts have been added)
          user = UserService.addPoints(user, gift.value)
        })
        // Now that all gifts are added in the loop above, finally update the user
        batch['/users/' + code + '/points'] = user.points
        batch['/users/' + code + '/totalPoints'] = user.totalPoints
        batch['/users/' + code + '/level'] = user.level
        // do the batch
        service.db.ref().update(batch).then(function() {
          resolve()
        }).catch(function(error) {
          reject(error)
        })
      }, function(error) {
        reject(error)
      })
    })
  },

  /**
   * Sends one gift to another user (creates a new gift document)
   */
  sendOneGift (gift) {
    if (gift == null) return null
    let service = this;
    return new Promise(function (resolve, reject) {
      service.db.ref('usersGifts').push().set({
        from: store.state.user.code,
        to: gift.code,
        value: gift.value,
        timestamp: NOW,
        received: false
      }).then(function() {
        resolve()
      }).catch(function(error) {
        reject(error)
      })
    })
  },

  /**
   * Sends several gifts to other users (creates new gift documents)
   */
  sendAllGifts (gifts) {
    if (gifts == null || gifts.length == 0) return null
    let service = this;
    return new Promise(function (resolve, reject) {
      let giftsRef = service.db.ref('usersGifts')
      // Write all gifts in a batch to optimize network usage
      let batch = {}
      gifts.forEach(function(gift) {
        let giftKey = giftsRef.push().key
        batch['/usersGifts/' + giftKey] = {
          from: store.state.user.code,
          to: gift.code,
          value: gift.value,
          timestamp: NOW,
          received: false
        }
      })
      // do the batch
      service.db.ref().update(batch).then(function() {
        resolve()
      }).catch(function(error) {
        reject(error)
      })
    })
  },
}

export default GiftDatabaseService