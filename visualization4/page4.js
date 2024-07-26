// Global variables
let charts = {};
let epsilon1, epsilon2, u1, u2, e1, e2;
let z1, z2, eta1, eta2;
let selectedPointIndex = null; 
let s1, s2;
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
  setupInputContentWrapper();

  color1 =  'rgb(75, 192, 192)';
  color2 =  'rgb(41, 128, 185)';
  color3 =  'rgb(255, 177, 153)';
}


 
function initializeVariables() { 
  s1 =  getInputValue('s1');
  s2 =  getInputValue('s2');
  T= getInputValue('T');
  phi0 = getInputValue('phi0');
  phi = getInputValue('phi');
  B0 = getB(phi0);
  B = getB(phi);

  
  gamma1 = getInputValue('gamma1');
  gamma2 = getInputValue('gamma2');
  gamma3 = getInputValue('gamma3');

  generateNewData(T); 
 
  insertEqZ(gamma1, gamma2, gamma3); 
  insertEqSVARe(B);
  insertEqNG(); 
  
 

}


// Event Listeners Setup
function setupEventListeners() {  
  
  createEventListener('s1', 
    (value) => document.getElementById('s1Value').textContent = value.toFixed(2),
    (value) => s1 = value, 
    (value) => generateNewData(T),
    (value) =>  insertEqNG(),
    (value) =>statsZE1 = calculateMoments(z1, e2),
    (value) =>statsZE2 = calculateMoments(z2, e2),
    (value) =>createTableZCovariance(statsZE1),
    (value) =>createTableZ2Covariance(u1, u2, z1, z2, phi),
    (value) =>updateChartScatter(charts.scatterPlotZ1Eps1, z1, epsilon2, "z1 eps2", "z₁", "ε₂", true),
    (value) =>updateChartScatter(charts.scatterPlotZ1Eps2, z2, epsilon2, "z2 eps2", "z₂", "ε₂", true),
    (value) =>updateChartScatter(charts.scatterPlotZ1E1, z1, e2, "z1 e1", "z₁", "e₂", true),
    (value) =>updateChartScatter(charts.scatterPlotZ1E2, z2, e2, "z2 e2", "z₂", "e₂", true),
    (value) =>updateLossPlots(OnlyPoint=false,charts.lossplot2,phi0,phi, [
      {
        lossFunction: lossZ1,
        extraArgs: [u1, u2,z1,z2 ,W],
        label: 'Loss Function 1',
        color: color1,
        lineStyle: 'solid'  
      },
      {
        lossFunction: lossZ2,
        extraArgs: [u1, u2,z1,z2,W],
        label: 'Loss Function 2',
        color: color2,
        lineStyle: 'solid'  
      },
      {
        lossFunction: lossZ12,
        extraArgs: [u1, u2,z1,z2,W],
        label: 'Loss Function 3',
        color: color3,
        lineStyle: 'solid'  
      },
      {
        lossFunction: () => 2.706 / T,  
        extraArgs: [],
        label: 'Critical Value',
        color: 'black',  
        lineStyle: 'dash'  
      },
    ]  ,''  ),
  );

  
  createEventListener('s2', 
    (value) => document.getElementById('s2Value').textContent = value.toFixed(2),
    (value) => s2 = value, 
    (value) => generateNewData(T),
    (value) =>  insertEqNG(),
    (value) =>statsZE1 = calculateMoments(z1, e2),
    (value) =>statsZE2 = calculateMoments(z2, e2),
    (value) =>createTableZCovariance(statsZE1),
    (value) =>createTableZ2Covariance(u1, u2, z1, z2, phi),
    (value) =>updateChartScatter(charts.scatterPlotZ1Eps1, z1, epsilon2, "z1 eps2", "z₁", "ε₂", true),
    (value) =>updateChartScatter(charts.scatterPlotZ1Eps2, z2, epsilon2, "z2 eps2", "z₂", "ε₂", true),
    (value) =>updateChartScatter(charts.scatterPlotZ1E1, z1, e2, "z1 e1", "z₁", "e₂", true),
    (value) =>updateChartScatter(charts.scatterPlotZ1E2, z2, e2, "z2 e2", "z₂", "e₂", true),
    (value) =>updateLossPlots(OnlyPoint=false,charts.lossplot2,phi0,phi, [
      {
        lossFunction: lossZ1,
        extraArgs: [u1, u2,z1,z2 ,W],
        label: 'Loss Function 1',
        color: color1,
        lineStyle: 'solid'  
      },
      {
        lossFunction: lossZ2,
        extraArgs: [u1, u2,z1,z2,W],
        label: 'Loss Function 2',
        color: color2,
        lineStyle: 'solid'  
      },
      {
        lossFunction: lossZ12,
        extraArgs: [u1, u2,z1,z2,W],
        label: 'Loss Function 3',
        color: color3,
        lineStyle: 'solid'  
      },
      {
        lossFunction: () => 2.706 / T,  
        extraArgs: [],
        label: 'Critical Value',
        color: 'black',  
        lineStyle: 'dash'  
      },
    ]  ,''  ),
  );


  createEventListener('phi', 
    (value) => document.getElementById('phiValue').textContent = value.toFixed(2),
    (value) => phi = value,
    (value) => B = getB(phi),
    (value) => insertEqSVARe(B),
    (value) => [e1, e2] = getE(u1,u2,B),
    (value) =>statsZE1 = calculateMoments(z1, e2), 
    (value) =>createTableZCovariance(statsZE1),
    (value) =>createTableZ2Covariance(u1, u2, z1, z2, phi), 
    (value) =>updateChartScatter(charts.scatterPlotZ1E1, z1, e2, "z1 e1", "z₁", "e₂", true),
    (value) =>updateChartScatter(charts.scatterPlotZ1E2, z2, e2, "z2 e2", "z₂", "e₂", true),
    (value) =>updateLossPlots(OnlyPoint=true,charts.lossplot2,phi0,phi, [
      {
        lossFunction: lossZ1,
        extraArgs: [u1, u2,z1,z2 ,W],
        label: 'Loss Function 1',
        color: color1,
        lineStyle: 'solid'  
      },
      {
        lossFunction: lossZ2,
        extraArgs: [u1, u2,z1,z2,W],
        label: 'Loss Function 2',
        color: color2,
        lineStyle: 'solid'  
      },
      {
        lossFunction: lossZ12,
        extraArgs: [u1, u2,z1,z2,W],
        label: 'Loss Function 3',
        color: color3,
        lineStyle: 'solid'  
      },
      {
        lossFunction: () => 2.706 / T,  
        extraArgs: [],
        label: 'Critical Value',
        color: 'black',  
        lineStyle: 'dash'  
      },
    ] ,'none'  ),
  );

       
 

  createEventListener('T',  
    (value) => T = value,
    (value) => generateNewData(T),
    (value) =>  insertEqNG(),
    (value) =>statsZE1 = calculateMoments(z1, e2), 
    (value) =>createTableZCovariance(statsZE1),
    (value) =>createTableZ2Covariance(u1, u2, z1, z2, phi),
    (value) =>updateChartScatter(charts.scatterPlotZ1Eps1, z1, epsilon2, "z1 eps2", "z₁", "ε₂", true),
    (value) =>updateChartScatter(charts.scatterPlotZ1Eps2, z2, epsilon2, "z2 eps2", "z₂", "ε₂", true),
    (value) =>updateChartScatter(charts.scatterPlotZ1E1, z1, e2, "z1 e1", "z₁", "e₂", true),
    (value) =>updateChartScatter(charts.scatterPlotZ1E2, z2, e2, "z2 e2", "z₂", "e₂", true),
    (value) =>updateLossPlots(OnlyPoint=false,charts.lossplot2,phi0,phi, [
      {
        lossFunction: lossZ1,
        extraArgs: [u1, u2,z1,z2,W ],
        label: 'Loss Function 1',
        color: color1,
        lineStyle: 'solid'  
      },
      {
        lossFunction: lossZ2,
        extraArgs: [u1, u2,z1,z2,W],
        label: 'Loss Function 2',
        color: color2,
        lineStyle: 'solid'  
      },
      {
        lossFunction: lossZ12,
        extraArgs: [u1, u2,z1,z2,W],
        label: 'Loss Function 3',
        color: color3,
        lineStyle: 'solid'  
      },
      {
        lossFunction: () => 2.706 / T,  
        extraArgs: [],
        label: 'Critical Value',
        color: 'black',  
        lineStyle: 'dash'  
      },
    ]  ,''  ), 
  );


  newDataBtn.addEventListener('click', function() {
    generateNewData(T);   
    insertEqNG();
    (value) =>updateChartScatter(charts.scatterPlotZ1Eps1, z1, epsilon2, "z1 eps2", "z₁", "ε₂", true),
    (value) =>updateChartScatter(charts.scatterPlotZ1Eps2, z2, epsilon2, "z2 eps2", "z₂", "ε₂", true),
    updateChartScatter(charts.scatterPlotZ1E1, z1, e2, "z1 e1", "z₁", "e₂", true);
    updateChartScatter(charts.scatterPlotZ1E2, z2, e2, "z2 e2", "z₂", "e₂", true);
    statsZE1 = calculateMoments(z1, e2); 
    createTableZCovariance(statsZE1);
    createTableZ2Covariance(u1, u2, z1, z2, phi);
    updateLossPlots(OnlyPoint=false,charts.lossplot2,phi0,phi, [
      {
        lossFunction: lossZ1,
        extraArgs: [u1, u2,z1,z2 ,W],
        label: 'Loss Function 1',
        color: color1,
        lineStyle: 'solid'  
      },
      {
        lossFunction: lossZ2,
        extraArgs: [u1, u2,z1,z2,W],
        label: 'Loss Function 2',
        color: color2,
        lineStyle: 'solid'  
      },
      {
        lossFunction: lossZ12,
        extraArgs: [u1, u2,z1,z2,W],
        label: 'Loss Function 3',
        color: color3,
        lineStyle: 'solid'  
      },
      {
        lossFunction: () => 2.706 / T,  
        extraArgs: [],
        label: 'Critical Value',
        color: 'black',  
        lineStyle: 'dash'  
      },
    ]  ,''  );
  })

  createEventListener('gamma1', 
    (value) => document.getElementById('gamma1Value').textContent = value.toFixed(2),
    (value) => gamma1 = value, 
    (value) => z1 =  epsilon1.map((e1, i) => gamma1 * e1 + gamma2 * epsilon2[i] + gamma3* eta1[i]),
    (value) => z2 = z1.map((z, i) => z * z), 
    (value) =>statsZE1 = calculateMoments(z1, e2), 
    (value) =>createTableZCovariance(statsZE1),
    (value) =>createTableZ2Covariance(u1, u2, z1, z2, phi),
    (value) =>updateChartScatter(charts.scatterPlotZ1Eps1, z1, epsilon2, "z1 eps2", "z₁", "ε₂", true),
    (value) =>updateChartScatter(charts.scatterPlotZ1Eps2, z2, epsilon2, "z2 eps2", "z₂", "ε₂", true),
    (value) =>updateChartScatter(charts.scatterPlotZ1E1, z1, e2, "z1 e1", "z₁", "e₂", true),
    (value) =>updateChartScatter(charts.scatterPlotZ1E2, z2, e2, "z2 e2", "z₂", "e₂", true),
    (value) => insertEqZ(gamma1, gamma2, gamma3), 
    (value) =>updateLossPlots(OnlyPoint=false,charts.lossplot2,phi0,phi, [
      {
        lossFunction: lossZ1,
        extraArgs: [u1, u2,z1,z2 ,W],
        label: 'Loss Function 1',
        color: color1,
        lineStyle: 'solid'  
      },
      {
        lossFunction: lossZ2,
        extraArgs: [u1, u2,z1,z2,W],
        label: 'Loss Function 2',
        color: color2,
        lineStyle: 'solid'  
      },
      {
        lossFunction: lossZ12,
        extraArgs: [u1, u2,z1,z2,W],
        label: 'Loss Function 3',
        color: color3,
        lineStyle: 'solid'  
      },
      {
        lossFunction: () => 2.706 / T,  
        extraArgs: [],
        label: 'Critical Value',
        color: 'black',  
        lineStyle: 'dash'  
      },
    ]  ,''  ),
  );

  createEventListener('gamma2', 
    (value) => document.getElementById('gamma2Value').textContent = value.toFixed(2),
    (value) => gamma2 = value, 
    (value) => z1 =  epsilon1.map((e1, i) => gamma1 * e1 + gamma2 * epsilon2[i] + gamma3* eta1[i]),
    (value) => z2 = z1.map((z, i) => z * z), 
    (value) =>statsZE1 = calculateMoments(z1, e2), 
    (value) =>createTableZCovariance(statsZE1),
    (value) =>createTableZ2Covariance(u1, u2, z1, z2, phi),
    (value) =>updateChartScatter(charts.scatterPlotZ1Eps1, z1, epsilon2, "z1 eps2", "z₁", "ε₂", true),
    (value) =>updateChartScatter(charts.scatterPlotZ1Eps2, z2, epsilon2, "z2 eps2", "z₂", "ε₂", true),
    (value) =>updateChartScatter(charts.scatterPlotZ1E1, z1, e2, "z1 e1", "z₁", "e₂", true),
    (value) =>updateChartScatter(charts.scatterPlotZ1E2, z2, e2, "z2 e2", "z₂", "e₂", true),
    (value) => insertEqZ(gamma1, gamma2, gamma3), 
    (value) =>updateLossPlots(OnlyPoint=false,charts.lossplot2,phi0,phi, [
      {
        lossFunction: lossZ1,
        extraArgs: [u1, u2,z1,z2 ,W],
        label: 'Loss Function 1',
        color: color1,
        lineStyle: 'solid'  
      },
      {
        lossFunction: lossZ2,
        extraArgs: [u1, u2,z1,z2,W],
        label: 'Loss Function 2',
        color: color2,
        lineStyle: 'solid'  
      },
      {
        lossFunction: lossZ12,
        extraArgs: [u1, u2,z1,z2,W],
        label: 'Loss Function 3',
        color: color3,
        lineStyle: 'solid'  
      },
      {
        lossFunction: () => 2.706 / T,  
        extraArgs: [],
        label: 'Critical Value',
        color: 'black',  
        lineStyle: 'dash'  
      },
    ]  ,''  ),
  );
 

  
  createEventListener('gamma3', 
    (value) => document.getElementById('gamma3Value').textContent = value.toFixed(2),
    (value) => gamma3 = value, 
    (value) => z1 =  epsilon1.map((e1, i) => gamma1 * e1 + gamma2 * epsilon2[i] + gamma3* eta1[i]),
    (value) => z2 = z1.map((z, i) => z * z), 
    (value) =>statsZE1 = calculateMoments(z1, e2), 
    (value) =>createTableZCovariance(statsZE1),
    (value) =>createTableZ2Covariance(u1, u2, z1, z2, phi),
    (value) =>updateChartScatter(charts.scatterPlotZ1Eps1, z1, epsilon2, "z1 eps2", "z₁", "ε₂", true),
    (value) =>updateChartScatter(charts.scatterPlotZ1Eps2, z2, epsilon2, "z2 eps2", "z₂", "ε₂", true),
    (value) =>updateChartScatter(charts.scatterPlotZ1E1, z1, e2, "z1 e1", "z₁", "e₂", true),
    (value) =>updateChartScatter(charts.scatterPlotZ1E2, z2, e2, "z2 e2", "z₂", "e₂", true),
    (value) => insertEqZ(gamma1, gamma2, gamma3), 
    (value) =>updateLossPlots(OnlyPoint=false,charts.lossplot2,phi0,phi, [
      {
        lossFunction: lossZ1,
        extraArgs: [u1, u2,z1,z2 ,W],
        label: 'Loss Function 1',
        color: color1,
        lineStyle: 'solid'  
      },
      {
        lossFunction: lossZ2,
        extraArgs: [u1, u2,z1,z2,W],
        label: 'Loss Function 2',
        color: color2,
        lineStyle: 'solid'  
      },
      {
        lossFunction: lossZ12,
        extraArgs: [u1, u2,z1,z2,W],
        label: 'Loss Function 3',
        color: color3,
        lineStyle: 'solid'  
      },
      {
        lossFunction: () => 2.706 / T,  
        extraArgs: [],
        label: 'Critical Value',
        color: 'black',  
        lineStyle: 'dash'  
      },
    ]  ,''  ),
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

  

    const callbacks2 = [
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
       updateChartScatter(charts.scatterPlotZ1E1, z1, e2, "z1 e1", "z₁", "e₂", false);
       updateChartScatter(charts.scatterPlotZ1E2, z2, e2, "z2 e2", "z₂", "e₂", false);
      },
      function(phi) { 
        statsZE = calculateMoments(z1, e2); 
        createTableZCovariance(statsZE);
      },
      function(phi) { 
        statsZE1 = calculateMoments(z1, e2); 
        createTableZCovariance(statsZE1);
        createTableZ2Covariance(u1, u2, z1, z2, phi);
      },
      function(phi) { 
        updateLossPlots(
          true, // OnlyPoint
          charts.lossplot2,
          phi0,
          phi, 
          [
            {
              lossFunction: lossZ1,
              extraArgs: [u1, u2,z1,z2,W ],
              label: 'Loss Function 1',
              color: color1,
              lineStyle: 'solid'  
            },
            {
              lossFunction: lossZ2,
              extraArgs: [u1, u2,z1,z2,W],
              label: 'Loss Function 2',
              color: color2,
              lineStyle: 'solid'  
            },
            {
              lossFunction: lossZ12,
              extraArgs: [u1, u2,z1,z2,W],
              label: 'Loss Function 3',
              color: color3,
              lineStyle: 'solid'  
            },
            {
              lossFunction: () => 2.706 / T,  
              extraArgs: [],
              label: 'Critical Value',
              color: 'black',  
              lineStyle: 'dash'  
            },
          ],
          'none'
        );
      },
    ];
    
    let currentAnimationStop = null;

    MinDependenciesBtn2.addEventListener('click', function() {
        // Stop any ongoing animation
        if (currentAnimationStop) {
            currentAnimationStop();
            currentAnimationStop = null; 
        }
    
        // Reset phi to its initial value
        const initialPhi = phi; // Assuming phi0 is your initial phi value
    
        // Start a new animation
        try {
            currentAnimationStop = animateBallRolling(charts.lossplot2, lossZ12, 'min', initialPhi, callbacks2, u1, u2, z1, z2,W);
        } catch (error) {
            console.error("An error occurred during animation setup:", error);
            // Implement any error handling or user notification here
        }
    });
}



 
// Chart Initialization
function initializeCharts() {
  const ScatterConfig = getScatterPlotConfig()
 
  createChart('scatterPlotZ1Eps1',ScatterConfig)  
  createChart('scatterPlotZ1Eps2',ScatterConfig)  
    
  updateChartScatter(charts.scatterPlotZ1Eps1, z1, epsilon2, "z1 eps2", "z₁", "ε₂", true);
  updateChartScatter(charts.scatterPlotZ1Eps2, z2, epsilon2, "z2 eps2", "z₂", "ε₂", true);

  
  createChart('scatterPlotZ1E1',ScatterConfig)  
  createChart('scatterPlotZ1E2',ScatterConfig)  
    
  updateChartScatter(charts.scatterPlotZ1E1, z1, e2, "z1 e1", "z₁", "e₂", true);
  updateChartScatter(charts.scatterPlotZ1E2, z2, e2, "z2 e2", "z₂", "e₂", true);

  


  const LossPlotConfig = getLossPlotConfig(); 
  
  createChart('lossplot2',LossPlotConfig);  

  updateLossPlots(OnlyPoint=false,charts.lossplot2,phi0,phi, [
    {
      lossFunction: lossZ1,
      extraArgs: [u1, u2,z1,z2 ,W],
      label: 'Loss Function 1',
      color: color1,
      lineStyle: 'solid'  
    },
    {
      lossFunction: lossZ2,
      extraArgs: [u1, u2,z1,z2,W],
      label: 'Loss Function 2',
      color: color2,
      lineStyle: 'solid'  
    },
    {
      lossFunction: lossZ12,
      extraArgs: [u1, u2,z1,z2,W],
      label: 'Loss Function 3',
      color: color3,
      lineStyle: 'solid'  
    },
    {
      lossFunction: () => 2.706 / T,  
      extraArgs: [],
      label: 'Critical Value',
      color: 'black',  
      lineStyle: 'dash'  
    },
  ]   ,''  );
  
  statsZE1 = calculateMoments(z1, e2); 
  createTableZCovariance(statsZE1);
  createTableZ2Covariance(u1, u2, z1, z2, phi);

}



 

 
function generateNewData(T) {  

  let rawEpsilon1, rawEpsilon2; 
  rawEpsilon1 = generateMixedNormalData(T,  s1);
  rawEpsilon2 = generateMixedNormalData(T, s2); 
  [epsilon1, epsilon2] = NormalizeData(rawEpsilon1, rawEpsilon2) ;
  
  [u1, u2] = getU(epsilon1, epsilon2, B0)   ; 
  [e1, e2] = getE(u1,u2,B); 
 

  eta1 = generateMixedNormalData(T, 0); 
  z1 =  eta1.map((eta, i) => gamma1 * epsilon1[i] + gamma2 * epsilon2[i] + gamma3* eta );  
  z2 = z1.map((z, i) => z * z); 

  W = getW(  epsilon2, z1, z2);  
   
}


