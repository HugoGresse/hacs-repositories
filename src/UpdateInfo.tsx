import { Box, Typography } from '@material-ui/core'
import React from 'react'
import { useSelector } from 'react-redux'
import { getLastUpdateSelector } from './packages/packagesSelectors'
import { DateTime } from 'luxon'

const UpdateInfo = () => {
    const lastUpdate = useSelector(getLastUpdateSelector)

    return (
        <Box marginTop={1}>
            <Typography
                variant="caption"
                color="textSecondary"
                title={lastUpdate?.toLocaleString(DateTime.DATETIME_FULL)}>
                Updated daily. Last update: {lastUpdate ? lastUpdate.toRelative() : 'unknown'}
            </Typography>
        </Box>
    )
}

export default UpdateInfo
