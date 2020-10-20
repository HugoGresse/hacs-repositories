import {FilterTypes} from '../packages/types'
import React from 'react'
import {Slider, Typography} from '@material-ui/core'
import {makeStyles} from '@material-ui/core/styles'

type FilterComponentProps = {
    filter: FilterTypes,
    name: string,
    value: number[],
    minValue: number,
    maxValue: number,
    onFilterChange: (filter: FilterTypes) => (event: React.ChangeEvent<{}>, value: number | number[]) => void
}

const valueText = (value: number, index: number) => `${value}`


const useStyles = makeStyles(theme => ({
    filterName: {
        textTransform: "uppercase",
        fontWeight: 200
    },
    slider: {
        marginLeft: 6,
        marginRight: 6,
        marginBottom: 12
    }
}))

export const FilterComponent = ({
                                    filter,
                                    name,
                                    value,
                                    minValue,
                                    maxValue,
                                    onFilterChange
                                }: FilterComponentProps
) => {
    const classes = useStyles()
    return <>
        <Typography className={classes.filterName}>
            {name} ({value[0]}→{value[1]})
        </Typography>
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
}
