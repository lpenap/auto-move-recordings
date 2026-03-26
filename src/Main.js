/**
 * Main entry point — called by the time-based trigger.
 * Run this function manually to test outside the trigger schedule.
 */
function main() {
  if (!isWithinTimeWindow()) {
    log('Outside time window (%s–%s). Skipping run.', CONFIG.timeWindow.startHour, CONFIG.timeWindow.endHour);
    return;
  }

  log('=== Starting recording scan ===');

  const sourceFolder = getSourceFolder();
  if (!sourceFolder) {
    log('ERROR: Source folder not found. Check sourceFolderId in config.json: "%s"', CONFIG.sourceFolderId);
    return;
  }

  const files = getUnprocessedFiles(sourceFolder);
  log('Found %s unprocessed file(s).', files.length);

  let moved = 0;
  let skipped = 0;

  files.forEach(function (file) {
    try {
      const result = processFile(file);
      if (result) moved++;
      else skipped++;
    } catch (e) {
      log('ERROR processing "%s": %s', file.getName(), e.message);
    }
  });

  log('Done. Moved: %s | Skipped (no match): %s', moved, skipped);
}

/**
 * Attempts to find a matching calendar event and move the file.
 * Returns true if the file was moved, false if skipped.
 */
function processFile(file) {
  const createdTime = file.getDateCreated();

  const event = findMatchingCalendarEvent(createdTime);
  if (!event) {
    log('No calendar event found near "%s" (created %s). Skipping.', file.getName(), createdTime);
    markAsProcessed(file.getId()); // mark so we don't retry endlessly
    return false;
  }

  const rule = matchRule(event.getTitle());
  if (!rule) {
    log('No rule matched event "%s". Leaving "%s" in place.', event.getTitle(), file.getName());
    markAsProcessed(file.getId());
    return false;
  }

  const yearFolder = getOrCreateYearFolder(rule.destinationFolderId, createdTime);
  moveFile(file, yearFolder);
  markAsProcessed(file.getId());

  log(
    'Moved "%s" → event "%s" → %s/%s/',
    file.getName(),
    event.getTitle(),
    rule.destinationFolderId,
    createdTime.getFullYear()
  );
  return true;
}

/**
 * Returns true if the current hour is within the configured time window.
 * Uses the timezone set in Apps Script Project Settings.
 */
function isWithinTimeWindow() {
  const hour = parseInt(Utilities.formatDate(new Date(), getUserTimezone(), 'H'), 10);
  return hour >= CONFIG.timeWindow.startHour && hour < CONFIG.timeWindow.endHour;
}
