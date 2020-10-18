import produce from "immer";
import { PackagesByCategory } from "../../functions/src/types";
import {
  LOAD_PACKAGES_END,
  LOAD_PACKAGES_START,
  PackagesActionTypes,
} from "./types";
import { DateTime } from "luxon";

interface PackagesState {
  packagesByCategories: PackagesByCategory[];
  loading: boolean;
  loaded: boolean;
  updatedAt: null | DateTime;
}

const initState: PackagesState = {
  packagesByCategories: [],
  loading: false,
  loaded: false,
  updatedAt: null,
};

export const packagesReducer = produce(
  (draft: PackagesState, { payload, type }: PackagesActionTypes) => {
    switch (type) {
      case LOAD_PACKAGES_START:
        draft.loading = true;
        break;
      case LOAD_PACKAGES_END:
        draft.loading = false;
        if (payload && payload.loadSuccess) {
          draft.loaded = true;
          draft.packagesByCategories = payload.packages || [];
          if (payload.updatedAt) {
            draft.updatedAt = DateTime.fromJSDate(payload.updatedAt.toDate());
          }
        }
        break;
      default:
        break;
    }
  },
  initState
);
