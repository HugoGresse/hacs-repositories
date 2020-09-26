import React from 'react'
import {PackagesByCategory} from './github/getSortedPackages'
import {Grid} from '@material-ui/core'
import PackageItem from './PackageItem'

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
