import React from 'react'
import {Chip, FormControl,  MenuItem, Select} from '@material-ui/core'
import {Category} from '../../functions/src/types'
import {makeStyles} from '@material-ui/core/styles'
import FilterName from './FilterName'
import {HacsInput} from './HacsInputBase'

type FilterSelectCategoryComponentProps = {
    onSelectChange: (categoriesSelected: string[]) => void
    values: Category[]
    selectedValues: Category[]
}

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        },
    },
}

function getStyles(name: Category, selectedValues: Category[]) {
    return {
        fontWeight:
            selectedValues.indexOf(name) === -1
                ? 200
                : 800,
    }
}

const useStyles = makeStyles(theme => ({
    formControl: {
        width: '100%',
        marginBottom: 16
    },
    chips: {
        display: 'flex',
        flexWrap: 'wrap',
    },
}))

const FilterSelectCategoryComponent = ({onSelectChange, values, selectedValues}: FilterSelectCategoryComponentProps) => {
    const classes = useStyles()
    const onPackageTypeChange = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
        onSelectChange(event.target.value as string[])
    }

    return <FormControl className={classes.formControl}>
        <FilterName>Repository type{selectedValues.length > 1 ? 's' : ''}</FilterName>
        <Select
            labelId="package-type"
            id="package-type"
            multiple
            value={selectedValues.map(value => value.key)}
            onChange={onPackageTypeChange}
            input={<HacsInput id="select-multiple-chip"/>}
            renderValue={() => (
                <div className={classes.chips}>
                    {selectedValues.map((value) => (
                        <Chip key={value.key} label={value.name}/>
                    ))}
                </div>
            )}
            MenuProps={MenuProps}
        >
            {values.map((value) => (
                <MenuItem key={value.key} value={value.key} style={getStyles(value, selectedValues)}>
                    {value.name}
                </MenuItem>
            ))}
        </Select>
    </FormControl>

}

export default FilterSelectCategoryComponent
