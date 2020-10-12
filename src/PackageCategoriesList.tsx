import React from 'react'
import {Grid} from '@material-ui/core'
import PackageItem from './PackageItem'
import {PackagesByCategory} from '../functions/src/types'

type PackageCategoriesList = {
    packagesByCategories: PackagesByCategory[]
}

const PackageCategoriesList = ({packagesByCategories}: PackageCategoriesList) => {

    return <>{
        packagesByCategories.map(({category, packages}) => {
            return <Grid item key={category.key}>
                {category.name}
                <Grid container>
                    {packages.map(p => <PackageItem packageItem={p} key={p.name}/>)}
                </Grid>
            </Grid>
        })
    }
    </>
}

export default PackageCategoriesList
