type FalsyValues = undefined | null | false;
/**
 * Throws on falsy value (including 0) to give a T without FalsyValues
 */
export function assert<T>(value: T | FalsyValues, errorMessage = ''): asserts value is T {
  if (!value) {
    throw new Error(`assert: ${errorMessage} (${value})`);
  }
}
