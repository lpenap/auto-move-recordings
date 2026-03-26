// getUserTimezone is a cross-file dependency — expose it as a global before requiring Main.js
const { getUserTimezone } = require('../src/Utils.js');
global.getUserTimezone = getUserTimezone;

const { isWithinTimeWindow } = require('../src/Main.js');

beforeEach(() => {
  global.CONFIG = { ...global.CONFIG, timeWindow: { startHour: 9, endHour: 18 } };
  global.Utilities.formatDate = jest.fn();
  // Mock getUserTimezone to return a fixed timezone (avoids CalendarApp call)
  global.getUserTimezone = jest.fn(() => 'America/New_York');
});

test('returns true within window', () => {
  global.Utilities.formatDate.mockReturnValue('10');
  expect(isWithinTimeWindow()).toBe(true);
});

test('returns true at startHour (inclusive)', () => {
  global.Utilities.formatDate.mockReturnValue('9');
  expect(isWithinTimeWindow()).toBe(true);
});

test('returns false at endHour (exclusive)', () => {
  global.Utilities.formatDate.mockReturnValue('18');
  expect(isWithinTimeWindow()).toBe(false);
});

test('returns false before window', () => {
  global.Utilities.formatDate.mockReturnValue('7');
  expect(isWithinTimeWindow()).toBe(false);
});

test('returns false after window', () => {
  global.Utilities.formatDate.mockReturnValue('22');
  expect(isWithinTimeWindow()).toBe(false);
});

test('respects custom time window', () => {
  global.CONFIG.timeWindow = { startHour: 8, endHour: 20 };
  global.Utilities.formatDate.mockReturnValue('19');
  expect(isWithinTimeWindow()).toBe(true);
});
