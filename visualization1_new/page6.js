// Page 6 initialization: load shared modules, setup UI, generate data, charts, events

// Globals (shared across helpers)
let charts = {};
let epsilon1, epsilon2, u1, u2, e1, e2;
let selectedPointIndex = null;
let T, phi0, phi, s, B0, B;
let color1, color2, color3;

// Bootstrapping now handled by shared Bootstrap helpers

const scripts = [
  'variables.js',
  'ui.js',
  'charts.js',
  'dataGeneration.js',
  'htmlout.js',
  'svar.js',
  'eventListeners.js'
];

// Prevent scrolling during first render and wait for MathJax + DOM, then load modules
try { Bootstrap.lockScrollPreInit(); } catch (e) {}
try {
  Bootstrap.onMathJaxThenDOM(async function() {
    await Bootstrap.loadScriptsSequential(scripts, Bootstrap.ASSET_VERSION);
    initializeApp();
  });
} catch (e) {
  // Fallback: initialize directly if Bootstrap not present
  (async () => {
    for (const s of scripts) { await new Promise((res) => { const el = document.createElement('script'); el.src = s; el.onload = res; el.onerror = () => res(); document.head.appendChild(el); }); }
    initializeApp();
  })();
}

async function initializeApp() {
  initializeUI();
  initializeVariables();
  initializeCharts();
  // Populate tables and ensure initial state is rendered before user interaction
  updateAllChartsAndStats(false);
  setupEventListeners();

  // Stabilize layout and finish loader using shared helpers
  try { await Bootstrap.awaitFontsAndTypesetAndStabilize(); } catch (e) {}
  try { Bootstrap.finalizeWithLoaderFadeOut(); } catch (e) {}
  // Keep page6-specific post-finalization adjustments
  try { resizeAllCharts(); } catch (e) {}
  try { updateAllChartsAndStats(false); } catch (e) {}
  try { setTimeout(() => { try { resizeAllCharts(); } catch (e) {} }, 50); } catch (e) {}
}

function initializeUI() {
  initializeCommonUI();
  // Wire label-based overlay popups for existing labels (gracefully skips if missing)
  setupPopup(['T', 'phi', 'phi0', 'sSlider']);
}

function initializeVariables() {
  // Theme accents
  try {
    const accents = getThemeAccents();
    color1 = accents.color1; color2 = accents.color2; color3 = accents.color3;
  } catch (e) {
    // Derive from CSS variables to avoid hardcoded literals
    try {
      const styles = getComputedStyle(document.documentElement);
      const primary = (styles.getPropertyValue('--color-primary') || styles.getPropertyValue('--brand') || '').trim();
      const accent = (styles.getPropertyValue('--color-accent') || styles.getPropertyValue('--brand-grad-end') || primary).trim();
      const weakVar = (styles.getPropertyValue('--brand-weak') || '').trim();
      const rgbaFromHex = (hex, a) => {
        if (!hex) return '';
        const m = hex.replace('#','');
        const full = m.length === 3 ? m.split('').map(c => c + c).join('') : m;
        const v = parseInt(full, 16);
        const r = (v >> 16) & 255, g = (v >> 8) & 255, b = v & 255;
        return `rgba(${r}, ${g}, ${b}, ${a})`;
      };
      const weak = weakVar && weakVar.length > 0 ? weakVar : rgbaFromHex(primary, 0.55);
      color1 = primary || accent || '#ff8c00';
      color2 = accent || primary || '#ffb34d';
      color3 = weak || rgbaFromHex('#ff8c00', 0.55);
    } catch (e2) {
      // Last resort fallbacks (should rarely be used)
      color1 = '#ff8c00'; color2 = '#ffb34d'; color3 = 'rgba(255,140,0,0.55)';
    }
  }

  // Inputs
  T = getInputValue('T', 250);
  phi = getInputValue('phi', 0);
  s = getInputValue('sSlider', 0);
  phi0 = 0.5;
  B0 = getB(phi0);
  B = getB(phi);

  // Ensure UI value labels reflect initial state
  try {
    const tVal = document.getElementById('TValue'); if (tVal) tVal.textContent = ` ${T.toFixed(0)}`;
    const pVal = document.getElementById('phiValue'); if (pVal) pVal.textContent = ` ${phi.toFixed(2)}`;
    const sVal = document.getElementById('sValue'); if (sVal) sVal.textContent = ` ${s.toFixed(2)}`;
    const p0Val = document.getElementById('phi0Value'); if (p0Val) p0Val.textContent = ` ${phi0.toFixed(2)}`;
  } catch (e) {}

  generateNewData(T, s);

  // Initial equations
  try { insertEqSVARe(B); } catch (e) {}
  try { insertEqNG(); } catch (e) {}
}

function generateUniformData(length) {
  // Uniform in [-1, 1]; NormalizeData will standardize moments
  return Array.from({ length }, () => Math.random() * 2 - 1);
}

function generateNewData(Tnew, sParam) {
  T = Tnew; s = sParam;
  // epsilon1: Gaussian; epsilon2: mixture normal controlled by s
  let rawEpsilon1 = Array.from({ length: T }, () => normalRandom());
  let rawEpsilon2 = generateMixedNormalData(T, s);
  [epsilon1, epsilon2] = NormalizeData(rawEpsilon1, rawEpsilon2);
  [u1, u2] = getU(epsilon1, epsilon2, B0);
  [e1, e2] = getE(u1, u2, B);
  selectedPointIndex = null;
}

function initializeCharts() {
  const scatterCfg = getScatterPlotConfig();
  createChart('scatterPlot1', scatterCfg);
  createChart('scatterPlot3', scatterCfg);
  updateScatter(charts.scatterPlot1, epsilon1, epsilon2, 'epsilon', true);
  updateScatter(charts.scatterPlot3, e1, e2, 'e', true);

  const lossCfg = getLossPlotConfig();
  createChart('lossplot4', lossCfg);
  updateLossPlot(false, charts.lossplot4, phi0, phi, loss34, '', u1, u2);
}

function updateAllChartsAndStats(onlyPoint = false) {
  // Update scatter
  updateScatter(charts.scatterPlot1, epsilon1, epsilon2, 'epsilon', true);
  updateScatter(charts.scatterPlot3, e1, e2, 'e', true);
  // Update loss
  updateLossPlot(onlyPoint, charts.lossplot4, phi0, phi, loss34, '', u1, u2);
  // Update equations and NG display
  try { insertEqSVARe(B); } catch (e) {}
  try { insertEqNG(); } catch (e) {}
  // Update stats tables
  try {
    const statsEps = calculateMoments(epsilon1, epsilon2);
    const statsE = calculateMoments(e1, e2);
    const htmlEps = createHTMLTableDependency(statsEps, 'Co-moments of structural shocks ε', 'ε');
    const htmlE = createHTMLTableDependency(statsE, 'Co-moments of innovations e', 'e');
    createTable('stats-epsilon', htmlEps);
    createTable('stats-e', htmlE);
  } catch (e) {}
}

function setupEventListeners() {
  // T slider
  createEventListener('T', (val) => {
    document.getElementById('TValue').textContent = ` ${val.toFixed(0)}`;
    generateNewData(val, s);
    // e depends on B (phi)
    B = getB(phi);
    [e1, e2] = getE(u1, u2, B);
    updateAllChartsAndStats(false);
  });

  // phi slider
  createEventListener('phi', (val) => {
    document.getElementById('phiValue').textContent = ` ${val.toFixed(2)}`;
    phi = val;
    B = getB(phi);
    [e1, e2] = getE(u1, u2, B);
    updateAllChartsAndStats(true);
  });

  // s slider (custom label update since id is 'sSlider' but label is 'sValue')
  createEventListener('sSlider', (val) => {
    const sVal = document.getElementById('sValue');
    if (sVal) sVal.textContent = ` ${val.toFixed(2)}`;
    s = val;
    generateNewData(T, s);
    B = getB(phi);
    [e1, e2] = getE(u1, u2, B);
    updateAllChartsAndStats(false);
  });

  // New Data
  const btn = document.getElementById('newDataBtn');
  if (btn) {
    btn.addEventListener('click', () => {
      generateNewData(T, s);
      B = getB(phi);
      [e1, e2] = getE(u1, u2, B);
      updateAllChartsAndStats(false);
    });
  }

  // Minimize dependencies animation
  const rollBtn = document.getElementById('rollBallButton');
  if (rollBtn) {
    let stop;
    rollBtn.addEventListener('click', () => {
      if (stop) { try { stop(); } catch (e) {} }
      const callbacks = [
        (currentPhi) => {
          phi = currentPhi;
          const phiEl = document.getElementById('phi');
          const phiVal = document.getElementById('phiValue');
          if (phiEl) phiEl.value = currentPhi;
          if (phiVal) phiVal.textContent = ` ${currentPhi.toFixed(2)}`;
          B = getB(phi);
          [e1, e2] = getE(u1, u2, B);
          updateAllChartsAndStats(true);
        }
      ];
      try {
        stop = animateBallRolling(charts.lossplot4, loss34, 'min', phi, callbacks, u1, u2);
      } catch (err) {
        console.error('Animation error:', err);
      }
    });
  }

  // Keep charts responsive on window resize
  try {
    window.addEventListener('resize', () => {
      try { resizeAllCharts(); } catch (e) {}
    });
  } catch (e) {}
  // On full window load, ensure final layout updates
  try {
    window.addEventListener('load', () => {
      try { resizeAllCharts(); } catch (e) {}
      try { updateAllChartsAndStats(false); } catch (e) {}
    });
  } catch (e) {}

  // Standardize point-click highlighting across scatter plots
  try { attachScatterClickHandlers(['scatterPlot1', 'scatterPlot3']); } catch (e) {}
}

function resizeAllCharts() {
  try {
    if (!charts) return;
    Object.keys(charts).forEach((key) => {
      const ch = charts[key];
      if (ch && typeof ch.resize === 'function') {
        try { ch.resize(); } catch (e) {}
      }
    });
  } catch (e) {}
}
