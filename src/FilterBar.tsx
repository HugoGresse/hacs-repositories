import React, {useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {
    getForksFilterValuesSelector,
    getMinMaxFiltersValuesSelector,
    getOpenIssuesFilterValuesSelector,
    getStarsFilterValuesSelector,
    getWatchersFilterValuesSelector, isFilterInitCompletedSelector
} from './packages/packagesSelectors'
import {setFilter} from './packages/filterActions'
import {FilterFork, FilterOpenIssues, FilterStar, FilterTypes, FilterWatchers} from './packages/types'
import {FilterComponent} from './components/FilterComponent'
import {Box, Typography} from '@material-ui/core'
import _ from 'lodash'
import {forceCheck} from 'react-lazyload'

// TODO :
// - component type (integration, etc)
// - fix css on resize and footer

type FilterBarProps = {}

const FilterBar = ({}: FilterBarProps) => {
    const dispatch = useDispatch()
    const filterInitCompleted = useSelector(isFilterInitCompletedSelector)
    const starsValue = useSelector(getStarsFilterValuesSelector)
    const watchersValue = useSelector(getWatchersFilterValuesSelector)
    const forksValue = useSelector(getForksFilterValuesSelector)
    const openIssuesValue = useSelector(getOpenIssuesFilterValuesSelector)
    const minMaxFiltersValues = useSelector(getMinMaxFiltersValuesSelector)

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

    const onFilterChange = (filter: FilterTypes) => (event: React.ChangeEvent<{}>, value: number | number[]) => {
        if (Array.isArray(value)) {
            setFiltersValues({
                ...filtersValues,
                [filter]: value
            })
            dispatchDebounced(setFilter(filter, value[0], value[1]))
        }
    }

    if (!minMaxFiltersValues || !filterInitCompleted) {
        return <>
            Loading...
        </>
    }
    return <Box padding={4}>
        <Typography variant="h4" gutterBottom>
            Filters
        </Typography>

        <FilterComponent
            filter={FilterStar}
            name="Stars"
            value={filtersValues[FilterStar]}
            minValue={minMaxFiltersValues.stars.min}
            maxValue={minMaxFiltersValues.stars.max}
            onFilterChange={onFilterChange}
        />

        <FilterComponent
            filter={FilterWatchers}
            name="Watchers"
            value={filtersValues[FilterWatchers]}
            minValue={minMaxFiltersValues.watchers.min}
            maxValue={minMaxFiltersValues.watchers.max}
            onFilterChange={onFilterChange}
        />
        <FilterComponent
            filter={FilterFork}
            name="Forks"
            value={filtersValues[FilterFork]}
            minValue={minMaxFiltersValues.forks.min}
            maxValue={minMaxFiltersValues.forks.max}
            onFilterChange={onFilterChange}
        />
        <FilterComponent
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
