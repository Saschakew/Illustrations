// Global variables
let charts = {};
let epsilon1, epsilon2, u1, u2;

// DOM Content Loaded Event Listener
document.addEventListener('DOMContentLoaded', function() {
  // Initialize UI elements
  initializeUI();
  
  // Initialize charts (creates empty chart objects)
  initializeCharts();
  
  // Set up event listeners
  setupEventListeners();
  
  // Generate initial data
  generateNewData();
  
  // Update B0 and B matrices
  updateB0Matrix(parseFloat(document.getElementById('phi0').value));
  updateBMatrix(parseFloat(document.getElementById('phi').value));
  
  // Update all charts with the generated data
  updateAllCharts();
  
  // Typeset MathJax elements
  MathJax.typeset();
});

// UI Initialization
function initializeUI() {
  // Setup sticky input container
  const inputContainer = document.querySelector('.input-container');
  const inputContainerTop = inputContainer.offsetTop;

  function handleScroll() {
    if (window.pageYOffset > inputContainerTop) {
      inputContainer.classList.add('sticky');
      document.body.style.paddingTop = inputContainer.offsetHeight + 'px';
    } else {
      inputContainer.classList.remove('sticky');
      document.body.style.paddingTop = 0;
    }
  }

  window.addEventListener('scroll', handleScroll);

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

// Event Listeners Setup
function setupEventListeners() {
  document.getElementById('phi0').addEventListener('input', function() {
    const phiValue0 = parseFloat(this.value);
    document.getElementById('phi0Value').textContent = phiValue0.toFixed(2);
    updateB0Matrix(phiValue0);
    updateChartWithPhi();
  });

  const phiElement = document.getElementById('phi');
  if (phiElement) {
    phiElement.addEventListener('input', function() {
      const phiValue = parseFloat(this.value);
      document.getElementById('phiValue').textContent = phiValue.toFixed(2);
      updateBMatrix(phiValue);
      updateChartWithPhi();   
      updateLossPlot();  // Add this line
    });
  }
 

  document.getElementById('T').addEventListener('input', function() {
    generateNewData();
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
        backgroundColor: 'rgba(255, 165, 0, 0.6)'
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
          label: 'Current φ',
          data: [],
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgb(255, 99, 132)',
          pointRadius: 6,
          pointHoverRadius: 8,
          showLine: false
        }, {
          label: 'φ₀',
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
            display: true,
            text: 'Loss Plot'
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'φ'
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
  updateLossPlot() 
}

function updateAllCharts() {
  if (charts.scatterPlot1) {
    updateChart(charts.scatterPlot1, epsilon1, epsilon2, "Structural Shocks (Uniform)", "ε₁", "ε₂");
  }
  updateChartWithPhi();
  updateLossPlot();
}

function updateLossPlot() {
  if (charts && charts.lossplot4 && u1 && u2) {
    const currentPhi = parseFloat(document.getElementById('phi').value);
    const phi0 = parseFloat(document.getElementById('phi0').value);
    const xValues = Array.from({length: 79}, (_, i) => i * 0.01);
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
    charts.lossplot4.data.datasets[2].data = [{
      x: phi0,
      y: phi0Loss
    }];

    charts.lossplot4.options.scales.x = {
      type: 'linear',
      position: 'bottom',
      title: {
        display: true,
        text: 'φ'
      },
      min: 0,
      max: 0.78,
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
      }
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
 

// Data Generation and Chart Updates
function generateNewData() {
  const T = parseInt(document.getElementById('T').value);

  // Generate new epsilon1 and epsilon2
  epsilon1 = Array.from({length: T}, () => Math.sqrt(3) * (2 * Math.random() - 1));
  epsilon2 = Array.from({length: T}, () => Math.sqrt(3) * (2 * Math.random() - 1));

  // Normalize epsilon1 and epsilon2
  epsilon1 = normalizeData(epsilon1);
  epsilon2 = normalizeData(epsilon2);
   
  updateAllCharts();
}

function updateChartWithPhi() {
  const phi0 = parseFloat(document.getElementById('phi0').value);
  const phi = parseFloat(document.getElementById('phi').value);

  // Calculate u1 and u2
  u1 = epsilon1.map((e1, i) => e1 * Math.cos(phi0) - epsilon2[i] * Math.sin(phi0));
  u2 = epsilon1.map((e1, i) => e1 * Math.sin(phi0) + epsilon2[i] * Math.cos(phi0));

  if (charts.scatterPlot2) {
    updateChart(charts.scatterPlot2, u1, u2, "Reduced Form Shocks", "u₁", "u₂", true);
  }

  // Calculate e1 and e2
  const e1 = u1.map((u1, i) => u1 * Math.cos(phi) + u2[i] * Math.sin(phi));
  const e2 = u1.map((u1, i) => -u1 * Math.sin(phi) + u2[i] * Math.cos(phi));

  if (charts.scatterPlot3) {
    updateChart(charts.scatterPlot3, e1, e2, "Transformed Shocks", "e₁", "e₂", true);
  }

  calculateStats(epsilon1, epsilon2, u1, u2, e1, e2);
}

// Matrix Updates
function updateB0Matrix(phi) {
  const cosPhiFixed = Math.cos(phi).toFixed(4);
  const sinPhiFixed = Math.sin(phi).toFixed(4);

  const matrixHtml = `
  $$
  B( \\phi_0 = ${phi.toFixed(2)}) = \\begin{bmatrix} 
  ${cosPhiFixed} & ${-sinPhiFixed} \\\\ 
  ${sinPhiFixed} & ${cosPhiFixed} 
  \\end{bmatrix}
  $$`;

  document.getElementById('current-B0').innerHTML = matrixHtml;
  MathJax.typeset();
}

function updateBMatrix(phi) {
  const cosPhiFixed = Math.cos(phi).toFixed(4);
  const sinPhiFixed = Math.sin(phi).toFixed(4);

  const matrixHtml = `
  $$
  B( \\phi = ${phi.toFixed(2)}) = \\begin{bmatrix} 
  ${cosPhiFixed} & ${-sinPhiFixed} \\\\ 
  ${sinPhiFixed} & ${cosPhiFixed} 
  \\end{bmatrix}
  $$`;

  document.getElementById('current-B').innerHTML = matrixHtml;
  MathJax.typeset();
}

// Utility Functions
function normalizeData(data) {
  const mean = data.reduce((a, b) => a + b) / data.length;
  const centered = data.map(val => val - mean);
  const stdDev = Math.sqrt(centered.reduce((acc, val) => acc + val * val, 0) / data.length);
  return centered.map(val => val / stdDev);
}

function updateChart(chart, xData, yData, title, xLabel, yLabel, animate = false) {
  if (!chart) return;  // Exit if the chart doesn't exist

  const newData = xData.map((x, i) => ({x: x, y: yData[i]}));

  chart.data.datasets[0].data = newData;
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
    loss: Math.pow(cokurtosis1, 2) + Math.pow(cokurtosis2, 2) + Math.pow(cokurtosis3, 2)
  };
}



function calculateAdditionalStats(data1, data2) {
  mean1 = mean(data1)
  mean2 = mean(data2)
  mean_squared1 = mean(data1.map(d => d * d))
  mean_squared2= mean(data2.map(d => d * d))
  mean_cubed1= mean(data1.map(d => d * d * d))
  mean_cubed2= mean(data2.map(d => d * d * d))
  mean_fourth1= mean(data1.map(d => d * d * d * d))
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
    loss: Math.pow(mean_fourth1, 2) + Math.pow(mean_fourth2, 2)
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

  updateStatsTable('stats-epsilon', stats.epsilon, "ε co-moments", "ε");
  updateStatsTable('stats-u', stats.u, "u co-moments", "u");
  updateStatsTable('stats-e', stats.e, "e co-moments", "e");

  updateAdditionalStatsTable('stats-epsilon-additional', stats.epsilon_additional, "ε moments", "ε");
  updateAdditionalStatsTable('stats-u-additional', stats.u_additional, "u moments", "u");
  updateAdditionalStatsTable('stats-e-additional', stats.e_additional, "e moments", "e");
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
      <td>${data.covariance.toFixed(4)}</td>
    </tr> 
    <tr>
      <td class="measure">Cokurtosis 1</td>
      <td class="formula">mean(${symbol}₁³ * ${symbol}₂)</td>
      <td>${data.cokurtosis1.toFixed(4)}</td>
    </tr>
    <tr>
      <td class="measure">Cokurtosis 2</td>
      <td class="formula">mean(${symbol}₁ * ${symbol}₂³)</td>
      <td>${data.cokurtosis2.toFixed(4)}</td>
    </tr>
    <tr>
      <td class="measure">Cokurtosis 3</td>
      <td class="formula">mean(${symbol}₁² * ${symbol}₂²) - 1</td>
      <td>${data.cokurtosis3.toFixed(4)}</td>
    </tr>
    <tr>
      <td class="measure">Loss</td>
      <td class="formula">...</td>
      <td>${data.loss.toFixed(4)}</td>
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
      <th>$i=1$</th>
      <th>$i=2$</th>
    </tr> 
    <tr>
      <td class="measure">Variance</td>
      <td class="formula">mean(${symbol}ᵢ²)</td>
      <td>${data.mean_squared1.toFixed(4)}</td>
      <td>${data.mean_squared2.toFixed(4)}</td>
    </tr> 
    <tr>
      <td class="measure">Excess Kurtosis</td>
      <td class="formula">mean(${symbol}ᵢ⁴)-3</td>
      <td>${data.mean_fourth1.toFixed(4)}</td>
      <td>${data.mean_fourth2.toFixed(4)}</td>
    </tr>
    <tr>
      <td class="measure">Loss</td>
      <td class="formula">...</td>
      <td>${data.loss.toFixed(4)}</td>
      <td> </td>
    </tr>
  </table>
  `;
}
