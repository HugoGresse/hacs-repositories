import { onCall } from 'firebase-functions/v2/https'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { getSortedPackages } from './github/getSortedPackages'
import { db, serverTimestamp } from './firebase'
import { Timestamp } from 'firebase-admin/firestore'
import { defineSecret } from 'firebase-functions/params'

const githubToken = defineSecret('GITHUB_TOKEN')

const STATUS_UPDATING = 'updating'
const STATUS_UPDATED = 'updated'
const STATUS_ERROR = 'error'

type Data = {
    updatedAt?: Timestamp
    updatingAt?: Timestamp
    status?: string
}

const shouldUpdate = async (): Promise<boolean> => {
    const result = await db.collection('data').doc('document').get()

    if (!result || !result.exists) {
        return true
    }

    const data = result.data() as Data

    const updatedAt = data.updatedAt
    const updatingAt = data.updatingAt
    const status = data.status
    const twentyFourHoursInMillis = 86400000
    const oneHourInMillis = 3600000

    if (status === STATUS_UPDATING) {
        if (updatingAt && updatingAt.toMillis() + oneHourInMillis > Date.now()) {
            console.log('Current update in progress, abort')
            return false
        }
        console.log('Previous update timed out or stalled (> 1h), allowing update')
    }

    if (!updatedAt || updatedAt.toMillis() + twentyFourHoursInMillis < Date.now()) {
        console.log('Need update, was a long time ago')
        return true
    }

    return false
}

export const executeUpdate = async (force: boolean = false): Promise<boolean> => {
    const shouldUpdateData = force || (await shouldUpdate())

    if (shouldUpdateData) {
        console.log('Update needed right now')

        await db.collection('data').doc('document').set(
            {
                status: STATUS_UPDATING,
                updatingAt: serverTimestamp(),
            },
            { merge: true }
        )

        try {
            const packages = await getSortedPackages()

            console.log('Updating database with ' + packages.length + ' categories')
            const batch = db.batch()
            const docRef = db.collection('data').doc('document')

            batch.set(
                docRef,
                {
                    status: STATUS_UPDATED,
                    updatedAt: serverTimestamp(),
                    categories: packages.map((p) => p.category.key),
                },
                { merge: true }
            )

            // Firestore document limit is 1MB. Categories with thousands of packages
            // exceed 1MB if serialized in a single document. We split into chunks under subcollection.
            const CHUNK_SIZE = 400
            for (const packagesByCat of packages) {
                const catRef = docRef.collection('categories').doc(packagesByCat.category.key)
                if (packagesByCat.packages.length > CHUNK_SIZE) {
                    const chunkCount = Math.ceil(packagesByCat.packages.length / CHUNK_SIZE)
                    batch.set(catRef, {
                        category: packagesByCat.category,
                        hasChunks: true,
                        chunkCount,
                    })

                    for (let i = 0; i < chunkCount; i++) {
                        const chunkPackages = packagesByCat.packages.slice(
                            i * CHUNK_SIZE,
                            (i + 1) * CHUNK_SIZE
                        )
                        const chunkRef = catRef.collection('chunks').doc(String(i))
                        batch.set(chunkRef, {
                            index: i,
                            data: JSON.stringify(chunkPackages),
                        })
                    }
                } else {
                    batch.set(catRef, {
                        category: packagesByCat.category,
                        hasChunks: false,
                        data: JSON.stringify(packagesByCat.packages),
                    })
                }
            }

            await batch.commit()
            console.log('Database updated successfully')
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

export const updateHacsPackagesv2 = onCall(
    {
        timeoutSeconds: 540,
        memory: '2GiB',
        secrets: [githubToken],
    },
    async () => {
        return await executeUpdate()
    }
)

export const autoUpdateHacsPackages = onSchedule(
    {
        schedule: 'every 24 hours',
        timeZone: 'UTC',
        timeoutSeconds: 540,
        memory: '2GiB',
        secrets: [githubToken],
    },
    async () => {
        console.log('Scheduled auto-update triggered')
        await executeUpdate()
    }
)
