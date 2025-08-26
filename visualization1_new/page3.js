// Global variables
let charts = {};
let epsilon1, epsilon2, u1, u2, e1, e2;
let z1, z2, eta1, eta2;
let selectedPointIndex = null; 
let s;
let T;
let phi0;
let phi;
let B0,B;
let gamma1, gamma2 , gamma3;
let color1, color2, color3;
let refLineColor;
let W;

// Shared scripts to load via Bootstrap
const scripts = [
  'variables.js',
  'ui.js',
  'charts.js',
  'dataGeneration.js',
  'htmlout.js',
  'svar.js',
  'eventListeners.js'
];

// Use shared bootstrap flow: lock scroll, wait for MathJax+DOM, load modules, then init
try { Bootstrap.lockScrollPreInit(); } catch (e) {}
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
  // Initialize UI, variables, charts, and events
  initializeUI();
  initializeVariables();
  initializeCharts();
  setupEventListeners();

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

  // Reference line color from theme border
  try {
    const styles = getComputedStyle(document.documentElement);
    refLineColor = (styles.getPropertyValue('--border') || '#e5e7eb').trim();
  } catch (e) { refLineColor = '#e5e7eb'; }

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
      // Keep theme accents as fallback; no hardcoded colors
    }
  } catch (e) {
    // Keep previously set theme accents as fallback
  }

  
  // Setup popups for input labels that exist in page3.html
  const popupIds = ['T', 'phi'];
  setupPopup(popupIds)  
}


 
function initializeVariables() { 
  s =  0;
  T= getInputValue('T');
  phi0 = 0.5;
  phi = getInputValue('phi');
  B0 = getB(phi0);
  B = getB(phi); 

  
  // Page 3 doesn't have gamma or rho controls - these are for other pages


  // Reflect UI displays for initial values
  try {
    const tVal = document.getElementById('TValue'); if (tVal) tVal.textContent = ` ${T.toFixed(0)}`;
    const pVal = document.getElementById('phiValue'); if (pVal) pVal.textContent = ` ${phi.toFixed(2)}`;
  } catch (e) {}

  generateNewData(T); 
  // Render initial equations for B0 and A=B(phi)^{-1}
  try { insertEqSVAR(B0); } catch (e) {}
  try { insertEqSVARe(B); } catch (e) {}
 

}


// Event Listeners Setup
function setupEventListeners() {  
  
 


  createEventListener('phi', 
    (value) => document.getElementById('phiValue').textContent = value.toFixed(2),
    (value) => phi = value,
    (value) => B = getB(phi), 
    (value) => { try { insertEqSVARe(B); } catch (e) {} },
    (value) => [e1, e2] = getE(u1,u2,B),
    (value) => updateScatter(charts.scatterPlot2, u1, u2, 'u', true),
    (value) => updateScatter(charts.scatterPlot3, e1, e2, 'e', true)
  );

       
 

  createEventListener('T',  
    (value) => document.getElementById('TValue').textContent = value.toFixed(0),
    (value) => T = value,
    (value) => generateNewData(T),
    (value) => updateScatter(charts.scatterPlot2, u1, u2, 'u', true),
    (value) => updateScatter(charts.scatterPlot3, e1, e2, 'e', true)
  );


  const newDataBtn = document.getElementById('newDataBtn');
  if (newDataBtn) {
    newDataBtn.addEventListener('click', function() {
      generateNewData(T);   
      updateScatter(charts.scatterPlot2, u1, u2, 'u', true);
      updateScatter(charts.scatterPlot3, e1, e2, 'e', true);
    });
  }

  // gamma1 event listener removed - element doesn't exist in page3.html

  // gamma2 event listener removed - element doesn't exist in page3.html
 

   
  
  // rho1 event listener removed - element doesn't exist in page3.html

  // rho2 event listener removed - element doesn't exist in page3.html

  // Standardized click handlers for existing scatter plots on page 3
  attachScatterClickHandlers(['scatterPlot2','scatterPlot3']);

  
}



 
function initializeCharts() {
  const ScatterConfig = getScatterPlotConfig()
 
  // Create and initialize page 3's main scatter plots to match page 4 styling
  createChart('scatterPlot2',ScatterConfig)
  createChart('scatterPlot3',ScatterConfig)
  updateScatter(charts.scatterPlot2, u1, u2, 'u', true);
  updateScatter(charts.scatterPlot3, e1, e2, 'e', true);

  // Page 3 only has scatterPlot2 and scatterPlot3 - other charts don't exist in the HTML

}



 

 
function generateNewData(T) {  

  // Generate independent non-Gaussian shocks and derive u and e
  const rawEpsilon1 = generateUniformData(T);
  const rawEpsilon2 = generateUniformData(T); 
  [epsilon1, epsilon2] = NormalizeData(rawEpsilon1, rawEpsilon2);

  [u1, u2] = getU(epsilon1, epsilon2, B0);
  [e1, e2] = getE(u1, u2, B);

  // Page 3 does not use z1/z2 or W; omit their generation to avoid undefined rho/gamma
}
