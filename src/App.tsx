import React, {useEffect, useState} from 'react'
import Grid from '@material-ui/core/Grid'
import PackageCategoriesList from './PackageCategoriesList'
import {functions} from './firebase/firebase'
import {Button} from '@material-ui/core'
import { Provider } from 'react-redux'
import {getPackages} from './firebase/getPackages'
import AppLayout from './AppLayout'
import {store} from './store'
import {PackagesLoadResult} from './packages/types'

/**
 * TODO :
 * 1. design
 * 2. filter: stars (range), fork (range
 * 3. search
 * 4. debounce
 * 5. READMe, github
 * 6. polish
 * @constructor
 */
function App() {
    const [packagesLoadResult, setPackages] = useState<PackagesLoadResult>({
        loadSuccess: false
    })

    useEffect(() => {
        const loadData = async () => {
            const result = await getPackages()
            if(result.loadSuccess) {
                setPackages(result)
            }
        }

        // noinspection JSIgnoredPromiseFromCall
        loadData()
    } , [])

    return <Provider store={store}>
        <AppLayout>
        <Grid container spacing={3}>
            <Grid item xs={12}
            >

                <Button onClick={async () => {
                    const data = await functions.updateHacsPackages()
                    console.log(data)
                }}>Update list</Button>

            </Grid>
            <PackageCategoriesList packagesByCategories={packagesLoadResult.packages}/>


        </Grid>
    </AppLayout>
    </Provider>
}

export default App
