/**
 * Standard action result type for server actions
 * Use this instead of throwing raw errors for better client-side handling
 */

export type ActionResult<T = void> =
  { success: true; data: T } | { success: false; error: string };

/**
 * Helper to create a success result
 */
export function actionSuccess<T = void>(data?: T): ActionResult<T> {
  return { success: true, data: data as T };
}

/**
 * Helper to create an error result
 */
export function actionError<T = void>(message: string): ActionResult<T> {
  return { success: false, error: message };
}
