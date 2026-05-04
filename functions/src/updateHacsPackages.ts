import { onCall } from 'firebase-functions/v2/https'
import { getSortedPackages } from './github/getSortedPackages'
import { db, serverTimestamp } from './firebase'
import { Timestamp } from 'firebase-admin/firestore'
import { defineSecret } from 'firebase-functions/params'

const githubToken = defineSecret("GITHUB_TOKEN")

export const updateHacsPackagesv2 = onCall(
    {
        timeoutSeconds: 540,
        memory: '2GiB',
        secrets: [githubToken],
    },
    async () => {
        const shouldUpdateData = await shouldUpdate()

        if (shouldUpdateData) {
            console.log('Update needed right now')

            await db.collection('data').doc('document').set(
                {
                    status: STATUS_UPDATING,
                },
                { merge: true }
            )

            try {
                const packages = await getSortedPackages()

                console.log('Updating database with ' + packages.length + ' categories')
                const batch = db.batch()
                const docRef = db.collection('data').doc('document')

                batch.set(docRef, {
                    status: STATUS_UPDATED,
                    updatedAt: serverTimestamp(),
                    categories: packages.map((p) => p.category.key),
                }, { merge: true })

                for (const packagesByCat of packages) {
                    const catRef = docRef.collection('categories').doc(packagesByCat.category.key)
                    batch.set(catRef, {
                        category: packagesByCat.category,
                        data: JSON.stringify(packagesByCat.packages),
                    })
                }

                await batch.commit()
                console.log('Database updated')
                return true
            } catch (error) {
                console.error('Failed to update packages:', error)
                await db.collection('data').doc('document').set(
                    { status: STATUS_ERROR },
                    { merge: true }
                )
                throw error
            }
        }

        return false
    }
)

type Data = {
    updatedAt: Timestamp
    status: string
}

const STATUS_UPDATING = 'updating'
const STATUS_UPDATED = 'updated'
const STATUS_ERROR = 'error'

const shouldUpdate = async (): Promise<boolean> => {
    const result = await db.collection('data').doc('document').get()

    if (!result || !result.exists) {
        return true
    }

    const data = result.data() as Data

    const updatedAt = data.updatedAt
    const status = data.status
    const twentyFoursHoursInMillis = 86400000
    if (!updatedAt || updatedAt.toMillis() + twentyFoursHoursInMillis < Date.now()) {
        console.log('Need update, was a long time ago')

        if (status === STATUS_UPDATING) {
            console.log('Current update in progress, abort')
            return false
        }

        return true
    }

    return false
}
