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
let color1, color2, color3;

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

  color1 =  'rgb(75, 192, 192)';
  color2 =  'rgb(41, 128, 185)';
  color3 =  'rgb(255, 177, 153)';
}



        color: 'rgb(75, 192, 192)'
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
    (value) =>statsZE1 = calculateMoments(z1, e2),
    (value) =>statsZE2 = calculateMoments(z2, e2),
    (value) =>createTableZCovariance(statsZE1),
    (value) =>createTableZ2Covariance(statsZE1,statsZE2),  
    (value) => updateChartScatter(charts.scatterPlot3, e1, e2, "Innovations", "e₁", "e₂", true),
    (value) => updateChartScatter(charts.scatterPlotZ1E1, z1, e1, "z1 e1", "z₁", "e₁", true),
    (value) => updateChartScatter(charts.scatterPlotZ1E2, z1, e2, "z1 e2", "z₁", "e₂", true),  
    (value) =>updateLossPlots(OnlyPoint=true,charts.lossplot2,phi0,phi, [
      {
        lossFunction: lossZ1,
        extraArgs: [u1, u2,z1,z2 ],
        label: 'Loss Function 1',
        color: color1
      },
      {
        lossFunction: lossZ2,
        extraArgs: [u1, u2,z1,z2],
        label: 'Loss Function 2',
        color: color2
      },
      {
        lossFunction: lossZ12,
        extraArgs: [u1, u2,z1,z2],
        label: 'Loss Function 3',
        color: color3
      },
    ] ,'none'  ),
  );

       
 

  createEventListener('T',  
    (value) => T = value,
    (value) => generateNewData(T),
    (value) =>statsZE1 = calculateMoments(z1, e2),
    (value) =>statsZE2 = calculateMoments(z2, e2),
    (value) =>createTableZCovariance(statsZE1),
    (value) =>createTableZ2Covariance(statsZE1,statsZE2),  
    (value) => updateChartScatter(charts.scatterPlot1, epsilon1, epsilon2, "Structural Shocks", "ε₁", "ε₂", true),
    (value) => updateChartScatter(charts.scatterPlot3, e1, e2, "Innovations", "e₁", "e₂", true),
    (value) => updateChartScatter(charts.scatterPlotZ1Eps1, z1, epsilon1, "z1 eps1", "z₁", "ε₁", true),
    (value) => updateChartScatter(charts.scatterPlotZ1Eps2, z1, epsilon2, "z1 eps2", "z₁", "ε₂", true),
    (value) => updateChartScatter(charts.scatterPlotZ1E1, z1, e1, "z1 e1", "z₁", "e₁", true),
    (value) => updateChartScatter(charts.scatterPlotZ1E2, z1, e2, "z1 e2", "z₁", "e₂", true), 
    (value) =>updateLossPlots(OnlyPoint=false,charts.lossplot2,phi0,phi, [
      {
        lossFunction: lossZ1,
        extraArgs: [u1, u2,z1,z2 ],
        label: 'Loss Function 1',
        color: color1
      },
      {
        lossFunction: lossZ2,
        extraArgs: [u1, u2,z1,z2],
        label: 'Loss Function 2',
        color: color2
      },
      {
        lossFunction: lossZ12,
        extraArgs: [u1, u2,z1,z2],
        label: 'Loss Function 3',
        color: color3
      },
    ]  ,''  ),
 
  );


  newDataBtn.addEventListener('click', function() {
    generateNewData(T);  
    updateChartScatter(charts.scatterPlot1, epsilon1, epsilon2, "Structural Shocks", "ε₁", "ε₂", true);
    updateChartScatter(charts.scatterPlot3, u1, u2, "Innovations", "e₁", "e₂", true); 
    updateChartScatter(charts.scatterPlotZ1Eps1, z1, epsilon1, "z1 eps1", "z₁", "ε₁", true);
    updateChartScatter(charts.scatterPlotZ1Eps2, z1, epsilon2, "z1 eps2", "z₁", "ε₂", true);
    updateChartScatter(charts.scatterPlotZ1E1, z1, e1, "z1 e1", "z₁", "e₁", true);
    updateChartScatter(charts.scatterPlotZ1E2, z1, e2, "z1 e2", "z₁", "e₂", true); 
    statsZE1 = calculateMoments(z1, e2);
    statsZE2 = calculateMoments(z2, e2);
    createTableZCovariance(statsZE1);
    createTableZ2Covariance(statsZE1,statsZE2);
    updateLossPlots(OnlyPoint=false,charts.lossplot2,phi0,phi, [
      {
        lossFunction: lossZ1,
        extraArgs: [u1, u2,z1,z2 ],
        label: 'Loss Function 1',
        color: color1
      },
      {
        lossFunction: lossZ2,
        extraArgs: [u1, u2,z1,z2],
        label: 'Loss Function 2',
        color: color2
      },
      {
        lossFunction: lossZ12,
        extraArgs: [u1, u2,z1,z2],
        label: 'Loss Function 3',
        color: color3
      },
    ]  ,''  );
  })

  createEventListener('gamma1', 
    (value) => document.getElementById('gamma1Value').textContent = value.toFixed(2),
    (value) => gamma1 = value, 
    (value) => z1 =  epsilon1.map((e1, i) => gamma1 * e1 + gamma2 * epsilon2[i] + eta1[i]),
    (value) =>statsZE1 = calculateMoments(z1, e2),
    (value) =>statsZE2 = calculateMoments(z2, e2),
    (value) =>createTableZCovariance(statsZE1),
    (value) =>createTableZ2Covariance(statsZE1,statsZE2),  
    (value) => updateChartScatter(charts.scatterPlotZ1Eps1, z1, epsilon1, "z1 eps1", "z₁", "ε₁", true),
    (value) => updateChartScatter(charts.scatterPlotZ1Eps2, z1, epsilon2, "z1 eps2", "z₁", "ε₂", true),  
    (value) => updateChartScatter(charts.scatterPlotZ1E1, z1, e1, "z1 e1", "z₁", "e₁", true),
    (value) => updateChartScatter(charts.scatterPlotZ1E2, z1, e2, "z1 e2", "z₁", "e₂", true), 
    (value) => insertEqZ(gamma1, gamma2), 
    (value) =>updateLossPlots(OnlyPoint=false,charts.lossplot2,phi0,phi, [
      {
        lossFunction: lossZ1,
        extraArgs: [u1, u2,z1,z2 ],
        label: 'Loss Function 1',
        color: color1
      },
      {
        lossFunction: lossZ2,
        extraArgs: [u1, u2,z1,z2],
        label: 'Loss Function 2',
        color: color2
      },
      {
        lossFunction: lossZ12,
        extraArgs: [u1, u2,z1,z2],
        label: 'Loss Function 3',
        color: color3
      },
    ]  ,''  ),
  );

  createEventListener('gamma2', 
    (value) => document.getElementById('gamma2Value').textContent = value.toFixed(2),
    (value) => gamma2 = value, 
    (value) => z1 =  epsilon1.map((e1, i) => gamma1 * e1 + gamma2 * epsilon2[i] + eta1[i]),
    (value) =>statsZE1 = calculateMoments(z1, e2),
    (value) =>statsZE2 = calculateMoments(z2, e2),
    (value) =>createTableZCovariance(statsZE1),
    (value) =>createTableZ2Covariance(statsZE1,statsZE2),  
    (value) => updateChartScatter(charts.scatterPlotZ1Eps1, z1, epsilon1, "z1 eps1", "z₁", "ε₁", true),
    (value) => updateChartScatter(charts.scatterPlotZ1Eps2, z1, epsilon2, "z1 eps2", "z₁", "ε₂", true), 
    (value) => updateChartScatter(charts.scatterPlotZ1E1, z1, e1, "z1 e1", "z₁", "e₁", true),
    (value) => updateChartScatter(charts.scatterPlotZ1E2, z1, e2, "z1 e2", "z₁", "e₂", true), 
    (value) => insertEqZ(gamma1, gamma2), 
    (value) =>updateLossPlots(OnlyPoint=false,charts.lossplot2,phi0,phi, [
      {
        lossFunction: lossZ1,
        extraArgs: [u1, u2,z1,z2 ],
        label: 'Loss Function 1',
        color: color1
      },
      {
        lossFunction: lossZ2,
        extraArgs: [u1, u2,z1,z2],
        label: 'Loss Function 2',
        color: color2
      },
      {
        lossFunction: lossZ12,
        extraArgs: [u1, u2,z1,z2],
        label: 'Loss Function 3',
        color: color3
      },
    ]  ,''  ),
  );
 
    // Highlight points in scatter 
    const scatterPlots = [  'scatterPlot1', 'scatterPlot3', 
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

  


    const callbacks2 = [
      function(phi) { document.getElementById('phi').value = phi.toFixed(2); },
      function(phi) { document.getElementById('phiValue').textContent = phi.toFixed(2); },
      function(phi) { B = getB(phi); insertEqSVARe(B); },
      function(phi) { [e1, e2] = getE(u1, u2, B); },
      function(phi) { updateChartScatter(charts.scatterPlot3, e1, e2, "Innovations", "e₁", "e₂", false); }, 
      function(phi) { updateChartScatter(charts.scatterPlotZ1E1, z1, e1, "z1 e1", "z₁", "e₁", true); }, 
      function(phi) { updateChartScatter(charts.scatterPlotZ1E2, z1, e2, "z1 e2", "z₁", "e₂", true); }, 
      function(phi) { statsZE = calculateMoments(z1, e2); createTableZCovariance(statsZE)  } , 
      function(phi) { 
        statsZE1 = calculateMoments(z1, e2);
        statsZE2 = calculateMoments(z2, e2);
        createTableZCovariance(statsZE1);
        createTableZ2Covariance(statsZE1,statsZE2);  } ,    
      function(phi) { updateLossPlots(OnlyPoint=true,charts.lossplot2,phi0,phi, [
        {
          lossFunction: lossZ1,
          extraArgs: [u1, u2,z1,z2 ],
          label: 'Loss Function 1',
          color: color1
        },
        {
          lossFunction: lossZ2,
          extraArgs: [u1, u2,z1,z2],
          label: 'Loss Function 2',
          color: color2
        },
        {
          lossFunction: lossZ12,
          extraArgs: [u1, u2,z1,z2],
          label: 'Loss Function 3',
          color: color3
        },
      ] ,'none'  )   }, 
    ];
    MinDependenciesBtn2.addEventListener('click', function() {
      animateBallRolling(charts.lossplot2,lossZ12,'min',phi,callbacks2,u1,u2,z1,z2); 
    })
}



 
// Chart Initialization
function initializeCharts() {
  const ScatterConfig = getScatterPlotConfig()

 
  createChart('scatterPlot1',ScatterConfig)  
  createChart('scatterPlot3',ScatterConfig)  
 
  
  updateChartScatter(charts.scatterPlot1, epsilon1, epsilon2, "Structural Shocks", "ε₁", "ε₂", true);
  updateChartScatter(charts.scatterPlot3, e1, e2, "Innovations", "e₁", "e₂", true);

  createChart('scatterPlotZ1Eps1',ScatterConfig)  
  createChart('scatterPlotZ1Eps2',ScatterConfig)  
    
  updateChartScatter(charts.scatterPlotZ1Eps1, z1, epsilon1, "z1 eps1", "z₁", "ε₁", true);
  updateChartScatter(charts.scatterPlotZ1Eps2, z1, epsilon2, "z1 eps2", "z₁", "ε₂", true);

  
  createChart('scatterPlotZ1E1',ScatterConfig)  
  createChart('scatterPlotZ1E2',ScatterConfig)  
    
  updateChartScatter(charts.scatterPlotZ1E1, z1, e1, "z1 e1", "z₁", "e₁", true);
  updateChartScatter(charts.scatterPlotZ1E2, z1, e2, "z1 e2", "z₁", "e₂", true);

  


  const LossPlotConfig = getLossPlotConfig(); 
  
  createChart('lossplot2',LossPlotConfig);  

  updateLossPlots(OnlyPoint=false,charts.lossplot2,phi0,phi, [
    {
      lossFunction: lossZ1,
      extraArgs: [u1, u2,z1,z2 ],
      label: 'Loss Function 1',
      color: color1
    },
    {
      lossFunction: lossZ2,
      extraArgs: [u1, u2,z1,z2],
      label: 'Loss Function 2',
      color: color2
    },
    {
      lossFunction: lossZ12,
      extraArgs: [u1, u2,z1,z2],
      label: 'Loss Function 3',
      color: color3
    },
  ]   ,''  );
  
  statsZE1 = calculateMoments(z1, e2);
  statsZE2 = calculateMoments(z2, e2);
  createTableZCovariance(statsZE1);
  createTableZ2Covariance(statsZE1,statsZE2);

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
  z2 = eta2.map((eta, i) => 1 * epsilon1[i]   + eta ); 
   
}


