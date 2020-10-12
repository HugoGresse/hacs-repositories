import fetch from 'node-fetch'
import {Category, CategoryKey, PackageName, PackagesByCategory, RepoStats} from '../types'
import * as functions from 'firebase-functions'

const CATEGORIES: Category[] = [{
    key: "integration",
    name: "Integration"
}, {
    key : "plugin",
    name: "Plugin"
}, {
    key: "appdaemon",
    name: "AppDaemon Apps"
}, {
    key: "netdaemon",
    name: "NetDaemon Apps"
}, {
    key: "python_script",
    name: "Python script"
}, {
    key: "theme",
    name: "Theme"
}]
const BASE_URL = "https://raw.githubusercontent.com/hacs/default/master/"
const BASE_GITHUB_API_URL = "https://api.github.com/repos/"

export const getSortedPackages = async (): Promise<PackagesByCategory[]> => {
    const packagesByCategories: PackagesByCategory[] = []
    for(let category of CATEGORIES) {
        const packages = await getCategoryPackages(category.key)
        packagesByCategories.push({
            category: category,
            packages: packages.map(p => ({
                name: p
            }))
        })
    }

    for(let packagesByCat of packagesByCategories) {
        for(let i = 0; i < packagesByCat.packages.length; i++) {
            packagesByCat.packages[i].stats = await getRepoStats(packagesByCat.packages[i].name)
        }
    }
    return packagesByCategories
}

const getCategoryPackages = async (cat: CategoryKey): Promise<PackageName[]> => {
    const result = await fetch(BASE_URL + cat)
    const list: PackageName[] = await result.json()

    return list.map(p => p.toLowerCase())
}

const getRepoStats = async (packageName: PackageName) : Promise<RepoStats> => {
    const result = await fetch(BASE_GITHUB_API_URL + packageName, {
        headers: {
            "Authorization": `token ${functions.config().github.token}`
        }
    })
    const data: any  = await result.json()

    return {
        forks: data.forks,
        stars: data.stargazers_count,
        watchers: data.watchers,
        openIssues: data.open_issues,
        updatedAt: data.updated_at
    }

}
