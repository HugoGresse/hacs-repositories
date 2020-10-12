import React, {useEffect, useState} from 'react'
import CssBaseline from '@material-ui/core/CssBaseline'
import Box from '@material-ui/core/Box'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import PackageCategoriesList from './PackageCategoriesList'
import {functions} from './firebase'
import {Button} from '@material-ui/core'
import {PackagesByCategory} from '../functions/src/types'

function App() {
    const [packagesByCategories, setPackages] = useState<PackagesByCategory[]>([])

    useEffect(() => {
        // noinspection JSIgnoredPromiseFromCall

    } , [])

    return (
        <Box marginTop={2}>
            <CssBaseline/>
            <main>
                <Container maxWidth="lg" style={{overflow: 'hidden'}}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}
                              >

                            <Button onClick={async () => {
                                const data = await functions.updateHacsPackages()
                                console.log(data)
                            }}>Update list</Button>

                        </Grid>
                        <PackageCategoriesList packagesByCategories={packagesByCategories}/>

                    </Grid>

                </Container>
            </main>
        </Box>
    )
}

export default App
