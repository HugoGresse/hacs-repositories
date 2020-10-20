import React from 'react'
import {Box, CircularProgress, Typography} from '@material-ui/core'
import PackageItem from './PackageItem'
import {makeStyles} from '@material-ui/core/styles'
import LazyLoad from 'react-lazyload'
import Grid from '@material-ui/core/Grid/Grid'
import FilterBar from './FilterBar'
import {useSelector} from 'react-redux'
import {getVisiblePackagesByCategorySelector, isPackagesByCategoryLoadingSelector} from './packages/packagesSelectors'

type PackageCategoriesList = {
}

const useStyles = makeStyles(theme => ({
    item: {
        width: "100%",
    },
    title: {
        marginTop: 64,
        width: "100%"
    },
}))

const lineHeight = 70

const PackageCategoriesList = ({}: PackageCategoriesList) => {
    const classes = useStyles()
    const isLoading = useSelector(isPackagesByCategoryLoadingSelector)
    const packagesByCategories = useSelector(getVisiblePackagesByCategorySelector)

    return <Grid container spacing={4}>

        <Grid item xs={12} sm={4}>
            <CircularProgress />
            <FilterBar />
        </Grid>
        <Grid item xs={12} sm={8}>
            {
                packagesByCategories.map(({category, packages}) => {
                    return <Box width="100%" key={category.key}>
                        <LazyLoad height={packages.length * lineHeight}>
                            <Typography variant="h1" className={classes.title}>
                                {category.name}
                            </Typography>
                            {packages.map(p =>
                                <LazyLoad key={p.name} height={lineHeight}>
                                    <PackageItem packageItem={p}/>
                                </LazyLoad>)}
                        </LazyLoad>
                    </Box>
                })
            }
        </Grid>

    </Grid>
}

export default PackageCategoriesList
