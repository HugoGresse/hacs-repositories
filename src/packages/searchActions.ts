import { SEARCH_UPDATE } from './types'
import { ThunkResult } from '../rootReducer'

export const updateSearch = (value?: string): ThunkResult<void> => (dispatch) => {
    const cleanedValue = value?.trim().toLowerCase()

    dispatch({
        type: SEARCH_UPDATE,
        payload: cleanedValue || null,
    })
}
