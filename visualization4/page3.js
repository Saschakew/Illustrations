// Global variables
let charts = {};
let epsilon1, epsilon2, u1, u2;
let selectedPointIndex = null; 
let s;
let T;
let phi0;
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
  s = 0;
  T= getInputValue('T');
  phi0 = getInputValue('phi0');
  phi = getInputValue('phi');
  B0 = getB(phi0);
  B = getB(phi);
  insertEqSVARe(B)

  generateNewData(T); 
 

}


// Event Listeners Setup
function setupEventListeners() { 
   
  createEventListener('phi0', 
    (value) => updateChartWithPhi(value),
    (value) => document.getElementById('phi0Value').textContent = value.toFixed(2),
    (value) => phi0 = value, 
  );
    
  createEventListener('phi', 
    (value) => updateChartWithPhi(value),
    (value) => document.getElementById('phiValue').textContent = value.toFixed(2),
    (value) => phi = value,
    (value) =>B = getB(phi),
    (value) => insertEqSVARe(B)
  );

    
  createEventListener('T',  
    (value) => T = value,
    (value) => generateNewData(T)
  );


  newDataBtn.addEventListener('click', function() {
    generateNewData(T); 
  })
 

}



 
// Chart Initialization
function initializeCharts() {
  
}



 
  

 
function generateNewData(T) {  

  let rawEpsilon1, rawEpsilon2; 
  rawEpsilon1 = generateMixedNormalData(T, s);
  rawEpsilon2 = generateMixedNormalData(T, 0); 
  epsilon1, epsilon2 = NormalizeData(rawEpsilon1, rawEpsilon2)
    

  u1, u2 =  getU(epsilon1, epsilon2, B0) 

   
      
}


