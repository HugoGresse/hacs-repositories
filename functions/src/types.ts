import { DateTime } from 'luxon'

export type PackageName = string
export type PackageFullName = string
export type CategoryKey = string
export type CategoryName = string
export type Category = {
    key: CategoryKey
    name: CategoryName
}
export type Package = {
    name: PackageName
    fullName: PackageFullName
    stats?: RepoStats
    info?: RepoInfo
}
export type PackagesByCategory = { category: Category; packages: Package[] }
export type RepoStats = {
    stars: number
    forks: number
    watchers: number
    openIssues: number
    updatedAt: string
    updatedAtLuxon?: DateTime
    createdAt: string
    createdAtLuxon?: DateTime
}
export type RepoInfo = {
    description: string
    license?: string
    url: string
    homepageUrl: string
}

export enum Status {
    UPDATING = 'updating',
    UPDATED = 'updated',
}
