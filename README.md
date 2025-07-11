# ProwbZerv

A lightweight Chrome Extension that **records a user's interaction flow** on any website and exports the sequence as JSON.  
Use the captured steps to automate manual QA, reproduce bugs, or feed browser-automation frameworks like Playwright / Puppeteer.

---

## Features

* **Start / Pause / Resume / Stop** controls in a compact popup UI (icon-based)
* Captures user-initiated events in order:
  * `click` – mouse or touch clicks
  * `input` – text typed into a field (single step per field, not per keystroke)
  * `key_enter` – Enter-key submissions
  * `navigate` – full reloads & SPA route changes
  * `alert` – runtime error/alert banners detected via `MutationObserver`
* **Visual Recording**:
  * Automatic screenshots of interacted elements
  * Visual preview in results editor
  * Screenshots included in exported JSON
* **Smart Element Selection**:
  * Multiple identifier strategies per element
  * Prioritizes stable attributes (`id`, `data-test`, `aria-label`)
  * Fallback to structural selectors when needed
* **Interactive Results Editor**:
  * Visual review of recorded steps
  * Choose between multiple selector strategies
  * Remove unwanted steps
  * Live JSON preview
* Generates _unique, human-readable CSS selectors_ for every element
* Records **only metadata** (never the text you type)
* Sequential `index` field for deterministic replays
* Opens a **Results** tab on Stop with pretty-printed JSON + one-click download
* Survives page reloads by buffering steps in `chrome.storage.session`

---

## Project Structure

```
ProwbZerv/
│  manifest.json          # MV3 manifest
│  background.js          # Service-worker managing session state
│  recorder.js           # Injected into pages to harvest events
│  results.html|css|js    # Results tab & JSON exporter
│  popup/                 # Popup UI (html, css, js)
│  icons/                 # SVG icons for controls
└─ README.md              # ← you are here
```

---

## Usage

1. Click the extension icon to open the popup.
2. Press **▶ Start** – status turns *Recording…*.
3. Interact with the target site. You may **⏸ Pause** / **Resume** at any time.
4. Press **⏹ Stop** – a new tab opens showing the captured steps.
5. Review steps in the editor:
   * View element screenshots
   * Choose alternative selectors if available
   * Remove unwanted steps
   * Preview final JSON output
6. Click **Download JSON** to save (filename `prowbz_steps.json`).

### JSON Schema

```json
{
  "steps": [
    {
      "index": 1,
      "url": "/login",
      "action": "input",    // click | input | key_enter | navigate | alert
      "element": "#username", // unique selector
      "type": "input",       // tag or input type
      "screenshot": "data:image/png;base64,..." // base64 element screenshot
    }
  ]
}
```

| Field       | Description                                   |
|-------------|-----------------------------------------------|
| `index`     | Monotonic counter starting at 1               |
| `url`       | `pathname + search` of the page when event fired |
| `action`    | Event classification                          |
| `element`   | CSS selector for the target element           |
| `type`      | Element tag / input subtype                   |
| `screenshot`| Base64 PNG image of the element (optional)    |