const { hasMeetLink, findMatchingCalendarEvent } = require('../src/Calendar.js');

beforeEach(() => {
  global.CONFIG = { ...global.CONFIG, calendarId: 'test@example.com', calendarLookbackHours: 4 };
});

describe('hasMeetLink', () => {
  test('detects meet link in description', () => {
    const event = { getDescription: () => 'Join at https://meet.google.com/abc-def-ghi', getLocation: () => '' };
    expect(hasMeetLink(event)).toBe(true);
  });

  test('detects meet link in location', () => {
    const event = { getDescription: () => '', getLocation: () => 'meet.google.com/xyz-uvw' };
    expect(hasMeetLink(event)).toBe(true);
  });

  test('returns false when no meet link', () => {
    const event = { getDescription: () => 'Regular notes', getLocation: () => 'Conference Room A' };
    expect(hasMeetLink(event)).toBe(false);
  });

  test('handles exceptions gracefully', () => {
    const event = {
      getDescription: () => { throw new Error('API error'); },
      getLocation:    () => { throw new Error('API error'); },
    };
    expect(hasMeetLink(event)).toBe(false);
  });
});

describe('findMatchingCalendarEvent', () => {
  const fileTime = new Date('2026-03-25T11:00:00Z');

  test('throws when calendar not found', () => {
    global.CalendarApp.getCalendarById = jest.fn(() => null);
    expect(() => findMatchingCalendarEvent(fileTime)).toThrow('Calendar not found');
  });

  test('returns null when no events found', () => {
    global.CalendarApp.getCalendarById = jest.fn(() => ({ getEvents: () => [] }));
    expect(findMatchingCalendarEvent(fileTime)).toBeNull();
  });

  test('prefers event with Meet link over one without', () => {
    const withMeet    = { getDescription: () => 'meet.google.com/abc', getLocation: () => '', getEndTime: () => new Date('2026-03-25T10:50:00Z') };
    const withoutMeet = { getDescription: () => 'No link',            getLocation: () => '', getEndTime: () => new Date('2026-03-25T10:55:00Z') };
    global.CalendarApp.getCalendarById = jest.fn(() => ({ getEvents: () => [withoutMeet, withMeet] }));
    expect(findMatchingCalendarEvent(fileTime)).toBe(withMeet);
  });

  test('picks event whose end time is closest to file creation time', () => {
    const closer  = { getDescription: () => 'meet.google.com/a', getLocation: () => '', getEndTime: () => new Date('2026-03-25T10:55:00Z') };
    const farther = { getDescription: () => 'meet.google.com/b', getLocation: () => '', getEndTime: () => new Date('2026-03-25T08:00:00Z') };
    global.CalendarApp.getCalendarById = jest.fn(() => ({ getEvents: () => [farther, closer] }));
    expect(findMatchingCalendarEvent(fileTime)).toBe(closer);
  });

  test('falls back to non-Meet events when no Meet events found', () => {
    const event = { getDescription: () => 'No link', getLocation: () => '', getEndTime: () => new Date('2026-03-25T10:50:00Z') };
    global.CalendarApp.getCalendarById = jest.fn(() => ({ getEvents: () => [event] }));
    expect(findMatchingCalendarEvent(fileTime)).toBe(event);
  });
});
