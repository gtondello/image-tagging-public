import firebase from "firebase/app";
import 'firebase/database'
import store from '../store'
import { User } from '../model/user-model'
import { UserChallenge } from '../model/user-challenge-model';
import Challenges from '../model/challenges'
import DatabaseService from './DatabaseService'
import UserService from './UserService'

const NOW = firebase.database.ServerValue.TIMESTAMP

let ChallengeDatabaseService = {
  initialize(db) {
    this.db = db
  },

  findChallenge(challengesSnapshot, id) {
    let found = null
    challengesSnapshot.forEach(function(doc) {
      if (doc.key === id) {
        found = doc
      }
    })
    return found
  },

  /**
   * Returns a list of the challenges, with details of the status of each challenge for the user
   */
  loadChallenges(callback) {
    if (callback == null) return // There is no point in making the search if there is no callback to listen to it
    let service = this
    let code = store.state.user.code
    // First, let's get the list of the challenges already completed by this user
    service.db.ref('usersTags/' + code + '/challenges').once('value', function(challengesSnapshot) {
      // Now that we have the list of challenges completed for the user,
      // we will actually add all the challenges to the return list, with information about completion when available
      let result = []
      Challenges.forEach(function(challenge) {
        let userChallenge = new UserChallenge(challenge)
        let challengeSnapshot = service.findChallenge(challengesSnapshot, challenge.id)
        if (challengeSnapshot != null) {
          let doc = challengeSnapshot.val()
          userChallenge.completed = doc.completed
          userChallenge.claimed = doc.claimed
          userChallenge.when = (doc.when == null ? null : new Date(doc.when))
        }
        result.push(userChallenge)
      })
      callback(result)
    })
  },

  /**
   * Returns the number of challenges that are completed but not claimed by the user
   */
  getNumberChallengesClaimable(callback) {
    if (callback == null) return // There is no point in making the search if there is no callback to listen to it
    let service = this
    let code = store.state.user.code
    // First, let's get the list of the challenges already completed by this user
    service.db.ref('usersTags/' + code + '/challenges').on('value', function(challengesSnapshot) {
      // Then, let's count only those that are not claimed yet
      let count = 0
      challengesSnapshot.forEach(function(doc) {
        if (doc.val().completed && !doc.val().claimed) {
          count++
        }
      })
      callback(count)
    })
  },

  /**
   * Marks one challenge as completed
   * (creates the userChallenge document in the database)
   */
  completeOneChallenge (challenge) {
    if (challenge == null) return null
    let service = this
    let code = store.state.user.code
    return new Promise(function (resolve, reject) {
      // Create the user-challenge in the database
      service.db.ref('usersTags/' + code + '/challenges/' + challenge.id).set({
        completed: true,
        claimed: false,
        when: NOW
      }).then(function() {
        resolve()
      }).catch(function(error) {
        reject(error)
      })
    })
  },

  /**
   * Claims the rewards of one challenge
   * (marks the challenge as claimed, adds the amount of points to the user, and updates the user)
   */
  claimOneChallenge (userChallenge) {
    if (userChallenge == null) return null
    let service = this
    let code = store.state.user.code
    return new Promise(function (resolve, reject) {
      let userRef = service.db.ref('users/' + code)
      // Read the user
      return userRef.once('value', function(userDoc) {
        let user = new User()
        user.code = code
        DatabaseService.mapUser(user, userDoc.val())
        // Run these updates in a batch to ensure atomicity
        let batch = {}
        // Update the challenge's claimed status
        batch['/usersTags/' + code + '/challenges/' + userChallenge.challenge.id + '/claimed'] = true
        // Add points and update the user
        user = UserService.addPoints(user, userChallenge.challenge.value)
        batch['/users/' + code + '/points'] = user.points
        batch['/users/' + code + '/totalPoints'] = user.totalPoints
        batch['/users/' + code + '/level'] = user.level
        service.db.ref().update(batch).then(function() {
          resolve()
        }).catch(function(error) {
          reject(error)
        })
      }, function(error) {
        reject(error)
      })
    })
  }
}

export default ChallengeDatabaseService