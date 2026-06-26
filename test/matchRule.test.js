const { matchRule, parseEventTitleFromFileName } = require('../src/Utils.js');

beforeEach(() => {
  global.CONFIG = {
    ...global.CONFIG,
    rules: [
      { eventNamePattern: 'Weekly Standup',  destinationFolderId: 'folder-standup' },
      { eventNamePattern: /client.*review/i, destinationFolderId: 'folder-client'  },
      { eventNamePattern: 'Monthly Review',   destinationFolderId: 'folder-dev'     },
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
    expect(matchRule('Monthly Review — March 2026')).toMatchObject({ destinationFolderId: 'folder-dev' });
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

describe('parseEventTitleFromFileName', () => {
  test('extracts title from a standard Meet recording name', () => {
    expect(parseEventTitleFromFileName('Monthly Review - 2026/01/15 10:00 GMT-03:00 - Recording'))
      .toBe('Monthly Review');
  });

  test('keeps hyphens that are part of the title', () => {
    expect(parseEventTitleFromFileName('Client - Review - 2026/06/24 09:30 GMT-03:00 - Recording'))
      .toBe('Client - Review');
  });

  test('parsed title feeds matchRule correctly', () => {
    const title = parseEventTitleFromFileName('Monthly Review - 2026/01/15 10:00 GMT-03:00 - Recording');
    expect(matchRule(title)).toMatchObject({ destinationFolderId: 'folder-dev' });
  });

  test('returns null for a name not in Meet format', () => {
    expect(parseEventTitleFromFileName('random-video.mp4')).toBeNull();
    expect(parseEventTitleFromFileName('')).toBeNull();
    expect(parseEventTitleFromFileName(null)).toBeNull();
  });
});

describe('rule priority', () => {
  test('first matching rule wins', () => {
    global.CONFIG.rules = [
      { eventNamePattern: 'Monthly',     destinationFolderId: 'folder-first'  },
      { eventNamePattern: 'Monthly Review', destinationFolderId: 'folder-second' },
    ];
    expect(matchRule('Monthly Review')).toMatchObject({ destinationFolderId: 'folder-first' });
  });
});
