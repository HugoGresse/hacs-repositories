import React, {useState} from 'react'
import {Box, Grid, InputAdornment, Link} from '@material-ui/core'
import HACSRepositoriesLogo from './logos/hacs-repositories-transparent-blue.svg'
import SearchIcon from '@material-ui/icons/Search'
import {HacsTextField} from './components/HacsTextField'
import {useDispatch} from 'react-redux'
import {updateSearch} from './packages/searchActions'
import {forceCheck} from 'react-lazyload'
import GitHubIcon from '@material-ui/icons/GitHub'
import _ from 'lodash'
import useIsMobile from './utils/useIsMobile'

const Header = () => {
    const dispatch = useDispatch()
    const isMobile = useIsMobile()
    const [dispatchDebounced] = useState(() =>
        _.debounce(
            (args) => {
                dispatch(args)
                setTimeout(forceCheck, 0)
            },
            200,
            {
                leading: false,
                trailing: true,
            }
        )
    )

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatchDebounced(updateSearch(event.currentTarget.value))
    }

    return (
        <Grid container component={Box} paddingLeft={isMobile ? 0 : 4}>
            <Grid item xs={12} sm={4}>
                <img src={HACSRepositoriesLogo} width={250} alt="HACS Repositories logo"/>
            </Grid>
            <Grid item xs={12} sm={8} component={Box} marginTop={1} display="flex" justifyContent="flex-end">
                <HacsTextField
                    id="filled-search"
                    placeholder="Search"
                    type="search"
                    fullWidth
                    onChange={handleSearchChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon/>
                            </InputAdornment>
                        ),
                    }}
                />
                <Box marginLeft={6} marginTop={2}>
                    <Link href="https://github.com/HugoGresse/hacs-repositories" color="textSecondary" target="_blank">
                        <GitHubIcon/>
                    </Link>
                </Box>
            </Grid>
        </Grid>
    )
}

export default Header
