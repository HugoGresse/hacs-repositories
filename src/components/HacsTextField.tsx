import React from 'react'
import { TextField, withStyles } from '@material-ui/core'

export const HacsTextField = withStyles({
    root: {
        borderBottom: 0,
        '& label.Mui-focused': {
            color: 'green',
        },
        '& .MuiInput-underline:before': {
            borderColor: 'transparent',
        },

        '& .MuiInput-underline': {
            height: 50,
        },
    },
})(TextField)
