import { FilterRangeTypes } from '../packages/types'
import React from 'react'
import {Box, Slider} from '@material-ui/core'
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

export const FilterRangeComponent = ({
    filter,
    name,
    value,
    minValue,
    maxValue,
    onFilterChange,
}: FilterComponentProps) => {
    return (
        <Box >
            <FilterName>
                {name} ({value[0]}→{value[1]})
            </FilterName>

            <Box display="block" position="relative" padding={1}>
            <Slider
                value={[value[0], value[1]]}
                onChange={onFilterChange(filter)}
                min={minValue}
                max={maxValue}
                valueLabelDisplay="auto"
                aria-labelledby="range-slider"
                getAriaValueText={valueText}
            />
            </Box>
        </Box>
    )
}
