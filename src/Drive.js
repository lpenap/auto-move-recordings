/**
 * Drive utilities — file scanning, folder creation, and moving.
 * Supports both My Drive and Shared Drives.
 */

/**
 * Returns the source folder by ID.
 * @returns {GoogleAppsScript.Drive.Folder|null}
 */
function getSourceFolder() {
  try {
    return DriveApp.getFolderById(CONFIG.sourceFolderId);
  } catch (e) {
    return null;
  }
}

/**
 * Returns all files in the source folder that have not yet been processed.
 * Only includes video files (mp4) to avoid acting on other Drive files.
 *
 * @param {GoogleAppsScript.Drive.Folder} folder
 * @returns {GoogleAppsScript.Drive.File[]}
 */
function getUnprocessedFiles(folder) {
  const results = [];
  const iterator = folder.getFiles();

  while (iterator.hasNext()) {
    const file = iterator.next();
    const mimeType = file.getMimeType();

    // Meet recordings are mp4 video files
    if (mimeType !== 'video/mp4') continue;
    if (isProcessed(file.getId())) continue;

    results.push(file);
  }

  return results;
}

/**
 * Gets or creates a year subfolder (e.g. '2026') inside the destination folder.
 * Works with both My Drive and Shared Drive destination folders.
 *
 * @param {string} destinationFolderId
 * @param {Date} date
 * @returns {GoogleAppsScript.Drive.Folder}
 */
function getOrCreateYearFolder(destinationFolderId, date) {
  const destFolder = DriveApp.getFolderById(destinationFolderId);
  const yearStr    = date.getFullYear().toString();

  const existing = destFolder.getFoldersByName(yearStr);
  if (existing.hasNext()) return existing.next();

  log('Creating year subfolder "%s" in destination.', yearStr);
  return destFolder.createFolder(yearStr);
}

/**
 * Moves a file to the target folder.
 * Uses DriveApp.moveTo which supports cross-drive moves (My Drive → Shared Drive).
 *
 * @param {GoogleAppsScript.Drive.File} file
 * @param {GoogleAppsScript.Drive.Folder} targetFolder
 */
function moveFile(file, targetFolder) {
  file.moveTo(targetFolder);
}

// ---------------------------------------------------------------------------
// Processed-file tracking via PropertiesService
// Each processed file ID is stored as a separate property key to avoid
// hitting the 9 KB per-value limit.
// ---------------------------------------------------------------------------

const PROCESSED_KEY_PREFIX = 'proc_';

/**
 * Marks a file ID as processed so it won't be retried on the next run.
 * @param {string} fileId
 */
function markAsProcessed(fileId) {
  PropertiesService.getScriptProperties()
    .setProperty(PROCESSED_KEY_PREFIX + fileId, new Date().toISOString());
}

/**
 * Returns true if this file ID has already been processed.
 * @param {string} fileId
 * @returns {boolean}
 */
function isProcessed(fileId) {
  return PropertiesService.getScriptProperties()
    .getProperty(PROCESSED_KEY_PREFIX + fileId) !== null;
}

/**
 * Utility: lists all files in the source folder with their MIME types.
 * Run manually to diagnose why a file isn't being picked up.
 */
function debugSourceFolder() {
  const folder = getSourceFolder();
  if (!folder) { log('Source folder not found: "%s"', CONFIG.sourceFolderName); return; }

  const iterator = folder.getFiles();
  let count = 0;
  while (iterator.hasNext()) {
    const file = iterator.next();
    log('[%s] mime="%s" processed=%s name="%s"',
      ++count, file.getMimeType(), isProcessed(file.getId()), file.getName());
  }
  if (count === 0) log('No files found in "%s"', CONFIG.sourceFolderName);
}

/**
 * Utility: clears all processed-file records.
 * Run manually from the Apps Script editor if you need to reprocess files.
 */
function clearProcessedFiles() {
  const props = PropertiesService.getScriptProperties().getProperties();
  const keys  = Object.keys(props).filter(function (k) { return k.startsWith(PROCESSED_KEY_PREFIX); });
  keys.forEach(function (k) { PropertiesService.getScriptProperties().deleteProperty(k); });
  log('Cleared %s processed-file record(s).', keys.length);
}
