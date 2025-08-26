// Page 5 initialization: load shared modules via Bootstrap, setup UI, generate data, charts, events

// Globals (shared across helpers)
let charts = {};
let epsilon1, epsilon2, u1, u2, e1, e2;
let selectedPointIndex = null;
let T, phi0, phi, B0, B;
let color1, color2, color3;

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
    for (const s of scripts) { await new Promise((res, rej) => { const el = document.createElement('script'); el.src = s; el.onload = res; el.onerror = () => res(); document.head.appendChild(el); }); }
    initializeApp();
  })();
}

async function initializeApp() {
  initializeUI();
  initializeVariables();
  initializeCharts();
  // Ensure initial tables and charts render before any interaction
  try { updateAllChartsAndStats(false); } catch (e) {}
  setupEventListeners();

  // Stabilize layout and finish loader using shared helpers
  try { await Bootstrap.awaitFontsAndTypesetAndStabilize(); } catch (e) {}
  try { Bootstrap.finalizeWithLoaderFadeOut(); } catch (e) {}
  // Post-load adjustments to avoid overlap/formatting issues
  try { if (typeof resizeAllCharts === 'function') resizeAllCharts(); } catch (e) {}
  try { updateAllChartsAndStats(false); } catch (e) {}
  try { setTimeout(() => { try { if (typeof resizeAllCharts === 'function') resizeAllCharts(); } catch (e) {} }, 50); } catch (e) {}
}

function initializeUI() {
  try { initializeCommonUI(); } catch (e) {
    // Fallback to individual setups if needed
    try { setupStickyInputContainer(); } catch (e2) {}
    try { setupNavigationMenu(); } catch (e2) {}
    try { setupActiveNavLink(); } catch (e2) {}
    try { setupInputContentWrapper(); } catch (e2) {}
    try { setupInfoIcons(); } catch (e2) {}
  }
}

function initializeVariables() {
  // Theme accents
  try {
    const accents = getThemeAccents();
    color1 = accents.color1; color2 = accents.color2; color3 = accents.color3;
  } catch (e) { color1 = '#ff8c00'; color2 = '#ffb34d'; color3 = 'rgba(255,140,0,0.55)'; }

  // Inputs
  T = getInputValue('T', 250);
  phi = getInputValue('phi', 0);
  phi0 = 0.5;
  B0 = getB(phi0);
  B = getB(phi);

  // Reflect phi0 in UI if present
  try { const el = document.getElementById('phi0Value'); if (el) el.textContent = ` ${phi0.toFixed(2)}`; } catch (e) {}

  generateNewData(T);

  // Initial equations
  try { insertEqSVARe(B); } catch (e) {}
}

function generateNewData(Tnew) {
  T = Tnew;
  // Use uniform shocks on page 5 per spec
  let rawEpsilon1 = generateUniformData(T);
  let rawEpsilon2 = generateUniformData(T);
  [epsilon1, epsilon2] = NormalizeData(rawEpsilon1, rawEpsilon2);
  [u1, u2] = getU(epsilon1, epsilon2, B0);
  [e1, e2] = getE(u1, u2, B);
  // Reset selection
  selectedPointIndex = null;
}

function initializeCharts() {
  const scatterCfg = getScatterPlotConfig();
  createChart('scatterPlot2', scatterCfg);
  createChart('scatterPlot3', scatterCfg);
  updateChartScatter(charts.scatterPlot2, u1, u2, 'Reduced-form shocks', 'u₁', 'u₂', true);
  updateChartScatter(charts.scatterPlot3, e1, e2, 'Innovations', 'e₁', 'e₂', true);

  const lossCfg = getLossPlotConfig();
  createChart('lossplot4m', lossCfg);
  updateLossPlot(false, charts.lossplot4m, phi0, phi, lossNonGaussian, '', u1, u2);
}

function updateAllChartsAndStats(onlyPoint = false) {
  // Update scatter
  updateChartScatter(charts.scatterPlot2, u1, u2, 'Reduced-form shocks', 'u₁', 'u₂');
  updateChartScatter(charts.scatterPlot3, e1, e2, 'Innovations', 'e₁', 'e₂');
  // Update loss
  updateLossPlot(onlyPoint, charts.lossplot4m, phi0, phi, lossNonGaussian, '', u1, u2);
  // Update equation
  try { insertEqSVARe(B); } catch (e) {}
  // Update stats tables (univariate moments for u and e)
  try {
    const statsU = calculateMoments(u1, u2);
    const statsE = calculateMoments(e1, e2);
    const htmlU = createHTMLTableUnivariateMoments(statsU, 'Moments of reduced-form shocks u', 'u');
    const htmlE = createHTMLTableUnivariateMoments(statsE, 'Moments of innovations e', 'e');
    createTable('stats-u-additional', htmlU);
    createTable('stats-e-additional', htmlE);
  } catch (e) {}
}

function setupEventListeners() {
  // T slider
  createEventListener('T', (val) => {
    document.getElementById('TValue').textContent = ` ${val.toFixed(0)}`;
    generateNewData(val);
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

  // New Data
  const btn = document.getElementById('newDataBtn');
  if (btn) {
    btn.addEventListener('click', () => {
      generateNewData(T);
      B = getB(phi);
      [e1, e2] = getE(u1, u2, B);
      updateAllChartsAndStats(false);
    });
  }

  // Maximize non-Gaussianity animation
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
        stop = animateBallRolling(charts.lossplot4m, lossNonGaussian, 'max', phi, callbacks, u1, u2);
      } catch (err) {
        console.error('Animation error:', err);
      }
    });
  }
}
