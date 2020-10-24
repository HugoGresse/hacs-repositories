import React from 'react'
import { Link, Typography } from '@material-ui/core'
import { Package } from '../functions/src/types'
import StarRateIcon from '@material-ui/icons/StarRate'
import VisibilityIcon from '@material-ui/icons/Visibility'
import MergeTypeIcon from '@material-ui/icons/MergeType'
import BugReportIcon from '@material-ui/icons/BugReport'
import UpdateIcon from '@material-ui/icons/Update'
import CopyrightIcon from '@material-ui/icons/Copyright'
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import { makeStyles } from '@material-ui/core/styles'
import {DateTime} from 'luxon'

type PackageItemProps = {
    packageItem: Package
}

const useStyles = makeStyles((theme) => ({
    container: {
        marginTop: 16,
        width: '100%',
    },
    icon: {
        position: 'relative',
        top: 6,
    },
    iconContainer: {
        padding: '0 6px 0 0',
        marginRight: 8,
        marginBottom: 8,
        color: '#888',
        display: 'flex',
        alignItems: 'baseline',
    },
    iconsContainer: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
}))

const PackageItem = ({ packageItem }: PackageItemProps) => {
    const classes = useStyles()

    return (
        <div className={classes.container}>
            <Typography variant="h5" gutterBottom>
                <Link href={packageItem.info?.url} title={packageItem.fullName}>
                    {packageItem.fullName}
                </Link>
            </Typography>
            <Typography gutterBottom>{packageItem.info?.description}</Typography>

            <div className={classes.iconsContainer}>
                <Typography className={classes.iconContainer} title="Star count">
                    <StarRateIcon className={classes.icon} />
                    {packageItem.stats?.stars}
                </Typography>
                <Typography className={classes.iconContainer} title="Watcher count">
                    <VisibilityIcon className={classes.icon} />
                    {packageItem.stats?.watchers}
                </Typography>
                <Typography className={classes.iconContainer} title="Fork count">
                    <MergeTypeIcon
                        style={{ transform: 'rotate(180deg)' }}
                        className={classes.icon}
                    />
                    {packageItem.stats?.forks}
                </Typography>
                <Typography className={classes.iconContainer} title="Open issue count">
                    <BugReportIcon className={classes.icon} />
                    {packageItem.stats?.openIssues}
                </Typography>
                {packageItem.info?.license && (
                    <Typography className={classes.iconContainer} title="License">
                        <CopyrightIcon className={classes.icon} />
                        {packageItem.info?.license}
                    </Typography>
                )}
                <Typography className={classes.iconContainer} title={`Creation date: ${packageItem.stats?.createdAtLuxon?.toLocaleString(DateTime.DATETIME_FULL)}`}>
                    <CalendarTodayIcon className={classes.icon} />
                    {packageItem.stats?.createdAtLuxon?.toRelative()}
                </Typography>
                <Typography className={classes.iconContainer} title={`Last update date: ${packageItem.stats?.updatedAtLuxon?.toLocaleString(DateTime.DATETIME_FULL)}`}>
                    <UpdateIcon className={classes.icon} />
                    {packageItem.stats?.updatedAtLuxon?.toRelative()}
                </Typography>
            </div>
        </div>
    )
}

export default PackageItem
