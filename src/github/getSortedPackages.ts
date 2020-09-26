type PackageName = string
type CategoryKey = string
type CategoryName = string
type Category = {
    key: CategoryKey,
    name: CategoryName
}
export type Package = { name: PackageName, stats?: RepoStats }
export type PackagesByCategory = { category: Category, packages: Package[] }
export type RepoStats = {
    stars: number,
    forks: number,
    watchers: number,
    openIssues: number,
    updatedAt: string
}

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


export const getSortedPackages = async (onUpdate: (packagesList: PackagesByCategory[]) => void): Promise<void> => {
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

    onUpdate(packagesByCategories)

    for(let packagesByCat of packagesByCategories) {
        for(let packageName of packagesByCat.packages) {
            await getRepoStats(packageName.name)

            break
        }

        onUpdate(packagesByCategories)
    }
}


const getCategoryPackages = async (cat: CategoryKey): Promise<PackageName[]> => {
    const result = await fetch(BASE_URL + cat)
    const list: PackageName[] = await result.json()

    return list.map(p => p.toLowerCase())
}

const getRepoStats = async (packageName: PackageName) : Promise<RepoStats> => {
    const result = await fetch(BASE_GITHUB_API_URL + packageName)
    const data: any  = await result.json()

    return {
        forks: data.forks,
        stars: data.stars,
        watchers: data.watchers,
        openIssues: data.stargazers_count,
        updatedAt: data.updated_at
    }

}
