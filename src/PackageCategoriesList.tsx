import React from 'react'
import {Box, Typography} from '@material-ui/core'
import PackageItem from './PackageItem'
import {PackagesByCategory} from '../functions/src/types'
import {makeStyles} from '@material-ui/core/styles'
import LazyLoad from 'react-lazyload'

type PackageCategoriesList = {
    packagesByCategories?: PackagesByCategory[]
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

const PackageCategoriesList = ({packagesByCategories}: PackageCategoriesList) => {
    const classes = useStyles()

    if (!packagesByCategories) {
        return <></>
    }

    return <>{
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
    </>
}

export default PackageCategoriesList
