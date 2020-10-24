import {
    CLEAR_FILTER,
    FilterRangeTypes,
    FilterSelectTypes,
    SET_FILTER_RANGE,
    SET_FILTER_SELECT,
} from './types'
import { getAvailableCategoriesSelector } from './packagesSelectors'
import { ThunkResult } from '../rootReducer'

export const clearFilter = (filter: FilterRangeTypes): ThunkResult<void> => (dispatch) => {
    dispatch({
        type: CLEAR_FILTER,
        payload: filter,
    })
}
export const setFilterRange = (
    filter: FilterRangeTypes,
    minValue: number,
    maxValue: number
): ThunkResult<void> => (dispatch) => {
    dispatch({
        type: SET_FILTER_RANGE,
        payload: {
            filter: filter,
            valueMin: minValue,
            valueMax: maxValue,
        },
    })
}

export const setFilterSelect = (filter: FilterSelectTypes, values: string[]): ThunkResult<void> => (
    dispatch,
    getState
) => {
    const availableCategories = getAvailableCategoriesSelector(getState())
    dispatch({
        type: SET_FILTER_SELECT,
        payload: {
            filter: filter,
            selected: values.map(
                (value) => availableCategories.filter((category) => category.key === value)[0]
            ),
        },
    })
}
