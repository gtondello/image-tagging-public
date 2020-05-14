import firebase from "firebase/app";
import 'firebase/storage'

let StorageService = {
    initialize() {
      this.storage = firebase.storage()
    },

    // Gets a URL to download a file
    getImageDownloadURL(imageName) {
        return this.storage.ref('images/' + imageName + '.jpeg').getDownloadURL()
    }
}

export default StorageService