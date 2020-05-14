let baseUrl = ''
if (process.env.NODE_ENV === 'production') {
   baseUrl = '' // set here the URL where the app will be running
} else {
   baseUrl = 'http://localhost:8080/'
}

// set here the Firebase configuration data
const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: ""
  }

// set here the domain name for email addresses
export const DOMAIN = '@example.com'

export const API_HOST = baseUrl

export const FIREBASE_CONFIG = firebaseConfig

export const IS_DEV = false
