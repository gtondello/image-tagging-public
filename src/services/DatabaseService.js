import firebase from "firebase/app";
import 'firebase/database'
import store from '../store'
import { ACTION_LOGIN, ACTION_LOGOUT } from '../store'
import { User } from '../model/user-model'
import Util from './Util'

const NOW = firebase.database.ServerValue.TIMESTAMP

let DatabaseService = {
  initialize() {
    this.db = firebase.database()
  },

  /**
   * Populates the properties of a User object from the snapshot received from the database
   */
  mapUser(user, userSnapshot) {
    if (user == null) { user = new User() }
    user.email = userSnapshot.email
    user.name = userSnapshot.name
    user.contactEmail = userSnapshot.contactEmail
    user.agreement = userSnapshot.agreement
    user.quotations = userSnapshot.quotations
    user.surveyDone = userSnapshot.surveyDone
    user.customized = userSnapshot.customized
    user.taskCompleted = userSnapshot.taskCompleted
    user.endSurveyDone = userSnapshot.endSurveyDone
    user.avatar = userSnapshot.avatar ? userSnapshot.avatar : 'anonymous'
    user.badge = userSnapshot.badge
    user.gameElements = userSnapshot.gameElements ? Util.mapToArray(userSnapshot.gameElements) : []
    user.unlockedAvatars = userSnapshot.unlockedAvatars ? Util.mapToArray(userSnapshot.unlockedAvatars) : []
    user.taggedImages = userSnapshot.taggedImages ? Util.mapObject(userSnapshot.taggedImages) : {}
    user.points = userSnapshot.points ? userSnapshot.points : 0
    user.totalPoints = userSnapshot.totalPoints ? userSnapshot.totalPoints : 0
    user.level = userSnapshot.level ? userSnapshot.level : 1
    user.powerups = userSnapshot.powerups ? Util.mapObject(userSnapshot.powerups) : {}
    user.hitCode = userSnapshot.hitCode
    user.condition = userSnapshot.condition
    user.registered = (userSnapshot.registered == null ? null : new Date(userSnapshot.registered))
    return user
  },

  /**
   * Loads a user object from the database using the unique code as key
   * and signals to the Store that the user is logged in
   */
  login (code, authData) {
    //console.log("DATABASE LOGIN")
    let service = this
    let resolved = false

    return new Promise(function (resolve, reject) {
      service.db.ref('users/' + code).on('value', async function(doc) {
        if (!doc.exists()) {
          service.logout()  // ensure that user is logged out after error
          resolved = true
          //console.log('User data not found on database.')
          reject('User data not found on database.')
          return
        }
        //console.log('User snapshot')
        let userSnapshot = doc.val()
        let user = new User()
        user.code = code
        service.mapUser(user, userSnapshot)
        user.authData = authData
        await store.dispatch(ACTION_LOGIN, user)
        if (!resolved) {
          resolved = true
          resolve(user)
        }
      }, function(error) {
        service.logout()  // ensure that user is logged out after error
        resolved = true
        reject(error)
      })
    })
  },

  /**
   * Creates a new user object in the database with the information provided by the user
   * and signals to the Store that the user is logged in
   */
  createUser (email, code, name, contactEmail, agreement, quotations, authData) {
    let service = this
    // Currently, we want to assign users to one of two conditions
    let condition = Math.floor(Math.random() * 2) + 1
    return new Promise(function (resolve, reject) {
      service.db.ref('users/' + code).set({
        email: email,
        name: name,
        contactEmail: contactEmail,
        agreement: agreement,
        quotations: quotations,
        surveyDone: false,
        condition: condition,
        registered: NOW
      }).then(async function() {
        // immediately returns created user
        let user = new User()
        user.email = email
        user.code = code
        user.name = name
        user.contactEmail = contactEmail
        user.agreement = agreement
        user.quotations = quotations
        user.condition = condition
        user.registered = new Date()
        user.authData = authData
        await store.dispatch(ACTION_LOGIN, user)
        resolve(user)
        // also sets up a listener to any future updates on the user
        service.db.ref('users/' + code).on('value', function(doc) {
          let userSnapshot = doc.val()
          let user = new User()
          user.code = code
          service.mapUser(user, userSnapshot)
          user.authData = authData
          store.dispatch(ACTION_LOGIN, user)
        })
      }).catch(function(error) {
        service.logout()  // ensure that user is logged out after error
        reject(error)
      })
    })
  },

  /**
   * Stops listening for changes on user data from the database 
   * and signals to the Store that the user is logged out.
   */
  logout () {
    //console.log("DATABASE LOGOUT")
    let service = this
    return new Promise(async function (resolve) {
      // Detach all the listeners from the DB
      if (store.state.user != null) {
        let code = store.state.user.code
        service.db.ref('users/' + code).off()
        service.db.ref('usersTags/' + code + '/badges').off()
        service.db.ref('usersTags/' + code + '/challenges').off()
        service.db.ref('usersGifts').off()
      }
      service.db.ref().off()

      // Remove the user from the store
      await store.dispatch(ACTION_LOGOUT)
      resolve()
    })
  },

  /**
   * Updates the user account information (display name, authorization to use quotations, and avatar)
   * Note: the code/email address and the agreement to participate cannot be updated once the account was created
   */
  updateUser (name, quotations, avatar) {
    let service = this
    return new Promise(function (resolve, reject) {
      service.db.ref('users/' + store.state.user.code).update({
        name: name,
        quotations: quotations,
        avatar: avatar
      }).then(function () {
        resolve()
      }).catch(function(error) {
        reject(error)
      })
    })
  },

  /**
   * Saves all the tags that a user has typed for an image into the database
   */
  saveTags (tags, imageId) {
    let service = this
    let code = store.state.user.code
    return new Promise(function (resolve, reject) {
      // Use a batch operation to ensure that all the DB modifications will be done atomically
      let batch = {}
      // save the tags
      batch['/usersTags/' + code + '/tags/' + imageId] = {
        tags: tags.join(),
        when: NOW
      }
      // add the image id to the array of images already tagged by the user
      batch['/users/' + code + '/taggedImages/' + imageId] = {
        tags: tags.length,
        when: NOW
      }
      batch['/users/' + code + '/taskCompleted'] = true
      // do the update
      service.db.ref().update(batch).then(function () {
        resolve()
      }).catch(function(error) {
        reject(error)
      })
    })
  },

  /**
   * Saves data about all the tags that a user has moderated for an image into the database
   */
  saveModeratedTags (moderationTags, moderationFlags, imageId) {
    let service = this
    let code = store.state.user.code
    let moderatedTags = {}
    for (let i = 0; i < moderationTags.length; i++) {
      moderatedTags[moderationTags[i]] = moderationFlags[i]
    }
    return new Promise(function (resolve, reject) {
      service.db.ref('usersTags/' + code + '/tags/' + imageId).update({
        moderatedTags: moderatedTags
      }).then(function () {
        resolve()
      }).catch(function(error) {
        reject(error)
      })
    })
  },

  /**
   * Saves the responses to the initial survey
   */
  saveSurvey (countryFrom, countryLive, age, gender, otherGender, hexadItems, personalityItems) {
    let service = this
    let code = store.state.user.code
    return new Promise(function (resolve, reject) {
      // Use a batch operation to ensure that all the DB modifications will be done atomically
      let batch = {}
      // create new usersSurveys document with the received data
      batch['/usersSurveys/' + code] = {
        countryFrom: countryFrom,
        countryLive: countryLive,
        age: age,
        gender: gender,
        otherGender: otherGender,
        hexadItems: Util.arrayToObject(hexadItems),
        personalityItems: Util.arrayToObject(personalityItems),
        when: NOW
      }
      // set that the user has already completed the survey
      batch['/users/' + code + '/surveyDone'] = true
      // do the update
      service.db.ref().update(batch).then(function () {
        resolve()
      }).catch(function(error) {
        reject(error)
      })
    })
  },

  /**
   * Saves the responses to the post-study survey
   */
  saveEndSurvey (imiItems, overall, experienceSelection, satisfiedOffered, satisfiedSelected, enjoyment, rating, preferredElement, whyElement, mostInfluential, motivatedMore, read, permission) {
    let service = this
    let code = store.state.user.code
    return new Promise(function (resolve, reject) {
      // Use a batch operation to ensure that all the DB modifications will be done atomically
      let batch = {}
      // create new usersEndSurveys document with the received data
      batch['/usersEndSurveys/' + code] = { 
        imiItems: Util.arrayToObject(imiItems),
        overall: overall,
        experienceSelection: experienceSelection,
        satisfiedOffered: satisfiedOffered,
        satisfiedSelected: satisfiedSelected,
        enjoyment: enjoyment,
        rating: rating,
        preferredElement: preferredElement,
        whyElement: whyElement,
        mostInfluential: mostInfluential,
        motivatedMore: motivatedMore,
        read: read,
        permission: permission,
        when: NOW
      }
      // set that the user has already completed the survey and save the HIT completion code
      let hitCode = Util.generateCode(10)
      batch['/users/' + code + '/endSurveyDone'] = true
      batch['/users/' + code + '/hitCode'] = hitCode
      // do the update
      service.db.ref().update(batch).then(function () {
        resolve()
      }).catch(function(error) {
        reject(error)
      })
    })
  },

  /**
   * Saves the customization options (avatar and game elements array)
   */
  saveCustomization (avatar, gameElements) {
    let service = this
    let code = store.state.user.code
    // Fow now, 'progress' is always selected
    if (gameElements.indexOf('progress') == -1) {
      gameElements.push('progress')
    }
    return new Promise(function (resolve, reject) {
      service.db.ref('users/' + code).update({  
        customized: true, // set that the user has already completed the customization
        avatar: avatar,   // saves the selected avatar id
        gameElements: Util.arrayToMap(gameElements) // saves the array of game elements
      }).then(function() {
        resolve()
      }).catch(function(error) {
        reject(error)
      })
    })
  },

  /**
   * Updates the user's points and level
   */
  updatePoints (points, totalPoints, level) {
    let service = this
    let code = store.state.user.code
    return new Promise(function (resolve, reject) {
      service.db.ref('users/' + code).update({  
        points: points, // the amount of points that the user currently has
        totalPoints: totalPoints,  // the total amount of points that the user has earned
        level: level // the current level
      }).then(function() {
        resolve()
      }).catch(function(error) {
        reject(error)
      })
    })
  },

  /**
   * Update the user's powerups inventory
   */
  updatePowerUps (powerups) {
    let service = this
    let code = store.state.user.code
    return new Promise(function (resolve, reject) {
      service.db.ref('users/' + code).update({  
        powerups: powerups // the user's power ups inventory
      }).then(function() {
        resolve()
      }).catch(function(error) {
        reject(error)
      })
    })
  },

  /**
   * Unlocks an avatar for the user (adds it to the list of unlocked avatars)
   * and updates the user's points at the same time
   * (because the user has just spent points to unlock the avatar)
   */
  unlockAvatar (points, unlockedAvatars) {
    let service = this
    let code = store.state.user.code
    return new Promise(function (resolve, reject) {
      service.db.ref('users/' + code).update({  
        points: points, // the amount of points that the user currently has
        unlockedAvatars: Util.arrayToMap(unlockedAvatars)  // the list of avatars unlocked by the user
      }).then(function() {
        resolve()
      }).catch(function(error) {
        reject(error)
      })
    })
  },

  /**
   * Reads a list of users for the Leaderboard
   */
  loadLeaderboard(callback) {
    if (callback == null) return // There is no point in making the search if there is no callback to listen to it
    let service = this
    let usersRef = service.db.ref('users').orderByChild('gameElements/leaderboards').equalTo(true)
    usersRef.on('value', function(snapshot) {
      let users = []
      snapshot.forEach(function(doc) {
        let userSnapshot = doc.val()
        let user = new User()
        user.code = doc.key
        service.mapUser(user, userSnapshot)
        users.push(user)
      })
      callback(users)
    })
  },

  /**
   * Reads a list of all the images tagged by the user
   */
  loadTaggedImages(callback) {
    if (callback == null) return // There is no point in making the search if there is no callback to listen to it
    let service = this
    let code = store.state.user.code
    let taggedImagesRef = service.db.ref('users/' + code + '/taggedImages')
    taggedImagesRef.once('value', function(snapshot) {
      let taggedImages = Util.mapObject(snapshot.val())
      callback(taggedImages)
    })
  },

}

export default DatabaseService