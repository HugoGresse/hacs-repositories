import { firestore } from './firebase'
import { PackagesByCategory } from '../../functions/src/types'
import { DateTime } from 'luxon'
import { PackagesLoadResult } from '../packages/types'

export const getPackagesFromFirestore = async (): Promise<PackagesLoadResult> => {
    const snapshot = await firestore.collection('data').doc('document').get()

    if (snapshot.exists) {
        const data: any = snapshot.data()
        const parsedRepos: PackagesByCategory[] = JSON.parse(data.data)

        return {
            loadSuccess: true,
            packages: parsedRepos.map((item) => ({
                category: item.category,
                packages: item.packages.map((pack) => {
                    const packageCopy = {
                        ...pack,
                    }
                    if (pack.stats) {
                        packageCopy.stats = {
                            ...pack.stats,
                            updatedAtLuxon: DateTime.fromISO(pack.stats.updatedAt),
                        }
                    }
                    if (pack.info) {
                        packageCopy.info = {
                            ...pack.info,
                        }
                    }
                    return packageCopy
                }),
            })),
            status: data.status,
        }
    }

    return Promise.resolve({
        loadSuccess: false,
    })
}
