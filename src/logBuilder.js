import store from './store'
import LogDatabaseService from './services/LogDatabaseService'


let consoleOutput=false;
let logFileOutput=true;

let previous = false;

export default class logBuilder{

  static buildLog(logType, logInfo=""){
    let user = store.state.user;

    if(user == null){
      return
    }

    if (logType.includes('leaderboard')){
      if (!previous) {
        // console.log("shouldn't get here")
        return
      }
    }


    //Create log message
    let message = [Date.now(),user.code,logType,logInfo].join(",")

    //Print to console if asked
    if (consoleOutput){
      console.log(message)
    }

    if (logFileOutput){
      let jsonMessage = {
        user: user.code,
        type: logType,
        info: logInfo,
        timestamp: Date.now()
      };

      LogDatabaseService.log(jsonMessage)
    }


    // The following is to stop the system outputting logs about the leaderboard when the user tags an image or updates their badge
    // The system should only output logs concerning the leaderboard when the user shows the leaderboard page
    if(logType === 'pageView'){
      if(logInfo === "Leaderboard"){
        previous = true
      }
      else {
        previous = false
      }
    }
    else if(logType.includes("leaderboard")){
      previous = true
    }
    else{
      previous = false
    }

    return message
  }


  static badgeParser(badge){
    return [badge.badge.id,badge.acquired,badge.when].join(",")
  }

  static challengeParser(challenge){
    return [challenge.challenge.id,challenge.completed,challenge.claimed, challenge.challenge.value, challenge.when].join(",")
  }

  static giftParser(gift){
    return [gift.name, gift.avatar, gift.badge, gift.level, gift.received, gift.totalPoints, gift.value].join(",")
  }

  static powerUpParser(powerup, count){
    return [powerup, count].join(",")
  }

  static userParser(user, rank){
    return [user.name, user.avatar, user.badge, user.totalPoints, user.level, rank].join(",")
  }

  static avatarParser(avatar, cost, currentPoints){
    return [avatar, cost, currentPoints].join(",")
  }

  static tagParser(tag, status){
    return [tag, status].join(",")
  }
}