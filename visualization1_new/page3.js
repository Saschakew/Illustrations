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

  
  // Setup popups for all input labels
  const popupIds = ['T', 'phi', 'phi0', 'gamma1', 'gamma2',  'rho1', 'rho2'];
  setupPopup(popupIds)  
}


 
function initializeVariables() { 
  s =  0;
  T= getInputValue('T');
  phi0 = 0.5;
  phi = getInputValue('phi');
  B0 = getB(phi0);
  B = getB(phi); 

  
  gamma1 = getInputValue('gamma1');
  gamma2 = getInputValue('gamma2');
  gamma3 = 1;
  insertEqZ2(gamma1, gamma2, 'current-z', 'z_{1t}','\\eta_{1t}');
  
  rho1 = getInputValue('rho1');
  rho2 = getInputValue('rho2');
  insertEqZ2(rho1, rho2, 'current-z2', 'z_{2t}','\\eta_{2t}');


  generateNewData(T); 
 

}


// Event Listeners Setup
function setupEventListeners() {  
  
 


  createEventListener('phi', 
    (value) => document.getElementById('phiValue').textContent = value.toFixed(2),
    (value) => phi = value,
    (value) => B = getB(phi), 
    (value) => [e1, e2] = getE(u1,u2,B),
    (value) =>statsZE1 = calculateMoments(z1, e2), 
    (value) =>createTableZCovariance(statsZE1),
    (value) =>createTableZ2Covariance(u1, u2, z1, z2, phi,color1, color2, color3),   
    (value) =>updateChartScatter(charts.scatterPlotZ1E1, z1, e2, " ", "z₁", "e₂", true),
    (value) =>updateChartScatter(charts.scatterPlotZ1E2, z2, e2, " ", "z₂", "e₂", true),
    (value) =>updateLossPlots(OnlyPoint=true,charts.lossplot2,phi0,phi, [
      {
        lossFunction: lossZ1,
        extraArgs: [u1, u2,z1,z2 ,W],
        label: 'Loss 1',
        color: color1,
        lineStyle: 'solid'  
      },
      {
        lossFunction: lossZ2,
        extraArgs: [u1, u2,z1,z2,W],
        label: 'Loss 2',
        color: color2,
        lineStyle: 'solid'  
      },
      {
        lossFunction: lossZ12,
        extraArgs: [u1, u2,z1,z2,W],
        label: 'Joint Loss',
        color: color3,
        lineStyle: 'solid'  
      },
      {
        lossFunction: () => 2.706 / T,  
        extraArgs: [],
        label: 'Reference Line',
        color: refLineColor,  
        lineStyle: 'dash'  
      },
    ] ,'none'  ),
  );

       
 

  createEventListener('T',  
    (value) => document.getElementById('TValue').textContent = value.toFixed(0),
    (value) => T = value,
    (value) => generateNewData(T),
    (value) =>statsZE1 = calculateMoments(z1, e2), 
    (value) =>createTableZCovariance(statsZE1),
    (value) =>createTableZ2Covariance(u1, u2, z1, z2, phi,color1, color2, color3),   
    (value) =>updateChartScatter(charts.scatterPlotZ1Eps2, z1, epsilon2, "Co-movement z₁–ε₂", "z₁", "ε₂", true),
    (value) =>updateChartScatter(charts.scatterPlotZ2Eps2, z2, epsilon2, "Co-movement z₂–ε₂", "z₂", "ε₂", true),
    (value) =>updateChartScatter(charts.scatterPlotZ1E1, z1, e2, " ", "z₁", "e₂", true),
    (value) =>updateChartScatter(charts.scatterPlotZ1E2, z2, e2, " ", "z₂", "e₂", true),
    (value) =>updateLossPlots(OnlyPoint=false,charts.lossplot2,phi0,phi, [
      {
        lossFunction: lossZ1,
        extraArgs: [u1, u2,z1,z2 ,W],
        label: 'Loss 1',
        color: color1,
        lineStyle: 'solid'  
      },
      {
        lossFunction: lossZ2,
        extraArgs: [u1, u2,z1,z2,W],
        label: 'Loss 2',
        color: color2,
        lineStyle: 'solid'  
      },
      {
        lossFunction: lossZ12,
        extraArgs: [u1, u2,z1,z2,W],
        label: 'Joint Loss',
        color: color3,
        lineStyle: 'solid'  
      },
      {
        lossFunction: () => 2.706 / T,  
        extraArgs: [],
        label: 'Reference Line',
        color: refLineColor,  
        lineStyle: 'dash'  
      },
    ]  ,''  ), 
  );


  newDataBtn.addEventListener('click', function() {
    generateNewData(T);   
    updateChartScatter(charts.scatterPlotZ1Eps2, z1, epsilon2, "Co-movement z₁–ε₂", "z₁", "ε₂", true),
    updateChartScatter(charts.scatterPlotZ2Eps2, z2, epsilon2, "Co-movement z₂–ε₂", "z₂", "ε₂", true),
    updateChartScatter(charts.scatterPlotZ1E1, z1, e2, " ", "z₁", "e₂", true);
    updateChartScatter(charts.scatterPlotZ1E2, z2, e2, " ", "z₂", "e₂", true);
    statsZE1 = calculateMoments(z1, e2); 
    createTableZCovariance(statsZE1);
    createTableZ2Covariance(u1, u2, z1, z2, phi,color1, color2, color3);
    updateLossPlots(OnlyPoint=false,charts.lossplot2,phi0,phi, [
      {
        lossFunction: lossZ1,
        extraArgs: [u1, u2,z1,z2,W ],
        label: 'Loss 1',
        color: color1,
        lineStyle: 'solid'  
      },
      {
        lossFunction: lossZ2,
        extraArgs: [u1, u2,z1,z2,W],
        label: 'Loss 2',
        color: color2,
        lineStyle: 'solid'  
      },
      {
        lossFunction: lossZ12,
        extraArgs: [u1, u2,z1,z2,W],
        label: 'Joint Loss',
        color: color3,
        lineStyle: 'solid'  
      },
      {
        lossFunction: () => 2.706 / T,  
        extraArgs: [],
        label: 'Reference Line',
        color: refLineColor,  
        lineStyle: 'dash'  
      },
    ]  ,''  );
  })

  createEventListener('gamma1', 
    (value) => document.getElementById('gamma1Value').textContent = value.toFixed(2),
    (value) => gamma1 = value, 
    (value) => z1 =  epsilon1.map((e1, i) => gamma1 * e1 + gamma2 * epsilon2[i] + gamma3* eta1[i]), 
    (value) =>statsZE1 = calculateMoments(z1, e2), 
    (value) =>createTableZCovariance(statsZE1),
    (value) =>createTableZ2Covariance(u1, u2, z1, z2, phi,color1, color2, color3),  
    (value) =>updateChartScatter(charts.scatterPlotZ1Eps2, z1, epsilon2, "Co-movement z₁–ε₂", "z₁", "ε₂", true), 
    (value) =>updateChartScatter(charts.scatterPlotZ1E2, z1, e2, " ", "z₁", "e₂", true), 
    (value) => insertEqZ2(gamma1, gamma2, 'current-z', 'z_{1t}','\\eta_{1t}'), 
    (value) =>updateLossPlots(OnlyPoint=false,charts.lossplot2,phi0,phi, [
      {
        lossFunction: lossZ1,
        extraArgs: [u1, u2,z1,z2 ,W],
        label: 'Loss 1',
        color: color1,
        lineStyle: 'solid'  
      },
      {
        lossFunction: lossZ2,
        extraArgs: [u1, u2,z1,z2,W],
        label: 'Loss 2',
        color: color2,
        lineStyle: 'solid'  
      },
      {
        lossFunction: lossZ12,
        extraArgs: [u1, u2,z1,z2,W],
        label: 'Joint Loss',
        color: color3,
        lineStyle: 'solid'  
      },
      {
        lossFunction: () => 2.706 / T,  
        extraArgs: [],
        label: 'Reference Line',
        color: refLineColor,  
        lineStyle: 'dash'  
      },
    ]  ,''  ),
  );

  createEventListener('gamma2', 
    (value) => document.getElementById('gamma2Value').textContent = value.toFixed(2),
    (value) => gamma2 = value, 
    (value) => z1 =  epsilon1.map((e1, i) => gamma1 * e1 + gamma2 * epsilon2[i] + gamma3* eta1[i]), 
    (value) =>statsZE1 = calculateMoments(z1, e2), 
    (value) =>createTableZCovariance(statsZE1),
    (value) =>createTableZ2Covariance(u1, u2, z1, z2, phi,color1, color2, color3),  
    (value) =>updateChartScatter(charts.scatterPlotZ1Eps2, z1, epsilon2, "Co-movement z₁–ε₂", "z₁", "ε₂", true), 
    (value) =>updateChartScatter(charts.scatterPlotZ1E1, z1, e2, " ", "z₁", "e₂", true), 
    (value) => insertEqZ2(gamma1, gamma2, 'current-z', 'z_{1t}','\\eta_{1t}'), 
    (value) =>updateLossPlots(OnlyPoint=false,charts.lossplot2,phi0,phi, [
      {
        lossFunction: lossZ1,
        extraArgs: [u1, u2,z1,z2 ,W],
        label: 'Loss 1',
        color: color1,
        lineStyle: 'solid'  
      },
      {
        lossFunction: lossZ2,
        extraArgs: [u1, u2,z1,z2,W],
        label: 'Loss 2',
        color: color2,
        lineStyle: 'solid'  
      },
      {
        lossFunction: lossZ12,
        extraArgs: [u1, u2,z1,z2,W],
        label: 'Joint Loss',
        color: color3,
        lineStyle: 'solid'  
      },
      {
        lossFunction: () => 2.706 / T,  
        extraArgs: [],
        label: 'Reference Line',
        color: refLineColor,  
        lineStyle: 'dash'  
      },
    ]  ,''  ),
  );
 

   
  
  createEventListener('rho1', 
    (value) => document.getElementById('rho1Value').textContent = value.toFixed(2),
    (value) => rho1 = value,  
    (value) => z2 =  eta2.map((eta, i) => rho1 * epsilon1[i] + rho2 * epsilon2[i] + 1* eta),
    (value) =>statsZE1 = calculateMoments(z1, e2), 
    (value) =>createTableZCovariance(statsZE1),
    (value) =>createTableZ2Covariance(u1, u2, z1, z2, phi,color1, color2, color3),   
    (value) =>updateChartScatter(charts.scatterPlotZ2Eps2, z2, epsilon2, "Co-movement z₂–ε₂", "z₂", "ε₂", true), 
    (value) =>updateChartScatter(charts.scatterPlotZ1E2, z2, e2, " ", "z₂", "e₂", true),
    (value) => insertEqZ2(rho1, rho2, 'current-z2', 'z_{2t}','\\eta_{2t}'), 
    (value) =>updateLossPlots(OnlyPoint=false,charts.lossplot2,phi0,phi, [
      {
        lossFunction: lossZ1,
        extraArgs: [u1, u2,z1,z2 ,W],
        label: 'Loss 1',
        color: color1,
        lineStyle: 'solid'  
      },
      {
        lossFunction: lossZ2,
        extraArgs: [u1, u2,z1,z2,W],
        label: 'Loss 2',
        color: color2,
        lineStyle: 'solid'  
      },
      {
        lossFunction: lossZ12,
        extraArgs: [u1, u2,z1,z2,W],
        label: 'Joint Loss',
        color: color3,
        lineStyle: 'solid'  
      },
      {
        lossFunction: () => 2.706 / T,  
        extraArgs: [],
        label: 'Reference Line',
        color: refLineColor,  
        lineStyle: 'dash'  
      },
    ]  ,''  ),
  );

  createEventListener('rho2', 
    (value) => document.getElementById('rho2Value').textContent = value.toFixed(2),
    (value) => rho2 = value,  
    (value) => z2 =  eta2.map((eta, i) => rho1 * epsilon1[i] + rho2 * epsilon2[i] + 1* eta),
    (value) =>statsZE1 = calculateMoments(z1, e2), 
    (value) =>createTableZCovariance(statsZE1),
    (value) =>createTableZ2Covariance(u1, u2, z1, z2, phi,color1, color2, color3),   
    (value) =>updateChartScatter(charts.scatterPlotZ2Eps2, z2, epsilon2, "Co-movement z₂–ε₂", "z₂", "ε₂", true), 
    (value) =>updateChartScatter(charts.scatterPlotZ1E2, z2, e2, " ", "z₂", "e₂", true),
    (value) => insertEqZ2(rho1, rho2, 'current-z2', 'z_{2t}','\\eta_{2t}'), 
    (value) =>updateLossPlots(OnlyPoint=false,charts.lossplot2,phi0,phi, [
      {
        lossFunction: lossZ1,
        extraArgs: [u1, u2,z1,z2 ,W],
        label: 'Loss 1',
        color: color1,
        lineStyle: 'solid'  
      },
      {
        lossFunction: lossZ2,
        extraArgs: [u1, u2,z1,z2,W],
        label: 'Loss 2',
        color: color2,
        lineStyle: 'solid'  
      },
      {
        lossFunction: lossZ12,
        extraArgs: [u1, u2,z1,z2,W],
        label: 'Joint Loss',
        color: color3,
        lineStyle: 'solid'  
      },
      {
        lossFunction: () => 2.706 / T,  
        extraArgs: [],
        label: 'Reference Line',
        color: 'black',  
        lineStyle: 'dash'  
      },
    ]  ,''  ),
  );
 

    // Highlight points in scatter 
    const scatterPlots = [   
      'scatterPlotZ1Eps2', 'scatterPlotZ2Eps2', 'scatterPlotZ1E1', 'scatterPlotZ1E2'];
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
      },
      function(phi) { 
        [e1, e2] = getE(u1, u2, B); 
      }, 
      function(phi) { 
       updateChartScatter(charts.scatterPlotZ1E1, z1, e2, " ", "z₁", "e₂", false);
       updateChartScatter(charts.scatterPlotZ1E2, z2, e2, " ", "z₂", "e₂", false);
      },
      function(phi) { 
        statsZE = calculateMoments(z1, e2); 
        createTableZCovariance(statsZE);
      },
      function(phi) { 
        statsZE1 = calculateMoments(z1, e2); 
        createTableZCovariance(statsZE1);
        createTableZ2Covariance(u1, u2, z1, z2, phi,color1, color2, color3);
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
              label: 'Loss 1',
              color: color1,
              lineStyle: 'solid'  
            },
            {
              lossFunction: lossZ2,
              extraArgs: [u1, u2,z1,z2,W],
              label: 'Loss 2',
              color: color2,
              lineStyle: 'solid'  
            },
            {
              lossFunction: lossZ12,
              extraArgs: [u1, u2,z1,z2,W],
              label: 'Joint Loss',
              color: color3,
              lineStyle: 'solid'  
            },
            {
              lossFunction: () => 2.706 / T,  
              extraArgs: [],
              label: 'Reference Line',
              color: refLineColor,  
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



 
function initializeCharts() {
  const ScatterConfig = getScatterPlotConfig()
 
  createChart('scatterPlotZ1Eps2',ScatterConfig)  
  createChart('scatterPlotZ2Eps2',ScatterConfig)  
    
  updateChartScatter(charts.scatterPlotZ1Eps2, z1, epsilon2, "Co-movement z₁–ε₂", "z₁", "ε₂", true);
  updateChartScatter(charts.scatterPlotZ2Eps2, z2, epsilon2, "Co-movement z₂–ε₂", "z₂", "ε₂", true);

  
  createChart('scatterPlotZ1E1',ScatterConfig)  
  createChart('scatterPlotZ1E2',ScatterConfig)  
    
  updateChartScatter(charts.scatterPlotZ1E1, z1, e2, " ", "z₁", "e₂", true);
  updateChartScatter(charts.scatterPlotZ1E2, z2, e2, " ", "z₂", "e₂", true);

  


  const LossPlotConfig = getLossPlotConfig(); 
  
  createChart('lossplot2',LossPlotConfig);  

  updateLossPlots(OnlyPoint=false,charts.lossplot2,phi0,phi, [
    {
      lossFunction: lossZ1,
      extraArgs: [u1, u2,z1,z2 ,W],
      label: 'Loss 1',
      color: color1,
      lineStyle: 'solid'  
    },
    {
      lossFunction: lossZ2,
      extraArgs: [u1, u2,z1,z2,W],
      label: 'Loss 2',
      color: color2,
      lineStyle: 'solid'  
    },
    {
      lossFunction: lossZ12,
      extraArgs: [u1, u2,z1,z2,W],
      label: 'Joint Loss',
      color: color3,
      lineStyle: 'solid'  
    },
    {
      lossFunction: () => 2.706 / T,  
      extraArgs: [],
      label: 'Reference Line',
      color: refLineColor,  
      lineStyle: 'dash'  
    },
  ]   ,''  );
  
  statsZE1 = calculateMoments(z1, e2); 
  createTableZCovariance(statsZE1);
  createTableZ2Covariance(u1, u2, z1, z2, phi,color1, color2, color3);

}



 

 
function generateNewData(T) {  

  let rawEpsilon1, rawEpsilon2; 
  rawEpsilon1 = generateUniformData(T);
  rawEpsilon2 = generateUniformData(T); 
  [epsilon1, epsilon2] = NormalizeData(rawEpsilon1, rawEpsilon2) ;
  
  [u1, u2] = getU(epsilon1, epsilon2, B0)   ; 
  [e1, e2] = getE(u1,u2,B); 

  eta1 = generateMixedNormalData(T, 0); 
  z1 =  eta1.map((eta, i) => gamma1 * epsilon1[i] + gamma2 * epsilon2[i] + gamma3* eta );  
  eta2 = generateMixedNormalData(T, 0); 
  z2 =  eta2.map((eta, i) =>  rho1 * epsilon1[i] + rho2 * epsilon2[i] + + eta );  

  
  W = getW(  epsilon2, z1, z2);  
   
}
