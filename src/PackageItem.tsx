import React from 'react'
import {Package} from './github/getSortedPackages'
import {Grid} from '@material-ui/core'

type PackageItemProps = {
    packageItem: Package
}

const PackageItem = ({packageItem}: PackageItemProps) => {

    return  <Grid item>
        {packageItem.name}
        {packageItem.stats?.stars}
    </Grid>

}

export default PackageItem
