document.addEventListener('DOMContentLoaded', async () => {
  const jsonPre = document.getElementById('json');
  const downloadBtn = document.getElementById('downloadBtn');

  const { prowbz_steps } = await chrome.storage.session.get('prowbz_steps');
  const data = { steps: prowbz_steps || [] };
  const jsonString = JSON.stringify(data, null, 2);
  jsonPre.textContent = jsonString;

  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  downloadBtn.addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prowbz_steps.json';
    a.click();
    URL.revokeObjectURL(url);
  });
}); 