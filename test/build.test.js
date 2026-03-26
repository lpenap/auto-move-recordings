const { serializePattern } = require('../build.js');

describe('serializePattern', () => {
  test('plain string is JSON-quoted', () => {
    expect(serializePattern('Dev Monthly')).toBe('"Dev Monthly"');
  });

  test('regex string becomes a RegExp literal', () => {
    expect(serializePattern('/client.*review/i')).toBe('/client.*review/i');
  });

  test('regex literal has no surrounding quotes', () => {
    expect(serializePattern('/client.*review/i')).not.toMatch(/^"/);
    expect(serializePattern('/client.*review/i')).not.toMatch(/"$/);
  });

  test('regex without flags works', () => {
    expect(serializePattern('/standup/')).toBe('/standup/');
  });

  test('plain string with slashes is not confused for regex', () => {
    expect(serializePattern('not/a/regex')).toBe('"not/a/regex"');
  });
});
