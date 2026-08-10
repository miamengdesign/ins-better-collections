// Every exported Figma asset lives in /public/images (or /public/references, for the
// one flattened reference mockup used directly) with spaces in its filename — this
// centralizes the encoding so components just pass the plain name from ASSET_MANIFEST.md.
export const img = (name, folder = 'images') => `/${folder}/${encodeURIComponent(name)}`
