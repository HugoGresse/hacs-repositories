import React from 'react'
import {Typography} from '@material-ui/core'
import {Package} from '../functions/src/types'
import StarRateIcon from '@material-ui/icons/StarRate'
import VisibilityIcon from '@material-ui/icons/Visibility'
import MergeTypeIcon from '@material-ui/icons/MergeType';
import BugReportIcon from '@material-ui/icons/BugReport';
import UpdateIcon from '@material-ui/icons/Update';
import {makeStyles} from '@material-ui/core/styles'

type PackageItemProps = {
    packageItem: Package
}

const useStyles = makeStyles(theme => ({
    container: {
        marginTop: 16,
        width: "100%"
    },
    icon: {
        position: "relative",
        top: 6
    },
    iconContainer: {
        border: "1px solid #CCCCCC",
        padding: "0 6px 3px",
        marginRight: 8,
        marginBottom: 8,
        borderRadius: 30,
        color: "#888",
        display: "flex",
        alignItems: "baseline",
    },
    iconsContainer: {
        display: "flex",
        flexDirection: "row",
        flexWrap:"wrap"
    }
}))

const PackageItem = ({packageItem}: PackageItemProps) => {
    const classes = useStyles()

    return  <div  className={classes.container}>
        <Typography variant="h5" gutterBottom>
            {packageItem.name}
        </Typography>

        <div className={classes.iconsContainer}>
            <Typography className={classes.iconContainer}>
                <StarRateIcon className={classes.icon}/>
                {packageItem.stats?.stars}
            </Typography>
            <Typography className={classes.iconContainer}>
                <VisibilityIcon  className={classes.icon}/>
                {packageItem.stats?.watchers}
            </Typography>
            <Typography className={classes.iconContainer}>
                <MergeTypeIcon style={{transform: "rotate(180deg)"}}  className={classes.icon}/>
                {packageItem.stats?.forks}
            </Typography>
            <Typography className={classes.iconContainer}>
                <BugReportIcon  className={classes.icon}/>
                {packageItem.stats?.openIssues}
            </Typography>
            <Typography className={classes.iconContainer}>
                <UpdateIcon  className={classes.icon}/>
                {packageItem.stats?.updatedAtLuxon?.toRelative()}
            </Typography>
        </div>
    </div>

}

export default PackageItem
