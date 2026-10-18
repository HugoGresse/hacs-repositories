import { DateTime } from 'luxon'
import { PackagesData } from '../types'
import { PackagesLoadResult } from './types'

// packages.json is generated daily by scripts/update-packages.ts and deployed with the app.
export const getPackages = async (): Promise<PackagesLoadResult> => {
    try {
        const response = await fetch('/packages.json')
        if (!response.ok) {
            console.error(`Failed to load packages.json, status: ${response.status}`)
            return { loadSuccess: false }
        }
        const data = (await response.json()) as PackagesData

        return {
            loadSuccess: true,
            packages: data.categories
                .map(({ category, packages }) => ({
                    category,
                    packages: packages.map((pack) =>
                        pack.stats
                            ? {
                                  ...pack,
                                  stats: {
                                      ...pack.stats,
                                      updatedAtLuxon: DateTime.fromISO(pack.stats.updatedAt),
                                      createdAtLuxon: pack.stats.createdAt
                                          ? DateTime.fromISO(pack.stats.createdAt)
                                          : undefined,
                                  },
                              }
                            : pack
                    ),
                }))
                .sort((a, b) => {
                    if (a.category.key === 'plugin') return -1
                    if (b.category.key === 'plugin') return 1
                    return 0
                }),
            updatedAt: DateTime.fromISO(data.updatedAt),
        }
    } catch (error) {
        console.error('Failed to load packages.json', error)
        return { loadSuccess: false }
    }
}
