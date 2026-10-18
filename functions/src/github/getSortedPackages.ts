import { defineSecret } from 'firebase-functions/params'
import {
    Category,
    CategoryKey,
    Package,
    PackageName,
    PackagesByCategory,
} from '../types'

export const githubToken = defineSecret('GITHUB_TOKEN')

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
const MAX_ATTEMPTS = 3

const getGithubToken = (): string => {
    try {
        return githubToken.value() || process.env.GITHUB_TOKEN || ''
    } catch {
        return process.env.GITHUB_TOKEN || ''
    }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const getSortedPackages = async (): Promise<PackagesByCategory[]> => {
    const packagesByCategories: PackagesByCategory[] = []
    const token = getGithubToken()

    console.log(`Fetching package lists for ${CATEGORIES.length} categories`)
    for (const category of CATEGORIES) {
        const packages = await getCategoryPackages(category.key)
        packagesByCategories.push({
            category: category,
            packages: packages.map((p) => ({
                name: getRepoName(p),
                fullName: p,
            })),
        })
    }

    const allPackages = packagesByCategories.flatMap((cat) => cat.packages)
    console.log(`Populating metadata for ${allPackages.length} packages (has GitHub token: ${Boolean(token)})`)

    if (token) {
        console.log(`Starting GraphQL batch fetch (batch size: ${BATCH_SIZE}, concurrency: ${CONCURRENCY})`)
        await fetchPackagesMetadataGraphQL(allPackages, token)
    }

    // Packages without metadata (no token, GraphQL failure, missing repo) are supplemented by HACS data-v2.
    // Packages still missing afterwards keep `stats` undefined and are hidden by the frontend.
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

const getRepoName = (fullName: string): PackageName =>
    fullName.includes('/') ? fullName.split('/')[1] : fullName

const fetchPackageList = async (url: string): Promise<PackageName[] | null> => {
    try {
        const result = await fetch(url)
        if (result.ok) {
            const list = (await result.json()) as PackageName[]
            return list.map((p) => p.toLowerCase())
        }
        console.warn(`Failed to fetch package list ${url}, status: ${result.status}`)
    } catch (error) {
        console.warn(`Failed to fetch package list ${url}:`, error)
    }
    return null
}

const getCategoryPackages = async (cat: CategoryKey): Promise<PackageName[]> => {
    const list =
        (await fetchPackageList(BASE_URL + cat)) ??
        (await fetchPackageList(`${HACS_DATA_BASE_URL}${cat}/repositories.json`))

    // Throwing aborts the whole update so the last good data stays in Firestore
    // instead of being overwritten by an empty category.
    if (!list) {
        throw new Error(`Unable to fetch package list for category "${cat}"`)
    }
    return list
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

type GraphQLResponse = {
    data?: Record<string, GraphQLRepoData | null> | null
    errors?: { type?: string; message: string }[]
}

const fetchPackagesMetadataGraphQL = async (packages: Package[], token: string): Promise<void> => {
    const batches: Package[][] = []
    for (let i = 0; i < packages.length; i += BATCH_SIZE) {
        batches.push(packages.slice(i, i + BATCH_SIZE))
    }

    let failedBatches = 0
    await processWithConcurrency(batches, CONCURRENCY, async (batch) => {
        const success = await fetchGraphQLBatchWithRetry(batch, token)
        if (!success) failedBatches++
    })
    console.log(`GraphQL batch fetch finished (${batches.length - failedBatches}/${batches.length} batches succeeded)`)
}

const fetchGraphQLBatchWithRetry = async (batch: Package[], token: string): Promise<boolean> => {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            await fetchGraphQLBatch(batch, token)
            return true
        } catch (error) {
            console.warn(`GraphQL batch failed (attempt ${attempt}/${MAX_ATTEMPTS}):`, error)
            if (attempt < MAX_ATTEMPTS) {
                await sleep(2000 * attempt)
            }
        }
    }
    return false
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

    const json = (await response.json()) as GraphQLResponse

    // NOT_FOUND is expected for deleted/private repos (data is null for that alias),
    // anything else (RATE_LIMITED, query errors, ...) means the batch result is unreliable.
    const unexpectedErrors = (json.errors ?? []).filter((e) => e.type !== 'NOT_FOUND')
    if (unexpectedErrors.length > 0) {
        throw new Error(`GitHub GraphQL errors: ${unexpectedErrors.map((e) => e.type ?? e.message).join(', ')}`)
    }

    for (const [alias, repo] of Object.entries(json.data ?? {})) {
        const pkg = indexMap.get(alias)
        if (pkg && repo) {
            pkg.name = repo.name || pkg.name
            pkg.stats = {
                stars: repo.stargazerCount ?? 0,
                forks: repo.forkCount ?? 0,
                watchers: repo.watchers?.totalCount ?? 0,
                openIssues: repo.issues?.totalCount ?? 0,
                updatedAt: repo.updatedAt || new Date().toISOString(),
                createdAt: repo.createdAt ?? undefined,
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
        if (!res.ok) {
            console.warn(`HACS data-v2 fallback for ${cat} failed, status: ${res.status}`)
            return
        }

        const data = (await res.json()) as Record<string, HacsDataV2Item>
        const hacsMap = new Map<string, HacsDataV2Item>()

        for (const item of Object.values(data)) {
            if (item.full_name) {
                hacsMap.set(item.full_name.toLowerCase(), item)
            }
        }

        for (const pkg of packages) {
            const item = pkg.stats ? undefined : hacsMap.get(pkg.fullName.toLowerCase())
            if (!item?.last_updated) continue

            // data-v2 has no fork/watcher counts nor creation date: forks/watchers are 0, createdAt is left empty.
            pkg.stats = {
                stars: item.stargazers_count ?? 0,
                forks: 0,
                watchers: 0,
                openIssues: item.open_issues ?? 0,
                updatedAt: item.last_updated,
            }
            pkg.info = {
                description: item.description ?? '',
                url: `https://github.com/${pkg.fullName}`,
                homepageUrl: '',
            }
        }
    } catch (error) {
        console.error(`Error applying HACS data-v2 fallback for ${cat}:`, error)
    }
}

// Runs `fn` over `items` with at most `concurrency` calls in flight at a time.
const processWithConcurrency = async <T>(
    items: T[],
    concurrency: number,
    fn: (item: T) => Promise<void>
): Promise<void> => {
    let next = 0
    const worker = async () => {
        while (next < items.length) {
            const item = items[next++]
            await fn(item)
        }
    }
    await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker))
}
