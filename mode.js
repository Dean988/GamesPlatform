(() => {
  function applyMode(mode) {
    const safeMode = mode === 'multi' ? 'multi' : 'single';
    window.GP_MODE = safeMode;
    document.body.dataset.mode = safeMode;
    const buttons = document.querySelectorAll('.mode-btn');
    buttons.forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.mode === safeMode);
    });
    window.dispatchEvent(new CustomEvent('gp:modechange', { detail: { mode: safeMode } }));
  }

  function init() {
    const saved = localStorage.getItem('gp-mode') || 'single';
    applyMode(saved);
    const buttons = document.querySelectorAll('.mode-btn');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode || 'single';
        localStorage.setItem('gp-mode', mode);
        applyMode(mode);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
