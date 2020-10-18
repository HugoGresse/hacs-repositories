import { combineReducers } from "redux";
import { packagesReducer } from "./packages/packagesReducer";

export const rootReducer = combineReducers({
  packages: packagesReducer,
});
