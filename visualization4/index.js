// Global variables
let charts = {};
let epsilon1, epsilon2, u1, u2, e1, e2;
let selectedPointIndex = null; 
let s;
let T;
let phi0;
let phi;
let B0,B;


// Function to load a script
function loadScript(src) {
  return new Promise((resolve, reject) => {
      let script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Script load error for ${src}`));
      document.head.appendChild(script);
  });
}

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

// Load scripts sequentially
async function loadScripts() {
  for (const script of scripts) {
    await loadScript(script);
  }
  // Wait for DOM content to be loaded before initializing the app
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    initializeApp();
  }
}

// Wait for MathJax to be ready
document.addEventListener('MathJaxReady', function() {
  // Wait for DOMContentLoaded event
  document.addEventListener('DOMContentLoaded', function() {
      loadScripts();
  });
});


function initializeApp() {
  // Initialize UI elements
  initializeUI();

  // Initialize UI elements
  initializeVariables();
  
  // Initialize charts (creates empty chart objects)
  initializeCharts();  
   
  // Set up event listeners
  setupEventListeners();
  
  // Typeset MathJax content
  if (typeof MathJax !== 'undefined' && MathJax.typeset) {
    MathJax.typeset();
  }
  
  if (document.readyState === 'complete') {
    document.getElementById('loading-screen').style.display = 'none';
  } else {
    window.addEventListener('load', () => {
      document.getElementById('loading-screen').style.display = 'none';
    });
  }
}


function initializeUI() {
  setupStickyInputContainer();
  setupNavigationMenu();
  setupInputContentWrapper();
  setupInfoIcons();
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
    updateChartScatter(charts.scatterPlot3, u1, u2, "Innovations", "e₁", "e₂", true);
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
  
  [u1, u2] = getU(epsilon1, epsilon2, B0)  

  [e1, e2] = getE(u1,u2,B)

}


