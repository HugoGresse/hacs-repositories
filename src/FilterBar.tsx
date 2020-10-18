import React from 'react'
import {Slider, Typography} from '@material-ui/core'
import {useDispatch, useSelector} from 'react-redux'
import {getMinMaxFiltersValuesSelector, getStarsFilterValuesSelector} from './packages/packagesSelectors'
import {setFilter} from './packages/filterActions'
import {FilterFork, FilterStar, FilterTypes} from './packages/types'

const valueText = (value: number, index: number) => `${value}`

const FilterBar = () => {
    const dispatch = useDispatch()
    const starsValue = useSelector(getStarsFilterValuesSelector)
    const minMaxFiltersValues = useSelector(getMinMaxFiltersValuesSelector)

    console.log("minMaxfilters", minMaxFiltersValues)

    const onFilterChange = (filter: FilterTypes) => (event: React.ChangeEvent<{}>, value: number | number[]) => {
        if (Array.isArray(value)) {
            dispatch(setFilter(filter, value[0], value[1]))
        }
    }

    // TODO : init filters with max values

    if (!minMaxFiltersValues) {
        return <>
            Loading...
        </>
    }

    return <>

        <FilterComponent
            filter={FilterStar}
            name="Stars"
            value={starsValue}
            minValue={minMaxFiltersValues.stars.min}
            maxValue={minMaxFiltersValues.stars.max}
            onFilterChange={onFilterChange}
        />

        {//TODO rest of the filters :D
             }

    </>
}

type FilterComponentProps = {
    filter: FilterTypes,
    name: string,
    value: number[],
    minValue: number,
    maxValue: number,
    onFilterChange : (filter: FilterTypes) => (event: React.ChangeEvent<{}>, value: number | number[]) => void
}

const FilterComponent = ({filter,
                         name,
                         value,
                         minValue,
                         maxValue,
                         onFilterChange}: FilterComponentProps
                         ) => {
    return <>
        <Typography id="range-slider" gutterBottom>
            {name} {value[0]} {value[1]}
        </Typography>
        <Slider
            value={[value[0], value[1]]}
            onChange={onFilterChange(filter)}
            min={minValue}
            max={maxValue}
            valueLabelDisplay="auto"
            aria-labelledby="range-slider"
            getAriaValueText={valueText}
        />
    </>
}

export default FilterBar
