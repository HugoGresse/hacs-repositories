import React, { useEffect, useState } from 'react'
import { Box, CircularProgress, Link, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { PackageFullName } from '../types'
import { getReadme } from '../packages/getReadme'

const useStyles = makeStyles((theme) => ({
    readme: {
        maxHeight: 600,
        overflow: 'auto',
        padding: theme.spacing(0, 2),
        borderLeft: `2px solid ${theme.palette.divider}`,
        overflowWrap: 'anywhere',
        '& img': {
            maxWidth: '100%',
        },
        '& pre': {
            overflow: 'auto',
            padding: theme.spacing(1),
            background: theme.palette.action.hover,
        },
        '& a': {
            color: theme.palette.primary.main,
        },
        '& .anchor': {
            display: 'none',
        },
        '& table': {
            borderCollapse: 'collapse',
        },
        '& td, & th': {
            border: `1px solid ${theme.palette.divider}`,
            padding: theme.spacing(0.5, 1),
        },
    },
}))

type PackageReadmeProps = {
    fullName: PackageFullName
    url?: string
}

const PackageReadme = ({ fullName, url }: PackageReadmeProps) => {
    const classes = useStyles()
    const [html, setHtml] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let active = true
        getReadme(fullName)
            .then((result) => active && setHtml(result))
            .catch((e: Error) => active && setError(e.message))
        return () => {
            active = false
        }
    }, [fullName])

    if (error) {
        return (
            <Typography color="error" gutterBottom>
                {error} {url && <Link href={url}>Open on GitHub</Link>}
            </Typography>
        )
    }

    if (html === null) {
        return (
            <Box padding={2}>
                <CircularProgress size={24} />
            </Box>
        )
    }

    return <div className={classes.readme} dangerouslySetInnerHTML={{ __html: html }} />
}

export default PackageReadme
