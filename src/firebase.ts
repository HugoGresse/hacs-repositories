import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/analytics'
import 'firebase/functions'

const config = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_DATABASE_URL,
    projectId: process.env.REACT_APP_PROJECT_ID,
    appId: process.env.REACT_APP_APPID,
}

const firebaseMain = firebase.initializeApp(config)
export const firestore = firebaseMain.firestore()

// firebase.functions().useFunctionsEmulator('http://localhost:5000')
export const functions = {
    updateHacsPackages: firebase
        .functions()
        .httpsCallable('updateHacsPackages'),
}

if (
    process.env.NODE_ENV === 'production' &&
    process.env.REACT_APP_MEASUREMENT_ID
) {
    firebase.analytics()
}
