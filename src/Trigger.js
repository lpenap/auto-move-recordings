/**
 * Trigger management.
 *
 * Run setupTrigger() once from the Apps Script editor to install the
 * time-based trigger. Run teardownTrigger() to remove it.
 *
 * The trigger interval is set by CONFIG.pollIntervalMinutes.
 * Allowed values: 1, 5, 10, 15, 30 (Apps Script limitation).
 */

const TRIGGER_FUNCTION_NAME = 'main';

/**
 * Installs a time-based trigger that calls main() every N minutes.
 * Safe to call multiple times — removes any existing trigger first.
 */
function setupTrigger() {
  teardownTrigger(); // avoid duplicates

  const intervalMinutes = CONFIG.pollIntervalMinutes;
  const allowed = [1, 5, 10, 15, 30];
  if (allowed.indexOf(intervalMinutes) === -1) {
    throw new Error(
      'pollIntervalMinutes must be one of: ' + allowed.join(', ') +
      '. Got: ' + intervalMinutes
    );
  }

  ScriptApp.newTrigger(TRIGGER_FUNCTION_NAME)
    .timeBased()
    .everyMinutes(intervalMinutes)
    .create();

  log('Trigger created: %s() every %s minute(s).', TRIGGER_FUNCTION_NAME, intervalMinutes);
}

/**
 * Removes all triggers for the main() function.
 */
function teardownTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  let removed = 0;

  triggers.forEach(function (trigger) {
    if (trigger.getHandlerFunction() === TRIGGER_FUNCTION_NAME) {
      ScriptApp.deleteTrigger(trigger);
      removed++;
    }
  });

  if (removed > 0) {
    log('Removed %s existing trigger(s).', removed);
  }
}

/**
 * Prints the status of the current trigger to the Apps Script log.
 * Run from the editor to verify setup.
 */
function triggerStatus() {
  const triggers = ScriptApp.getProjectTriggers()
    .filter(function (t) { return t.getHandlerFunction() === TRIGGER_FUNCTION_NAME; });

  if (triggers.length === 0) {
    log('No trigger installed. Run setupTrigger() to install one.');
    return;
  }

  triggers.forEach(function (t) {
    log(
      'Trigger: %s() | type: %s | interval: every %s min',
      t.getHandlerFunction(),
      t.getEventType(),
      CONFIG.pollIntervalMinutes
    );
  });
}
