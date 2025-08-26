// Global variables
let charts = {};
let epsilon1, epsilon2, u1, u2;
let selectedPointIndex = null; 
let s;
let T;
let phi0;
let B0;
let color1, color2, color3;

// Using shared Bootstrap.ASSET_VERSION for cache-busting

// Using shared Bootstrap.loadScriptsSequential; local loadScript removed.

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

// Prevent scrolling during initial render to avoid sticky recalculation jank
try { Bootstrap.lockScrollPreInit(); } catch (e) {}

// Load scripts using shared Bootstrap helper and initialize app
try {
  Bootstrap.onMathJaxThenDOM(async function() {
    await Bootstrap.loadScriptsSequential(scripts, Bootstrap.ASSET_VERSION);
    initializeApp();
  });
} catch (e) {
  // Fallback if Bootstrap unavailable
  (async () => {
    for (const s of scripts) {
      await new Promise((res) => { const el = document.createElement('script'); el.src = s; el.onload = res; el.onerror = () => res(); document.head.appendChild(el); });
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
      initializeApp();
    }
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
  
  // Stabilize layout, typeset, and finalize loader using shared helpers
  try { await Bootstrap.awaitFontsAndTypesetAndStabilize(); } catch (e) {}
  try { Bootstrap.finalizeWithLoaderFadeOut(); } catch (e) {}
  try { if (typeof resizeAllCharts === 'function') resizeAllCharts(); } catch (e) {}
  try { setTimeout(() => { try { if (typeof resizeAllCharts === 'function') resizeAllCharts(); } catch (e) {} }, 50); } catch (e) {}
}


function initializeUI() {
  setupStickyInputContainer();
  setupNavigationMenu();
  setupActiveNavLink();
  setupInputContentWrapper();
  setupInfoIcons();

  const { color1: c1, color2: c2, color3: c3 } = getThemeAccents();
  color1 = c1;
  color2 = c2;
  color3 = c3;
  
    // Setup popups for all input labels
    const popupIds = ['T', 'phi0' ];
    setupPopup(popupIds)  
}


function initializeVariables() { 
  s =  0;
  T = getInputValue('T');
  phi0 = getInputValue('phi0');
  if (isNaN(phi0)) phi0 = 0.5;
  B0 = getB(phi0);
  insertEqSVAR(B0);

  generateNewData(T); 
}


// Event Listeners Setup
function setupEventListeners() {  
  createEventListener('T',  
    (value) => document.getElementById('TValue').textContent = value.toFixed(0),
    (value) => { T = value; generateNewData(T); },
    (value) => updateScatter(charts.scatterPlot1, epsilon1, epsilon2, 'epsilon', true),
    (value) => updateScatter(charts.scatterPlot2, u1, u2, 'u', true),
  );

  createEventListener('phi0', 
    (value) => document.getElementById('phi0Value').textContent = value.toFixed(2),
    (value) => { phi0 = value; B0 = getB(phi0); insertEqSVAR(B0); },
    (value) => { [u1, u2] = getU(epsilon1, epsilon2, B0); },
    (value) => updateScatter(charts.scatterPlot2, u1, u2, 'u', true),
  );

  const newDataBtn = document.getElementById('newDataBtn');
  if (newDataBtn) {
    newDataBtn.addEventListener('click', function() {
      generateNewData(T);
      updateScatter(charts.scatterPlot1, epsilon1, epsilon2, 'epsilon', true);
      updateScatter(charts.scatterPlot2, u1, u2, 'u', true);
    });
  }

  // Highlight points in scatter using DRY helper
  attachScatterClickHandlers(['scatterPlot1', 'scatterPlot2']);

  // Keep charts responsive on window resize and final window load
  try {
    window.addEventListener('resize', () => { try { resizeAllCharts(); } catch (e) {} });
  } catch (e) {}
  try {
    window.addEventListener('load', () => { try { resizeAllCharts(); } catch (e) {} });
  } catch (e) {}
}



 
// Chart Initialization
function initializeCharts() {
  const ScatterConfig = getScatterPlotConfig();

  createChart('scatterPlot1', ScatterConfig);
  createChart('scatterPlot2', ScatterConfig);

  updateScatter(charts.scatterPlot1, epsilon1, epsilon2, 'epsilon', true);
  updateScatter(charts.scatterPlot2, u1, u2, 'u', true);
}



 

 
function generateNewData(T) {  
  let rawEpsilon1, rawEpsilon2; 
  rawEpsilon1 = generateUniformData(T);
  rawEpsilon2 = generateUniformData(T); 
  [epsilon1, epsilon2] = NormalizeData(rawEpsilon1, rawEpsilon2);
  [u1, u2] = getU(epsilon1, epsilon2, B0);
}

// Resize all charts helper (mirrors page6 behavior)
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



