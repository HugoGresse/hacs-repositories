import React from 'react'
import {
    createMuiTheme,
    MuiThemeProvider,
    responsiveFontSizes,
    ThemeOptions,
    useMediaQuery,
} from '@material-ui/core'
import Box from '@material-ui/core/Box'
import CssBaseline from '@material-ui/core/CssBaseline'
import Container from '@material-ui/core/Container'
import { PaletteOptions } from '@material-ui/core/styles/createPalette'

type AppLayoutProps = {
    children: JSX.Element
}

type HacsSortedPalette = PaletteOptions & {
    pageBackground: string
    headerBackground: string
}

export type HacsSortedTheme = ThemeOptions & {
    palette: PaletteOptions & HacsSortedPalette
}

const AppLayout = ({ children }: AppLayoutProps) => {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

    const mainTheme = responsiveFontSizes(
        createMuiTheme({
            typography: {
                h1: {
                    fontSize: 30,
                    fontWeight: 400,
                },
                h2: {
                    fontSize: 26,
                    fontWeight: 400,
                },
                h3: {
                    fontSize: 20,
                    fontWeight: 400,
                },
            },
            palette: {
                type: prefersDarkMode ? 'dark' : 'light',
                pageBackground: prefersDarkMode ? '#303030' : '#fff',
                headerBackground: prefersDarkMode ? '#090' : '#8aecb8',
            },
        } as HacsSortedTheme)
    )

    return (
        <MuiThemeProvider theme={mainTheme}>
            <Box marginTop={2}>
                <CssBaseline />
                <main>
                    <Container maxWidth="lg" style={{ overflow: 'hidden' }}>
                        {children}
                    </Container>
                </main>
            </Box>
        </MuiThemeProvider>
    )
}

export default AppLayout
