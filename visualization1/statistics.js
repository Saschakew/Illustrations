// Handle statistical calculations

import { mean } from './utils.js';

export function calculateStats(epsilon1, epsilon2, u1, u2, e1, e2) {
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
  return {
    covariance: mean(data1.map((d1, i) => d1 * data2[i])),
    coskewness1: mean(data1.map((d1, i) => d1 * d1 * data2[i])),
    coskewness2: mean(data1.map((d1, i) => d1 * data2[i] * data2[i])),
    cokurtosis1: mean(data1.map((d1, i) => d1 * d1 * d1 * data2[i])),
    cokurtosis2: mean(data1.map((d1, i) => d1 * data2[i] * data2[i] * data2[i])),
    cokurtosis3: mean(data1.map((d1, i) => d1 * d1 * data2[i] * data2[i])) - 1
  };
}

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

export function updateStatsDisplay(stats) {
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