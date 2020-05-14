// import firebase from "firebase/app";
import 'firebase/database'
import store from '../store'

// const NOW = firebase.database.ServerValue.TIMESTAMP

let LogDatabaseService = {
  initialize(db) {
    this.db = db
  },

  log(message) {
    let service = this;
    let code = store.state.user.code;

    //message.timestamp = NOW

    return new Promise(function (resolve, reject) {
      service.db.ref('userLogs/' + code + '/' + message.timestamp.toString()).set(message).then(function() {
        resolve()
      }).catch(function(error) {
        reject(error)
      })
    })
  }
};

export default LogDatabaseService