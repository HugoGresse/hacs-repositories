import { CLEAR_FILTER, FilterTypes, SET_FILTER } from "./types";
import { Dispatch } from "redux";

export const clearFilter = (filter: FilterTypes) => (dispatch: Dispatch) => {
  dispatch({
    type: CLEAR_FILTER,
    payload: filter,
  });
};
export const setFilter = (
  filter: FilterTypes,
  minValue: number,
  maxValue: number
) => (dispatch: Dispatch) => {
  dispatch({
    type: SET_FILTER,
    payload: {
      filter: filter,
      valueMin: minValue,
      valueMax: maxValue,
    },
  });
};
