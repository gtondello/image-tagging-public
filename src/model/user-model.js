// Study conditions
export const CONDITION_FIXED = 1      // User uses all game elements (fixed)
export const CONDITION_SELECTION = 2  // User can select the game elements that they want

/**
 * Represents a user logged into the system.
 */
export class User {
  constructor () {
    this.code = ''          // The user's unique ID code
    this.email = ''         // The user's login email address (for Firebase authentication)
    this.name = ''          // The user's display name
    this.contactEmail = ''  // The user's contact email address (for actual communication)
    this.agreement = false  // If the user has agreed to participate in the study during sign up
    this.quotations = false // If the user has agreed to the use of quotations during sign up
    this.surveyDone = false // If the user has already completed the initial survey
    this.customized = false // If the user has already chosen the game elements to customize their experience
    this.taskCompleted = false  // If the user has already completed at least one classification task
    this.endSurveyDone = false  // If the user has already completed the post-study survey
    this.avatar = 'anonymous'  // The selected avatar
    this.gameElements = []  // The list of game elements the user has chosen for their experience
    this.unlockedAvatars = []  // The list of avatars unlocked by the user
    this.taggedImages = {}  // The list of image ids already tagged by thet user
    this.points = 0         // The amount of points that the user currently has
    this.totalPoints = 0    // The total amount of points that the user has earned
    this.level = 1          // The current level
    this.powerups = {}      // The power ups in the inventory
    this.hitCode = null     // The HIT completion code (for MTurk)
    this.condition = 0      // The study condition (see constants above)
    this.registered = null  // The timestamp of registration
    this.authData = null    // Authentication data received from firebase.Auth
  }

  /**
   * Returns a new instance of User with the same attribute values than this object
   */
  clone() {
    let cloned = Object.assign(new User(), this) // basic, shallow copy
    cloned.powerups = Object.assign({}, this.powerups) // deep copy of object "powerups"
    return cloned
  }

  /**
   * Returns the number of power ups available in the inventory
   */
  countPowerUps() {
    let count = 0
    for (const id in this.powerups) {
      count += this.powerups[id]
    }
    return count
  }

  /**
   * Returns the number of tagged images by this user.
   */
  countTaggedImages() {
    return Object.keys(this.taggedImages).length
  }

  /**
   * Returns true if the user has enabled any game element that needs to use points
   */
  usePoints() {
    return this.gameElements.indexOf('moderating') != -1
    || this.gameElements.indexOf('gifting') != -1
    || this.gameElements.indexOf('bosses') != -1
    || this.gameElements.indexOf('challenges') != -1
    || this.gameElements.indexOf('badges') != -1
    || this.gameElements.indexOf('unlocks') != -1
    || this.gameElements.indexOf('leaderboards') != -1
    || this.gameElements.indexOf('teams') != -1
    || this.gameElements.indexOf('levels') != -1
    || this.gameElements.indexOf('glowing') != -1
    || this.gameElements.indexOf('powerups') != -1
  }

  /**
   * Returns true if the user has enabled the game element "levels"
   */
  useLevels() {
    return this.gameElements.indexOf('levels') != -1
  }

  /**
   * Returns true if the user has enabled the game element "progress"
   */
  useProgress() {
    return this.gameElements.indexOf('progress') != -1
  }

  /**
   * Returns true if the user has enabled the game element "leaderboards"
   */
  useLeaderboard() {
    return this.gameElements.indexOf('leaderboards') != -1
  }

  /**
   * Returns true if the user has enabled the game element "gifting"
   */
  useGifting() {
    return this.gameElements.indexOf('gifting') != -1
  }

  /**
   * Returns true if the user has enabled the game element "badges"
   */
  useBadges() {
    return this.gameElements.indexOf('badges') != -1
  }

  /**
   * Returns true if the user has enabled the game element "challenges"
   */
  useChallenges() {
    return this.gameElements.indexOf('challenges') != -1
  }

  /**
   * Returns true if the user has enabled the game element "unlocks"
   */
  useUnlocks() {
    return this.gameElements.indexOf('unlocks') != -1
  }

  /**
   * Returns true if the user has enabled the game element "chance"
   */
  useChance() {
    return this.gameElements.indexOf('chance') != -1
  }

  /**
   * Returns true if the user has enabled the game element "powerups"
   */
  usePowerUps() {
    return this.gameElements.indexOf('powerups') != -1
  }

  /**
   * Returns true if the user has enabled the game element "moderating"
   */
  useModeratingRole() {
    return this.gameElements.indexOf('moderating') != -1
  }

  /**
   * Returns true if user can select the game elements that they want (condition == 2)
   */
  allowSelection() {
    return this.condition == 2
  }

  /**
   * Returns true if one week has passed (minimum time before user can complete the end survey)
   */
  enableEndSurvey() {
    if (this.registered == null) return true
    let registrationDay = new Date(this.registered)
    registrationDay.setHours(0, 0, 0, 0)
    let today = new Date()
    today.setHours(0, 0, 0, 0)
    let diff = Math.round((today - registrationDay)/8.64e7)
    return diff >= 7
  }

}