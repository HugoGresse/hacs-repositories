import { PackagesState } from "./packagesReducer";
import { createSelector } from "reselect";
import { Package } from "../../functions/src/types";
import { State } from "../rootReducer";

const getPackagesState = (state: State): PackagesState => state.packages;

export const getStarsFilterValuesSelector = (state: State) =>
  getPackagesState(state).filters.starsRange;

export const getPackagesByCategorySelector = (state: State) =>
  getPackagesState(state).packagesByCategories;

// Memoized selectors

export const getPackagesArraySelector = createSelector(
  getPackagesByCategorySelector,
  (packagesByCategory): Package[] => {
    return packagesByCategory.reduce((acc, item) => {
      return acc.concat(item.packages);
    }, [] as Package[]);
  }
);

export const getMinMaxFiltersValuesSelector = createSelector(
  getPackagesArraySelector,
  (packages) => {
    const min = 0;
    let maxStars = 0;
    let maxForks = 0;
    let maxIssues = 0;
    let maxWatchers = 0;

    packages.forEach((p) => {
      if (!p.stats) {
        return;
      }
      if (p.stats.stars > maxStars) {
        maxStars = p.stats.stars;
      }
      if (p.stats.forks > maxForks) {
        maxForks = p.stats.forks;
      }
      if (p.stats.watchers > maxWatchers) {
        maxWatchers = p.stats.watchers;
      }
      if (p.stats.openIssues > maxIssues) {
        maxIssues = p.stats.openIssues;
      }
    });

    return {
      stars: {
        min,
        max: maxStars,
      },
      forks: {
        min,
        max: maxForks,
      },
      openIssues: {
        min,
        max: maxIssues,
      },
      watchers: {
        min,
        max: maxWatchers,
      },
    };
  }
);
