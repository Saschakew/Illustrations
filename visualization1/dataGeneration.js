// Handle data generation

import { normalizeData } from './utils.js';
import { charts, updateChart, updateChartWithPhi } from './charts.js';

let epsilon1, epsilon2;

export function generateNewData() {
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