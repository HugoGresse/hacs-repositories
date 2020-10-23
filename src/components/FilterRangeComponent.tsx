import { FilterRangeTypes } from '../packages/types'
import React from 'react'
import { Slider } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import FilterName from './FilterName'

type FilterComponentProps = {
    filter: FilterRangeTypes
    name: string
    value: number[]
    minValue: number
    maxValue: number
    onFilterChange: (
        filter: FilterRangeTypes
    ) => (event: React.ChangeEvent<{}>, value: number | number[]) => void
}

const valueText = (value: number, index: number) => `${value}`

const useStyles = makeStyles((theme) => ({
    slider: {
        marginLeft: 6,
        marginRight: 6,
        marginBottom: 12,
    },
}))

export const FilterRangeComponent = ({
    filter,
    name,
    value,
    minValue,
    maxValue,
    onFilterChange,
}: FilterComponentProps) => {
    const classes = useStyles()
    return (
        <>
            <FilterName>
                {name} ({value[0]}→{value[1]})
            </FilterName>
            <Slider
                className={classes.slider}
                value={[value[0], value[1]]}
                onChange={onFilterChange(filter)}
                min={minValue}
                max={maxValue}
                valueLabelDisplay="auto"
                aria-labelledby="range-slider"
                getAriaValueText={valueText}
            />
        </>
    )
}
