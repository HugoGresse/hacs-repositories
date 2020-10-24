import React, { useEffect } from 'react'
import Grid from '@material-ui/core/Grid'
import PackageCategoriesList from './PackageCategoriesList'
import { useDispatch } from 'react-redux'
import AppLayout from './AppLayout'
import { loadPackages } from './packages/loadActions'
import Header from './Header'

/**
 * TODO :
 * 5. READMe, github, license
 * 6. polish (colors?) + footer
 */
function App() {
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(loadPackages())
    }, [dispatch])

    return (
        <AppLayout>
            <Grid container spacing={4}>
                <Grid item xs={12}>
                    <Header />
                </Grid>
                <PackageCategoriesList />
            </Grid>
        </AppLayout>
    )
}

export default App
