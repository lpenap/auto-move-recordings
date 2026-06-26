# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

_Nothing yet._

## [1.1.0] - 2026-06-26

### Changed
- Recordings are now identified by the meeting title parsed from the file name
  (Meet names recordings `<Title> - <date> - Recording`) instead of by picking
  the calendar event whose end time is closest to the file's creation time. The
  calendar lookup is kept only as a fallback for file names not in Meet's format.

### Added
- `debugMatch(fileName)` utility — previews the meeting title parsed from a
  recording name and which rule it matches, without moving files or hitting the
  calendar.

### Fixed
- A recording was left in place when more than one meeting fell inside the
  calendar lookback window: the time-proximity heuristic could match the wrong
  overlapping event, which then matched no rule. File-name matching resolves this.

### Security
- Replaced real private meeting names with generic examples in docs and tests
  (this is a public repository).

## [1.0.0] - 2026-03-26

### Added
- Initial release: Google Apps Script that auto-moves Google Meet recordings
  from a source Drive folder into per-rule destination folders, organized by
  year (`destination/YYYY/`).
- Rule-driven configuration in `config.json` with `eventNamePattern` support for
  case-insensitive substring matches and `/regex/flags` patterns; first match wins.
- Time-window guard so scans only run during configured office hours, using the
  timezone from the user's Google account.
- Source folder selected by ID (`sourceFolderId`) rather than name.
- Processed-file tracking via `PropertiesService` so files are never moved twice.
- Support for both My Drive and Shared Drive destinations.
- Utilities: `setupTrigger`, `teardownTrigger`, `triggerStatus`,
  `clearProcessedFiles`, `debugSourceFolder`.
- Local Jest test suite (rule matching, time window, calendar lookup, build
  serialization) with stubbed Apps Script globals — no deployment required.
- `build.js` to generate `src/Config.js` from `config.json`.

[Unreleased]: https://github.com/lpenap/auto-move-recordings/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/lpenap/auto-move-recordings/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/lpenap/auto-move-recordings/releases/tag/v1.0.0
