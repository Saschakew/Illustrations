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
let gamma1, gamma2;

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
  s =  0;
  T= getInputValue('T');
  phi0 = getInputValue('phi0');
  phi = getInputValue('phi');
  B0 = getB(phi0);
  B = getB(phi);
  insertEqSVARe(B)

  
  gamma1 = getInputValue('gamma1');
  gamma2 = getInputValue('gamma2');
  insertEqZ(gamma1, gamma2)

  generateNewData(T); 
 

}


// Event Listeners Setup
function setupEventListeners() {  
  
  createEventListener('phi', 
    (value) => document.getElementById('phiValue').textContent = value.toFixed(2),
    (value) => phi = value,
    (value) => B = getB(phi),
    (value) => insertEqSVARe(B),
    (value) => [e1, e2] = getE(u1,u2,B),   
    (value) => statsZE = calculateMoments(z1, e2),
    (value) => createTableZCovariance(statsZE),
    (value) => updateChartScatter(charts.scatterPlot3, e1, e2, "Innovations", "e₁", "e₂", true),
    (value) => updateChartScatter(charts.scatterPlotZ1E1, z1, e1, "z1 e1", "z₁", "e₁", true),
    (value) => updateChartScatter(charts.scatterPlotZ1E2, z1, e2, "z1 e2", "z₁", "e₂", true), 
    (value) =>  updateLossPlot(charts.lossplot,phi0,phi,lossZ1,u1, u2,z1,z2),
  );

       
 

  createEventListener('T',  
    (value) => T = value,
    (value) => generateNewData(T), 
    (value) => statsZE = calculateMoments(z1, e2),
    (value) => createTableZCovariance(statsZE),
    (value) => updateChartScatter(charts.scatterPlot2, u1, u2, "Reduced Form Shocks", "u₁", "u₂", true),
    (value) => updateChartScatter(charts.scatterPlot3, e1, e2, "Innovations", "e₁", "e₂", true),
    (value) => updateChartScatter(charts.scatterPlotZ1Eps1, z1, epsilon1, "z1 eps1", "z₁", "ε₁", true),
    (value) => updateChartScatter(charts.scatterPlotZ1Eps2, z1, epsilon2, "z1 eps2", "z₁", "ε₂", true),
    (value) => updateChartScatter(charts.scatterPlotZ1E1, z1, e1, "z1 e1", "z₁", "e₁", true),
    (value) => updateChartScatter(charts.scatterPlotZ1E2, z1, e2, "z1 e2", "z₁", "e₂", true),
    (value) =>  updateLossPlot(charts.lossplot,phi0,phi,lossZ1,u1, u2,z1,z2),
 
  );


  newDataBtn.addEventListener('click', function() {
    generateNewData(T);  
    updateChartScatter(charts.scatterPlot2, u1, u2, "Reduced Form Shocks", "u₁", "u₂", true);
    updateChartScatter(charts.scatterPlot3, u1, u2, "Innovations", "e₁", "e₂", true); 
    updateChartScatter(charts.scatterPlotZ1Eps1, z1, epsilon1, "z1 eps1", "z₁", "ε₁", true);
    updateChartScatter(charts.scatterPlotZ1Eps2, z1, epsilon2, "z1 eps2", "z₁", "ε₂", true);
    updateChartScatter(charts.scatterPlotZ1E1, z1, e1, "z1 e1", "z₁", "e₁", true);
    updateChartScatter(charts.scatterPlotZ1E2, z1, e2, "z1 e2", "z₁", "e₂", true);
    updateLossPlot(charts.lossplot,phi0,phi,lossZ1,u1, u2,z1,z2);
    statsZE = calculateMoments(z1, e2);
    createTableZCovariance(statsZE);
  })

  createEventListener('gamma1', 
    (value) => document.getElementById('gamma1Value').textContent = value.toFixed(2),
    (value) => gamma1 = value, 
    (value) => z1 =  epsilon1.map((e1, i) => gamma1 * e1 + gamma2 * epsilon2[i] + eta1[i]),
    (value) => statsZE = calculateMoments(z1, e2),
    (value) => createTableZCovariance(statsZE),
    (value) => updateChartScatter(charts.scatterPlotZ1Eps1, z1, epsilon1, "z1 eps1", "z₁", "ε₁", true),
    (value) => updateChartScatter(charts.scatterPlotZ1Eps2, z1, epsilon2, "z1 eps2", "z₁", "ε₂", true),  
    (value) => updateChartScatter(charts.scatterPlotZ1E1, z1, e1, "z1 e1", "z₁", "e₁", true),
    (value) => updateChartScatter(charts.scatterPlotZ1E2, z1, e2, "z1 e2", "z₁", "e₂", true), 
    (value) => insertEqZ(gamma1, gamma2),
    (value) =>  updateLossPlot(charts.lossplot,phi0,phi,lossZ1,u1, u2,z1,z2),
  );

  createEventListener('gamma2', 
    (value) => document.getElementById('gamma2Value').textContent = value.toFixed(2),
    (value) => gamma2 = value, 
    (value) => z1 =  epsilon1.map((e1, i) => gamma1 * e1 + gamma2 * epsilon2[i] + eta1[i]),
    (value) => statsZE = calculateMoments(z1, e2),
    (value) => createTableZCovariance(statsZE),
    (value) => updateChartScatter(charts.scatterPlotZ1Eps1, z1, epsilon1, "z1 eps1", "z₁", "ε₁", true),
    (value) => updateChartScatter(charts.scatterPlotZ1Eps2, z1, epsilon2, "z1 eps2", "z₁", "ε₂", true), 
    (value) => updateChartScatter(charts.scatterPlotZ1E1, z1, e1, "z1 e1", "z₁", "e₁", true),
    (value) => updateChartScatter(charts.scatterPlotZ1E2, z1, e2, "z1 e2", "z₁", "e₂", true), 
    (value) => insertEqZ(gamma1, gamma2),
    (value) =>  updateLossPlot(charts.lossplot,phi0,phi,lossZ1,u1, u2,z1,z2),
  );
 
    // Highlight points in scatter 
    const scatterPlots = [  'scatterPlot2', 'scatterPlot3', 
      'scatterPlotZ1Eps1', 'scatterPlotZ1Eps2', 'scatterPlotZ1E1', 'scatterPlotZ1E2'];
    scatterPlots.forEach((id) =>   {
      const canvas = document.getElementById(id); 
      canvas.addEventListener('click', function() {
        console.log(`Canvas ${id} clicked`);
        const chart = charts[id];
        const elements = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);
        handleChartClick(event, elements, chart);
      }) 
    })

    const callbacks = [
      function(phi) { document.getElementById('phi').value = phi.toFixed(2); },
      function(phi) { document.getElementById('phiValue').textContent = phi.toFixed(2); },
      function(phi) { B = getB(phi); insertEqSVARe(B); },
      function(phi) { [e1, e2] = getE(u1, u2, B); },
      function(phi) { updateChartScatter(charts.scatterPlot3, e1, e2, "Innovations", "e₁", "e₂", false); }, 
      function(phi) { updateChartScatter(charts.scatterPlotZ1E1, z1, e1, "z1 e1", "z₁", "e₁", true); }, 
      function(phi) { updateChartScatter(charts.scatterPlotZ1E2, z1, e2, "z1 e2", "z₁", "e₂", true); }, 
      function(phi) { statsZE = calculateMoments(z1, e2); createTableZCovariance(statsZE)  } 
    ];
    MinDependenciesBtn .addEventListener('click', function() {
      animateBallRolling(charts.lossplot,lossZ1,'min',phi,callbacks,u1,u2,z1,z2); 
    })
}



 
// Chart Initialization
function initializeCharts() {
  const ScatterConfig = getScatterPlotConfig()

 
  createChart('scatterPlot2',ScatterConfig)  
  createChart('scatterPlot3',ScatterConfig)  
 
  
  updateChartScatter(charts.scatterPlot2, u1, u2, "Reduced Form Shocks", "u₁", "u₂", true);
  updateChartScatter(charts.scatterPlot3, e1, e2, "Innovations", "e₁", "e₂", true);

  createChart('scatterPlotZ1Eps1',ScatterConfig)  
  createChart('scatterPlotZ1Eps2',ScatterConfig)  
    
  updateChartScatter(charts.scatterPlotZ1Eps1, z1, epsilon1, "z1 eps1", "z₁", "ε₁", true);
  updateChartScatter(charts.scatterPlotZ1Eps2, z1, epsilon2, "z1 eps2", "z₁", "ε₂", true);

  
  createChart('scatterPlotZ1E1',ScatterConfig)  
  createChart('scatterPlotZ1E2',ScatterConfig)  
    
  updateChartScatter(charts.scatterPlotZ1E1, z1, e1, "z1 e1", "z₁", "e₁", true);
  updateChartScatter(charts.scatterPlotZ1E2, z1, e2, "z1 e2", "z₁", "e₂", true);

  const LossPlotConfig = getLossPlotConfig() 
  
  createChart('lossplot',LossPlotConfig)  

  updateLossPlot(charts.lossplot,phi0,phi,lossZ1,u1, u2,z1,z2)
  
  statsZE = calculateMoments(z1, e2)
  createTableZCovariance(statsZE)
}



 

 
function generateNewData(T) {  

  let rawEpsilon1, rawEpsilon2; 
  rawEpsilon1 = generateMixedNormalData(T, s);
  rawEpsilon2 = generateMixedNormalData(T, 0); 
  [epsilon1, epsilon2] = NormalizeData(rawEpsilon1, rawEpsilon2) ;
  
  [u1, u2] = getU(epsilon1, epsilon2, B0)   ; 
  [e1, e2] = getE(u1,u2,B); 

  eta1 = generateMixedNormalData(T, 0); 
  z1 =  eta1.map((eta, i) => gamma1 * epsilon1[i] + gamma2 * epsilon2[i] + eta ); 
  eta2 = generateMixedNormalData(T, 0); 
  z2 = eta1.map((eta, i) => 1 * epsilon1[i]   + eta ); 
   
}


