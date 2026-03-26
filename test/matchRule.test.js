const { matchRule } = require('../src/Utils.js');

beforeEach(() => {
  global.CONFIG = {
    ...global.CONFIG,
    rules: [
      { eventNamePattern: 'Weekly Standup',  destinationFolderId: 'folder-standup' },
      { eventNamePattern: /client.*review/i, destinationFolderId: 'folder-client'  },
      { eventNamePattern: 'Dev Monthly',     destinationFolderId: 'folder-dev'     },
    ],
  };
});

describe('string patterns', () => {
  test('exact match', () => {
    expect(matchRule('Weekly Standup')).toMatchObject({ destinationFolderId: 'folder-standup' });
  });

  test('case-insensitive match', () => {
    expect(matchRule('weekly standup')).toMatchObject({ destinationFolderId: 'folder-standup' });
    expect(matchRule('WEEKLY STANDUP')).toMatchObject({ destinationFolderId: 'folder-standup' });
  });

  test('substring match', () => {
    expect(matchRule('Team Weekly Standup — Q1')).toMatchObject({ destinationFolderId: 'folder-standup' });
    expect(matchRule('Dev Monthly — March 2026')).toMatchObject({ destinationFolderId: 'folder-dev' });
  });

  test('no match returns null', () => {
    expect(matchRule('Random All-Hands')).toBeNull();
    expect(matchRule('')).toBeNull();
  });
});

describe('regex patterns', () => {
  test('regex match', () => {
    expect(matchRule('Client Quarterly Review')).toMatchObject({ destinationFolderId: 'folder-client' });
    expect(matchRule('client review')).toMatchObject({ destinationFolderId: 'folder-client' });
    expect(matchRule('CLIENT ANNUAL REVIEW')).toMatchObject({ destinationFolderId: 'folder-client' });
  });

  test('no regex match', () => {
    expect(matchRule('Client Kickoff')).toBeNull();
  });
});

describe('rule priority', () => {
  test('first matching rule wins', () => {
    global.CONFIG.rules = [
      { eventNamePattern: 'Monthly',     destinationFolderId: 'folder-first'  },
      { eventNamePattern: 'Dev Monthly', destinationFolderId: 'folder-second' },
    ];
    expect(matchRule('Dev Monthly')).toMatchObject({ destinationFolderId: 'folder-first' });
  });
});
