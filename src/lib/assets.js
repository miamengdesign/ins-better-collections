// Every exported Figma asset lives in /public/images with spaces in its filename —
// this centralizes the encoding so components just pass the plain name from ASSET_MANIFEST.md.
export const img = (name) => `/images/${encodeURIComponent(name)}`
