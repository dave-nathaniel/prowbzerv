# ProwbZerv

A lightweight Chrome Extension that **records a user’s interaction flow** on any website and exports the exact sequence as JSON.  
Use the captured steps to automate manual QA, reproduce bugs, or feed browser-automation frameworks like Playwright / Puppeteer.

---

## ✨ Features

* **Start / Pause / Resume / Stop** controls in a compact popup UI (icon-based)
* Captures user-initiated events in order:
  * `click` – mouse or touch clicks
  * `input` – text typed into a field (single step per field, not per keystroke)
  * `key_enter` – Enter-key submissions
  * `navigate` – full reloads & SPA route changes
  * `alert` – runtime error/alert banners detected via `MutationObserver`
* Generates _unique, human-readable CSS selectors_ for every element
* Records **only metadata** (never the text you type)
* Sequential `index` field for deterministic replays
* Opens a **Results** tab on Stop with pretty-printed JSON + one-click download
* Survives page reloads by buffering steps in `chrome.storage.session`

---

## 🗂️ Project Structure

```
ProwbZerv/
│  manifest.json          # MV3 manifest
│  background.js          # Service-worker managing session state
│  recorder.js            # Injected into pages to harvest events
│  results.html|css|js    # Results tab & JSON exporter
│  popup/                 # Popup UI (html, css, js)
│  icons/                 # SVG icons for controls
└─ README.md              # ← you are here
```

---

## 🚀 Install (Development)

1. Clone / download this repository.
2. Open **Chrome** and navigate to `chrome://extensions`.
3. Enable **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select the `ProwbZerv/` folder.
5. The “ProwbZerv” icon now appears in the toolbar.

No build step is required; MV3 loads raw source files.

---

## 🕹️ Usage

1. Click the extension icon to open the popup.
2. Press **▶ Start** – status turns *Recording…*.
3. Interact with the target site. You may **⏸ Pause** / **Resume** at any time.
4. Press **⏹ Stop** – a new tab opens showing the captured steps.
5. Review and **Download JSON** (filename `prowbz_steps.json`).

### JSON Schema

```json
{
  "steps": [
    {
      "index": 1,
      "url": "/login",
      "action": "input",    // click | input | key_enter | navigate | alert
      "element": "#username", // unique selector
      "type": "input"         // tag or input type
    }
  ]
}
```

| Field    | Description                                   |
|----------|-----------------------------------------------|
| `index`  | Monotonic counter starting at 1               |
| `url`    | `pathname + search` of the page when event fired |
| `action` | Event classification                          |
| `element`| CSS selector for the target element           |
| `type`   | Element tag / input subtype                   |

---

## 🏗️ Internals

* **`recorder.js`** – Injected via `chrome.scripting.executeScript`. Attaches listeners for `click`, `change`, `keydown` and monitors DOM mutations for error banners. Generates selectors with:
  1. Unique `id` if present.
  2. `data-test`, `aria-label`, `name`, or `title` attributes.
  3. Fallback CSS `nth-child` path.
* **`background.js`**
  * Maintains `isRecording`, `isPaused`, `steps`, `stepCounter`.
  * Re-injects recorder after each navigation via `webNavigation.onCommitted`.
  * Listens for messages `{ type: 'STEP', payload }` from recorder.
  * On Stop → persists steps → opens `results.html`.
* **`results.*`** – Fetches steps from `chrome.storage.session`, renders `<pre>` view, and builds a download blob.

---

## 🔒 Permissions & Privacy

| Permission          | Why it’s needed                                   |
|---------------------|---------------------------------------------------|
| `activeTab`         | Inject recorder into the current tab              |
| `scripting`         | Programmatically execute `recorder.js`            |
| `tabs`              | Create the Results tab                            |
| `storage`           | Persist steps across page reloads                 |
| `webNavigation`     | Detect navigations & reinject recorder            |
| `host_permissions`  | `<all_urls>` so any site can be recorded          |

Only **metadata** (URL, selector, event type) is stored. Input values or personal data are never collected.

---

## 📦 Packaging for Web Store

1. Bump the version in `manifest.json`.
2. Zip the contents of **ProwbZerv/** (do _not_ include dotfiles like `.git/`).
3. Upload the ZIP to the Chrome Web Store Developer Dashboard.

---

## 🛤️ Roadmap

- [ ] Replay engine powered by Playwright script generator
- [ ] Domain allow-/deny-list
- [ ] Iframe & cross-origin frame support
- [ ] Settings page to tweak selector strategy

Contributions & ideas are welcome – feel free to open issues or PRs! 