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
  initializeApp();
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
  MathJax.typeset();
 
} ;


function initializeUI() {
  setupStickyInputContainer();
  setupNavigationMenu();
}



function initializeVariables() { 
  s =  getInputValue('sSlider');
  T= getInputValue('T');
  phi0 = getInputValue('phi0');
  phi = getInputValue('phi');
  B0 = getB(phi0);
  B = getB(phi);
  insertEqSVARe(B)

  generateNewData(T); 
  
   statsEpsilon = calculateMoments(epsilon1, epsilon2);
   updateNonGaussianityDisplay(statsEpsilon);
 

}


// Event Listeners Setup
function setupEventListeners() { 
   
  createEventListener('phi0', 
    (value) => document.getElementById('phi0Value').textContent = value.toFixed(2),
    (value) => phi0 = value, 
    (value) => B0 = getB(phi0),
    (value) => [u1, u2] = getU(epsilon1,epsilon2,B0),
    (value) => [e1, e2] = getE(u1,u2,B), 
    (value) => statsE = calculateMoments(e1, e2),
    (value) => createTableDependency(statsE),
    (value) => updateChartScatter(charts.scatterPlot2, u1, u2, "Reduced Form Shocks", "u₁", "u₂", true),
    (value) => updateChartScatter(charts.scatterPlot3, e1, e2, "Innovations", "e₁", "e₂", true),
    (value) => updateLossPlot(charts.lossplot,phi0,phi,loss34),
  );
    
  createEventListener('phi', 
    (value) => document.getElementById('phiValue').textContent = value.toFixed(2),
    (value) => phi = value,
    (value) => B = getB(phi),
    (value) => insertEqSVARe(B),
    (value) => [e1, e2] = getE(u1,u2,B),  
    (value) => statsE = calculateMoments(e1, e2),
    (value) => createTableDependency(statsE),
    (value) => updateChartScatter(charts.scatterPlot3, e1, e2, "Innovations", "e₁", "e₂", true),
    (value) => updateLossPlot(charts.lossplot,phi0,phi,loss34),
  );

       
  createEventListener('sSlider', 
    (value) => document.getElementById('sValue').textContent = value.toFixed(2),
    (value) => s = value, 
    (value) => generateNewData(T),
    (value) => [u1, u2] = getU(epsilon1,epsilon2,B0),
    (value) => [e1, e2] = getE(u1,u2,B),
    (value) => [e1, e2] = getE(u1,u2,B),  
    (value) => statsE = calculateMoments(e1, e2),
    (value) => createTableDependency(statsE),
     (value) => statsEpsilon = calculateMoments(epsilon1, epsilon2),
    (value) => updateNonGaussianityDisplay(statsEpsilon),
    (value) => updateChartScatter(charts.scatterPlot1, epsilon1, epsilon2, "Structural Form Shocks", "ε₁", "ε₂", true),
    (value) => updateChartScatter(charts.scatterPlot2, u1, u2, "Reduced Form Shocks", "u₁", "u₂", true),
    (value) => updateChartScatter(charts.scatterPlot3, e1, e2, "Innovations", "e₁", "e₂", true),
    (value) => updateLossPlot(charts.lossplot,phi0,phi,loss34),
  );

  createEventListener('T',  
    (value) => T = value,
    (value) => generateNewData(T),
    (value) => statsEpsilon = calculateMoments(epsilon1, epsilon2),
   (value) => updateNonGaussianityDisplay(statsEpsilon),
    (value) => statsE = calculateMoments(e1, e2),
    (value) => createTableDependency(statsE),
    (value) => updateChartScatter(charts.scatterPlot1, epsilon1, epsilon2, "Structural Form Shocks", "ε₁", "ε₂", true),
    (value) => updateChartScatter(charts.scatterPlot2, u1, u2, "Reduced Form Shocks", "u₁", "u₂", true),
    (value) => updateChartScatter(charts.scatterPlot3, e1, e2, "Innovations", "e₁", "e₂", true),
    (value) => updateLossPlot(charts.lossplot,phi0,phi,loss34),
  );


  newDataBtn.addEventListener('click', function() {
    generateNewData(T);
   statsEpsilon = calculateMoments(epsilon1, epsilon2);
    updateNonGaussianityDisplay(statsEpsilon);
    updateChartScatter(charts.scatterPlot1, epsilon1, epsilon2, "Structural Form Shocks", "ε₁", "ε₂", true);
    updateChartScatter(charts.scatterPlot2, u1, u2, "Reduced Form Shocks", "u₁", "u₂", true);
    updateChartScatter(charts.scatterPlot3, u1, u2, "Innovations", "e₁", "e₂", true);
    updateLossPlot(charts.lossplot,phi0,phi,loss34 );
    statsE = calculateMoments(e1, e2);
     createTableDependency(statsE);
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

  MinDependenciesBtn .addEventListener('click', function() {
    animateBallRolling(charts.lossplot,loss34,'min',phi,charts.scatterPlot3); 
  })
 

}



 
// Chart Initialization
function initializeCharts() {
  const ScatterPlotConfig = getScatterPlotConfig()


  createChart('scatterPlot1',ScatterPlotConfig)  
  createChart('scatterPlot2',ScatterPlotConfig)  
  createChart('scatterPlot3',ScatterPlotConfig)  
 
 
  updateChartScatter(charts.scatterPlot1, epsilon1, epsilon2, "Structural Shocks", "ε₁", "ε₂", true);
  updateChartScatter(charts.scatterPlot2, u1, u2, "Reduced Form Shocks", "u₁", "u₂", true);
  updateChartScatter(charts.scatterPlot3, e1, e2, "Innovations", "e₁", "e₂", true);

  
  const LossPlotConfig = getLossPlotConfig() 
  
  createChart('lossplot',LossPlotConfig)  

  updateLossPlot(charts.lossplot,phi0,phi,loss34)


  statsE = calculateMoments(e1, e2)
  createTableDependency(statsE)

}



 
  

 
function generateNewData(T) {  

  let rawEpsilon1, rawEpsilon2; 
  rawEpsilon1 = generateMixedNormalData(T, s);
  rawEpsilon2 = generateMixedNormalData(T, 0); 
  [epsilon1, epsilon2] = NormalizeData(rawEpsilon1, rawEpsilon2)
    

  [u1, u2] = getU(epsilon1, epsilon2, B0)  

  [e1, e2] = getE(u1,u2,B)

  
   
      
}


