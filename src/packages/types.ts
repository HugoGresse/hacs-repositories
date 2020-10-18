import { PackagesByCategory, Status } from "../../functions/src/types";
import firebase from "firebase";

export const LOAD_PACKAGES_START = "packages/load/start";
export const LOAD_PACKAGES_END = "packages/load/end";

export type PackagesLoadResult = {
  packages?: PackagesByCategory[];
  status?: Status;
  updatedAt?: firebase.firestore.Timestamp;
  loadSuccess: boolean;
};

interface LoadPackagesStartAction {
  type: typeof LOAD_PACKAGES_START;
  payload: null;
}

interface LoadPackagesEndAction {
  type: typeof LOAD_PACKAGES_END;
  payload: PackagesLoadResult;
}

export type PackagesActionTypes =
  | LoadPackagesStartAction
  | LoadPackagesEndAction;
