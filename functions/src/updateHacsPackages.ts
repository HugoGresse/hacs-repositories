import { onCall } from 'firebase-functions/v2/https'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { getSortedPackages, githubToken } from './github/getSortedPackages'
import { db, serverTimestamp } from './firebase'
import { Timestamp } from 'firebase-admin/firestore'

const STATUS_UPDATING = 'updating'
const STATUS_UPDATED = 'updated'
const STATUS_ERROR = 'error'

const ONE_HOUR_IN_MILLIS = 3600000
const TWENTY_FOUR_HOURS_IN_MILLIS = 24 * ONE_HOUR_IN_MILLIS
// The scheduler fires every 24h but updatedAt is written at the end of a run, so a strict 24h
// threshold would skip every other scheduled run. 20h leaves room for run duration and drift.
const SCHEDULED_MIN_AGE_IN_MILLIS = 20 * ONE_HOUR_IN_MILLIS

type Data = {
    updatedAt?: Timestamp
    updatingAt?: Timestamp
    status?: string
}

const shouldUpdate = (data: Data | undefined, minAgeMillis: number): boolean => {
    if (!data) {
        return true
    }

    const { updatedAt, updatingAt, status } = data

    if (status === STATUS_UPDATING) {
        if (updatingAt && updatingAt.toMillis() + ONE_HOUR_IN_MILLIS > Date.now()) {
            console.log('Current update in progress, abort')
            return false
        }
        console.log('Previous update timed out or stalled (> 1h), allowing update')
    }

    if (!updatedAt || updatedAt.toMillis() + minAgeMillis < Date.now()) {
        console.log('Need update, was a long time ago')
        return true
    }

    return false
}

// Checks and claims the update lock atomically so concurrent triggers (scheduler + manual) don't both run.
const claimUpdate = async (minAgeMillis: number): Promise<boolean> => {
    const docRef = db.collection('data').doc('document')
    return db.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(docRef)
        if (!shouldUpdate(snapshot.data() as Data | undefined, minAgeMillis)) {
            return false
        }
        transaction.set(
            docRef,
            {
                status: STATUS_UPDATING,
                updatingAt: serverTimestamp(),
            },
            { merge: true }
        )
        return true
    })
}

export const executeUpdate = async (
    minAgeMillis: number = TWENTY_FOUR_HOURS_IN_MILLIS
): Promise<boolean> => {
    if (await claimUpdate(minAgeMillis)) {
        console.log('Update needed right now')

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
                        // Keeps clients built before chunking (which JSON.parse `data`) from crashing.
                        data: '[]',
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
        await executeUpdate(SCHEDULED_MIN_AGE_IN_MILLIS)
    }
)
