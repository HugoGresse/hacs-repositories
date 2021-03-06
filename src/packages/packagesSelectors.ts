import { PackagesState } from './packagesReducer'
import { createSelector } from 'reselect'
import { Package, PackagesByCategory } from '../../functions/src/types'
import { State } from '../rootReducer'
import {
    FilterFork,
    FilterOpenIssues,
    FilterPackageCategories,
    FilterStar,
    FilterWatchers,
    SortCreatedAsc,
    SortStarsDesc,
    SortTypes,
    SortUpdatedDesc,
} from './types'

const getPackagesState = (state: State): PackagesState => state.packages

export const getLastUpdateSelector = (state: State) => getPackagesState(state).updatedAt
export const getFiltersSelector = (state: State) => getPackagesState(state).filters
export const getStarsFilterValuesSelector = (state: State) => getFiltersSelector(state)[FilterStar]
export const getWatchersFilterValuesSelector = (state: State) =>
    getFiltersSelector(state)[FilterWatchers]
export const getForksFilterValuesSelector = (state: State) => getFiltersSelector(state)[FilterFork]
export const getOpenIssuesFilterValuesSelector = (state: State) =>
    getFiltersSelector(state)[FilterOpenIssues]
export const getSelectedCategoriesSelector = (state: State) =>
    getFiltersSelector(state)[FilterPackageCategories]
export const isFilterInitCompletedSelector = (state: State) =>
    getFiltersSelector(state).initCompleted
export const getSearchValueSelector = (state: State) => getPackagesState(state).search
export const getSortModeSelector = (state: State): SortTypes => getPackagesState(state).sort

export const isPackagesByCategoryLoadingSelector = (state: State) => getPackagesState(state).loading
export const getPackagesByCategorySelector = (state: State) =>
    getPackagesState(state).packagesByCategories

// Memoized selectors

export const getSortedPackagesByCategoriesSelector = createSelector(
    getPackagesByCategorySelector,
    getSortModeSelector,
    (packagesByCategories, sortMode: SortTypes): PackagesByCategory[] => {
        const sortFunction = sortPackages(sortMode)
        return packagesByCategories.map((packageByCat) => {
            return {
                category: packageByCat.category,
                packages: packageByCat.packages.slice().sort(sortFunction),
            }
        })
    }
)

export const getVisiblePackagesByCategorySelector = createSelector(
    getSortedPackagesByCategoriesSelector,
    getStarsFilterValuesSelector,
    getWatchersFilterValuesSelector,
    getForksFilterValuesSelector,
    getOpenIssuesFilterValuesSelector,
    getSelectedCategoriesSelector,
    getSearchValueSelector,
    (
        packagesByCategory,
        starValues,
        watchersValues,
        forksValues,
        openIssuesValues,
        selectedCategories,
        searchValue
    ) => {
        let starsOutOfRange = false
        let watchersOutOfRange = false
        let forksOutOfRange = false
        let openIssuesOutOfRange = false
        return packagesByCategory.reduce((acc, packageByCat) => {
            if (
                selectedCategories.length > 0 &&
                !selectedCategories.includes(packageByCat.category)
            ) {
                return acc
            }

            const packages = packageByCat.packages.filter((packageItem) => {
                if (searchValue && (!packageItem.name || !packageItem.name.includes(searchValue))) {
                    return false
                }

                if (!packageItem.stats) {
                    return false
                }
                starsOutOfRange =
                    packageItem.stats.stars < starValues[0] ||
                    packageItem.stats.stars > starValues[1]
                watchersOutOfRange =
                    packageItem.stats.watchers < watchersValues[0] ||
                    packageItem.stats.watchers > watchersValues[1]
                forksOutOfRange =
                    packageItem.stats.forks < forksValues[0] ||
                    packageItem.stats.forks > forksValues[1]
                openIssuesOutOfRange =
                    packageItem.stats.openIssues < openIssuesValues[0] ||
                    packageItem.stats.openIssues > openIssuesValues[1]

                return (
                    !starsOutOfRange &&
                    !watchersOutOfRange &&
                    !forksOutOfRange &&
                    !openIssuesOutOfRange
                )
            })
            if (packages.length > 0) {
                acc.push({
                    category: packageByCat.category,
                    packages,
                })
            }
            return acc
        }, [] as PackagesByCategory[])
    }
)

export const getPackagesArraySelector = createSelector(
    getPackagesByCategorySelector,
    (packagesByCategory): Package[] => {
        return packagesByCategory.reduce((acc, item) => {
            return acc.concat(item.packages)
        }, [] as Package[])
    }
)

export const getMinMaxFiltersValuesSelector = createSelector(
    getPackagesArraySelector,
    (packages) => {
        const min = 0
        let maxStars = 0
        let maxForks = 0
        let maxIssues = 0
        let maxWatchers = 0

        packages.forEach((p) => {
            if (!p.stats) {
                return
            }
            if (p.stats.stars > maxStars) {
                maxStars = p.stats.stars
            }
            if (p.stats.forks > maxForks) {
                maxForks = p.stats.forks
            }
            if (p.stats.watchers > maxWatchers) {
                maxWatchers = p.stats.watchers
            }
            if (p.stats.openIssues > maxIssues) {
                maxIssues = p.stats.openIssues
            }
        })

        return {
            stars: {
                min,
                max: maxStars,
            },
            forks: {
                min,
                max: maxForks,
            },
            openIssues: {
                min,
                max: maxIssues,
            },
            watchers: {
                min,
                max: maxWatchers,
            },
        }
    }
)

export const getAvailableCategoriesSelector = createSelector(
    getPackagesByCategorySelector,
    (packagesByCategory) => packagesByCategory.map((packagesByCat) => packagesByCat.category)
)

const sortPackages = (sortType: SortTypes) => (a: Package, b: Package): number => {
    if (!a.stats || !b.stats) {
        return 0
    }

    switch (sortType) {
        case SortStarsDesc:
            if (a.stats?.stars > b.stats?.stars) {
                return -1
            } else if (a.stats?.stars < b.stats?.stars) {
                return 1
            }
            return 0
        case SortUpdatedDesc:
            if (!a.stats.updatedAtLuxon || !b.stats.updatedAtLuxon) {
                return 0
            }
            if (a.stats?.updatedAtLuxon > b.stats?.updatedAtLuxon) {
                return -1
            } else if (a.stats?.updatedAtLuxon < b.stats?.updatedAtLuxon) {
                return 1
            }
            return 0
        case SortCreatedAsc:
            if (!a.stats.createdAtLuxon || !b.stats.createdAtLuxon) {
                return 0
            }
            if (a.stats?.createdAtLuxon > b.stats?.createdAtLuxon) {
                return -1
            } else if (a.stats?.createdAtLuxon < b.stats?.createdAtLuxon) {
                return 1
            }
            return 0
        default:
            return 0
    }
}
