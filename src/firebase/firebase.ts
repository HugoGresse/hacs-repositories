import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/analytics'
import 'firebase/functions'

const config = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_DATABASE_URL,
    projectId: import.meta.env.VITE_PROJECT_ID,
    appId: import.meta.env.VITE_APPID,
}

const firebaseMain = firebase.initializeApp(config)
export const firestore = firebaseMain.firestore()

export const functions = {
    updateHacsPackages: firebase.functions().httpsCallable('updateHacsPackagesv2'),
}

if (import.meta.env.PROD && import.meta.env.VITE_MEASUREMENT_ID) {
    firebase.analytics()
}
