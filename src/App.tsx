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
 * 3. search + remove border
 * 4. update list behavior
 * 5. READMe, github
 * 6. polish (colors?) + footer
 */
function App() {
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(loadPackages())
    } , [dispatch])

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
