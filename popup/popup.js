document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const statusText = document.getElementById('status');
  const pauseBtn = document.getElementById('pauseBtn');

  let currentIsRecording = false;
  let currentIsPaused = false;

  // Query current recording state
  chrome.runtime.sendMessage({ type: 'POPUP_STATUS' }, (resp) => {
    updateUI(resp?.isRecording, resp?.isPaused);
  });

  startBtn.addEventListener('click', () => {
    if (!currentIsRecording) {
      chrome.runtime.sendMessage({ type: 'START_RECORDING' }, (resp) => {
        updateUI(true, false);
      });
    } else if (currentIsPaused) {
      // resume
      chrome.runtime.sendMessage({ type: 'PAUSE_RECORDING' }, (resp) => {
        updateUI(resp?.isRecording, resp?.isPaused);
      });
    }
  });

  stopBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'STOP_RECORDING' }, () => {
      updateUI(false, false);
    });
  });

  pauseBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'PAUSE_RECORDING' }, (resp) => {
      updateUI(resp?.isRecording, resp?.isPaused);
    });
  });

  function updateUI(isRecording, isPaused) {
    currentIsRecording = !!isRecording;
    currentIsPaused = !!isPaused;
    if (!isRecording) {
      startBtn.hidden = false;
      pauseBtn.hidden = true;
      stopBtn.hidden = true;
      statusText.textContent = 'Not recording';
    } else if (isPaused) {
      startBtn.hidden = false; // resume
      pauseBtn.hidden = true;
      stopBtn.hidden = false;
      statusText.textContent = 'Paused';
    } else {
      startBtn.hidden = true;
      pauseBtn.hidden = false;
      stopBtn.hidden = false;
      statusText.textContent = 'Recording...';
    }
  }
}); 