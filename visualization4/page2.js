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
let W;

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

  color1 =  'rgb(75, 192, 192)';
  color2 =  'rgb(41, 128, 185)';
  color3 =  'rgb(255, 177, 153)';
}



        color: 'rgb(75, 192, 192)'
function initializeVariables() { 
  s =  0;
  T= getInputValue('T');
  phi0 = 0.5;
  phi = getInputValue('phi');
  B0 = getB(phi0);
  B = getB(phi);
  insertEqSVARe(B);

  
  gamma1 = getInputValue('gamma1');
  gamma2 = getInputValue('gamma2');
  gamma3= 1;
  insertEqZ2(gamma1, gamma2, 'current-z', 'z_{t}','\\eta_{t}');

  generateNewData(T); 
 

}


// Event Listeners Setup
function setupEventListeners() {  
  
 

       
 

  createEventListener('T',  
    (value) => document.getElementById('TValue').textContent = value.toFixed(0),
    (value) => T = value,
    (value) => generateNewData(T), 
    (value) => updateChartScatter(charts.scatterPlotZ1Eps1, z1, epsilon1, "z1 eps1", "z₁", "ε₁", true),
    (value) => updateChartScatter(charts.scatterPlotZ1Eps2, z1, epsilon2, "z1 eps2", "z₁", "ε₂", true),
    (value) => updateChartScatter(charts.scatterPlotZ1E1, z1, e1, "z1 e1", "z₁", "e₁", true),
    (value) => updateChartScatter(charts.scatterPlotZ1E2, z1, e2, "z1 e2", "z₁", "e₂", true),
    (value) => updateLossPlots(
      false, // OnlyPoint
      charts.lossplot,
      phi0,
      phi, 
      [
        {
          lossFunction: lossZ1,
          extraArgs: [u1, u2,z1,z2 ,W],
          label: 'Loss Function 1',
          color: color1,
          lineStyle: 'solid'  
        } 
      ],
      ''
    ), 
 
  );


  createEventListener('phi', 
    (value) => document.getElementById('phiValue').textContent = value.toFixed(2),
    (value) => phi = value,
    (value) => B = getB(phi),
    (value) => insertEqSVARe(B),
    (value) => [e1, e2] = getE(u1,u2,B), 
    (value) => updateChartScatter(charts.scatterPlotZ1E1, z1, e1, "z1 e1", "z₁", "e₁", true),
    (value) => updateChartScatter(charts.scatterPlotZ1E2, z1, e2, "z1 e2", "z₁", "e₂", true), 
    (value) =>  updateLossPlots(
      false, // OnlyPoint
      charts.lossplot,
      phi0,
      phi, 
      [
        {
          lossFunction: lossZ1,
          extraArgs: [u1, u2,z1,z2 ,W],
          label: 'Loss Function 1',
          color: color1,
          lineStyle: 'solid'  
        } 
      ],
      'none'
    ), 
  );

  newDataBtn.addEventListener('click', function() {
    generateNewData(T);   
    updateChartScatter(charts.scatterPlotZ1Eps1, z1, epsilon1, "z1 eps1", "z₁", "ε₁", true);
    updateChartScatter(charts.scatterPlotZ1Eps2, z1, epsilon2, "z1 eps2", "z₁", "ε₂", true);
    updateChartScatter(charts.scatterPlotZ1E1, z1, e1, "z1 e1", "z₁", "e₁", true);
    updateChartScatter(charts.scatterPlotZ1E2, z1, e2, "z1 e2", "z₁", "e₂", true); 
    updateLossPlots(
      false, // OnlyPoint
      charts.lossplot,
      phi0,
      phi, 
      [
        {
          lossFunction: lossZ1,
          extraArgs: [u1, u2,z1,z2 ,W],
          label: 'Loss Function 1',
          color: color1,
          lineStyle: 'solid'  
        } 
      ],
      ''
    );
  })

  createEventListener('gamma1', 
    (value) => document.getElementById('gamma1Value').textContent = value.toFixed(2),
    (value) => gamma1 = value, 
    (value) => z1 =  epsilon1.map((e1, i) => gamma1 * e1 + gamma2 * epsilon2[i] + gamma3 * eta1[i]), 
    (value) => updateChartScatter(charts.scatterPlotZ1Eps1, z1, epsilon1, "z1 eps1", "z₁", "ε₁", true),
    (value) => updateChartScatter(charts.scatterPlotZ1Eps2, z1, epsilon2, "z1 eps2", "z₁", "ε₂", true),  
    (value) => updateChartScatter(charts.scatterPlotZ1E1, z1, e1, "z1 e1", "z₁", "e₁", true),
    (value) => updateChartScatter(charts.scatterPlotZ1E2, z1, e2, "z1 e2", "z₁", "e₂", true), 
    (value) => insertEqZ2(gamma1, gamma2, 'current-z', 'z_{t}','\\eta_{t}'),
    (value) => updateLossPlots(
      false, // OnlyPoint
      charts.lossplot,
      phi0,
      phi, 
      [
        {
          lossFunction: lossZ1,
          extraArgs: [u1, u2,z1,z2 ,W],
          label: 'Loss Function 1',
          color: color1,
          lineStyle: 'solid'  
        } 
      ],
      'none'
    ),    
  );

  createEventListener('gamma2', 
    (value) => document.getElementById('gamma2Value').textContent = value.toFixed(2),
    (value) => gamma2 = value, 
    (value) => z1 =  epsilon1.map((e1, i) => gamma1 * e1 + gamma2 * epsilon2[i] + gamma3 * eta1[i]), 
    (value) => updateChartScatter(charts.scatterPlotZ1Eps1, z1, epsilon1, "z1 eps1", "z₁", "ε₁", true),
    (value) => updateChartScatter(charts.scatterPlotZ1Eps2, z1, epsilon2, "z1 eps2", "z₁", "ε₂", true), 
    (value) => updateChartScatter(charts.scatterPlotZ1E1, z1, e1, "z1 e1", "z₁", "e₁", true),
    (value) => updateChartScatter(charts.scatterPlotZ1E2, z1, e2, "z1 e2", "z₁", "e₂", true), 
    (value) => insertEqZ2(gamma1, gamma2, 'current-z', 'z_{t}','\\eta_{t}'),
    (value) =>   updateLossPlots(
      false, // OnlyPoint
      charts.lossplot,
      phi0,
      phi, 
      [
        {
          lossFunction: lossZ1,
          extraArgs: [u1, u2,z1,z2 ,W],
          label: 'Loss Function 1',
          color: color1,
          lineStyle: 'solid'  
        } 
      ],
      'none'
    ), 
  );
 

     

    // Highlight points in scatter 
    const scatterPlots = [   
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
      function(phi) { 
        B = getB(phi); 
        insertEqSVARe(B); 
      },
      function(phi) { 
        [e1, e2] = getE(u1, u2, B); 
      }, 
      function(phi) { 
        updateChartScatter(charts.scatterPlotZ1E1, z1, e1, "z1 e1", "z₁", "e₁", false); 
      },
      function(phi) { 
        updateChartScatter(charts.scatterPlotZ1E2, z1, e2, "z1 e2", "z₁", "e₂", false); 
      }, 
      function(phi) { 
        updateLossPlots(
          true, // OnlyPoint
          charts.lossplot,
          phi0,
          phi, 
          [
            {
              lossFunction: lossZ1,
              extraArgs: [u1, u2,z1,z2 ,W],
              label: 'Loss Function 1',
              color: color1,
              lineStyle: 'solid'  
            } 
          ],
          'none'
        );
      },
    ];
    
    let currentAnimationStop = null;

    MinDependenciesBtn.addEventListener('click', function() {
        // Stop any ongoing animation
        if (currentAnimationStop) {
            currentAnimationStop();
            currentAnimationStop = null;
        }
    
        // Reset phi to its initial value
        const initialPhi = phi; // Assuming phi0 is your initial phi value
    
        // Start a new animation
        try {
            currentAnimationStop = animateBallRolling(charts.lossplot, lossZ1, 'min', initialPhi, callbacks, u1, u2, z1, z2,W);
        } catch (error) {
            console.error("An error occurred during animation setup:", error);
            // Implement any error handling or user notification here
        }
    });

 
}



 
// Chart Initialization
function initializeCharts() {
  const ScatterConfig = getScatterPlotConfig();
  

  createChart('scatterPlotZ1Eps1',ScatterConfig) ; 
  createChart('scatterPlotZ1Eps2',ScatterConfig) ; 
    
  updateChartScatter(charts.scatterPlotZ1Eps1, z1, epsilon1, "Relevance:", "z₁", "ε₁", true);
  updateChartScatter(charts.scatterPlotZ1Eps2, z1, epsilon2, "Exogeneity:", "z₁", "ε₂", true);

  
  createChart('scatterPlotZ1E1',ScatterConfig)  ;
  createChart('scatterPlotZ1E2',ScatterConfig)  ;
    
  updateChartScatter(charts.scatterPlotZ1E1, z1, e1, " ", "z₁", "e₁", true);
  updateChartScatter(charts.scatterPlotZ1E2, z1, e2, " ", "z₁", "e₂", true);

 
  const LossPlotConfig = getLossPlotConfig(); 
  
  createChart('lossplot',LossPlotConfig);  

  updateLossPlots(OnlyPoint=false,charts.lossplot,phi0,phi, [
    {
      lossFunction: lossZ1,
      extraArgs: [u1, u2,z1,z2 ,W],
      label: 'Loss Function 1',
      color: color1,
      lineStyle: 'solid'  
    }, 
  ]   ,''  );
 

   

}



 

 
function generateNewData(T) {  

  let rawEpsilon1, rawEpsilon2; 
  rawEpsilon1 = generateMixedNormalData(T, s);
  rawEpsilon2 = generateMixedNormalData(T, 0); 
  [epsilon1, epsilon2] = NormalizeData(rawEpsilon1, rawEpsilon2) ;
  
  [u1, u2] = getU(epsilon1, epsilon2, B0)   ; 
  [e1, e2] = getE(u1,u2,B); 

  eta1 = generateMixedNormalData(T, 0); 
  z1 =  eta1.map((eta, i) => gamma1 * epsilon1[i] + gamma2 * epsilon2[i] + gamma3 * eta ); 
  eta2 = generateMixedNormalData(T, 0); 
  z2 = eta2.map((eta, i) => 1 * epsilon1[i]   +   eta ); 
   
  
  W = getW(  epsilon2, z1, z2);  
}


