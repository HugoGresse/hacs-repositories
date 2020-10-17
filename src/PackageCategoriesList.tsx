import React from 'react'
import {Grid, Typography} from '@material-ui/core'
import {PackagesByCategory} from '../functions/src/types'
import {makeStyles} from '@material-ui/core/styles'
import {WindowScroller, AutoSizer, List, ListRowRenderer, CellMeasurer, CellMeasurerCache} from 'react-virtualized'
import PackageList from './PackageList'

type PackageCategoriesList = {
    packagesByCategories?: PackagesByCategory[]
}

const useStyles = makeStyles(theme => ({
    container: {
        width: "100%"
    },
    title: {
        marginTop: 64,
    }
}))

const cache = new CellMeasurerCache({
    defaultHeight: 500,
    fixedWidth: true
})


const PackageCategoriesList = ({packagesByCategories}: PackageCategoriesList) => {
    const classes = useStyles()

    if (!packagesByCategories) {
        return <></>
    }

    const rowRender: ListRowRenderer = ({index, key, style, parent}) => {
        const packageByCategory = packagesByCategories[index]

        return <CellMeasurer
            cache={cache}
            columnIndex={0}
            key={key}
            overscanRowCount={10}
            parent={parent}
            rowIndex={index}
        >
            <Grid item key={key} style={style}>
                <Typography variant="h1" className={classes.title}>
                    {packageByCategory.category.name}
                </Typography>
                <PackageList packages={packageByCategory.packages}/>
            </Grid>
        </CellMeasurer>
    }

    return <div className={classes.container}>
        <WindowScroller
            scrollElement={window}>
            {({height, isScrolling, registerChild, onChildScroll, scrollTop}) => (
                <div>
                    {console.log("re der list", height, isScrolling, scrollTop)}
                    <AutoSizer disableHeight>
                        {({width}) => (
                            <div ref={registerChild}>
                                <List
                                    autoHeight
                                    height={height}
                                    isScrolling={isScrolling}
                                    onScroll={onChildScroll}
                                    overscanRowCount={2}
                                    rowCount={packagesByCategories.length}
                                    rowHeight={cache.rowHeight}
                                    rowRenderer={rowRender}
                                    scrollTop={scrollTop}
                                    width={width}
                                />
                            </div>
                        )}
                    </AutoSizer>
                </div>
            )}
        </WindowScroller>

    </div>
}

export default PackageCategoriesList
