/**
 * Phase-1 cinematic scene graph (Hero → Why → CE states 1–3).
 * Later sections append here in future migrations.
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
]

export const SCENE_INDEX = Object.fromEntries(
  SCENES.map((scene, index) => [scene.id, index]),
)

export const LAST_CINEMATIC_INDEX = SCENES.length - 1

export function sceneById(id) {
  return SCENES[SCENE_INDEX[id]]
}
