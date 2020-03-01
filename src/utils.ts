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

/**
 * Omit empty values from an object
 * @param target
 */
export const trimObject = (target: any): object => {
  if (isEmpty(target)) return {};

  return Object.keys(target)
    .filter((key: string) => target?.[key])
    .reduce((a: object, key: string): object => ({
      ...a,
      [key]: target[key],
    }), {});
};
