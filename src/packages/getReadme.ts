import DOMPurify from 'dompurify'
import { PackageFullName } from '../types'

const cache = new Map<PackageFullName, Promise<string>>()

// Fetches the README rendered to HTML by GitHub (unauthenticated: 60 requests/hour per visitor IP),
// sanitizes it and rewrites relative links and images so they resolve against the repository.
export const getReadme = (fullName: PackageFullName): Promise<string> => {
    const cached = cache.get(fullName)
    if (cached) return cached

    const promise = fetchReadme(fullName)
    cache.set(fullName, promise)
    promise.catch(() => cache.delete(fullName))
    return promise
}

const fetchReadme = async (fullName: PackageFullName): Promise<string> => {
    const response = await fetch(`https://api.github.com/repos/${fullName}/readme`, {
        headers: { Accept: 'application/vnd.github.html+json' },
    })
    if (response.status === 404) {
        throw new Error('This repository has no README.')
    }
    if (response.status === 403 || response.status === 429) {
        throw new Error('GitHub rate limit reached, try again later or open the README on GitHub.')
    }
    if (!response.ok) {
        throw new Error(`Failed to load the README (status ${response.status}).`)
    }

    const html = await response.text()
    const readmePath = new DOMParser().parseFromString(html, 'text/html').querySelector('[data-path]')?.getAttribute('data-path') ?? 'README.md'
    return sanitizeReadme(html, fullName, readmePath)
}

const sanitizeReadme = (html: string, fullName: PackageFullName, readmePath: string): string => {
    const blobBase = `https://github.com/${fullName}/blob/HEAD/${readmePath}`
    const rawBase = `https://raw.githubusercontent.com/${fullName}/HEAD/${readmePath}`

    const rewrite = (node: Element) => {
        const href = node.getAttribute('href')
        if (href && !href.startsWith('#')) {
            node.setAttribute('href', resolveUrl(href, blobBase))
            node.setAttribute('target', '_blank')
            node.setAttribute('rel', 'noopener noreferrer')
        }
        const src = node.getAttribute('src')
        if (src) {
            node.setAttribute('src', resolveUrl(src, rawBase))
        }
    }

    DOMPurify.addHook('afterSanitizeAttributes', rewrite)
    try {
        return DOMPurify.sanitize(html, { ADD_ATTR: ['target'] })
    } finally {
        DOMPurify.removeHook('afterSanitizeAttributes')
    }
}

const resolveUrl = (url: string, base: string): string => {
    try {
        return new URL(url, base).toString()
    } catch {
        return url
    }
}
