import { combineReducers } from 'redux'
import { packagesReducer, PackagesState } from './packages/packagesReducer'
import { ThunkAction } from 'redux-thunk'
import { PackagesActionTypes } from './packages/types'

export const rootReducer = combineReducers({
    packages: packagesReducer,
})

type Actions = PackagesActionTypes

export type State = { packages: PackagesState }

export type ThunkResult<R> = ThunkAction<R, State, undefined, Actions>
