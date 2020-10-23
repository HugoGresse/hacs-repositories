import { Category, PackagesByCategory, Status } from '../../functions/src/types'
import firebase from 'firebase'

export const LOAD_PACKAGES_START = 'packages/load/start'
export const LOAD_PACKAGES_END = 'packages/load/end'
export const CLEAR_FILTER = 'packages/filter/clear'
export const SET_FILTER_RANGE = 'packages/filter/setRange'
export const SET_FILTER_SELECT = 'packages/filter/setSelect'
export const FILTER_INIT_COMPLETED = 'packages/filter/initCompleted'
export const SEARCH_UPDATE = 'packages/search/update'
export const SET_SORT = 'packages/sort/set'
export const RESET_SORT = 'packages/sort/reset'

export const FilterStar = 'filterStar'
export const FilterFork = 'filterFork'
export const FilterWatchers = 'filterWatchers'
export const FilterOpenIssues = 'filterOpenIssues'
export const FilterPackageCategories = 'filterPackageCategories'

export type FilterRangeTypes =
    | typeof FilterStar
    | typeof FilterFork
    | typeof FilterWatchers
    | typeof FilterOpenIssues

export const SortCreatedAsc = 'sortUpdateAsc'
export const SortUpdateDesc = 'sortUpdateDesc'
export const SortStatsDesc = 'sortStarsDesc'
export type SortTypes = typeof SortCreatedAsc | typeof SortUpdateDesc | typeof SortStatsDesc

export type FilterSelectTypes = typeof FilterPackageCategories

export type PackagesLoadResult = {
    packages?: PackagesByCategory[]
    status?: Status
    updatedAt?: firebase.firestore.Timestamp
    loadSuccess: boolean
}

export interface LoadPackagesStartAction {
    type: typeof LOAD_PACKAGES_START
}

export interface LoadPackagesEndAction {
    type: typeof LOAD_PACKAGES_END
    payload: PackagesLoadResult
}

export interface ClearFilterAction {
    type: typeof CLEAR_FILTER
    payload: FilterRangeTypes
}

export interface SetFilterRangeAction {
    type: typeof SET_FILTER_RANGE
    payload: {
        valueMin: number
        valueMax: number
        filter: FilterRangeTypes
    }
}

export interface SetFilterSelectAction {
    type: typeof SET_FILTER_SELECT
    payload: {
        selected: string[] | Category[]
        filter: FilterSelectTypes
    }
}
export interface FilterInitCompleted {
    type: typeof FILTER_INIT_COMPLETED
}

export interface SearchUpdate {
    type: typeof SEARCH_UPDATE
    payload: string | null
}

export interface SortSet {
    type: typeof SET_SORT
    payload: SortTypes
}

export interface ResetSort {
    type: typeof RESET_SORT
}

export type PackagesActionTypes =
    | LoadPackagesStartAction
    | LoadPackagesEndAction
    | ClearFilterAction
    | SetFilterRangeAction
    | SetFilterSelectAction
    | FilterInitCompleted
    | SearchUpdate
    | SortSet
    | ResetSort
