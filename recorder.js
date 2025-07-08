// recorder.js – capture click and input events and send to background

(function() {
  const EVENT_TYPES = ['click', 'change', 'keydown'];

  EVENT_TYPES.forEach(type => {
    window.addEventListener(type, handleEvent, true); // use capture phase to log early
  });

  function handleEvent(e) {
    // Ignore synthetic events
    if (!e.isTrusted) return;

    const target = e.target;
    if (!target) return;

    const normalized = normalizeEventType(e);

    if (!normalized) return; // ignored event

    // For keydown, we only care about Enter key
    if (e.type === 'keydown' && normalized !== 'key_enter') {
      return;
    }

    // Build payload once
    const payload = {
      url: location.pathname + location.search,
      action: normalized,
      element: getUniqueSelector(target),
      type: getElementType(target)
    };

    chrome.runtime.sendMessage({ type: 'STEP', payload });
  }

  function normalizeEventType(event) {
    if (event.type === 'click') return 'click';
    if (event.type === 'change') return 'input';
    if (event.type === 'keydown' && event.key === 'Enter') return 'key_enter';
    return null; // other events ignored
  }

  function getElementType(el) {
    if (el.tagName === 'INPUT') {
      return el.type || 'input';
    }
    return el.tagName.toLowerCase();
  }

  // Simple unique selector generator
  function getUniqueSelector(el) {
    if (el.id) {
      return `#${CSS.escape(el.id)}`;
    }

    // Use data-test or name attribute if available
    const attr = ['data-test', 'aria-label', 'name', 'title'].find(a => el.getAttribute && el.getAttribute(a));
    if (attr) {
      const value = CSS.escape(el.getAttribute(attr));
      return `${el.tagName.toLowerCase()}[${attr}="${value}"]`;
    }

    // fallback nth-child path
    let path = '';
    let current = el;
    while (current && current.nodeType === Node.ELEMENT_NODE && current !== document.body) {
      const index = Array.from(current.parentNode.children).indexOf(current) + 1;
      path = `>${current.tagName.toLowerCase()}:nth-child(${index})` + path;
      current = current.parentNode;
    }
    return 'body' + path;
  }

  // Observe DOM for alert/error messages
  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      m.addedNodes.forEach(node => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        if (isAlertElement(node)) {
          const payload = {
            url: location.pathname + location.search,
            action: 'alert',
            element: getUniqueSelector(node),
            type: 'alert'
          };
          chrome.runtime.sendMessage({ type: 'STEP', payload });
        }
      });
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  function isAlertElement(el) {
    const role = el.getAttribute && el.getAttribute('role');
    if (role === 'alert' || role === 'alertdialog') return true;
    const cls = (el.className || '').toLowerCase();
    if (/error|alert|invalid|warning|toast/.test(cls)) return true;
    const text = (el.textContent || '').toLowerCase();
    if (/error|incorrect|failed|invalid/.test(text)) return true;
    return false;
  }
})(); 