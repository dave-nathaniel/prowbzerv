document.addEventListener('DOMContentLoaded', async () => {
  const stepsForm = document.getElementById('stepsForm');
  const downloadBtn = document.getElementById('downloadBtn');
  const resetBtn = document.getElementById('resetBtn');
  const { prowbz_steps } = await chrome.storage.session.get('prowbz_steps');
  const steps = prowbz_steps || [];
  const selections = steps.map(step => {
    const ids = step.identifiers ? Object.values(step.identifiers) : [];
    return ids.length > 0 ? ids[0] : null;
  });

  let currentSteps = [...steps];
  let currentSelections = [...selections];

  function resetSteps() {
    currentSteps = [...steps];
    currentSelections = [...selections];
  }

  function renderSteps() {
    stepsForm.innerHTML = '';
    console.log('Current steps:', currentSteps);
    const jsonOutput = document.getElementById('jsonOutput');
    jsonOutput.textContent = JSON.stringify(currentSteps, null, 2);
    currentSteps.forEach((step, i) => {
      console.log('Step identifiers:', step.identifiers);
      // Use template literal for structure, then fill in dynamic values
      const div = document.createElement('div');
      div.style.position = 'relative';
      div.style.marginBottom = '1em';

      // HTML structure as per prompt
      div.innerHTML = `
        <button title="Remove step" style="position: absolute; margin-top: -1px; right: 8px; color: red;padding: 0px; width: 20px; height: 20px; font-size: 26px; cursor: pointer; display: flex; align-items: center; justify-content: center;border: 1px solid red;line-height: 2px;">×</button>
        <label style="display: block;text-align: center;">Step ${step.index}</label>
        <p>URL: <code>${step.url}</code></p>
        <p>Snapshot: <img src="" alt="Element screenshot" style="max-width:200px; max-height:100px; vertical-align:middle;"></p>
        <div class="row d-flex align-items-center">
            <div class="col-12 pb-2 mb-2 border-bottom">
                <p>Action: </p>
            </div>
            <div class="col-6 text-center">
                <code style="font-size: 18px;">[${step.action}]</code>
            </div>
            <div class="col-6">
                <select></select>
            </div>
        </div>
      `;

      // Remove step button
      const cancelBtn = div.querySelector('button[title="Remove step"]');
      cancelBtn.addEventListener('click', () => {
        currentSteps.splice(i, 1);
        currentSelections.splice(i, 1);
        renderSteps();
      });

      // Set screenshot if present
      if (step.screenshot) {
        const img = div.querySelector('img');
        img.src = step.screenshot;
      }

      // Fill select with identifiers
      const select = div.querySelector('select');
      const ids = step.identifiers ? Object.entries(step.identifiers) : [];
      if (ids.length === 0) {
        select.innerHTML = '<option value="">(No identifiers)</option>';
        select.disabled = true;
      } else {
        ids.forEach(([key, value], idx) => {
          const opt = document.createElement('option');
          opt.value = value;
          opt.textContent = `${key}: ${value}`;
          if (idx === 0) opt.selected = true;
          select.appendChild(opt);
        });
      }
      select.addEventListener('change', () => {
        currentSelections[i] = select.value || null;
      });

      stepsForm.appendChild(div);
    });
  }

  renderSteps();

  // Always enable the download button
  downloadBtn.disabled = false;

  downloadBtn.addEventListener('click', () => {
    // Build new steps array with selected identifiers
    var stepCounter = 0;
    const finalSteps = currentSteps.map((step, i) => ({
      index: stepCounter++,
      url: step.url,
      action: step.action,
      element: currentSelections[i],
      type: step.type,
      screenshot: step.screenshot
    }));
    const data = { steps: finalSteps };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prowbz_steps.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  resetBtn.addEventListener('click', () => {
    resetSteps();
    renderSteps();
  });
}); 