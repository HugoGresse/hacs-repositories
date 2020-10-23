import React, {useState} from 'react'
import {Box, Button, Grid, InputAdornment} from '@material-ui/core'
import {functions} from './firebase/firebase'
import HACSRepositoriesLogo from './logos/hacs-repositories-transparent-blue.svg'
import SearchIcon from '@material-ui/icons/Search';
import {HacsTextField} from './components/HacsTextField'
import {useDispatch} from 'react-redux'
import {updateSearch} from './packages/searchActions'
import {forceCheck} from 'react-lazyload'
import _ from 'lodash'

const Header = () => {
    const dispatch = useDispatch()
    const [dispatchDebounced] = useState(() =>
        _.debounce((args) => {
            dispatch(args)
            setTimeout(forceCheck, 0)
        }, 200, {
            leading: false,
            trailing: true
        })
    )

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatchDebounced(updateSearch(event.currentTarget.value))
    };

    return  <Grid container component={Box} paddingLeft={4} paddingTop={0}>
        <Grid item xs={12} sm={4}>
            <img src={HACSRepositoriesLogo} width={250}/>

        </Grid>
        <Grid item xs={12} sm={6}>
            <Box marginTop={1}>
                <HacsTextField
                    id="filled-search"
                    placeholder="Search"
                    type="search"
                    fullWidth
                    onChange={handleSearchChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>
        </Grid>
        <Grid item xs={12} sm={2}>
            <Button onClick={async () => {
                const data = await functions.updateHacsPackages()
                console.log(data)
            }}>Update list</Button>
        </Grid>
    </Grid>
}

export default Header
