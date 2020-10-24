import {Box, Button, Dialog, DialogContent, DialogTitle, Typography} from '@material-ui/core'
import React, {useState} from 'react'
import {useSelector} from 'react-redux'
import {getLastUpdateSelector} from './packages/packagesSelectors'
import {DateTime} from 'luxon'
import {functions} from './firebase/firebase'

const UpdateInfo = () => {
    const lastUpdate = useSelector(getLastUpdateSelector)
    const [dialogOpen, setDialogOpen] = useState(false)


    return  <Box marginTop={1} >
        <Button onClick={() => setDialogOpen(true)}  size="small">
            Last update: {lastUpdate ? lastUpdate.toRelative() : "never, click here to run it"}
        </Button>


        <Dialog onClose={() => setDialogOpen(false)} aria-labelledby="Update repositories" open={dialogOpen}>
            <DialogTitle id="Update repositories">Update repository list</DialogTitle>
            <DialogContent>
                <Typography>
                    The list is updated upon user request to prevent useless server usage. The last update was {lastUpdate ? lastUpdate.toRelative() : "never"},
                    on {lastUpdate ? lastUpdate.toLocaleString(DateTime.DATETIME_FULL) : "a missing day somewhere in deep space."}. <br/>
                    Upon request, the update take around 2-5 minutes, and can run one time per day maximum.
                </Typography>

                <br/>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        // noinspection JSIgnoredPromiseFromCall
                        functions.updateHacsPackages()
                        setDialogOpen(false)
                    }}>
                    Request update
                </Button>

                <br/>
            </DialogContent>
        </Dialog>
    </Box>

}

export default UpdateInfo
