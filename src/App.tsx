import React, {useEffect} from 'react'
import Grid from '@material-ui/core/Grid'
import PackageCategoriesList from './PackageCategoriesList'
import {functions} from './firebase/firebase'
import {Button} from '@material-ui/core'
import {useDispatch} from 'react-redux'
import AppLayout from './AppLayout'
import {loadPackages} from './packages/loadActions'

/**
 * TODO :
 * 2. filter: stars (range), fork (range
 * 3. search
 * 4. debounce
 * 5. READMe, github
 * 6. polish
 * @constructor
 */
function App() {
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(loadPackages())
    } , [])

    return <AppLayout>
        <Grid container spacing={3}>
            <Grid item xs={12}
            >

                <Button onClick={async () => {
                    const data = await functions.updateHacsPackages()
                    console.log(data)
                }}>Update list</Button>

            </Grid>
            <PackageCategoriesList />


        </Grid>
    </AppLayout>
}

export default App
