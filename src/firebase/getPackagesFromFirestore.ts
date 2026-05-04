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

    const packagesByCategory: PackagesByCategory[] = categoriesSnapshot.docs.map((doc) => {
        const catData = doc.data()
        const packages: Package[] = JSON.parse(catData.data)
        return {
            category: catData.category,
            packages: packages.map((pack) => {
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

    return {
        loadSuccess: true,
        packages: packagesByCategory.sort((a, b) => {
            if (a.category.key === 'plugin') return -1
            if (b.category.key === 'plugin') return 1
            return 0
        }),
        status: data.status,
        updatedAt: DateTime.fromJSDate(data.updatedAt.toDate()),
    }
}
