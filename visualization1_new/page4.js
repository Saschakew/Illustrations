// Global variables
let charts = {};
let epsilon1, epsilon2, u1, u2, e1, e2;
let selectedPointIndex = null; 
let T;
let phi0;
let phi;
let B0, B;
let color1, color2, color3;

// Using shared Bootstrap helpers for script loading and initialization

// Array of scripts to load
const scripts = [
  'variables.js',
  'ui.js',
  'charts.js',
  'dataGeneration.js',
  'htmlout.js',
  'svar.js',
  'eventListeners.js'
];

// Prevent scrolling during initial render using Bootstrap helper
try { Bootstrap.lockScrollPreInit(); } catch (e) {}

// Gate on MathJax readiness then DOM, load dependencies, and initialize
try {
  Bootstrap.onMathJaxThenDOM(async function() {
    await Bootstrap.loadScriptsSequential(scripts, Bootstrap.ASSET_VERSION);
    initializeApp();
  });
} catch (e) {
  // Fallback: naive loader and direct init if Bootstrap unavailable
  (async () => {
    for (const s of scripts) {
      await new Promise((res) => {
        const el = document.createElement('script');
        el.src = s; el.onload = res; el.onerror = () => res();
        document.head.appendChild(el);
      });
    }
    initializeApp();
  })();
}

async function initializeApp() {
  // Initialize UI elements
  initializeUI();

  // Initialize UI elements
  initializeVariables();
  
  // Initialize charts (creates empty chart objects)
  initializeCharts();  
   
  // Set up event listeners
  setupEventListeners();

  // Initial draw/update of charts and stats
  try { updateAllChartsAndStats(false); } catch (e) {}

  // Stabilize layout and reveal UI via shared helpers
  try { await Bootstrap.awaitFontsAndTypesetAndStabilize(); } catch (e) {}
  try { Bootstrap.finalizeWithLoaderFadeOut(); } catch (e) {}
}

function initializeUI() {
  // Centralized common UI init with graceful fallback
  try { initializeCommonUI(); } catch (e) {
    try { setupStickyInputContainer(); } catch (e2) {}
    try { setupNavigationMenu(); } catch (e2) {}
    try { setupActiveNavLink(); } catch (e2) {}
    try { setupInputContentWrapper(); } catch (e2) {}
    try { setupInfoIcons(); } catch (e2) {}
  }

  const { color1: c1, color2: c2, color3: c3 } = getThemeAccents();
  color1 = c1;
  color2 = c2;
  color3 = c3;
  
  // Override colors with the exact equation colors if present in the DOM
  try {
    const scope = document.querySelector('#interactive-loss') || document;
    const eqWrappers = scope.querySelectorAll('.equation-wrapper[style*="border-color"]');
    if (eqWrappers && eqWrappers.length >= 3) {
      const eqColors = Array.from(eqWrappers)
        .map(el => {
          const cs = getComputedStyle(el);
          return cs.borderColor || cs.color;
        })
        .filter(Boolean);
      if (eqColors.length >= 3) {
        [color1, color2, color3] = eqColors.slice(0, 3);
      }
    } else {
      // Keep theme accents as fallback; avoid hardcoded colors
    }
  } catch (e) {
    // Keep previously set theme accents as fallback
  }
  
  // Setup popups for all input labels
  const popupIds = ['T', 'phi', 'phi0'];
  setupPopup(popupIds)  
}

function initializeVariables() { 
  // Inputs
  T = getInputValue('T');
  phi0 = 0.5;
  phi = getInputValue('phi');
  B0 = getB(phi0);
  B = getB(phi);

  // Reflect UI
  try {
    const tVal = document.getElementById('TValue'); if (tVal) tVal.textContent = ` ${T.toFixed(0)}`;
    const pVal = document.getElementById('phiValue'); if (pVal) pVal.textContent = ` ${phi.toFixed(2)}`;
    const p0Val = document.getElementById('phi0Value'); if (p0Val) p0Val.textContent = ` ${phi0.toFixed(2)}`;
  } catch (e) {}

  generateNewData(T);

  // Initial equations
  try { insertEqSVARe(B); } catch (e) {}
  try { insertEqNG(); } catch (e) {}
}

// Event Listeners Setup
function setupEventListeners() {
  // T slider
  createEventListener('T', (val) => {
    document.getElementById('TValue').textContent = ` ${val.toFixed(0)}`;
    T = val;
    generateNewData(T);
    // e depends on B (phi)
    B = getB(phi);
    [e1, e2] = getE(u1, u2, B);
    updateAllChartsAndStats(false);
    try { insertEqNG(); } catch (e) {}
  });

  // phi slider
  createEventListener('phi', (val) => {
    document.getElementById('phiValue').textContent = val.toFixed(2);
    phi = val;
    B = getB(phi);
    [e1, e2] = getE(u1, u2, B);
    updateAllChartsAndStats(true);
    try { insertEqSVARe(B); } catch (e) {}
  });

  // New Data button
  const newDataBtn = document.getElementById('newDataBtn');
  if (newDataBtn) {
    newDataBtn.addEventListener('click', () => {
      generateNewData(T);
      B = getB(phi);
      [e1, e2] = getE(u1, u2, B);
      updateAllChartsAndStats(false);
      try { insertEqNG(); } catch (e) {}
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
          try { insertEqSVARe(B); } catch (e) {}
        }
      ];
      try {
        stop = animateBallRolling(charts.lossplot4, loss34, 'min', phi, callbacks, u1, u2);
      } catch (err) {
        console.error('Animation error:', err);
      }
    });
  }

  // Standardize point-click highlighting across scatter plots
  try { attachScatterClickHandlers(['scatterPlot2', 'scatterPlot3']); } catch (e) {}
}


 
// Chart Initialization
function initializeCharts() {
  // Scatter plots for reduced-form shocks and innovations
  try {
    const scatterCfg = getScatterPlotConfig();
    createChart('scatterPlot2', scatterCfg);
    createChart('scatterPlot3', scatterCfg);
    updateScatter(charts.scatterPlot2, u1, u2, 'u', true);
    updateScatter(charts.scatterPlot3, e1, e2, 'e', true);
  } catch (e) {}

  // Loss plot
  const lossCfg = getLossPlotConfig();
  createChart('lossplot4', lossCfg);
  updateLossPlot(false, charts.lossplot4, phi0, phi, loss34, '', u1, u2);
}

function updateAllChartsAndStats(onlyPoint = false) {
  try {
    // Update scatter plots
    updateScatter(charts.scatterPlot2, u1, u2, 'u', true);
    updateScatter(charts.scatterPlot3, e1, e2, 'e', true);
  } catch (e) {}

  try {
    // Update loss plot
    updateLossPlot(onlyPoint, charts.lossplot4, phi0, phi, loss34, '', u1, u2);
  } catch (e) {}

  try {
    // Update stats tables using shared HTML generators
    const statsU = calculateMoments(u1, u2);
    const statsE = calculateMoments(e1, e2);
    const htmlU = createHTMLTableDependency(statsU, 'Co-moments of reduced-form shocks u', 'u');
    const htmlE = createHTMLTableDependency(statsE, 'Co-moments of innovations e', 'e');
    createTable('stats-u-additional', htmlU);
    createTable('stats-e-additional', htmlE);
  } catch (e) {}
}

 
 
function generateNewData(Tnew) {  
  T = Tnew;
  // structural shocks: use uniform baseline and normalize
  const rawEpsilon1 = generateUniformData(T);
  const rawEpsilon2 = generateUniformData(T);
  [epsilon1, epsilon2] = NormalizeData(rawEpsilon1, rawEpsilon2);
  [u1, u2] = getU(epsilon1, epsilon2, B0);
  [e1, e2] = getE(u1, u2, B);
  selectedPointIndex = null;
}


