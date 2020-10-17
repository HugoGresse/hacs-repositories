import React from 'react'
import {Grid, Typography} from '@material-ui/core'
import PackageItem from './PackageItem'
import {PackagesByCategory} from '../functions/src/types'
import {makeStyles} from '@material-ui/core/styles'

type PackageCategoriesList = {
    packagesByCategories?: PackagesByCategory[]
}

const useStyles = makeStyles(theme => ({
    title: {
        marginTop: 64,
    },
}))


const PackageCategoriesList = ({packagesByCategories}: PackageCategoriesList) => {
    const classes = useStyles()

    if(!packagesByCategories) {
        return <></>
    }

    return <>{
        packagesByCategories.map(({category, packages}) => {
            return <Grid item key={category.key}>
                <Typography variant="h1" className={classes.title}>
                    {category.name}
                </Typography>
                <Grid container>
                    {packages.map(p => <PackageItem packageItem={p} key={p.name}/>)}
                </Grid>
            </Grid>
        })
    }
    </>
}

export default PackageCategoriesList
