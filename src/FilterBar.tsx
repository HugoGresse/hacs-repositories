import React, {useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {
    getAvailableCategoriesSelector,
    getForksFilterValuesSelector,
    getMinMaxFiltersValuesSelector,
    getOpenIssuesFilterValuesSelector,
    getSelectedCategoriesSelector,
    getStarsFilterValuesSelector,
    getWatchersFilterValuesSelector,
    isFilterInitCompletedSelector
} from './packages/packagesSelectors'
import {setFilterRange, setFilterSelect} from './packages/filterActions'
import {
    FilterFork,
    FilterOpenIssues,
    FilterPackageCategories,
    FilterRangeTypes,
    FilterStar,
    FilterWatchers
} from './packages/types'
import {FilterRangeComponent} from './components/FilterRangeComponent'
import {Box, CircularProgress, Typography} from '@material-ui/core'
import _ from 'lodash'
import {forceCheck} from 'react-lazyload'
import FilterSelectCategoryComponent from './components/FilterSelectCategoryComponent'

type FilterBarProps = {}

const FilterBar = ({}: FilterBarProps) => {
    const dispatch = useDispatch()
    const filterInitCompleted = useSelector(isFilterInitCompletedSelector)
    const starsValue = useSelector(getStarsFilterValuesSelector)
    const watchersValue = useSelector(getWatchersFilterValuesSelector)
    const forksValue = useSelector(getForksFilterValuesSelector)
    const openIssuesValue = useSelector(getOpenIssuesFilterValuesSelector)
    const minMaxFiltersValues = useSelector(getMinMaxFiltersValuesSelector)
    const availableCategories = useSelector(getAvailableCategoriesSelector)
    const selectedCategories = useSelector(getSelectedCategoriesSelector)

    const [filtersValues, setFiltersValues] = useState({
        [FilterStar]: [0, 0],
        [FilterWatchers]: [0, 0],
        [FilterFork]: [0, 0],
        [FilterOpenIssues]: [0, 0],
    })
    const [filtersInitiated, setFiltersInitiated] = useState(false)

    useEffect(() => {
        if (!filterInitCompleted || filtersInitiated) {
            return
        }
        setFiltersValues({
            [FilterStar]: starsValue,
            [FilterWatchers]: watchersValue,
            [FilterFork]: forksValue,
            [FilterOpenIssues]: openIssuesValue,
        })
        setFiltersInitiated(true)
    }, [filterInitCompleted, filtersInitiated])

    const [dispatchDebounced] = useState(() =>
        _.debounce((arfs) => {
            dispatch(arfs)
            forceCheck()
        }, 200, {
            leading: false,
            trailing: true
        })
    )

    const onFilterChange = (filter: FilterRangeTypes) => (event: React.ChangeEvent<{}>, value: number | number[]) => {
        if (Array.isArray(value)) {
            // this allow the filter on redux to be debounced while maintaining up to date react state update on drag
            setFiltersValues({
                ...filtersValues,
                [filter]: value
            })
            dispatchDebounced(setFilterRange(filter, value[0], value[1]))
        }
    }

    const onPackageTypeChange = (categories: string[]) => {
        dispatch(setFilterSelect(FilterPackageCategories, categories));
        setTimeout(() => {
            forceCheck()
        }, 0)
    }

    if (!minMaxFiltersValues || !filterInitCompleted) {
        return <Box padding={4}> <CircularProgress/></Box>
    }
    return <Box padding={4}>
        <Typography variant="h4" gutterBottom>
            Filters
        </Typography>

        <FilterSelectCategoryComponent
            onSelectChange={onPackageTypeChange}
            selectedValues={selectedCategories}
            values={availableCategories}
            />
        <FilterRangeComponent
            filter={FilterStar}
            name="Stars"
            value={filtersValues[FilterStar]}
            minValue={minMaxFiltersValues.stars.min}
            maxValue={minMaxFiltersValues.stars.max}
            onFilterChange={onFilterChange}
        />
        <FilterRangeComponent
            filter={FilterWatchers}
            name="Watchers"
            value={filtersValues[FilterWatchers]}
            minValue={minMaxFiltersValues.watchers.min}
            maxValue={minMaxFiltersValues.watchers.max}
            onFilterChange={onFilterChange}
        />
        <FilterRangeComponent
            filter={FilterFork}
            name="Forks"
            value={filtersValues[FilterFork]}
            minValue={minMaxFiltersValues.forks.min}
            maxValue={minMaxFiltersValues.forks.max}
            onFilterChange={onFilterChange}
        />
        <FilterRangeComponent
            filter={FilterOpenIssues}
            name="Open issues"
            value={filtersValues[FilterOpenIssues]}
            minValue={minMaxFiltersValues.openIssues.min}
            maxValue={minMaxFiltersValues.openIssues.max}
            onFilterChange={onFilterChange}
        />

    </Box>
}

export default FilterBar