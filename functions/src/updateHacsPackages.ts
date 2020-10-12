import * as functions from 'firebase-functions'
import {getSortedPackages} from './github/getSortedPackages'
import {db, serverTimestamp} from './firebase'
import * as admin from 'firebase-admin'
import Timestamp = admin.firestore.Timestamp

export const updateHacsPackages = functions
    .runWith({
        timeoutSeconds: 540,
        memory: '2GB',
    })
    .https.onCall(async () => {
    const shouldUpdateData = await shouldUpdate()

    if(shouldUpdateData) {
        console.log("Update needed right now")

        await db.collection('data').doc('document')
            .set({
                status: STATUS_UPDATING
            }, {merge: true})

        const packages = await getSortedPackages()

        await db.collection('data')
            .doc('document')
            .set({
                status: STATUS_UPDATED,
                updatedAt: serverTimestamp(),
                data: JSON.stringify(packages)
            }, {merge: true})
        return true
    }

    return false
})

type Data = {
    updatedAt: Timestamp,
    status: string
}

const STATUS_UPDATING = "updating"
const STATUS_UPDATED = "updated"

const shouldUpdate = async (): Promise<boolean> => {
    const result = await db.collection('data').doc('document').get()

    if (!result || !result.exists) {
        return true
    }

    const data = result.data() as Data

    const updatedAt = data.updatedAt
    const status = data.status
    // Check last update time, see if more than 24h
    const twentyFoursHoursInMillis = 86400000
    if(!updatedAt || (updatedAt.toMillis() + twentyFoursHoursInMillis) < Date.now()) {
        console.log("Need update, was a long time ago")

        if(status === STATUS_UPDATING) {
            console.log("Current update in progress, abort")
            return false
        }

        return true
    }

    return false
}

