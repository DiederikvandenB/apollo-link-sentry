export function stringifyObjectKeys(
  object: Record<string, unknown>,
): Record<string, unknown> {
  const stringified: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(object)) {
    stringified[key] = typeof value === 'object' ? stringify(value) : value;
  }

  return stringified;
}

export function stringify(value: unknown): string {
  return JSON.stringify(value, null, 2);
}
