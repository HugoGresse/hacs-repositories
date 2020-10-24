import fetch from 'node-fetch'
import {
    Category,
    CategoryKey,
    PackageName,
    PackagesByCategory,
    RepoInfo,
    RepoStats,
} from '../types'
import * as functions from 'firebase-functions'

const CATEGORIES: Category[] = [
    {
        key: 'integration',
        name: 'Integration',
    },
    {
        key: 'plugin',
        name: 'Plugin',
    },
    {
        key: 'appdaemon',
        name: 'AppDaemon Apps',
    },
    {
        key: 'netdaemon',
        name: 'NetDaemon Apps',
    },
    {
        key: 'python_script',
        name: 'Python script',
    },
    {
        key: 'theme',
        name: 'Theme',
    },
]
const BASE_URL = 'https://raw.githubusercontent.com/hacs/default/master/'
const BASE_GITHUB_API_URL = 'https://api.github.com/repos/'

export const getSortedPackages = async (): Promise<PackagesByCategory[]> => {
    const packagesByCategories: PackagesByCategory[] = []
    for (const category of CATEGORIES) {
        const packages = await getCategoryPackages(category.key)
        packagesByCategories.push({
            category: category,
            packages: packages.map((p) => ({
                name: p,
                fullName: p,
            })),
        })
    }

    for (const packagesByCat of packagesByCategories) {
        for (const item of packagesByCat.packages) {
            const repoData = await getRepoDate(item.name)
            item.name = repoData.name
            item.stats = repoData.stats
            item.info = repoData.infos
        }
    }
    return packagesByCategories
}

const getCategoryPackages = async (cat: CategoryKey): Promise<PackageName[]> => {
    const result = await fetch(BASE_URL + cat)
    const list: PackageName[] = await result.json()

    return list.map((p) => p.toLowerCase())
}

const getRepoDate = async (
    packageName: PackageName
): Promise<{
    stats: RepoStats
    infos: RepoInfo
    name: PackageName
}> => {
    const result = await fetch(BASE_GITHUB_API_URL + packageName, {
        headers: {
            Authorization: `token ${functions.config().github.token}`,
        },
    })
    const data: any = await result.json()

    return {
        name: data.name,
        stats: {
            forks: data.forks,
            stars: data.stargazers_count,
            watchers: data.watchers,
            openIssues: data.open_issues,
            updatedAt: data.updated_at,
            createdAt: data.created_at,
        },
        infos: {
            description: data.description,
            url: data.html_url,
            homepageUrl: data.homepage,
            license: data.license ? data.license.spdx_id : null,
        },
    }
}
