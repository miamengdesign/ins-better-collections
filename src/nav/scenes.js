/**
 * Phase-1 cinematic scene graph
 * (Hero → Why → CE → Solutions 1–3 → Prototype → Behind 1–2 → Wrap 1–2).
 * Wrap Up scene 3 remains for a later migration.
 */

/** @typedef {{ id: string, label: string, enterMs: number }} SceneDef */

/** Resting scenes. `enterMs` is the timeline duration when arriving FROM the previous scene. */
export const SCENES = [
  { id: 'hero', label: 'Hero', enterMs: 0 },
  { id: 'why-title', label: 'Why Collection — title', enterMs: 1200 },
  { id: 'why-1', label: 'Why Collection — statement 1', enterMs: 1100 },
  { id: 'why-2', label: 'Why Collection — statement 2', enterMs: 1100 },
  { id: 'why-3', label: 'Why Collection — statement 3', enterMs: 1100 },
  { id: 'why-4', label: 'Why Collection — statement 4', enterMs: 1100 },
  {
    id: 'ce-1',
    label: 'Current Experience — state 1',
    enterMs: 2600, // full §02→03 handoff choreography
  },
  {
    id: 'ce-2',
    label: 'Current Experience — state 2',
    enterMs: 1100,
  },
  {
    id: 'ce-3',
    label: 'Current Experience — state 3',
    enterMs: 1100,
  },
  {
    id: 'sol-1',
    label: 'Solutions — state 1',
    enterMs: 2800, // full §03→04 handoff choreography
  },
  {
    id: 'sol-2',
    label: 'Solutions — state 2',
    enterMs: 1100,
  },
  {
    id: 'sol-3',
    label: 'Solutions — state 3',
    enterMs: 1100,
  },
  {
    id: 'proto',
    label: 'Prototype',
    enterMs: 1600, // §04→05 physical panel push
  },
  {
    id: 'behind-1',
    label: 'Behind the Work — state 1',
    enterMs: 2200, // §05→06 layered exit → collage
  },
  {
    id: 'behind-2',
    label: 'Behind the Work — state 2',
    enterMs: 2000, // dark-cloth veil + statement
  },
  {
    id: 'wrap-1',
    label: 'Wrap Up — scene 1',
    enterMs: 2600, // §06→07: statement out → bg → beat → text
  },
  {
    id: 'wrap-2',
    label: 'Wrap Up — scene 2',
    enterMs: 1600, // statement rises; “If I had more time…” fades in
  },
]

export const SCENE_INDEX = Object.fromEntries(
  SCENES.map((scene, index) => [scene.id, index]),
)

export const LAST_CINEMATIC_INDEX = SCENES.length - 1

export function sceneById(id) {
  return SCENES[SCENE_INDEX[id]]
}
