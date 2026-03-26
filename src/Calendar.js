/**
 * Calendar utilities — finding the meeting event that belongs to a recording.
 */

/**
 * Given the time a recording file appeared in Drive, searches the configured
 * calendar for the most likely associated Google Meet event.
 *
 * Strategy: recordings appear in Drive minutes-to-hours after the meeting ends
 * due to processing. We look back CONFIG.calendarLookbackHours from the file's
 * creation time and find Meet events that ended in that window.
 *
 * @param {Date} fileCreatedTime
 * @returns {GoogleAppsScript.Calendar.CalendarEvent|null}
 */
function findMatchingCalendarEvent(fileCreatedTime) {
  const calendar = CalendarApp.getCalendarById(CONFIG.calendarId);
  if (!calendar) {
    throw new Error('Calendar not found: ' + CONFIG.calendarId + '. Check your calendarId in Config.js.');
  }

  const searchStart = new Date(fileCreatedTime.getTime() - CONFIG.calendarLookbackHours * 60 * 60 * 1000);
  const searchEnd   = new Date(fileCreatedTime.getTime() + 15 * 60 * 1000); // small forward buffer

  const events = calendar.getEvents(searchStart, searchEnd);

  // Prefer events with a Google Meet link (most reliable match)
  const meetEvents = events.filter(hasMeetLink);

  const candidates = meetEvents.length > 0 ? meetEvents : events;
  if (candidates.length === 0) return null;

  // Pick the event whose end time is closest to (but before) the recording creation time
  const sorted = candidates.slice().sort(function (a, b) {
    const distA = Math.abs(fileCreatedTime - a.getEndTime());
    const distB = Math.abs(fileCreatedTime - b.getEndTime());
    return distA - distB;
  });

  return sorted[0];
}

/**
 * Returns true if the calendar event appears to be a Google Meet event,
 * by checking for a meet.google.com link in the description or location.
 *
 * @param {GoogleAppsScript.Calendar.CalendarEvent} event
 * @returns {boolean}
 */
function hasMeetLink(event) {
  try {
    const description = event.getDescription() || '';
    const location    = event.getLocation()    || '';
    return description.includes('meet.google.com') || location.includes('meet.google.com');
  } catch (e) {
    return false;
  }
}

// Node.js compatibility — ignored by Apps Script
if (typeof module !== 'undefined') {
  module.exports = { findMatchingCalendarEvent: findMatchingCalendarEvent, hasMeetLink: hasMeetLink };
}
