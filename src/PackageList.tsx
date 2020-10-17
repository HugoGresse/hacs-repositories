import React from 'react'
import PackageItem from './PackageItem'
import {Package} from '../functions/src/types'

type PackageListProps = {
    packages: Package[]
}

const PackageList = ({packages}: PackageListProps) => {

    return <>{
        packages.map(p => <PackageItem packageItem={p} key={p.name}/>)
        }</>

}

export default PackageList
