/**
 * Narrow an unknown thrown value to a human-readable message without using `any`.
 */
export const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Unknown error';
