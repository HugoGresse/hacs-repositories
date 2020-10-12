import React from 'react'
import {Grid} from '@material-ui/core'
import {Package} from '../functions/src/types'

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
