/**
 * Shared utilities.
 */

/**
 * Matches an event title against the configured rules (in order).
 * Returns the first matching rule, or null if none match.
 *
 * @param {string} eventTitle
 * @returns {{eventNamePattern: string|RegExp, destinationFolderId: string}|null}
 */
function matchRule(eventTitle) {
  for (var i = 0; i < CONFIG.rules.length; i++) {
    var rule    = CONFIG.rules[i];
    var pattern = rule.eventNamePattern;

    if (pattern instanceof RegExp) {
      if (pattern.test(eventTitle)) return rule;
    } else {
      // String: case-insensitive substring match
      if (eventTitle.toLowerCase().includes(pattern.toLowerCase())) return rule;
    }
  }
  return null;
}

/**
 * Extracts the meeting title from a Google Meet recording file name.
 *
 * Meet names recordings as:
 *   "<Meeting Title> - <YYYY/MM/DD HH:mm GMT±HH:mm> - Recording"
 * e.g. "Monthly Review - 2026/01/15 10:00 GMT-03:00 - Recording"
 *
 * This is the authoritative source of the meeting title — far more reliable
 * than matching a calendar event by time proximity, which breaks when more
 * than one meeting falls in the lookback window.
 *
 * @param {string} fileName
 * @returns {string|null} the meeting title, or null if the name doesn't match the pattern
 */
function parseEventTitleFromFileName(fileName) {
  // Strip the trailing " - <YYYY/MM/DD HH:mm ...>" portion; keep everything before it.
  var match = /^(.+?) - \d{4}\/\d{2}\/\d{2} \d{2}:\d{2}\b/.exec(fileName || '');
  return match ? match[1].trim() : null;
}

// Cached timezone from the user's Google account — resolved once per execution.
var _timezone = null;

/**
 * Returns the timezone from the user's Google account (via their default calendar).
 * Falls back to the script project timezone if unavailable.
 * @returns {string}
 */
function getUserTimezone() {
  if (!_timezone) {
    try {
      _timezone = CalendarApp.getDefaultCalendar().getTimeZone();
    } catch (e) {
      _timezone = Session.getScriptTimeZone();
    }
  }
  return _timezone;
}

/**
 * Logs a formatted message with a timestamp prefix.
 * Supports printf-style placeholders: %s
 *
 * @param {string} message
 * @param {...*} args
 */
function log(message) {
  var args = Array.prototype.slice.call(arguments, 1);
  var formatted = message.replace(/%s/g, function () {
    return args.length > 0 ? args.shift() : '%s';
  });

  var timestamp = Utilities.formatDate(new Date(), getUserTimezone(), 'yyyy-MM-dd HH:mm:ss');
  console.log('[' + timestamp + '] ' + formatted);
}

// Node.js compatibility — ignored by Apps Script
if (typeof module !== 'undefined') {
  module.exports = {
    matchRule: matchRule,
    parseEventTitleFromFileName: parseEventTitleFromFileName,
    getUserTimezone: getUserTimezone,
    log: log,
  };
}
