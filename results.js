document.addEventListener('DOMContentLoaded', async () => {
  const stepsForm = document.getElementById('stepsForm');
  const downloadBtn = document.getElementById('downloadBtn');

  const { prowbz_steps } = await chrome.storage.session.get('prowbz_steps');
  const steps = prowbz_steps || [];
  const selections = steps.map(step => {
    const ids = step.identifiers ? Object.values(step.identifiers) : [];
    return ids.length > 0 ? ids[0] : null;
  });

  // Render selector pickers
  steps.forEach((step, i) => {
    console.log('Step identifiers:', step.identifiers);
    const div = document.createElement('div');
    div.style.marginBottom = '1em';
    const label = document.createElement('label');
    label.textContent = `Step ${step.index}: [${step.action}] ${step.url}`;
    label.style.display = 'block';
    div.appendChild(label);

    if (step.screenshot) {
      const img = document.createElement('img');
      img.src = step.screenshot;
      img.alt = 'Element screenshot';
      img.style.maxWidth = '200px';
      img.style.maxHeight = '100px';
      img.style.display = 'block';
      img.style.marginBottom = '0.5em';
      div.appendChild(img);
    }

    const select = document.createElement('select');
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
      selections[i] = select.value || null;
    });
    div.appendChild(select);
    stepsForm.appendChild(div);
  });

  // Always enable the download button
  downloadBtn.disabled = false;

  downloadBtn.addEventListener('click', () => {
    // Build new steps array with selected identifiers
    const finalSteps = steps.map((step, i) => ({
      index: step.index,
      url: step.url,
      action: step.action,
      element: selections[i],
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
}); 