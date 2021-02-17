import { stringifyObjectKeys } from '../src/utils';

describe('stringifyObjectKeys', () => {
  it('stringifies all keys that are objects', () => {
    expect(
      stringifyObjectKeys({
        string: 'foo',
        number: 3,
        boolean: true,
        object: { a: 'a' },
      }),
    ).toEqual({
      string: 'foo',
      number: 3,
      boolean: true,
      object: `{
  "a": "a"
}`,
    });
  });
});
