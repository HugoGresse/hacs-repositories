import { PackagesByCategory, Status } from "../../functions/src/types";
import firebase from "firebase";

export const LOAD_PACKAGES_START = "packages/load/start";
export const LOAD_PACKAGES_END = "packages/load/end";
export const CLEAR_FILTER = "packages/filter/clear";
export const SET_FILTER = "packages/filter/set";

export const FilterStar = "filterStar";
export const FilterFork = "filterFork";
export const FilterWatchers = "filterWatchers";
export const FilterOpenIssues = "filterOpenIssues";

export type FilterTypes =
  | typeof FilterStar
  | typeof FilterFork
  | typeof FilterWatchers
  | typeof FilterOpenIssues;

export type PackagesLoadResult = {
  packages?: PackagesByCategory[];
  status?: Status;
  updatedAt?: firebase.firestore.Timestamp;
  loadSuccess: boolean;
};

export interface LoadPackagesStartAction {
  type: typeof LOAD_PACKAGES_START;
}

export interface LoadPackagesEndAction {
  type: typeof LOAD_PACKAGES_END;
  payload: PackagesLoadResult;
}

export interface ClearFilterAction {
  type: typeof CLEAR_FILTER;
  payload: FilterTypes;
}

export interface SetFilterAction {
  type: typeof SET_FILTER;
  payload: {
    valueMin: number;
    valueMax: number;
    filter: FilterTypes;
  };
}

export type PackagesActionTypes =
  | LoadPackagesStartAction
  | LoadPackagesEndAction
  | ClearFilterAction
  | SetFilterAction;
