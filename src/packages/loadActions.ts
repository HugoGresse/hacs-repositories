import { getPackagesFromFirestore } from "../firebase/getPackagesFromFirestore";
import {
  FILTER_INIT_COMPLETED,
  FilterFork,
  FilterOpenIssues,
  FilterStar,
  FilterWatchers,
  LOAD_PACKAGES_END,
  LOAD_PACKAGES_START,
  PackagesActionTypes,
  SET_FILTER,
} from "./types";
import { getMinMaxFiltersValuesSelector } from "./packagesSelectors";
import { State } from "../rootReducer";

export const loadPackages = () => async (
  dispatch: (action: PackagesActionTypes) => {},
  getState: () => {}
) => {
  dispatch({
    type: LOAD_PACKAGES_START,
  });

  const result = await getPackagesFromFirestore();

  dispatch({
    type: LOAD_PACKAGES_END,
    payload: result,
  });

  const filterValues = getMinMaxFiltersValuesSelector(getState() as State);

  dispatch({
    type: SET_FILTER,
    payload: {
      filter: FilterStar,
      valueMin: filterValues.stars.min,
      valueMax: filterValues.stars.max,
    },
  });
  dispatch({
    type: SET_FILTER,
    payload: {
      filter: FilterFork,
      valueMin: filterValues.forks.min,
      valueMax: filterValues.forks.max,
    },
  });
  dispatch({
    type: SET_FILTER,
    payload: {
      filter: FilterWatchers,
      valueMin: filterValues.watchers.min,
      valueMax: filterValues.watchers.max,
    },
  });
  dispatch({
    type: SET_FILTER,
    payload: {
      filter: FilterOpenIssues,
      valueMin: filterValues.openIssues.min,
      valueMax: filterValues.openIssues.max,
    },
  });
  dispatch({
    type: FILTER_INIT_COMPLETED,
  });
};
