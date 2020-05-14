<template>
  <v-layout align-center justify-center>
    <!----- IMAGE ----->
    <v-flex xs12 sm11 md10>
      <v-snackbar v-model="successAlert" top multi-line color="success">
        Tags saved!
        <v-btn dark flat @click="successAlert = false">Close</v-btn>
      </v-snackbar>
      <div v-if="image != null">
        <h2>Please tag this image!</h2>
        <div class="form">
          <div class="form-layout">
            <v-form ref="form" v-model="valid" lazy-validation @submit.prevent.native="saveTags" class="form">
              <v-text-field ref="field" prepend-icon="list" name="tags" label="Tags" type="text" v-model="tags" :rules="[v => !!v || 'Please type your tags here']" required clearable
                            validate-on-blur hint="Please type all the tags that you can think about. Tags are words that describe the things you see in the image below. Separate each tag with a comma (,), e.g.: tag1,tag2,tag3."
                            :disabled="submitting" append-outer-icon="send" @click:append-outer="saveTags"></v-text-field>
            </v-form>
            <div class="powerup" v-if="user.usePowerUps()">
              <v-btn v-if="powerupInUse == null" @click.prevent="showPowerUpDialog()">
                <v-badge :value="user.countPowerUps() > 0" class="custom-badge">
                  <span>Power ups!</span>
                  <span slot="badge" style="margin-top:0">{{ user.countPowerUps() }}</span>
                </v-badge>
              </v-btn>
              <span v-if="powerupInUse != null">
                <v-chip color="indigo" text-color="white" class="reward-card-chip">
                  <v-avatar><v-icon>{{ powerupInUse.powerup.icon }}</v-icon></v-avatar>
                  {{ powerupInUse.times }} x{{ powerupInUse.multiplier}}
                </v-chip>
              </span>
            </div>
          </div>  
          <div class="hidden-sm-and-down" v-if="user.enableEndSurvey()">
            <em>Note:</em> When you are ready to complete the study, please proceed to the <router-link to="/endsurvey">final questionnaire</router-link>. We can only use the data you provided after you complete it.
          </div>
          <!--<v-alert v-model="submitting" type="info">Saving tags. Please wait...</v-alert>-->
          <v-snackbar v-model="errorAlert" top multi-line color="error">
            An unexpected error has occurred. Please try again latter or contact the researchers for assistance.
            <v-btn dark flat @click="errorAlert = false">Close</v-btn>
          </v-snackbar>
        </div>
        <div class="image">
          <img :src="imageURL"/><br>
          <span v-if="imageURL">Photo by {{ image.author }} on Pexels</span>
        </div>
        <div class="hidden-md-and-up" style="margin-top:15px" v-if="user.enableEndSurvey()">
          <em>Note:</em> When you are ready to complete the study, please proceed to the <router-link to="/endsurvey">final questionnaire</router-link>. We can only use the data you provided after you complete it.
        </div>
      </div>
      <v-alert v-else :value="true" type="success">You have already classified all images in our database! Awesome! Thank you very much for your help!</v-alert>
    </v-flex>
    <!----- SUCCESS DIALOG ----->
    <v-dialog v-model="dialog" max-width="400" persistent>
      <v-card>
        <v-card-title class="headline">Congratulations!</v-card-title>
        <v-card-text>
          <p>Your tags are saved!</p>
          <p v-if="user.usePoints()">
            <span style="margin-right:20px">Base points:</span><v-icon color="amber" size="16px">star</v-icon><span style="margin-left:10px">+10</span><br>
            <span style="margin-right:20px">Points for tags:</span><v-icon color="amber" size="16px">star</v-icon><span style="margin-left:10px">+{{bonusPoints}}</span><br>
            <template v-if="user.useChance()">
              <span style="margin-right:20px">Random modifier:</span><span>{{ showType == 0 ? '&times;' : '&divide;' }} {{ showMultiplier }}</span><br>
            </template>
            <span class="font-weight-bold" style="margin-right:20px">Total points:</span><v-icon color="amber" size="18px">star</v-icon><span class="font-weight-bold" style="margin-left:10px">{{user.useChance() ? showCoins : coins}}</span>
            &nbsp;<v-chip v-if="user.usePowerUps() && powerupInUse != null" color="indigo" text-color="white" class="reward-card-chip">x{{ powerupInUse.multiplier }}</v-chip><br>
          </p>
          <p v-if="user.useUnlocks()">
            <span class="font-weight-bold" style="margin-right:20px">Total coins:</span><v-icon color="amber" size="18px">attach_money</v-icon><span class="font-weight-bold" style="margin-left:10px">{{user.useChance() ? showCoins : coins}}</span>
            &nbsp;<v-chip v-if="user.usePowerUps() && powerupInUse != null" color="indigo" text-color="white" class="reward-card-chip">x{{ powerupInUse.multiplier }}</v-chip><br>
          </p>
          <p v-if="user.usePoints()">
            <v-icon color="amber" title="Coins" size="20px" v-if="user.useUnlocks()">attach_money</v-icon>
            <span style="margin-left:5px" v-if="user.useUnlocks()"><b>{{ animating ? '' : user.points }}</b></span>
            <v-icon color="amber" style="margin-left:20px" title="Points" size="20px">star</v-icon>
            <span style="margin-left:5px"><b>{{ animating ? '' : user.totalPoints }}</b></span>
          </p>
          <hr style="margin-bottom:16px" v-if="user.usePoints() && (user.useLevels() || user.useProgress())">
          <p v-if="user.useLevels()"><v-badge v-model="levelUp"><v-icon slot="badge" dark small>arrow_upward</v-icon><span><b>Current Level: {{ user.level }}</b></span></v-badge></p>
          <p v-if="user.useLevels()"><v-progress-linear v-model="levelPercentage"></v-progress-linear><span style="font-size:0.85em">Level Up in {{ pointsToLevelUp }}</span></p>
          <hr style="margin-bottom:16px" v-if="user.useLevels() && user.useProgress()">
          <p v-if="user.useProgress()"><b>Overall Progress</b></p>
          <p v-if="user.useProgress()"><v-progress-linear v-model="progressPercentage"></v-progress-linear><span style="font-size:0.85em">Tagged images: {{ user.countTaggedImages() }} out of {{ totalImages }}</span></p>
          <hr style="margin-bottom:16px" v-if="user.usePowerUps() && rewardPowerUp">
          <p v-if="user.usePowerUps() && rewardPowerUp"><b>Rewards</b></p>
          <p v-if="user.usePowerUps() && rewardPowerUp">
            <v-card>
              <v-card-text>
                <v-layout>
                  <v-flex xs4 text-xs-left>
                    <v-chip color="indigo" text-color="white" class="reward-card-chip">
                      <v-avatar><v-icon>{{ rewardPowerUp.icon }}</v-icon></v-avatar>
                      {{ rewardPowerUp.name }}
                    </v-chip>
                  </v-flex>
                  <v-flex xs8 text-xs-left>{{ rewardPowerUp.description }}</v-flex>
                </v-layout>
              </v-card-text>
            </v-card>
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="dismissSuccessDialog()">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!----- POWER UPS DIALOG ----->
    <v-dialog v-model="powerupsDialog" max-width="400" persistent>
      <v-card>
        <v-card-title class="headline">Power Ups</v-card-title>
        <v-card-text>
          <v-card v-for="userPowerUp in userPowerUps" :key="userPowerUp.powerup.id" class="powerupCard">
            <v-card-text>
              <v-layout>
                <v-flex xs4 text-xs-left>
                  <v-chip color="indigo" text-color="white" class="reward-card-chip">
                    <v-avatar><v-icon>{{ userPowerUp.powerup.icon }}</v-icon></v-avatar>
                    {{ userPowerUp.powerup.name }}
                  </v-chip>
                </v-flex>
                <v-flex xs8 text-xs-left>{{ userPowerUp.powerup.description }}</v-flex>
              </v-layout>
            </v-card-text>
            <v-card-actions class="use-powerup">
              <span>In stock: <b>{{ userPowerUp.quantity }}</b></span>
              <v-spacer></v-spacer>
              <v-btn @click.prevent="usePowerUp(userPowerUp)">Use</v-btn>
            </v-card-actions>
          </v-card>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="dismissPowerUpDialog()">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!----- MODERATION DIALOG ----->
    <v-dialog v-model="moderationDialog" max-width="400" persistent>
      <v-card>
        <v-card-title class="headline">Moderate Tags</v-card-title>
        <v-card-text>
          <p>Are the following tags related to the image you just classified?</p>
          <v-list>
            <template v-for="(moderationTag, index) in moderationTags">
              <v-list-tile :key="moderationTag">
                <v-list-tile-content>
                  {{ moderationTag }}
                </v-list-tile-content>
                <v-list-tile-action>
                  <v-switch v-model="moderationFlags[index]" :label="moderationFlags[index] ? 'Yes' : 'No'"></v-switch>
                </v-list-tile-action>
              </v-list-tile>
              <!--v-divider v-if="index + 1 < badges.length" :key="index"></v-divider-->
            </template>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="skipModeratingTags()">Skip</v-btn>
          <v-btn color="primary" @click="saveModeratedTags()">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import ImageListService from '../services/ImageListService'
import DatabaseService from '../services/DatabaseService'
import StorageService from '../services/StorageService'
import UserService from '../services/UserService'
import { getRandomPowerUp } from '../model/powerups'
import logBuilder from "../logBuilder";
export default {
  name: 'ImageTagging',
  data () {
    return {
      image: this.loadRandomImage(),
      imageURL: '',
      tags: '',
      valid: false,
      submitting: false,
      errorAlert: false,
      successAlert: false,
      dialog: false,
      levelUp: false,
      bonusPoints: 0,
      coins: 0,
      multiplier: 0,
      type: 0,
      showMultiplier: 0,
      showType: 0,
      showCoins: '',
      animating: false,
      rewardPowerUp: null,
      powerupInUse: null,
      powerupsDialog: false,
      moderationDialog: false,
      moderationTags: null,
      moderationFlags: null,
      totalImages: ImageListService.length()
    }
  },
  computed: {
    user: function() {
      return this.$store.state.user
    },
    levelPercentage: function() {
      let user = this.$store.state.user
      let pointsToLevel = UserService.LEVELS[user.level-1]
      let pointsZero = user.level > 1 ? UserService.LEVELS[user.level-2] : 0
      let percentage = 100 * (user.totalPoints - pointsZero) / (pointsToLevel - pointsZero)
      return percentage
    },
    pointsToLevelUp: function() {
      let user = this.$store.state.user
      let pointsToLevel = UserService.LEVELS[user.level-1]
      return pointsToLevel - user.totalPoints
    },
    progressPercentage: function() {
      let user = this.$store.state.user
      let percentage = 100 * user.countTaggedImages() / this.totalImages
      return percentage
    },
    userPowerUps: function() {
      return UserService.getPowerUps(this.$store.state.user)
    }
  },
  methods: {
    saveTags (e) {
      e.preventDefault()
      if (this.$refs.form.validate()) {
        let user = this.$store.state.user
        this.errorAlert = false
        this.successAlert = false
        this.submitting = true
        let tagArray = this.tags.split(',').map(item => item.trim())
        this.bonusPoints = tagArray.length
        this.coins = 10 + this.bonusPoints

        logBuilder.buildLog("tagImage",tagArray.length)

        if (user.useChance()) {
          // the amount of points/coins must be random because the user is using chance as a game element
          this.multiplier = Math.floor((Math.random() * 5) + 1)
          this.type = Math.round(Math.random())
          this.coins = this.type == 0 ? this.coins * this.multiplier : Math.round(this.coins / this.multiplier)
          if (this.coins < 1) { this.coins = 1 }
          this.animateCoins()

          logBuilder.buildLog("randomPointGain", [this.type, this.multiplier].join(','))

        }
        let poweredCoins = this.coins
        if (user.usePowerUps()) {
          this.rewardPowerUp = getRandomPowerUp()
          if (this.powerupInUse != null) {
            poweredCoins = this.powerupInUse.applyTo(poweredCoins)
            if (this.powerupInUse.times <= 0) {
              this.powerupInUse = null
            }
          }
        }

        logBuilder.buildLog('pointsGain', poweredCoins)

        // Save the tags to the database...
        DatabaseService.saveTags(tagArray, this.image.fileName).then(() => {
          let updatedUser = UserService.addPointsAndCoins(user, poweredCoins, poweredCoins)
          this.levelUp = updatedUser.level > user.level

          logBuilder.buildLog('levelUpStatus', updatedUser.level)
          logBuilder.buildLog('userTotalPoints', updatedUser.totalPoints)

          // ... then show the success dialog
          this.submitting = false
          this.dialog = true
          // ... and also update the user's points
          DatabaseService.updatePoints(updatedUser.points, updatedUser.totalPoints, updatedUser.level)
          // ... and verify challenge completion
          if (user.useChallenges()) {
            UserService.checkChallengeCompletion()
          }
          // ... and verify badge completion
          if (user.useBadges()) {
            UserService.checkBadgeCompletion()
          }
          // ... and save the reward powerup
          if (user.usePowerUps() && this.rewardPowerUp) {
            updatedUser = UserService.addPowerUp(updatedUser, this.rewardPowerUp)
            DatabaseService.updatePowerUps(updatedUser.powerups)
          }
        }).catch(() => {
          // ... or show error alert if the operation fails
          this.submitting = false
          this.errorAlert = true
        })
      }
    },
    loadNewImage () {
      // loads a new image to be tagged
      this.successAlert = false
      this.dialog = false
      this.levelUp = false
      this.rewardPowerUp = null
      this.tags = ''
      this.moderationDialog = false
      this.moderationTags = null
      this.moderationFlags = null
      this.image = this.loadRandomImage()

      logBuilder.buildLog('loadNewImage', '')

      if (this.image != null) {
        this.$refs.field.focus()
      }
    },
    loadRandomImage () {
      // creates a new array with only the images that were not tagged by the logged user yet
      this.imageURL = ''
      let taggedImages = this.$store.state.user.taggedImages
      let availableImages = ImageListService.getAvailableImages(taggedImages)
      if (availableImages.length > 0) {
        // set the current image to a random image from the list
        let randomNumber = Math.floor(Math.random() * availableImages.length)
        //console.log(ImageListService.getRandomTagsForImage(availableImages[randomNumber]))
        let selectedImage = availableImages[randomNumber]
        let that = this
        StorageService.getImageDownloadURL(selectedImage.fileName).then(url => {
          that.imageURL = url
        })
        return selectedImage
      } else {
        return null
      }
    },
    dismissSuccessDialog () {
      // closes the success dialog
      this.successAlert = false
      this.dialog = false
      this.levelUp = false
      this.rewardPowerUp = null
      if (this.$store.state.user.useModeratingRole()) {
        this.showModerationDialog()
      } else {
        this.loadNewImage()
      }
    },
    dismissPowerUpDialog() {
      this.powerupsDialog = false

      logBuilder.buildLog('dismissPowerUpDialog', '')
    },
    showModerationDialog () {
      this.moderationTags = ImageListService.getRandomTagsForImage(this.image)
      this.moderationFlags = new Array(10)
      this.moderationFlags.fill(false)
      this.moderationDialog = true
    },
    saveModeratedTags () {
      DatabaseService.saveModeratedTags(this.moderationTags, this.moderationFlags, this.image.fileName).then(() => {

        let i = 0;
        while(i < this.moderationFlags.length){
          logBuilder.buildLog("moderatingRoleTagStatus", logBuilder.tagParser(this.moderationTags[i], this.moderationFlags[i]))
          i+=1;
        }


        this.loadNewImage()
      }).catch(() => {
        this.loadNewImage()
      })
    },
    skipModeratingTags() {
      logBuilder.buildLog("moderatingRoleSkip", "")
      this.loadNewImage()
    },
    animateCoins () {
      this.showMultiplier = Math.floor((Math.random() * 5) + 1)
      this.showType = Math.round(Math.random())
      this.showCoins = ''
      this.animating = true
      let round = 5
      let handle = setInterval(() => {
        round--
        if (round == 0) {
          clearInterval(handle)
          this.showMultiplier = this.multiplier
          this.showType = this.type
          this.showCoins = this.coins
          this.animating = false
        } else {
          this.showMultiplier = Math.floor((Math.random() * 5) + 1)
          this.showType = Math.round(Math.random())
        }
      }, 400)
    },
    showPowerUpDialog () {
      if (this.$store.state.user.usePowerUps() && this.powerupInUse == null) {
        this.powerupsDialog = true

        logBuilder.buildLog("pageView", "PowerUp")


        for (let powerup in this.$store.state.user.powerups){
          logBuilder.buildLog("powerUpStatus", logBuilder.powerUpParser(powerup, this.$store.state.user.powerups[powerup]))
        }
      }
    },
    usePowerUp (userPowerUp) {
      let user = this.$store.state.user
      if (user.usePowerUps()) {
        this.powerupsDialog = false
        let updatedUser = UserService.usePowerUp(user, userPowerUp.powerup)
        DatabaseService.updatePowerUps(updatedUser.powerups).then(() => {
          this.powerupInUse = userPowerUp.powerup.use()
        }).catch(() => {
          this.errorAlert = true
        })
      }
    }
  },
  created () {
    if (!this.$store.state.user.surveyDone) {
      // If the Survey is not done yet, then the user needs to complete it first
      this.$router.push({ name: 'Survey' })
    } else if (!this.$store.state.user.customized) {
      // If the game elements Customization is not done yet, then the user needs to complete it first
      this.$router.push({ name: 'Customization' })
    } else if (this.$store.state.user.endSurveyDone) {
      // If the End Survey is already done, then the study is completed
      this.$router.push({ name: 'Completed' })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
div.form {
  margin-bottom: 16px;
}
div.form-layout {
  width: 100%;
  display: flex;
  flex-direction: row;
}
form.form {
  flex: 1;
}
div.powerup {
  width: 160px;
  margin-top: 10px;
  text-align: center;
}
div.powerup button {
  width: 140px;
}
div.image {
  text-align: center;
}
/*p.tags {
  text-align: left;
}*/
img {
  max-width: 100%;
}
div.v-progress-linear {
  margin-bottom: 0.25rem;
}
.reward-card-chip {
  margin: 0 auto;
}
div.use-powerup {
  margin-top: -10px;
}
div.use-powerup button {
  height: 28px;
  font-size: 0.95em;
}
.powerupCard {
  margin-bottom: 6px;
}
@media screen and (max-width: 768px) {
  div.form-layout {
    flex-direction: column;
  }
  div.powerup {
    width: 100%;
  }
}
</style>
