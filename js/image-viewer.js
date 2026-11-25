(() => {
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = new URL('../css/image-viewer.css', document.currentScript.src).href;
  document.head.append(stylesheet);

  const dialog = document.createElement('dialog');
  dialog.className = 'image-viewer';
  dialog.setAttribute('aria-label', 'Image viewer');
  dialog.innerHTML = `
    <div class="image-viewer-toolbar">
      <button type="button" data-action="out" aria-label="Zoom out">−</button>
      <output aria-live="polite">100%</output>
      <button type="button" data-action="in" aria-label="Zoom in">+</button>
      <button type="button" data-action="reset">Fit</button>
      <button type="button" data-action="close" aria-label="Close image viewer">✕</button>
    </div>
    <div class="image-viewer-stage"><img draggable="false" alt=""></div>
    <p class="image-viewer-caption"></p>
    <p class="image-viewer-hint">Scroll or use + / − to zoom · Drag to pan · Esc to close</p>`;
  document.body.append(dialog);

  const stage = dialog.querySelector('.image-viewer-stage');
  const preview = stage.querySelector('img');
  const output = dialog.querySelector('output');
  let scale = 1, x = 0, y = 0, drag = null, dragged = false;
  let originalFocus = null, previousOverflow = '';

  function render() {
    preview.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    output.value = `${Math.round(scale * 100)}%`;
    stage.classList.toggle('is-zoomed', scale > 1);
  }

  function zoom(next) {
    const previous = scale;
    scale = Math.min(8, Math.max(1, next));
    x *= scale / previous;
    y *= scale / previous;
    render();
  }

  function reset() { scale = 1; x = y = 0; render(); }

  function open(source) {
    originalFocus = source;
    preview.src = source.currentSrc || source.src;
    preview.alt = source.alt;
    dialog.querySelector('.image-viewer-caption').textContent = source.alt || '';
    reset();
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    dialog.querySelector('[data-action="close"]').focus();
  }

  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    drag = null;
    if (originalFocus?.isConnected) originalFocus.focus({ preventScroll: true });
  });

  dialog.addEventListener('click', event => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'close') dialog.close();
    if (action === 'in') zoom(scale * 1.25);
    if (action === 'out') zoom(scale / 1.25);
    if (action === 'reset') reset();
    if (event.target === dialog || (event.target === stage && !dragged)) dialog.close();
  });

  preview.addEventListener('click', () => {
    if (!dragged) { if (scale === 1) zoom(2); else reset(); }
  });
  stage.addEventListener('wheel', event => {
    event.preventDefault();
    zoom(scale * (event.deltaY < 0 ? 1.15 : 1 / 1.15));
  }, { passive: false });
  stage.addEventListener('pointerdown', event => {
    dragged = false;
    if (event.button !== 0 || scale === 1) return;
    drag = { px: event.clientX, py: event.clientY, x, y };
    event.target.setPointerCapture(event.pointerId);
  });
  stage.addEventListener('pointermove', event => {
    if (!drag) return;
    const dx = event.clientX - drag.px, dy = event.clientY - drag.py;
    if (Math.abs(dx) + Math.abs(dy) > 5) dragged = true;
    x = drag.x + dx; y = drag.y + dy;
    render();
  });
  stage.addEventListener('pointerup', () => { drag = null; });
  stage.addEventListener('pointercancel', () => { drag = null; });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); dialog.close(); }
    if (event.key === '+' || event.key === '=') { event.preventDefault(); zoom(scale * 1.25); }
    if (event.key === '-') { event.preventDefault(); zoom(scale / 1.25); }
    if (event.key === '0') { event.preventDefault(); reset(); }
  });

  document.querySelectorAll('img').forEach(img => {
    if (dialog.contains(img) || img.closest('.component-gallery')) return;
    img.classList.add('zoomable-image');
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-haspopup', 'dialog');
    img.setAttribute('aria-label', `Enlarge image: ${img.alt || 'Image'}`);
    img.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      open(img);
    });
    img.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
        open(img);
      }
    });
  });
})();
