// Placeholder bootstrap for Page 5
// Keeps consistent cache-busting constant but avoids loading heavy modules
// Only handles loader fade-out and optional MathJax typesetting

const ASSET_VERSION = '20250811-082303';

function completeInit() {
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

function initializePage5() {
  // Typeset MathJax if available, then finish init
  if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
    MathJax.typesetPromise().finally(completeInit);
  } else {
    completeInit();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePage5);
} else {
  initializePage5();
}
