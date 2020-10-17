import {firestore} from './firebase'
import {PackagesByCategory, Status} from '../../functions/src/types'
import firebase from 'firebase'
import {DateTime} from "luxon"


export type PackagesLoadResult = {
    packages?: PackagesByCategory[],
    status?: Status,
    updatedAt?: firebase.firestore.Timestamp,
    loadSuccess: boolean
}

export const getPackages = async (): Promise<PackagesLoadResult> => {
    const snapshot = await firestore.collection('data').doc('document').get()

    if(snapshot.exists) {
        const data: any = snapshot.data()
        const parsedRepos: PackagesByCategory[] = JSON.parse(data.data)



        return {
            loadSuccess: true,
            packages: parsedRepos.map(item => ({
                category: item.category,
                packages: item.packages.map(pack => {
                    if(!pack.stats) {
                        return pack
                    }
                    return ({
                        name: pack.name,
                        stats: {
                            ...pack.stats,
                            updatedAtLuxon: DateTime.fromISO(pack.stats.updatedAt)
                        }
                    })
                })
            })),
            status: data.status
        }
    }

    return Promise.resolve({
        loadSuccess: false
    })
}
