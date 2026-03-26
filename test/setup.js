/**
 * Test setup — defines Google Apps Script globals as stubs.
 * Individual tests override specific methods with jest.fn() as needed.
 *
 * Config.js is NOT loaded here — tests set global.CONFIG directly.
 * Source files are loaded via require() in each test file.
 */

global.Utilities = {
  formatDate: () => '12',
};

global.Session = {
  getScriptTimeZone: () => 'America/New_York',
};

global.CalendarApp = {
  getDefaultCalendar: () => ({ getTimeZone: () => 'America/New_York' }),
  getCalendarById:    () => ({ getEvents: () => [] }),
};

global.DriveApp = {
  getFolderById:    () => ({ getFiles: () => ({ hasNext: () => false }), getFoldersByName: () => ({ hasNext: () => false }), createFolder: () => ({}) }),
  getFoldersByName: () => ({ hasNext: () => false }),
};

global.PropertiesService = {
  getScriptProperties: () => ({
    getProperty:    () => null,
    setProperty:    () => {},
    deleteProperty: () => {},
    getProperties:  () => ({}),
  }),
};

global.ScriptApp = {
  newTrigger:         () => ({ timeBased: () => ({ everyMinutes: () => ({ create: () => {} }) }) }),
  getProjectTriggers: () => [],
  deleteTrigger:      () => {},
};

global.CONFIG = {
  sourceFolderId:        'test-source-folder-id',
  calendarId:            'test@example.com',
  calendarLookbackHours: 4,
  pollIntervalMinutes:   5,
  timeWindow:            { startHour: 9, endHour: 18 },
  rules:                 [],
};
