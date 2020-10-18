import { combineReducers } from "redux";
import { packagesReducer, PackagesState } from "./packages/packagesReducer";

export const rootReducer = combineReducers({
  packages: packagesReducer,
});

export type State = { packages: PackagesState };
