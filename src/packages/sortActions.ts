import { PackagesActionTypes, RESET_SORT, SET_SORT, SortTypes } from './types'

export const setSort = (sort: SortTypes): PackagesActionTypes => ({
    type: SET_SORT,
    payload: sort,
})

export const resetSort = (): PackagesActionTypes => ({
    type: RESET_SORT,
})
