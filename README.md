# auto-move-recordings

A Google Apps Script that automatically moves Google Meet recordings from your
Drive to configured destination folders (including Shared Drives), organized by
year, based on matching calendar event names.

## How it works

1. A time-based trigger runs `main()` every N minutes, **only during your configured hours**.
2. It scans the configured source folder (by ID) for unprocessed video files.
3. For each recording, it searches your calendar for a Google Meet event that
   ended near the file's creation time.
4. The event title is matched against your configured rules (first match wins).
5. The file is moved to `destinationFolder/YYYY/` — no rename, original filename kept.
6. Processed files are tracked so they're never moved twice.

The time window check uses the timezone from your Google account automatically —
no manual timezone configuration required.

---

## Setup

### Prerequisites

- A Google account with Google Meet recording enabled
- [Node.js](https://nodejs.org) >= 16
- [clasp](https://github.com/google/clasp) — Google's Apps Script CLI

```bash
npm install -g @google/clasp
```

---

### Step 1 — Create the Apps Script project

1. Go to [script.google.com](https://script.google.com)
2. Click **New project**
3. In the editor, go to **Project Settings** (gear icon)
4. Copy the **Script ID** — you'll need it in Step 3

---

### Step 2 — Clone and log in

```bash
git clone <this-repo>
cd auto-move-recordings
clasp login
```

---

### Step 3 — Link to your Apps Script project

Create `.clasp.json` (gitignored — do not commit it):

```json
{
  "scriptId": "YOUR_SCRIPT_ID_HERE",
  "rootDir": "./src"
}
```

---

### Step 4 — Find your configuration values

#### Folder IDs (source and destination)

Open any folder in Google Drive. The URL looks like:
```
https://drive.google.com/drive/folders/1ABCxyz_THIS_IS_THE_ID
```

Copy the ID after `/folders/`. Use this for both `sourceFolderId` (your Meet Recordings folder) and each rule's `destinationFolderId`.

> **Shared Drives**: same method — open the subfolder inside the Shared Drive and copy the ID from the URL.

#### Calendar ID

1. Open [Google Calendar](https://calendar.google.com)
2. Click the three dots next to your calendar → **Settings and sharing**
3. Scroll to **Calendar ID** — looks like `you@company.com` or `abc123@group.calendar.google.com`

---

### Step 5 — Create your local config

```bash
cp config.example.json config.json
```

Edit `config.json` with your values (this file is gitignored):

```json
{
  "sourceFolderId": "1ABCxyz...",
  "calendarId": "you@yourcompany.com",
  "calendarLookbackHours": 4,
  "pollIntervalMinutes": 5,
  "timeWindow": {
    "startHour": 9,
    "endHour": 18
  },
  "rules": [
    {
      "eventNamePattern": "Weekly Standup",
      "destinationFolderId": "1ABCxyz..."
    },
    {
      "eventNamePattern": "/client.*review/i",
      "destinationFolderId": "1DEFxyz..."
    }
  ]
}
```

**`pollIntervalMinutes`** must be one of: `1`, `5`, `10`, `15`, `30` (Apps Script limitation).

**`eventNamePattern`** supports two formats:
- `"plain string"` — case-insensitive substring match: `"Standup"` matches `"Weekly Standup"`, `"standup call"`, etc.
- `"/pattern/flags"` — regex: `"/client.*review/i"` matches `"Client Quarterly Review"`, `"client review"`, etc.

Rules are evaluated **top to bottom** — first match wins.

---

### Step 6 — Build and push

```bash
npm run push
```

This runs `build.js` (generates `src/Config.js` from `config.json`) then `clasp push`.

---

### Step 7 — Grant permissions & install trigger

1. Open the Apps Script editor: `npm run open`
2. Select `setupTrigger` from the function dropdown and click **Run**
3. Grant the requested permissions when prompted (Calendar read, Drive, script triggers)
4. Run `triggerStatus` to confirm

> Run `setupTrigger` only once — it removes any existing trigger before creating a new one.

---

### Step 8 — Test

1. Select `main` from the function dropdown and click **Run**
2. Check **View → Logs** to see what happened

---

## Workflow for config changes

```bash
# Edit your local config
vim config.json

# Rebuild and redeploy
npm run push
```

`src/Config.js` is generated — never edit it directly.

---

## Utility functions

| Function | Description |
|---|---|
| `main()` | Run a scan manually |
| `setupTrigger()` | Install the time-based trigger |
| `teardownTrigger()` | Remove the trigger |
| `triggerStatus()` | Show current trigger info |
| `clearProcessedFiles()` | Reset processed-file history (reprocesses everything) |
| `debugSourceFolder()` | List all files in the source folder with MIME types and processed status — use when a file isn't being picked up |

---

## Project structure

```
auto-move-recordings/
├── .gitignore
├── .clasp.json            # gitignored — your script ID
├── config.json            # gitignored — your actual values
├── config.example.json    # committed — template for config.json
├── build.js               # generates src/Config.js from config.json
├── package.json
├── README.md
└── src/
    ├── appsscript.json    # Apps Script manifest (OAuth scopes, runtime)
    ├── Config.js          # gitignored — generated by build.js
    ├── Main.js            # Entry point and core flow
    ├── Calendar.js        # Calendar event lookup
    ├── Drive.js           # File scanning, folder creation, moving
    ├── Trigger.js         # Trigger install/remove utilities
    └── Utils.js           # Rule matching, logging, timezone
```

---

## Troubleshooting

**"Source folder not found"**
→ Double-check `sourceFolderId` in `config.json`. Get it from the folder URL in Google Drive.

**"Calendar not found"**
→ Double-check `calendarId` in `config.json`. Use the full calendar email address.

**Recording not matched / stays in source folder**
→ Run `main()` manually and check logs. The log shows which calendar event was found
and whether a rule matched. Adjust `eventNamePattern` if needed.

**Files are being re-processed**
→ Run `clearProcessedFiles()` only if you intentionally want to reprocess.

**"Cannot move file" error on Shared Drive**
→ The Google account running the script needs at least **Contributor** access on the
destination Shared Drive.

**Time window seems off**
→ The hours are evaluated in your Google account's timezone (from your default calendar).
If it still seems wrong, check your Google Calendar timezone in Calendar Settings.
