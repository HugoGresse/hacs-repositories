import produce from "immer";
import { Category, PackagesByCategory } from "../../functions/src/types";
import {
  FILTER_INIT_COMPLETED,
  FilterFork,
  FilterOpenIssues,
  FilterPackageCategories,
  FilterStar,
  FilterWatchers,
  LOAD_PACKAGES_END,
  LOAD_PACKAGES_START,
  LoadPackagesEndAction,
  PackagesActionTypes,
  SET_FILTER_RANGE,
  SET_FILTER_SELECT,
  SetFilterRangeAction,
  SetFilterSelectAction,
} from "./types";
import { DateTime } from "luxon";

export interface PackagesState {
  packagesByCategories: PackagesByCategory[];
  loading: boolean;
  loaded: boolean;
  updatedAt: null | DateTime;
  filters: {
    [FilterStar]: number[];
    [FilterWatchers]: number[];
    [FilterOpenIssues]: number[];
    [FilterFork]: number[];
    [FilterPackageCategories]: Category[];
    initCompleted: boolean;
  };
  sorts: {};
}

const initState: PackagesState = {
  packagesByCategories: [],
  loading: false,
  loaded: false,
  updatedAt: null,
  filters: {
    [FilterStar]: [0, 0],
    [FilterWatchers]: [0, 0],
    [FilterOpenIssues]: [0, 0],
    [FilterFork]: [0, 0],
    [FilterPackageCategories]: [],
    initCompleted: false,
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
      case SET_FILTER_RANGE: {
        const { payload } = action as SetFilterRangeAction;
        switch (payload.filter) {
          case FilterFork:
          case FilterStar:
          case FilterWatchers:
          case FilterOpenIssues:
            draft.filters[payload.filter] = [
              payload.valueMin,
              payload.valueMax,
            ];
            break;
          default:
            console.error(
              "This filter range is not managed in the reducer",
              payload.filter
            );
        }
        break;
      }
      case SET_FILTER_SELECT: {
        const { payload } = action as SetFilterSelectAction;
        switch (payload.filter) {
          case FilterPackageCategories:
            draft.filters[payload.filter] = payload.selected as Category[];
            break;
          default:
            console.error(
              "This filter select is not managed in the reducer",
              payload.filter
            );
        }
        break;
      }
      case FILTER_INIT_COMPLETED:
        draft.filters.initCompleted = true;
        break;
      default:
        break;
    }
  },
  initState
);
