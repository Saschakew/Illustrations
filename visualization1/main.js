// Global variables
let charts = {};
let epsilon1, epsilon2, u1, u2;
let selectedPointIndex = null;

// DOM Content Loaded Event Listener
document.addEventListener('DOMContentLoaded', function() {
  // Initialize UI elements
  initializeUI();

  
  // Initialize UI elements
  initializeVariables();

  
  
  // Initialize charts (creates empty chart objects)
  initializeCharts();
  
  
  console.log('DOM fully loaded');
  // Set up event listeners
  setupEventListeners();
  
  const currentPage = document.body.className;
  if (currentPage !== 'index') {
  // Generate initial data
  generateNewData();
  }
  
  
  // Update B0 and B matrices
  updateAllMatrices(phi0Value,phiValue); 
   
});

// UI Initialization
function initializeUI() {
  // Setup sticky input container
  const inputContainer = document.querySelector('.input-container');

  if (inputContainer) {
    const inputContainerTop = inputContainer.offsetTop;
    const paddingTop = 15; // Account for the existing padding-top
  
    function handleScroll() {
      if (window.pageYOffset > inputContainerTop - paddingTop) {
        inputContainer.classList.add('sticky');
        document.body.style.paddingTop = `${inputContainer.offsetHeight + paddingTop}px`;
      } else {
        inputContainer.classList.remove('sticky');
        document.body.style.paddingTop = `${paddingTop}px`;
      }
    }
  
    window.addEventListener('scroll', handleScroll);
  } else {
    console.log('Input container not found. Sticky functionality not applied.');
  }

  // Setup navigation menu toggle
  document.getElementById('menu-toggle').addEventListener('click', function() {
    document.querySelector('nav').classList.toggle('expanded');
  });

  // Setup navigation links
  document.querySelectorAll('nav ul li a').forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href.startsWith('#')) {
        e.preventDefault();
        document.querySelectorAll('.page').forEach(page => {
          page.style.display = 'none';
        });
        const activePage = document.querySelector(href);
        if (activePage) {
          activePage.style.display = 'block';
        }
      }
      // If it's not a hash link, let the browser handle navigation
    });
  });

  
}

function initializeVariables() {
  const sSlider = document.getElementById('sSlider');
  if (sSlider) {
    s = parseFloat(sSlider.value);
  } else {
    s = 0; // Default value if slider is not found
  }
  
  const phi0Element = document.getElementById('phi0');
  if (phi0Element) {
    phi0Value = parseFloat(phi0Element.value);
  }
  else {
    phi0Value = 0;
  }

  const phiElement = document.getElementById('phi');
  if (phiElement) {
    phiValue = parseFloat(phiElement.value);
  }
  else {
    phiValue = 0;
  }

}

// Event Listeners Setup
function setupEventListeners() {

  const phi0Element = document.getElementById('phi0');
  if (phi0Element) {
    document.getElementById('phi0').addEventListener('input', function() {
      const phi0Value = parseFloat(this.value);
      document.getElementById('phi0Value').textContent = phi0Value.toFixed(2);
      updateAllMatrices(phi0Value,phiValue); 
        updateChartWithPhi();    
        updateSelectedPoints(); 
      });
    }



    const phiElement = document.getElementById('phi');
    if (phiElement) {
      phiElement.addEventListener('input', function() {
        const phiValue = parseFloat(this.value);
        document.getElementById('phiValue').textContent = phiValue.toFixed(2);
        updateAllMatrices(phi0Value, phiValue);
        updateChartWithPhi();
        updateLossPlotm();  // Add this line 
        updateLossPlot();  // Add this line
        // The selected point is maintained within updateChartWithPhi
      });
    }
 
  const TElement = document.getElementById('T');
  if (TElement) {
  document.getElementById('T').addEventListener('input', function() {
    generateNewData();
    });
  } 

  const newDataButton = document.getElementById('newDataBtn');
  if (newDataButton) {
    newDataButton.addEventListener('click', function() {
      generateNewData();
    })
  }
  
  const sSlider = document.getElementById('sSlider');
  if (sSlider) {
    sSlider.addEventListener('input', function() {
      s = parseFloat(this.value);
      document.getElementById('sValue').textContent = s.toFixed(2);
      generateNewData();
    });
  }

  
  
  const rollBallButtonPage4 = document.querySelector('body.page4 #rollBallButton');
  if (rollBallButtonPage4) {
    rollBallButtonPage4.addEventListener('click', () => animateBallRolling('min'));
  }
  const rollBallButtonPage6 = document.querySelector('body.page6 #rollBallButton');
  if (rollBallButtonPage6) {
    rollBallButtonPage6.addEventListener('click', () => animateBallRolling('min'));
  }

  const rollBallButtonPage5 = document.querySelector('body.page5 #rollBallButton');
  if (rollBallButtonPage5) {
    rollBallButtonPage5.addEventListener('click', () => animateBallRolling('max'));
  }

  function createPopup(icon, className) {
    const content = icon.getAttribute(className === 'info-popup' ? 'data-info' : 'data-ref');
    
    // Remove any existing pop-ups
    const existingPopup = document.querySelector('.info-popup');
    if (existingPopup) {
      existingPopup.remove();
    }
    
    // Create and position the pop-up
    const popup = document.createElement('div');
    popup.className = className;
    popup.innerHTML = content;
    document.body.appendChild(popup);
    
    const iconRect = icon.getBoundingClientRect();
    popup.style.left = `${iconRect.left + window.scrollX}px`;
    popup.style.top = `${iconRect.bottom + window.scrollY + 5}px`;
    popup.style.display = 'block';
    
    // Ensure the popup doesn't go off-screen
    const popupRect = popup.getBoundingClientRect();
    if (popupRect.right > window.innerWidth) {
      popup.style.left = `${window.innerWidth - popupRect.width - 10}px`;
    }
    
    // Process LaTeX in the popup
    MathJax.typesetPromise([popup]).then(() => {
      // Reposition after typesetting (LaTeX rendering might change size)
      const newPopupRect = popup.getBoundingClientRect();
      if (newPopupRect.right > window.innerWidth) {
        popup.style.left = `${window.innerWidth - newPopupRect.width - 10}px`;
      }
    });
    
    // Close the pop-up when clicking outside
    document.addEventListener('click', function closePopup(event) {
      if (!popup.contains(event.target) && event.target !== icon) {
        popup.remove();
        document.removeEventListener('click', closePopup);
      }
    });
  }
  
  // Add event listeners for info and ref icons
  document.querySelectorAll('.info-icon').forEach(icon => {
    icon.addEventListener('click', function(e) {
      createPopup(this, this.classList.contains('info-icon') ? 'info-popup' : 'ref-popup');
      e.stopPropagation();
    });
  });



  ['scatterPlot1', 'scatterPlot2', 'scatterPlot3'].forEach(id => {
    const canvas = document.getElementById(id);
    if (canvas) {
      canvas.addEventListener('click', function(event) {
        console.log(`Canvas ${id} clicked`);
        const chart = charts[id];
        const elements = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);
        handleChartClick(event, elements, chart);
      });
    }
  });
}


 
// Chart Initialization
function initializeCharts() {
  
  const chartConfig = {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Data',
        data: [],
        backgroundColor: 'rgba(255, 165, 0, 0.6)',
        pointRadius: 5,
        pointHoverRadius: 7
      }, {
        label: 'Selected Point',
        data: [],
        backgroundColor: 'red',
        pointRadius: 7,
        pointHoverRadius: 9
      }]
    },
    options: { 
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 1,
      plugins: {
        title: {
          display: true,
          text: '',
          font: { size: 18 }
        },
        legend: { display: false }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: '',
            font: { size: 16 }
          }
        },
        y: {
          title: {
            display: true,
            text: '',
            font: { size: 16 }
          }
        }
      } 
    }
  };





function createChartIfExists(id) {
  const element = document.getElementById(id);
  if (element) {
    const ctx = element.getContext('2d');
    charts[id] = new Chart(ctx, JSON.parse(JSON.stringify(chartConfig)));
    console.log(`Chart ${id} created`);
  } else {
    console.log(`Element with id ${id} not found`);
  }
}

createChartIfExists('scatterPlot1');
createChartIfExists('scatterPlot2');
  createChartIfExists('scatterPlot3');

  const lossplot4Element = document.getElementById('lossplot4');
  if (lossplot4Element) {
    const ctx = lossplot4Element.getContext('2d');
    charts.lossplot4 = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Loss',
          data: [],
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }, {
          label: 'Current ϕ',
          data: [],
          borderColor: '#ffa500',
          backgroundColor: '#ffa500',
          pointRadius: 6,
          pointHoverRadius: 8,
          showLine: false
        }, {
          label: 'ϕ₀',
          data: [],
          borderColor: 'rgb(255, 206, 86)',
          backgroundColor: 'rgb(255, 206, 86)',
          pointRadius: 6,
          pointHoverRadius: 8,
          showLine: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1,
        plugins: {
          title: {
            display: false,
            text: 'Loss Plot'
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'ϕ'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Loss'
            }
          }
        }
      }
    });
    console.log('lossplot4 chart created');
  } else {
    console.log('lossplot4 element not found');
  }


  const lossplot4mElement = document.getElementById('lossplot4m');
  if (lossplot4mElement) {
    const ctx = lossplot4mElement.getContext('2d');
    charts.lossplot4m = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Loss',
          data: [],
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }, {
          label: 'Current ϕ',
          data: [],
          borderColor: '#ffa500',
          backgroundColor: '#ffa500',
          pointRadius: 6,
          pointHoverRadius: 8,
          showLine: false
        }, {
          label: 'ϕ₀',
          data: [],
          borderColor: 'rgb(255, 206, 86)',
          backgroundColor: 'rgb(255, 206, 86)',
          pointRadius: 6,
          pointHoverRadius: 8,
          showLine: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1,
        plugins: {
          title: {
            display: false,
            text: 'Loss Plot'
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'ϕ'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Loss'
            }
          }
        }
      }
    });
    console.log('lossplot4m chart created');
  } else {
    console.log('lossplot4m element not found');
  }
  
}

function updateAllCharts() {
  if (charts.scatterPlot1) {
    updateChartScatter(charts.scatterPlot1, epsilon1, epsilon2, "Structural Shocks", "ε₁", "ε₂");
  }
  updateChartWithPhi();
  updateLossPlotm();
  updateLossPlot();
}



function animateBallRolling(lossType) {
  const startPhi = parseFloat(document.getElementById('phi').value);
  let currentPhi = startPhi;
  const stepSize = 0.01;
  const maxSteps = 100;
  let step = 0;
  let animationId;
  let isAnimating = true;
  
  function calculateLoss(phi) {
    return lossType === 'min' ? myloss(u1, u2, phi) : -mylossm(u1, u2, phi);
  }
  
  function updateChart(phi, loss) {
    const chartToUpdate = lossType === 'min' ? charts.lossplot4 : charts.lossplot4m;
    chartToUpdate.data.datasets[1].data = [{ x: phi, y: Math.abs(loss) }];
    chartToUpdate.update('none');
  }
  
  function updateUI(phi) {
    document.getElementById('phi').value = phi.toFixed(2);
    document.getElementById('phiValue').textContent = phi.toFixed(2);
    updateAllMatrices(phi0Value,phi);
    updateChartWithPhi();
  }

  function stopAnimation() {
    isAnimating = false;
    cancelAnimationFrame(animationId);
    console.log("Animation stopped by user input");
  }

  function addEventListeners() {
    const inputs = document.querySelectorAll('input, button');
    inputs.forEach(input => { 
      input.addEventListener('click', stopAnimation);
    });
  }

  function removeEventListeners() {
    const inputs = document.querySelectorAll('input, button');
    inputs.forEach(input => { 
      input.removeEventListener('click', stopAnimation);
    });
  }

  addEventListeners();
  
  function animate() {
    if (!isAnimating || step >= maxSteps) {
      console.log(isAnimating ? "Maximum steps reached" : "Animation stopped");
      removeEventListeners();
      return;
    }
    
    const currentLoss = calculateLoss(currentPhi);
    const leftLoss = calculateLoss(currentPhi - stepSize);
    const rightLoss = calculateLoss(currentPhi + stepSize);
    
    let newPhi = currentPhi;
    if (leftLoss < currentLoss && leftLoss < rightLoss) {
      newPhi = Math.max(0, currentPhi - stepSize);
    } else if (rightLoss < currentLoss && rightLoss < leftLoss) {
      newPhi = Math.min(1.57, currentPhi + stepSize);
    } else {
      console.log("Optima reached");
      removeEventListeners();
      return;
    }
    
    currentPhi = newPhi;
    const newLoss = calculateLoss(currentPhi);
    
    updateChart(currentPhi, newLoss);
    updateUI(currentPhi);
    
    step++;
    animationId = requestAnimationFrame(animate);
  }
  
  animate();
}

function handleChartClick(event, elements, chart) {
  console.log('Chart clicked');
  if (elements.length > 0) {
    selectedPointIndex = elements[0].index;
    highlightPointOnAllCharts(selectedPointIndex);
  }
}

function highlightPointOnAllCharts(index) {
  if (charts.scatterPlot1) highlightPoint(charts.scatterPlot1, index);
  if (charts.scatterPlot2) highlightPoint(charts.scatterPlot2, index);
  if (charts.scatterPlot3) highlightPoint(charts.scatterPlot3, index);
}
  // Add this function to highlight a specific point
function highlightPoint(chart, index) {
  const selectedDataset = chart.data.datasets[1];
  selectedDataset.data = [chart.data.datasets[0].data[index]];
  chart.update();
}
function highlightPoint(chart, index) {
  const mainDataset = chart.data.datasets[0];
  const selectedDataset = chart.data.datasets[1];
  
  if (index !== null && index < mainDataset.data.length) {
    selectedDataset.data = [mainDataset.data[index]];
  } else {
    selectedDataset.data = [];
  }
  
  chart.update();
}
function updateLossPlot() {
  if (charts && charts.lossplot4 && u1 && u2) {
    const currentPhi = parseFloat(document.getElementById('phi').value);
    const phi0 = parseFloat(document.getElementById('phi0').value);
    const xValues = Array.from({length: 159}, (_, i) => i * 0.01);
    const yValues = xValues.map(x => myloss(u1, u2, x));

    charts.lossplot4.data.labels = xValues.map(x => x.toFixed(2));
    charts.lossplot4.data.datasets[0].data = xValues.map((x, i) => ({x: x, y: yValues[i]}));

    // Update the current phi point
    const currentLoss = myloss(u1, u2, currentPhi);
    charts.lossplot4.data.datasets[1].data = [{
      x: currentPhi,
      y: currentLoss
    }];

    // Update the phi0 point
    const phi0Loss = myloss(u1, u2, phi0);
const yMin = Math.min(0,...charts.lossplot4.data.datasets[0].data.map(point => point.y));
const yMax = Math.max(0.5,...charts.lossplot4.data.datasets[0].data.map(point => point.y));

charts.lossplot4.data.datasets[2] = {
  type: 'line',
  label: 'φ₀',
  data: [
    { x: phi0, y: yMin },
    { x: phi0, y: yMax }
  ],
  borderColor: '#ffa500',
  borderWidth: 2,
  pointRadius: 0,
  animation: false
};

charts.lossplot4.options.annotation = {
  annotations: [{
    type: 'line',
    mode: 'vertical',
    scaleID: 'x',
    value: phi0,
    borderColor: '#ffa500',
    borderWidth: 2,
    label: {
      content: 'φ₀',
      enabled: false,
      position: 'top'
    }
  }]
};

    charts.lossplot4.options.scales.x = {
      type: 'linear',
      position: 'bottom',
      title: {
        display: true,
        text: 'φ'
      },
      min: 0,
      max: 1.57,
      ticks: {
        callback: function(value) {
          return value.toFixed(2);
        },
        maxTicksLimit: 10
      }
    };
    
    charts.lossplot4.options.scales.y = {
      title: {
        display: true,
        text: 'Loss'
      },
      min: 0,
      max: Math.max(0.5, ...yValues, currentLoss, phi0Loss)
    };

    charts.lossplot4.update();

    // Update the loss value displays
    const lossValueElement = document.getElementById('current-loss-value');
    if (lossValueElement) {
      lossValueElement.textContent = currentLoss.toFixed(4);
    }
    const phi0LossValueElement = document.getElementById('phi0-loss-value');
    if (phi0LossValueElement) {
      phi0LossValueElement.textContent = phi0Loss.toFixed(4);
    }
  }
}

function myloss(u1,u2,x) {
  const e1tmp = u1.map((u1, i) => u1 * Math.cos(x) + u2[i] * Math.sin(x));
  const e2tmp = u1.map((u1, i) => -u1 * Math.sin(x) + u2[i] * Math.cos(x));

  const out = calculateMoments(e1tmp, e2tmp).loss

  return out;
}



function updateLossPlotm() {
  if (charts && charts.lossplot4m && u1 && u2) {
    const currentPhi = parseFloat(document.getElementById('phi').value);
    const phi0 = parseFloat(document.getElementById('phi0').value);
    const xValues = Array.from({length: 159}, (_, i) => i * 0.01);
    const yValues = xValues.map(x => mylossm(u1, u2, x));

    charts.lossplot4m.data.labels = xValues.map(x => x.toFixed(2));
    charts.lossplot4m.data.datasets[0].data = xValues.map((x, i) => ({x: x, y: yValues[i]}));

    // Update the current phi point
    const currentLoss = mylossm(u1, u2, currentPhi);
    charts.lossplot4m.data.datasets[1].data = [{
      x: currentPhi,
      y: currentLoss
    }];

      // Update the phi0 point
      const phi0Loss = mylossm(u1, u2, phi0);
      const yMin = Math.min(0,...charts.lossplot4m.data.datasets[0].data.map(point => point.y));
      const yMax = Math.max(0.5,...charts.lossplot4m.data.datasets[0].data.map(point => point.y));
      
      charts.lossplot4m.data.datasets[2] = {
        type: 'line',
        label: 'φ₀',
        data: [
          { x: phi0, y: yMin },
          { x: phi0, y: yMax }
        ],
        borderColor: '#ffa500',
        borderWidth: 2,
        pointRadius: 0,
        animation: false
      };
      
      charts.lossplot4m.options.annotation = {
        annotations: [{
          type: 'line',
          mode: 'vertical',
          scaleID: 'x',
          value: phi0,
          borderColor: '#ffa500',
          borderWidth: 2,
          label: {
            content: 'φ₀',
            enabled: false,
            position: 'top'
          }
        }]
      };

    charts.lossplot4m.options.scales.x = {
      type: 'linear',
      position: 'bottom',
      title: {
        display: true,
        text: 'φ'
      },
      min: 0,
      max: 1.57,
      ticks: {
        callback: function(value) {
          return value.toFixed(2);
        },
        maxTicksLimit: 10
      }
    };
    
    charts.lossplot4m.options.scales.y = {
      title: {
        display: true,
        text: 'Loss'
      }
    };

    charts.lossplot4m.update();

    // Update the loss value displays
    const lossValueElement = document.getElementById('current-loss-value');
    if (lossValueElement) {
      lossValueElement.textContent = currentLoss.toFixed(4);
    }
    const phi0LossValueElement = document.getElementById('phi0-loss-value');
    if (phi0LossValueElement) {
      phi0LossValueElement.textContent = phi0Loss.toFixed(4);
    }
  }
}

function mylossm(u1,u2,x) {
  const e1tmp = u1.map((u1, i) => u1 * Math.cos(x) + u2[i] * Math.sin(x));
  const e2tmp = u1.map((u1, i) => -u1 * Math.sin(x) + u2[i] * Math.cos(x));

  const out = calculateAdditionalStats(e1tmp, e2tmp).loss

  return out;
}

 
function generateNewData() { 
   const T = parseInt(document.getElementById('T').value);
  const currentPage = document.body.className;

  let rawEpsilon1, rawEpsilon2;

  if (currentPage === 'page6') {
    console.log('Generating mixed normal data for page 6');
    rawEpsilon1 = generateMixedNormalData(T, s);
    rawEpsilon2 = generateMixedNormalData(T, 0);
  } else {
    console.log('Generating uniform data for other pages');
    rawEpsilon1 = Array.from({length: T}, () => Math.sqrt(3) * (2 * Math.random() - 1));
    rawEpsilon2 = Array.from({length: T}, () => Math.sqrt(3) * (2 * Math.random() - 1));
  }

  // Compute sample means and covariance matrix
  const mean1 = rawEpsilon1.reduce((a, b) => a + b, 0) / T;
  const mean2 = rawEpsilon2.reduce((a, b) => a + b, 0) / T;
  let cov11 = 0, cov12 = 0, cov22 = 0;
  for (let i = 0; i < T; i++) {
    cov11 += (rawEpsilon1[i] - mean1) * (rawEpsilon1[i] - mean1);
    cov12 += (rawEpsilon1[i] - mean1) * (rawEpsilon2[i] - mean2);
    cov22 += (rawEpsilon2[i] - mean2) * (rawEpsilon2[i] - mean2);
  }
  cov11 /= T - 1;
  cov12 /= T - 1;
  cov22 /= T - 1;

  // Compute Cholesky decomposition
  const L11 = Math.sqrt(cov11);
  const L21 = cov12 / L11;
  const L22 = Math.sqrt(cov22 - L21 * L21);

  // Orthogonalize and normalize the shocks
  epsilon1 = new Array(T);
  epsilon2 = new Array(T);
  for (let i = 0; i < T; i++) {
    epsilon1[i] = (rawEpsilon1[i] - mean1) / L11;
    epsilon2[i] = ((rawEpsilon2[i] - mean2) - L21 * epsilon1[i]) / L22;
  }

  // Ensure zero mean and unit variance
  let newMean1 = 0, newMean2 = 0, newVar1 = 0, newVar2 = 0;
  for (let i = 0; i < T; i++) {
    newMean1 += epsilon1[i];
    newMean2 += epsilon2[i];
  }
  newMean1 /= T;
  newMean2 /= T;

  for (let i = 0; i < T; i++) {
    epsilon1[i] -= newMean1;
    epsilon2[i] -= newMean2;
    newVar1 += epsilon1[i] * epsilon1[i];
    newVar2 += epsilon2[i] * epsilon2[i];
  }
  newVar1 = Math.sqrt(newVar1 / (T ));
  newVar2 = Math.sqrt(newVar2 / (T ));

  for (let i = 0; i < T; i++) {
    epsilon1[i] /= newVar1;
    epsilon2[i] /= newVar2;
  }
   
  selectedPointIndex = null;

  updateAllCharts();
}

function generateMixedNormalData(length, s) {
  return Array.from({length}, () => {
    if (Math.random() < 0.9) {
      // 90% standard normal
      return normalRandom() - 0.1*s;
    } else {
      // 10% normal with mean s and variance 1
      return normalRandom() + s - 0.1*s;
    }
  });
}

function normalRandom() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Helper function to generate random numbers from a standard normal distribution
function normalRandom() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function updateChartWithPhi() {
  const phi0 = parseFloat(document.getElementById('phi0').value);
  const phi = parseFloat(document.getElementById('phi').value);

  // Calculate u1 and u2
  u1 = epsilon1.map((e1, i) => e1 * Math.cos(phi0) - epsilon2[i] * Math.sin(phi0));
  u2 = epsilon1.map((e1, i) => e1 * Math.sin(phi0) + epsilon2[i] * Math.cos(phi0));

  if (charts.scatterPlot2) {
    updateChartScatter(charts.scatterPlot2, u1, u2, "Reduced Form Shocks", "u₁", "u₂", true);
  }

  // Calculate e1 and e2
  const e1 = u1.map((u1, i) => u1 * Math.cos(phi) + u2[i] * Math.sin(phi));
  const e2 = u1.map((u1, i) => -u1 * Math.sin(phi) + u2[i] * Math.cos(phi));

  if (charts.scatterPlot3) {
    updateChartScatter(charts.scatterPlot3, e1, e2, "Innovations", "e₁", "e₂", true);
  }

  calculateStats(epsilon1, epsilon2, u1, u2, e1, e2);
  
  // Maintain the selected point
  if (selectedPointIndex !== null) {
    highlightPointOnAllCharts(selectedPointIndex);
  }
}

 
function updateAllMatrices(phi0, phi) {
  const cosPhiFixed0 = Math.cos(phi0).toFixed(2);
  const sinPhiFixed0 = Math.sin(phi0).toFixed(2);
  const cosPhiFixed = Math.cos(phi).toFixed(2);
  const sinPhiFixed = Math.sin(phi).toFixed(2);

  const matrixHtml0 = ` 
    $$
        \\begin{bmatrix} u_{1,t}   \\\\ u_{2,t}  \\end{bmatrix} 
         =  
      \\begin{bmatrix} 
  ${cosPhiFixed0} & ${-sinPhiFixed0} \\\\ 
  ${sinPhiFixed0} & ${cosPhiFixed0} 
  \\end{bmatrix} 
    \\begin{bmatrix} \\epsilon_{1,t}   \\\\ \\epsilon_{2,t}  \\end{bmatrix}
         $$ `;

  const matrixHtml = ` 
    $$
        \\begin{bmatrix} e_{1,t}   \\\\ e_{2,t}  \\end{bmatrix} 
         =  
      \\begin{bmatrix} 
  ${cosPhiFixed} & ${sinPhiFixed} \\\\ 
  ${-sinPhiFixed} & ${cosPhiFixed} 
  \\end{bmatrix} 
    \\begin{bmatrix} u_{1,t}   \\\\ u_{2,t}  \\end{bmatrix}
         $$ `; 

  const b0Element = document.getElementById('current-B0');
  const bElement = document.getElementById('current-B');

  if (b0Element) b0Element.innerHTML = matrixHtml0;
  if (bElement) bElement.innerHTML = matrixHtml;

  MathJax.typeset();
  
}

 
 

function updateChartScatter(chart, xData, yData, title, xLabel, yLabel, animate = false) {
  if (!chart) return;

  const newData = xData.map((x, i) => ({x: x, y: yData[i]}));

  chart.data.datasets[0].data = newData;
  
  // The selected point will be updated in highlightPointOnBothCharts
  chart.data.datasets[1].data = [];

  chart.options.plugins.title.text = title;
  chart.options.scales.x.title.text = xLabel;
  chart.options.scales.y.title.text = yLabel;

  chart.options.animation = animate ? 
    { duration: 300, easing: 'easeInOutQuad' } : 
    { duration: 0 };

  chart.update();
}

function mean(arr) {
  return arr.reduce((a, b) => a + b) / arr.length;
}

// Statistical Calculations
function calculateStats(epsilon1, epsilon2, u1, u2, e1, e2) {
  const stats = {
    epsilon: calculateMoments(epsilon1, epsilon2),
    u: calculateMoments(u1, u2),
    e: calculateMoments(e1, e2),
    epsilon_additional: calculateAdditionalStats(epsilon1, epsilon2),
    u_additional: calculateAdditionalStats(u1, u2),
    e_additional: calculateAdditionalStats(e1, e2) 
  };

  updateStatsDisplay(stats);
}

function calculateMoments(data1, data2) {
  if (!Array.isArray(data1) || !Array.isArray(data2) || data1.length !== data2.length || data1.length === 0) {
    throw new Error("Input must be non-empty arrays of equal length");
  }

  const n = data1.length;
  
  // Helper function to calculate mean
  const mean = (arr) => arr.reduce((sum, val) => sum + val, 0) / n;

  // Calculate basic moments
  const covariance = mean(data1.map((d1, i) => d1 * data2[i]));
  const coskewness1 = mean(data1.map((d1, i) => d1 * d1 * data2[i]));
  const coskewness2 = mean(data1.map((d1, i) => d1 * data2[i] * data2[i]));
  const cokurtosis1 = mean(data1.map((d1, i) => d1 * d1 * d1 * data2[i]));
  const cokurtosis2 = mean(data1.map((d1, i) => d1 * data2[i] * data2[i] * data2[i]));
  const cokurtosis3 = mean(data1.map((d1, i) => d1 * d1 * data2[i] * data2[i]))-1;

  return {
    covariance,
    coskewness1,
    coskewness2,
    cokurtosis1,
    cokurtosis2,
    cokurtosis3,
    loss: Math.pow(coskewness1, 2) +Math.pow(coskewness2, 2) +Math.pow(cokurtosis1, 2) + Math.pow(cokurtosis2, 2) + Math.pow(cokurtosis3, 2)
  };
}



function calculateAdditionalStats(data1, data2) {
  mean1 = mean(data1)
  mean2 = mean(data2)
  mean_squared1 = mean(data1.map(d => d * d))
  mean_squared2= mean(data2.map(d => d * d))
  mean_cubed1= mean(data1.map(d => d * d * d))
  mean_cubed2= mean(data2.map(d => d * d * d))
  mean_fourth1= mean(data1.map(d => d * d * d * d))-3
  mean_fourth2= mean(data2.map(d => d * d * d * d))-3
  return {
    mean1,
    mean2,
    mean_squared1,
    mean_squared2,
    mean_cubed1,
    mean_cubed2,
    mean_fourth1,
    mean_fourth2,
    loss: Math.pow(mean_cubed1, 2) + Math.pow(mean_cubed2, 2) +Math.pow(mean_fourth1, 2) + Math.pow(mean_fourth2, 2)
  };
}

 

// Stats Display Updates
function updateStatsDisplay(stats) {
  const updateStatsTable = (elementId, data, title, symbol) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = createTable(data, title, symbol);
    }
  };

  const updateAdditionalStatsTable = (elementId, data, title, symbol) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = createAdditionalTable(data, title, symbol);
    }
  };

  updateStatsTable('stats-epsilon', stats.epsilon, "Co-moments of structural shocks ε ", "ε");
  updateStatsTable('stats-u', stats.u, "Co-moments of reduced form shocks u ", "u");
  updateStatsTable('stats-e', stats.e, "Co-moments of innovations e  ", "e");

  updateAdditionalStatsTable('stats-epsilon-additional', stats.epsilon_additional, " Moments of structural shocks  ε", "ε");
  updateAdditionalStatsTable('stats-u-additional', stats.u_additional, "Moments of reduced form shocks u", "u");
  updateAdditionalStatsTable('stats-e-additional', stats.e_additional, "Moments of innovations e", "e");
}

function createTable(data, title, symbol) {
  return `
  <h3>${title}</h3>
  <table class="stats-table">
    <tr>
      <th> </th>
      <th>Formula</th>
      <th>Value</th>
    </tr>
    <tr>
      <td class="measure">Covariance</td>
      <td class="formula">mean(${symbol}₁ * ${symbol}₂)</td>
      <td  class="value">${data.covariance.toFixed(2)}</td>
    </tr> 
    <tr>
      <td class="measure">Coskewness </td>
      <td class="formula">mean(${symbol}₁³ * ${symbol}₂)</td>
      <td  class="value">${data.coskewness1.toFixed(2)}</td>
    </tr>
    <tr>
      <td class="measure">Coskewness </td>
      <td class="formula">mean(${symbol}₁ * ${symbol}₂³)</td>
      <td  class="value">${data.coskewness2.toFixed(2)}</td>
    </tr>
    <tr>
      <td class="measure">Cokurtosis </td>
      <td class="formula">mean(${symbol}₁³ * ${symbol}₂)</td>
      <td  class="value">${data.cokurtosis1.toFixed(2)}</td>
    </tr>
    <tr>
      <td class="measure">Cokurtosis </td>
      <td class="formula">mean(${symbol}₁ * ${symbol}₂³)</td>
      <td  class="value">${data.cokurtosis2.toFixed(2)}</td>
    </tr>
    <tr>
      <td class="measure">Cokurtosis </td>
      <td class="formula">mean(${symbol}₁² * ${symbol}₂² - 1 ) </td>
      <td  class="value">${data.cokurtosis3.toFixed(2)}</td>
    </tr>
    <tr>
      <td class="measure">Loss</td>
      <td class="formula"> </td>
      <td  class="value">${data.loss.toFixed(2)}</td>
    </tr>
  </table>
  `; 
}

function createAdditionalTable(data, title, symbol) {
  return `
  <h3>${title}</h3>
  <table class="stats-table">
    <tr>
      <th> </th>
      <th>Formula</th>
      <th>i=1</th>
      <th>i=2</th>
    </tr> 
    <tr>
      <td class="measure">Mean</td>
      <td class="formula">mean(${symbol}ᵢ²)</td>
      <td>${data.mean1.toFixed(2)}</td>
      <td>${data.mean2.toFixed(2)}</td>
    </tr> 
    <tr>
      <td class="measure">Variance</td>
      <td class="formula">mean(${symbol}ᵢ²)</td>
      <td>${data.mean_squared1.toFixed(2)}</td>
      <td>${data.mean_squared2.toFixed(2)}</td>
    </tr> 
    <tr>
      <td class="measure">Skewness</td>
      <td class="formula">mean(${symbol}ᵢ³)</td>
      <td>${data.mean_cubed1.toFixed(2)}</td>
      <td>${data.mean_cubed2.toFixed(2)}</td>
    </tr> 
    <tr>
      <td class="measure">Excess Kurtosis</td>
      <td class="formula">mean(${symbol}ᵢ⁴)-3</td>
      <td>${data.mean_fourth1.toFixed(2)}</td>
      <td>${data.mean_fourth2.toFixed(2)}</td>
    </tr>
    <tr>
      <td class="measure">Loss</td>
      <td class="formula"> </td>
      <td>${data.loss.toFixed(2)}</td>
      <td> </td>
    </tr>
  </table>
  `; 
}
