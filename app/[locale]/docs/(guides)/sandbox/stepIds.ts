/**
 * The step ids, in page order. A numeral or a letter, never a word.
 *
 * Its own module on purpose: `SetupSteps.tsx` is a client component, and a const
 * imported from a `'use client'` file by a server page is a client REFERENCE, not
 * the array (a production build failed with `STEP_IDS.map is not a function`;
 * Vitest does not enforce the boundary, so no unit test caught it).
 */
export const STEP_IDS = ['1', '2', '2a', '2b', '2c', '3', '4', '5'] as const
export type StepId = (typeof STEP_IDS)[number]
