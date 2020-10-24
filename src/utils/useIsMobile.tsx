import {useMediaQuery, useTheme} from '@material-ui/core'

const useIsMobile =  ()=> {
    const theme = useTheme()
    return useMediaQuery(theme.breakpoints.down('sm'))
}

export default useIsMobile
