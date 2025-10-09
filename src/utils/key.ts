export function buildCacheKey(
    prefix: string,
    params: Record<string, any>
): string {
    const keyParts = [prefix]

    for (const [key, value] of Object.entries(params)) {
        keyParts.push(`${key}_${value ?? 'none'} `)
    }

    return keyParts.join('_')
}
