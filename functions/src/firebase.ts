import { initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

initializeApp()

export const db = getFirestore()
export const serverTimestamp = FieldValue.serverTimestamp
