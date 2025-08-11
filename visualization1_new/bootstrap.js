// Shared bootstrap utilities for visualization1_new
// Mirrors and improves the initialization flow seen in visualization4 pages

// Keep this version string in sync with page cache-busting values
const ASSET_VERSION = '20250811-082303';

function loadScript(src, version = ASSET_VERSION) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    let finalSrc = src;
    try {
      const isExternal = /^(https?:)?\/\//i.test(src);
      const hasQuery = src.includes('?');
      const hasVersion = /[?&]v=/.test(src);
      if (!isExternal) {
        if (hasQuery) {
          finalSrc = hasVersion ? src : `${src}&v=${version}`;
        } else {
          finalSrc = `${src}?v=${version}`;
        }
      }
    } catch (e) { /* no-op */ }
    script.src = finalSrc;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Script load error for ${src}`));
    document.head.appendChild(script);
  });
}

async function loadScriptsSequential(scripts, version = ASSET_VERSION) {
  for (const s of scripts) {
    await loadScript(s, version);
  }
}

function onMathJaxThenDOM(callback) {
  document.addEventListener('MathJaxReady', function () {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  });
}

function lockScrollPreInit() {
  try {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  } catch (e) {}
}

async function awaitFontsAndTypesetAndStabilize() {
  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
  } catch (e) {}

  if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
    try { await MathJax.typesetPromise(); } catch (e) {}
  }

  // Allow 2 frames for Chart.js responsive layout to settle
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  // Force a layout pass and broadcast resize to settle responsive components
  try {
    document.querySelector('.input-container')?.getBoundingClientRect();
    window.dispatchEvent(new Event('resize'));
  } catch (e) {}

  // Enable sticky and transitions only after layout is fully stable
  try { document.documentElement.classList.add('ui-sticky-ready'); } catch (e) {}
  try { document.documentElement.classList.remove('ui-preinit'); } catch (e) {}
}

function finalizeWithLoaderFadeOut() {
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

// Expose helpers on window for non-module scripts
window.Bootstrap = {
  ASSET_VERSION,
  loadScript,
  loadScriptsSequential,
  onMathJaxThenDOM,
  lockScrollPreInit,
  awaitFontsAndTypesetAndStabilize,
  finalizeWithLoaderFadeOut,
};
