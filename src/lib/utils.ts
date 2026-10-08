/**
 * Shewa Fashion - Utility Functions
 * Lightweight helper utilities without extraneous third-party dependencies.
 */

/**
 * Combines conditional class names into a single clean string.
 */
export function cn(
  ...inputs: (string | undefined | null | false | 0)[]
): string {
  return inputs.filter(Boolean).join(" ");
}
