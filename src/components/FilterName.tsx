import React from 'react'
import {makeStyles} from '@material-ui/core/styles'
import {Typography} from '@material-ui/core'

type FilterNameProps = {
    children: React.ReactNode
}

const useStyles = makeStyles(theme => ({
    filterName: {
        textTransform: "uppercase",
        fontWeight: 200
    },
}))


const FilterName = ({children}: FilterNameProps) => {
    const classes = useStyles()
    return <Typography className={classes.filterName}>{children}</Typography>
}
export default FilterName
