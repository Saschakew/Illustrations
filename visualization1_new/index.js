// Global variables
let charts = {};
let epsilon1, epsilon2, u1, u2, e1, e2;
let selectedPointIndex = null; 
let s;
let T;
let phi0;
let phi;
let B0,B;

// Using shared Bootstrap.ASSET_VERSION for cache-busting


// Using shared Bootstrap.loadScriptsSequential; local loadScript removed.

// Array of scripts to load (index page needs only common UI)
const scripts = [
  'ui.js'
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

// Initialization handled by Bootstrap.onMathJaxThenDOM


async function initializeApp() {
  // Index page: no inputs, no charts. Initialize only common UI.
  try { initializeCommonUI(); } catch (e) {}
  // Stabilize layout, typeset math, and finalize loader/scroll using shared Bootstrap helpers
  try { await Bootstrap.awaitFontsAndTypesetAndStabilize(); } catch (e) {}
  try { Bootstrap.finalizeWithLoaderFadeOut(); } catch (e) {}
}


function initializeUI() {
  setupStickyInputContainer();
  setupNavigationMenu();
  setupActiveNavLink();
  setupInputContentWrapper();
  setupInfoIcons();
  
  // Setup popups for all input labels
  const popupIds = ['T', 'phi', 'phi0'];
  setupPopup(popupIds)  
}



function initializeVariables() { 
  s =  0;
  T= getInputValue('T');
  phi0 = 0.5;
  phi = getInputValue('phi');
  B0 = getB(phi0);
  B = getB(phi);
  insertEqSVAR(B0);
  insertEqSVARe(B);

  generateNewData(T); 
 

}


// Event Listeners Setup
function setupEventListeners() { 
 
  createEventListener('phi0', 
    (value) => document.getElementById('phi0Value').textContent = value.toFixed(2),
    (value) => phi0 = value, 
    (value) => B0 = getB(phi0),
    (value) => insertEqSVAR(B0),
    (value) => [u1, u2] = getU(epsilon1,epsilon2,B0),
    (value) => [e1, e2] = getE(u1,u2,B), 
    (value) => statsE = calculateMoments(e1, e2),
    (value) => createTableCovariance(statsE),
    (value) => updateChartScatter(charts.scatterPlot2, u1, u2, "Reduced Form Shocks", "u₁", "u₂", true),
    (value) => updateChartScatter(charts.scatterPlot3, e1, e2, "Innovations", "e₁", "e₂", true),
  );
    
  createEventListener('phi', 
    (value) => document.getElementById('phiValue').textContent = value.toFixed(2),
    (value) => phi = value,
    (value) => B = getB(phi),
    (value) => insertEqSVARe(B),
    (value) => [e1, e2] = getE(u1,u2,B),  
    (value) => statsE = calculateMoments(e1, e2),
    (value) => createTableCovariance(statsE),
    (value) => updateChartScatter(charts.scatterPlot3, e1, e2, "Innovations", "e₁", "e₂", true),
  );

       
 

  createEventListener('T',  
    (value) => document.getElementById('TValue').textContent = value.toFixed(0),
    (value) => T = value,
    (value) => generateNewData(T), 
    (value) => statsE = calculateMoments(e1, e2),
    (value) => createTableCovariance(statsE),
    (value) => updateChartScatter(charts.scatterPlot1, epsilon1, epsilon2, "Structural Form Shocks", "ε₁", "ε₂", true),
    (value) => updateChartScatter(charts.scatterPlot2, u1, u2, "Reduced Form Shocks", "u₁", "u₂", true),
    (value) => updateChartScatter(charts.scatterPlot3, e1, e2, "Innovations", "e₁", "e₂", true),
  );


  newDataBtn.addEventListener('click', function() {
    generateNewData(T); 
    updateChartScatter(charts.scatterPlot1, epsilon1, epsilon2, "Structural Form Shocks", "ε₁", "ε₂", true);
    updateChartScatter(charts.scatterPlot2, u1, u2, "Reduced Form Shocks", "u₁", "u₂", true);
    updateChartScatter(charts.scatterPlot3, e1, e2, "Innovations", "e₁", "e₂", true);
    statsE = calculateMoments(e1, e2);
    createTableCovariance(statsE);
  })

  // Highlight points in scatter 
  const scatterPlots = ['scatterPlot1', 'scatterPlot2', 'scatterPlot3'];
  scatterPlots.forEach((id) =>   {
    const canvas = document.getElementById(id); 
    canvas.addEventListener('click', function() {
      console.log(`Canvas ${id} clicked`);
      const chart = charts[id];
      const elements = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);
      handleChartClick(event, elements, chart);
    }) 
  })

 

 
 
 
}



 
// Chart Initialization
function initializeCharts() {
  const ScatterConfig = getScatterPlotConfig()


  createChart('scatterPlot1',ScatterConfig)  
  createChart('scatterPlot2',ScatterConfig)  
  createChart('scatterPlot3',ScatterConfig)  
 
 
  updateChartScatter(charts.scatterPlot1, epsilon1, epsilon2, "Structural Shocks: ", "ε₁", "ε₂", true);
  updateChartScatter(charts.scatterPlot2, u1, u2, "Reduced Form Shocks: ", "u₁", "u₂", true);
  updateChartScatter(charts.scatterPlot3, e1, e2, "Innovations: ", "e₁", "e₂", true);



}



 
  

 
function generateNewData(T) {  

  let rawEpsilon1, rawEpsilon2; 
  rawEpsilon1 = generateMixedNormalData(T, s);
  rawEpsilon2 = generateMixedNormalData(T, 0); 
  [epsilon1, epsilon2] = NormalizeData(rawEpsilon1, rawEpsilon2);
  
  [u1, u2] = getU(epsilon1, epsilon2, B0)  ;

  [e1, e2] = getE(u1,u2,B);

}


