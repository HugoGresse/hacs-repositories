import { firestore } from './firebase'
import { Package, PackagesByCategory } from '../../functions/src/types'
import { DateTime } from 'luxon'
import { PackagesLoadResult } from '../packages/types'

export const getPackagesFromFirestore = async (): Promise<PackagesLoadResult> => {
    const snapshot = await firestore.collection('data').doc('document').get()

    if (!snapshot.exists) {
        return { loadSuccess: false }
    }

    const data: any = snapshot.data()

    const categoriesSnapshot = await firestore
        .collection('data')
        .doc('document')
        .collection('categories')
        .get()

    const packagesByCategory: PackagesByCategory[] = await Promise.all(
        categoriesSnapshot.docs.map(async (doc) => {
            const catData = doc.data()
            let rawPackages: Package[] = []

            if (catData.hasChunks) {
                const chunksSnapshot = await doc.ref.collection('chunks').orderBy('index').get()
                const chunks = chunksSnapshot.docs.map((chunkDoc) => {
                    const chunkData = chunkDoc.data()
                    return JSON.parse(chunkData.data) as Package[]
                })
                const expectedChunks = catData.chunkCount ?? chunks.length
                rawPackages = chunks.slice(0, expectedChunks).flat()
            } else if (catData.data) {
                rawPackages = JSON.parse(catData.data)
            }

            return {
                category: catData.category,
                packages: rawPackages.map((pack) => {
                    const packageCopy = { ...pack }
                    if (pack.stats) {
                        packageCopy.stats = {
                            ...pack.stats,
                            updatedAtLuxon: DateTime.fromISO(pack.stats.updatedAt),
                            createdAtLuxon: DateTime.fromISO(pack.stats.createdAt),
                        }
                    }
                    if (pack.info) {
                        packageCopy.info = { ...pack.info }
                    }
                    return packageCopy
                }),
            }
        })
    )

    return {
        loadSuccess: true,
        packages: packagesByCategory.sort((a, b) => {
            if (a.category.key === 'plugin') return -1
            if (b.category.key === 'plugin') return 1
            return 0
        }),
        status: data.status,
        updatedAt: data.updatedAt ? DateTime.fromJSDate(data.updatedAt.toDate()) : undefined,
    }
}
