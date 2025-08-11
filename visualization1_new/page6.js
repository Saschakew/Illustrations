// Placeholder bootstrap for Page 6
// Minimal init: handle loader fade-out and optional MathJax typesetting

const ASSET_VERSION = '20250811-082303';

function completeInit6() {
  try { document.documentElement.classList.remove('ui-preinit'); } catch (e) {}
  const loader = document.getElementById('loading-screen');
  if (loader) {
    loader.classList.add('fade-out');
    loader.addEventListener('transitionend', () => {
      loader.style.display = 'none';
      try {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
      } catch (e) {}
    }, { once: true });
  } else {
    try {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    } catch (e) {}
  }
}

function initializePage6() {
  if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
    MathJax.typesetPromise().finally(completeInit6);
  } else {
    completeInit6();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePage6);
} else {
  initializePage6();
}
