// Handle chart creation and updates

import { calculateStats } from './statistics.js';

export let charts = {};

export function initializeCharts() {
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
          font: {
            size: 18
          }
        },
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: '',
            font: {
              size: 16
            }
          }
        },
        y: {
          title: {
            display: true,
            text: '',
            font: {
              size: 16
            }
          }
        }
      }
    }
  };
 

  createChartIfExists('scatterPlot1', chartConfig);
  createChartIfExists('scatterPlot2', chartConfig);
  createChartIfExists('scatterPlot3', chartConfig);
}

function createChartIfExists(id, config) {
  const element = document.getElementById(id);
  if (element) {
    const ctx = element.getContext('2d');
    charts[id] = new Chart(ctx, JSON.parse(JSON.stringify(config)));
  }
}

export function updateChartWithPhi() {
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

export function updateChart(chart, xData, yData, title, xLabel, yLabel, animate = false) {
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