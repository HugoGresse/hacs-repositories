import { defineSecret } from 'firebase-functions/params'
import {
    Category,
    CategoryKey,
    PackageName,
    PackagesByCategory,
    RepoInfo,
    RepoStats,
} from '../types'

const githubToken = defineSecret("GITHUB_TOKEN")

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
const CONCURRENCY = 10
const MAX_RETRIES = 3

export const getSortedPackages = async (): Promise<PackagesByCategory[]> => {
    const packagesByCategories: PackagesByCategory[] = []

    console.log(`Fetching package lists for ${CATEGORIES.length} categories`)
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

    const totalPackages = packagesByCategories.reduce((sum, cat) => sum + cat.packages.length, 0)
    console.log(`Fetching repo data for ${totalPackages} packages (concurrency: ${CONCURRENCY})`)

    for (const packagesByCat of packagesByCategories) {
        await processInBatches(packagesByCat.packages, CONCURRENCY, async (item) => {
            const repoData = await getRepoDataWithRetry(item.name)
            if (repoData) {
                item.name = repoData.name
                item.stats = repoData.stats
                item.info = repoData.infos
            }
        })
    }

    return packagesByCategories
}

const processInBatches = async <T>(
    items: T[],
    batchSize: number,
    fn: (item: T) => Promise<void>
): Promise<void> => {
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize)
        await Promise.all(batch.map(fn))
    }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const getRepoDataWithRetry = async (
    packageName: PackageName
): Promise<{ stats: RepoStats; infos: RepoInfo; name: PackageName } | null> => {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            return await getRepoData(packageName)
        } catch (error: any) {
            if (error.rateLimitReset) {
                const waitMs = Math.max(0, error.rateLimitReset * 1000 - Date.now()) + 1000
                console.warn(`Rate limited. Waiting ${Math.round(waitMs / 1000)}s before retry (attempt ${attempt}/${MAX_RETRIES})`)
                await sleep(waitMs)
                continue
            }
            if (attempt === MAX_RETRIES) {
                console.error(`Failed to fetch ${packageName} after ${MAX_RETRIES} attempts:`, error.message)
                return null
            }
            await sleep(1000 * attempt)
        }
    }
    return null
}

const getCategoryPackages = async (cat: CategoryKey): Promise<PackageName[]> => {
    const result = await fetch(BASE_URL + cat)
    const list: PackageName[] = await result.json() as PackageName[]
    return list.map((p) => p.toLowerCase())
}

const getRepoData = async (
    packageName: PackageName
): Promise<{
    stats: RepoStats
    infos: RepoInfo
    name: PackageName
}> => {
    const result = await fetch(BASE_GITHUB_API_URL + packageName, {
        headers: {
            Authorization: `token ${githubToken.value()}`,
        },
    })

    if (result.status === 403 || result.status === 429) {
        const resetHeader = result.headers.get('x-ratelimit-reset')
        const error: any = new Error(`GitHub rate limit hit for ${packageName}`)
        error.rateLimitReset = resetHeader ? parseInt(resetHeader) : Math.floor(Date.now() / 1000) + 60
        throw error
    }

    const data: any = await result.json()

    if (!result.ok) {
        console.error(`GitHub request failed for ${packageName}, status: ${result.status}`, data)
        throw new Error(`GitHub request failed, status: ${result.status}`)
    }

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
