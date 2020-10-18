import produce from "immer";
import { PackagesByCategory } from "../../functions/src/types";
import {
  FilterFork,
  FilterOpenIssues,
  FilterStar,
  FilterWatchers,
  LOAD_PACKAGES_END,
  LOAD_PACKAGES_START,
  LoadPackagesEndAction,
  PackagesActionTypes,
  SET_FILTER,
  SetFilterAction,
} from "./types";
import { DateTime } from "luxon";

export interface PackagesState {
  packagesByCategories: PackagesByCategory[];
  loading: boolean;
  loaded: boolean;
  updatedAt: null | DateTime;
  filters: {
    starsRange: number[];
    issuesRange: number[];
    forksRange: number[];
    watchersRange: number[];
  };
  sorts: {};
}

const initState: PackagesState = {
  packagesByCategories: [],
  loading: false,
  loaded: false,
  updatedAt: null,
  filters: {
    starsRange: [0, 0],
    issuesRange: [0, 0],
    forksRange: [0, 0],
    watchersRange: [0, 0],
  },
  sorts: {},
};

export const packagesReducer = produce(
  (draft: PackagesState, action: PackagesActionTypes) => {
    switch (action.type) {
      case LOAD_PACKAGES_START:
        draft.loading = true;
        break;
      case LOAD_PACKAGES_END: {
        const { payload } = action as LoadPackagesEndAction;
        draft.loading = false;
        if (payload.loadSuccess) {
          draft.loaded = true;
          draft.packagesByCategories = payload.packages || [];
          if (payload.updatedAt) {
            draft.updatedAt = DateTime.fromJSDate(payload.updatedAt.toDate());
          }
        }
        break;
      }
      case SET_FILTER: {
        const { payload } = action as SetFilterAction;
        switch (payload.filter) {
          case FilterFork:
            draft.filters.forksRange = [payload.valueMin, payload.valueMax];
            break;
          case FilterStar:
            draft.filters.starsRange = [payload.valueMin, payload.valueMax];
            break;
          case FilterWatchers:
            draft.filters.watchersRange = [payload.valueMin, payload.valueMax];
            break;
          case FilterOpenIssues:
            draft.filters.issuesRange = [payload.valueMin, payload.valueMax];
            break;
          default:
            console.error(
              "This filter is not managed in the reducer",
              payload.filter
            );
        }
        break;
      }
      default:
        break;
    }
  },
  initState
);
