import DatabaseService from './DatabaseService'
import ChallengeDatabaseService from './ChallengeDatabaseService'
import BadgeDatabaseService from './BadgeDatabaseService'
import PowerUps from '../model/powerups'
import { UserPowerUp } from '../model/user-powerup'
import logBuilder from "../logBuilder"

let UserService = {
  LEVELS: [10, 30, 60, 100, 150, 210, 280, 360, 450, 550, 660, 780, 910, 1050, 1200, 1360, 1530, 1710, 1900, 2100],

  /**
   * Returns a clone of the User object, with the points and level updated.
   * Called when the user earns points (same amount of points and coins)
   */
  addPoints(user, pointsToAdd) {
    let newUser = user.clone()
    newUser.points = newUser.points + pointsToAdd
    newUser.totalPoints = newUser.totalPoints + pointsToAdd
    while (newUser.totalPoints >= this.LEVELS[newUser.level-1]) {
      newUser.level = newUser.level + 1
    }
    return newUser
  },

  /**
   * Returns a clone of the User object, with the points and level updated.
   * Called when the user earns different amounts of points and coins
   */
  addPointsAndCoins(user, pointsToAdd, coinsToAdd) {
    let newUser = user.clone()
    newUser.points = newUser.points + coinsToAdd
    newUser.totalPoints = newUser.totalPoints + pointsToAdd
    while (newUser.totalPoints >= this.LEVELS[newUser.level-1]) {
      newUser.level = newUser.level + 1
    }
    return newUser
  },

  /**
   * Returns a clone of the User object, with the points updated.
   * Called when the user spends points
   */
  usePoints(user, pointsToUse) {
    let newUser = user.clone()
    newUser.points = (newUser.points > pointsToUse) ? (newUser.points - pointsToUse) : 0
    return newUser
  },

  /**
   * Creates an array of UserPowerUp's containing the powerups that the user has in the inventory
   */
  getPowerUps(user) {
    let userPowerUps = []
    PowerUps.forEach((powerup) => {
      if (user.powerups[powerup.id] > 0) {
        userPowerUps.push(new UserPowerUp(powerup, user.powerups[powerup.id]))
      }
    })

    return userPowerUps
  },

  /**
   * Adds one more power up to the user inventory
   */
  addPowerUp(user, powerup) {
    let newUser = user.clone()
    if (newUser.powerups[powerup.id]) {
      newUser.powerups[powerup.id] += 1
    } else {
      newUser.powerups[powerup.id] = 1
    }

    logBuilder.buildLog("gainPowerUp", logBuilder.powerUpParser(powerup.id, 1))
    return newUser
  },

  /**
   * Decrease the quantity of one power in the user inventory
   */
  usePowerUp(user, powerup) {
    let newUser = user.clone()
    if (newUser.powerups[powerup.id]) {
      newUser.powerups[powerup.id] -= 1
    } else {
      newUser.powerups[powerup.id] = 0
    }

    logBuilder.buildLog("usePowerUp", logBuilder.powerUpParser(powerup.id, newUser.powerups[powerup.id]))

    return newUser
  },

  /**
   * Checks if the user has completed any new challenge, and updates the database accordingly.
   */
  checkChallengeCompletion() {
    // First, let's get the list of challenges with completion information
    let done = false
    ChallengeDatabaseService.loadChallenges((userChallenges) => {
      // Now, let's get the list of images tagged by the user
      DatabaseService.loadTaggedImages((taggedImages) => {
        if (!done) { // ensure that we just do this once
          userChallenges.forEach((userChallenge) => {
            if (!userChallenge.completed && userChallenge.challenge.isCompleted(taggedImages)) {
              // challenge was not complete before, but it is now, so, let's save it to the DB
              ChallengeDatabaseService.completeOneChallenge(userChallenge.challenge)

              logBuilder.buildLog("challengeComplete", logBuilder.challengeParser(userChallenge))
            }
          })
          done = true // ensure that we just do this once
        }
      })
    })
  },

  /**
   * Checks if the user has acquired any new badge, and updates the database accordingly.
   */
  checkBadgeCompletion() {
    // First, let's get the list of badges with completion information
    let done = false
    BadgeDatabaseService.loadBadges((userBadges) => {
      // Now, let's get the list of images tagged by the user
      DatabaseService.loadTaggedImages((taggedImages) => {
        if (!done) { // ensure that we just do this once
          userBadges.forEach((userBadge) => {
            if (!userBadge.acquired && userBadge.badge.isCompleted(taggedImages)) {
              // badge was not complete before, but it is now, so, let's save it to the DB
              BadgeDatabaseService.completeOneBadge(userBadge.badge)
              logBuilder.buildLog("badgeAcquired", logBuilder.badgeParser(userBadge))
            }
          })
          done = true // ensure that we just do this once
        }
      })
    })
  },
}

export default UserService