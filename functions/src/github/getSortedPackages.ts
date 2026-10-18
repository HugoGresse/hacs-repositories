import { defineSecret } from 'firebase-functions/params'
import {
    Category,
    CategoryKey,
    Package,
    PackageName,
    PackagesByCategory,
} from '../types'

const githubToken = defineSecret('GITHUB_TOKEN')

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
const HACS_DATA_BASE_URL = 'https://data-v2.hacs.xyz/'
const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql'
const BATCH_SIZE = 40
const CONCURRENCY = 3

const getGithubToken = (): string => {
    try {
        return githubToken.value() || process.env.GITHUB_TOKEN || ''
    } catch {
        return process.env.GITHUB_TOKEN || ''
    }
}

export const getSortedPackages = async (): Promise<PackagesByCategory[]> => {
    const packagesByCategories: PackagesByCategory[] = []
    const token = getGithubToken()

    console.log(`Fetching package lists for ${CATEGORIES.length} categories`)
    for (const category of CATEGORIES) {
        const packages = await getCategoryPackages(category.key)
        packagesByCategories.push({
            category: category,
            packages: packages.map((p) => ({
                name: p.includes('/') ? p.split('/')[1] : p,
                fullName: p,
            })),
        })
    }

    const totalPackages = packagesByCategories.reduce((sum, cat) => sum + cat.packages.length, 0)
    console.log(`Populating metadata for ${totalPackages} packages (has GitHub token: ${Boolean(token)})`)

    // Attempt GraphQL batch fetching if GitHub token is present
    if (token) {
        try {
            console.log(`Starting GraphQL batch fetch (batch size: ${BATCH_SIZE}, concurrency: ${CONCURRENCY})`)
            for (const packagesByCat of packagesByCategories) {
                await fetchCategoryPackagesMetadataGraphQL(packagesByCat.packages, token)
            }
            console.log('GraphQL batch fetch finished successfully')
        } catch (error) {
            console.warn('GraphQL batch fetch encountered an error, will supplement with HACS data-v2 fallback:', error)
        }
    }

    // Check if any packages are missing metadata (or if token was not available / GraphQL failed)
    for (const packagesByCat of packagesByCategories) {
        const missingCount = packagesByCat.packages.filter((p) => !p.stats).length
        if (missingCount > 0) {
            console.log(
                `Category "${packagesByCat.category.key}" has ${missingCount}/${packagesByCat.packages.length} packages without metadata. Fetching HACS data-v2 fallback...`
            )
            await applyHacsDataV2Fallback(packagesByCat.category.key, packagesByCat.packages)
        }
    }

    return packagesByCategories
}

const getCategoryPackages = async (cat: CategoryKey): Promise<PackageName[]> => {
    try {
        const result = await fetch(BASE_URL + cat)
        if (result.ok) {
            const list: PackageName[] = (await result.json()) as PackageName[]
            return list.map((p) => p.toLowerCase())
        }
    } catch (error) {
        console.warn(`Failed to fetch default list for category "${cat}", trying HACS repositories endpoint:`, error)
    }

    // Fallback to HACS data-v2 repositories.json
    try {
        const result = await fetch(`${HACS_DATA_BASE_URL}${cat}/repositories.json`)
        if (result.ok) {
            const list: PackageName[] = (await result.json()) as PackageName[]
            return list.map((p) => p.toLowerCase())
        }
    } catch (error) {
        console.error(`Failed to fetch repositories for category "${cat}" from HACS data-v2:`, error)
    }

    return []
}

type GraphQLRepoData = {
    name: string
    nameWithOwner: string
    description: string | null
    url: string | null
    homepageUrl: string | null
    stargazerCount: number | null
    forkCount: number | null
    watchers: { totalCount: number } | null
    issues: { totalCount: number } | null
    updatedAt: string | null
    createdAt: string | null
    licenseInfo: { spdxId: string | null } | null
}

const fetchCategoryPackagesMetadataGraphQL = async (
    packages: Package[],
    token: string
): Promise<void> => {
    const batches: Package[][] = []
    for (let i = 0; i < packages.length; i += BATCH_SIZE) {
        batches.push(packages.slice(i, i + BATCH_SIZE))
    }

    await processInBatches(batches, CONCURRENCY, async (batch) => {
        await fetchGraphQLBatch(batch, token)
    })
}

const fetchGraphQLBatch = async (batch: Package[], token: string): Promise<void> => {
    const queryParts: string[] = []
    const indexMap = new Map<string, Package>()

    batch.forEach((pkg, index) => {
        const parts = pkg.fullName.split('/')
        if (parts.length === 2) {
            const [owner, name] = parts
            const alias = `r${index}`
            indexMap.set(alias, pkg)
            queryParts.push(
                `${alias}: repository(owner: ${JSON.stringify(owner)}, name: ${JSON.stringify(name)}) {
                    name
                    nameWithOwner
                    description
                    url
                    homepageUrl
                    stargazerCount
                    forkCount
                    watchers { totalCount }
                    issues(states: OPEN) { totalCount }
                    updatedAt
                    createdAt
                    licenseInfo { spdxId }
                }`
            )
        }
    })

    if (queryParts.length === 0) return

    const query = `query {\n${queryParts.join('\n')}\n}`

    const response = await fetch(GITHUB_GRAPHQL_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'User-Agent': 'hacs-repositories',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
    })

    if (!response.ok) {
        throw new Error(`GitHub GraphQL API error status: ${response.status}`)
    }

    const json = (await response.json()) as { data?: Record<string, GraphQLRepoData | null> }
    const data = json.data || {}

    for (const [alias, repo] of Object.entries<GraphQLRepoData | null>(data)) {
        const pkg = indexMap.get(alias)
        if (pkg && repo) {
            pkg.name = repo.name || pkg.name
            pkg.stats = {
                stars: repo.stargazerCount ?? 0,
                forks: repo.forkCount ?? 0,
                watchers: repo.watchers?.totalCount ?? 0,
                openIssues: repo.issues?.totalCount ?? 0,
                updatedAt: repo.updatedAt || new Date().toISOString(),
                createdAt: repo.createdAt || new Date().toISOString(),
            }
            pkg.info = {
                description: repo.description ?? '',
                url: repo.url ?? `https://github.com/${pkg.fullName}`,
                homepageUrl: repo.homepageUrl ?? '',
                license: repo.licenseInfo?.spdxId ?? undefined,
            }
        }
    }
}

type HacsDataV2Item = {
    full_name: string
    description?: string
    manifest_name?: string
    domain?: string
    stargazers_count?: number
    open_issues?: number
    last_updated?: string
}

const applyHacsDataV2Fallback = async (cat: CategoryKey, packages: Package[]): Promise<void> => {
    try {
        const res = await fetch(`${HACS_DATA_BASE_URL}${cat}/data.json`)
        if (!res.ok) return

        const data: Record<string, HacsDataV2Item> = (await res.json()) as Record<string, HacsDataV2Item>
        const hacsMap = new Map<string, HacsDataV2Item>()

        for (const item of Object.values(data)) {
            if (item.full_name) {
                hacsMap.set(item.full_name.toLowerCase(), item)
            }
        }

        for (const pkg of packages) {
            if (!pkg.stats) {
                const item = hacsMap.get(pkg.fullName.toLowerCase())
                if (item) {
                    pkg.name = item.manifest_name || item.domain || pkg.name
                    pkg.stats = {
                        stars: item.stargazers_count ?? 0,
                        forks: 0,
                        watchers: 0,
                        openIssues: item.open_issues ?? 0,
                        updatedAt: item.last_updated ?? new Date().toISOString(),
                        createdAt: item.last_updated ?? new Date().toISOString(),
                    }
                    pkg.info = {
                        description: item.description ?? '',
                        url: `https://github.com/${pkg.fullName}`,
                        homepageUrl: `https://github.com/${pkg.fullName}`,
                    }
                } else {
                    // Default fallback stats so filtering/sorting doesn't crash on undefined
                    pkg.stats = {
                        stars: 0,
                        forks: 0,
                        watchers: 0,
                        openIssues: 0,
                        updatedAt: new Date().toISOString(),
                        createdAt: new Date().toISOString(),
                    }
                    pkg.info = {
                        description: '',
                        url: `https://github.com/${pkg.fullName}`,
                        homepageUrl: `https://github.com/${pkg.fullName}`,
                    }
                }
            }
        }
    } catch (error) {
        console.error(`Error applying HACS data-v2 fallback for ${cat}:`, error)
    }
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
