import { charts, epsilon1, epsilon2, u1, u2 } from './main.js';

// Include all the remaining functions from the original script.js here
// This includes:
// - updateB0Matrix
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
// - updateBMatrix
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

// - generateNewData
function generateNewData() {
  const T = parseInt(document.getElementById('T').value);

  // Generate new epsilon1 and epsilon2
  epsilon1 = Array.from({length: T}, () => Math.sqrt(3) * (2 * Math.random() - 1));
  epsilon2 = Array.from({length: T}, () => Math.sqrt(3) * (2 * Math.random() - 1));

  // Normalize epsilon1 and epsilon2
  epsilon1 = normalizeData(epsilon1);
  epsilon2 = normalizeData(epsilon2);
   
  if (charts.scatterPlot1) {
    updateChart(charts.scatterPlot1, epsilon1, epsilon2, "Structural Shocks (Uniform)", "ε₁", "ε₂");
  }
  updateChartWithPhi();
}

// - normalizeData
function normalizeData(data) {
  const mean = data.reduce((a, b) => a + b) / data.length;
  const centered = data.map(val => val - mean);
  const stdDev = Math.sqrt(centered.reduce((acc, val) => acc + val * val, 0) / data.length);
  return centered.map(val => val / stdDev);
}

// - updateChartWithPhi
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

// - updateChart
function updateChart(chart, xData, yData, title, xLabel, yLabel, animate = false) {
  if (!chart) return;  // Exit if the chart doesn't exist

  const newData = xData.map((x, i) => ({x: x, y: yData[i]}));

  chart.data.datasets[0].data = newData;
  chart.options.plugins.title.text = title;
  chart.options.scales.x.title.text = xLabel;
  chart.options.scales.y.title.text = yLabel;

  if (animate) {
    chart.options.animation = {
      duration: 300,
      easing: 'easeInOutQuad'
    };
  } else {
    chart.options.animation = {
      duration: 0
    };
  }

  chart.update();
}

// - calculateStats
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

// - calculateMoments
function calculateMoments(data1, data2) {
  return {
    covariance: mean(data1.map((d1, i) => d1 * data2[i])),
    coskewness1: mean(data1.map((d1, i) => d1 * d1 * data2[i])),
    coskewness2: mean(data1.map((d1, i) => d1 * data2[i] * data2[i])),
    cokurtosis1: mean(data1.map((d1, i) => d1 * d1 * d1 * data2[i])),
    cokurtosis2: mean(data1.map((d1, i) => d1 * data2[i] * data2[i] * data2[i])),
    cokurtosis3: mean(data1.map((d1, i) => d1 * d1 * data2[i] * data2[i])) - 1
  };
}

// - calculateAdditionalStats
function calculateAdditionalStats(data1, data2) {
  return {
    mean1: mean(data1),
    mean2: mean(data2),
    mean_squared1: mean(data1.map(d => d * d)),
    mean_squared2: mean(data2.map(d => d * d)),
    mean_cubed1: mean(data1.map(d => d * d * d)),
    mean_cubed2: mean(data2.map(d => d * d * d)),
    mean_fourth1: mean(data1.map(d => d * d * d * d)),
    mean_fourth2: mean(data2.map(d => d * d * d * d))
  };
}

// - updateStatsDisplay
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

// - createTable
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
      <td class="measure">Coskewness 1</td>
      <td class="formula">mean(${symbol}₁² * ${symbol}₂)</td>
      <td>${data.coskewness1.toFixed(4)}</td>
    </tr>
    <tr>
      <td class="measure">Coskewness 2</td>
      <td class="formula">mean(${symbol}₁ * ${symbol}₂²)</td>
      <td>${data.coskewness2.toFixed(4)}</td>
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
  </table>
  `;
}


// - createAdditionalTable
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
      <td class="measure">Mean</td>
      <td class="formula">mean(${symbol}ᵢ)</td>
      <td>${data.mean1.toFixed(4)}</td>
      <td>${data.mean2.toFixed(4)}</td>
    </tr>
    <tr>
      <td class="measure">Mean Squared</td>
      <td class="formula">mean(${symbol}ᵢ²)</td>
      <td>${data.mean_squared1.toFixed(4)}</td>
      <td>${data.mean_squared2.toFixed(4)}</td>
    </tr>
    <tr>
      <td class="measure">Mean Cubed</td>
      <td class="formula">mean(${symbol}ᵢ³)</td>
      <td>${data.mean_cubed1.toFixed(4)}</td>
      <td>${data.mean_cubed2.toFixed(4)}</td>
    </tr>
    <tr>
      <td class="measure">Mean Fourth</td>
      <td class="formula">mean(${symbol}ᵢ⁴)</td>
      <td>${data.mean_fourth1.toFixed(4)}</td>
      <td>${data.mean_fourth2.toFixed(4)}</td>
    </tr>
  </table>
  `;
}

// - mean
function mean(arr) {
  return arr.reduce((a, b) => a + b) / arr.length;
}

// - initializeCharts (new function to set up charts)
export function initializeCharts(charts) {
  const chartConfig = {
    // ... (chart configuration from the original script)
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
}

// Export all the functions that need to be accessed from other modules
export {
  updateB0Matrix,
  updateBMatrix,
  generateNewData,
  updateChartWithPhi,
  // ... other functions as needed
};