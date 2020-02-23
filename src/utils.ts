/**
 * Check if an object is empty
 * @param target
 */
export const isEmpty = (target?: object): boolean => (
  target == null || !(Object.keys(target) || target).length
);

/**
 * Nicely format an object
 * @param target
 */
export const stringifyObject = (target: any): string => (
  JSON.stringify(target, null, 2)
);
