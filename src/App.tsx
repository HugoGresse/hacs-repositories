import React, {useEffect} from 'react'
import Grid from '@material-ui/core/Grid'
import PackageCategoriesList from './PackageCategoriesList'
import {functions} from './firebase/firebase'
import {Button} from '@material-ui/core'
import {useDispatch} from 'react-redux'
import AppLayout from './AppLayout'
import {loadPackages} from './packages/loadActions'
import Header from './Header'

/**
 * TODO :
 * // TODO : need to update functions for that createdAt, add real repo name separately, check duplicated jm-73 nolonger exist
 * 4. update list behavior
 * 5. READMe, github, license
 * 6. polish (colors?) + footer
 */
function App() {
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(loadPackages())
    } , [dispatch])

    return <AppLayout>
        <Grid container spacing={4}>
            <Grid item xs={12}>
                    <Header/>
            </Grid>
            <PackageCategoriesList />

        </Grid>
    </AppLayout>
}

export default App
