import {InputBase, withStyles} from '@material-ui/core'

export const HacsInput = withStyles((theme) => ({
    root: {
        'label + &': {
            marginTop: theme.spacing(3),
        },
    },
    input: {
        position: 'relative',
        backgroundColor: 'transparent',
        fontSize: 16,
        padding: '10px 26px 10px 0',
        transition: theme.transitions.create(['border-color', 'box-shadow']),
        '&:hover': {
            boxShadow: `0 0 0 0.2rem ${theme.palette.primary.main}`,
        },'&:focus': {
            boxShadow: `0 0 0 0.2rem ${theme.palette.primary.main}`,
        },
    },
}))(InputBase);
