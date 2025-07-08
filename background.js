// ProwbZerv background service worker (MV3)

let isRecording = false;
let isPaused = false;
let steps = [];

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'START_RECORDING':
      handleStartRecording().then(() => sendResponse({ status: 'recording' }));
      break;

    case 'STOP_RECORDING':
      handleStopRecording().then(() => sendResponse({ status: 'stopped' }));
      break;

    case 'PAUSE_RECORDING':
      isPaused = !isPaused;
      sendResponse({ status: isPaused ? 'paused' : 'recording', isRecording: true, isPaused });
      break;

    case 'STEP':
      if (isRecording && !isPaused) {
        steps.push(message.payload);
      }
      break;

    case 'POPUP_STATUS':
      sendResponse({ isRecording, isPaused });
      break;
  }
  // Indicate we will respond asynchronously when needed
  return true;
});

async function injectRecorder(tabId) {
  try {
    await chrome.scripting.executeScript({ target: { tabId }, files: ['recorder.js'] });
  } catch (err) {
    console.error('Failed to inject recorder:', err);
  }
}

// replace previous injectRecorderIntoActiveTab usage
async function injectRecorderIntoActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    await injectRecorder(tab.id);
  }
}

// Modify webNavigation listener to also inject
chrome.webNavigation.onCommitted.addListener((details) => {
  if (!isRecording) return;
  if (details.frameId !== 0) return;
  // For SPA navigations this fires too
  if (!isPaused) {
    const urlObj = new URL(details.url);
    steps.push({ url: urlObj.pathname + urlObj.search, action: 'navigate', element: '', type: '' });
  }
  // Inject recorder for new document
  injectRecorder(details.tabId);
});

async function handleStartRecording() {
  if (isRecording) return; // already recording (maybe after pause)
  isRecording = true;
  isPaused = false;
  steps = [];
  await injectRecorderIntoActiveTab();
}

async function handleStopRecording() {
  isRecording = false;
  isPaused = false;
  // Save steps to session storage
  await chrome.storage.session.set({ prowbz_steps: steps });
  // Open results page
  await chrome.tabs.create({ url: chrome.runtime.getURL('results.html') });
  console.log('ProwbZerv recorded steps:', steps);
} 