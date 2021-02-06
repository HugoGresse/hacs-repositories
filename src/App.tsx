import React, { useEffect } from 'react'
import Grid from '@material-ui/core/Grid'
import PackageCategoriesList from './PackageCategoriesList'
import { useDispatch } from 'react-redux'
import AppLayout from './AppLayout'
import { loadPackages } from './packages/loadActions'
import Header from './Header'
import {TestAframe} from './TestAframe'

function App() {
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(loadPackages())
    }, [dispatch])

    return (
        <AppLayout>
                <TestAframe/>
        </AppLayout>
    )
}

export default App
