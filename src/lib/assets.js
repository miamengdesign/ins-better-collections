// `/public/images` is the runtime source of truth. Every runtime asset is a PNG
// nested in a per-section folder (`<Section> asset/<file>.png`), so each path
// segment is encoded separately — the folder separators must survive.
//
// This helper can only build `/images` paths on purpose: `/references` holds
// visual reference snapshots for design QA and must never be rendered at runtime.
export const img = (path) => `/images/${path.split('/').map(encodeURIComponent).join('/')}`
