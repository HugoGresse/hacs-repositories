import React, {useEffect, useState} from 'react'
import CssBaseline from '@material-ui/core/CssBaseline'
import Box from '@material-ui/core/Box'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import {getSortedPackages, PackagesByCategory} from './github/getSortedPackages'
import PackageCategoriesList from './PackageCategoriesList'

function App() {
    const [packagesByCategories, setPackages] = useState<PackagesByCategory[]>([])

    useEffect(() => {
        // noinspection JSIgnoredPromiseFromCall
        getSortedPackages((packagesList => {
            setPackages(packagesList)
        }))
    } , [])

    return (

        <Box marginTop={2}>
            <CssBaseline/>
            <main>
                <Container maxWidth="lg" style={{overflow: 'hidden'}}>
                    <Grid container spacing={3}>

                        <PackageCategoriesList packagesByCategories={packagesByCategories}/>

                    </Grid>

                </Container>
            </main>
        </Box>
    )
}

export default App
