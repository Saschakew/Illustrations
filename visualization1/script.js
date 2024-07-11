let chart1, chart2;
let epsilon1, epsilon2;

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


function updateBMatrix(phi) {
  const cosPhiFixed = Math.cos(phi).toFixed(4);
  const sinPhiFixed = Math.sin(phi).toFixed(4);

  const matrixHtml = `
  $$
  B(${phi.toFixed(2)}) = \\begin{bmatrix} 
  ${cosPhiFixed} & ${-sinPhiFixed} \\\\ 
  ${sinPhiFixed} & ${cosPhiFixed} 
  \\end{bmatrix}
  $$`;

  document.getElementById('current-B').innerHTML = matrixHtml;
  MathJax.typeset();
}

function generateNewData() {
  const T = parseInt(document.getElementById('T').value);

  // Generate new epsilon1 and epsilon2
  epsilon1 = Array.from({length: T}, () => Math.sqrt(3) * (2 * Math.random() - 1));
  epsilon2 = Array.from({length: T}, () => Math.sqrt(3) * (2 * Math.random() - 1));

  updateChart(chart1, epsilon1, epsilon2, "Structural Shocks (Uniform)", "ε₁", "ε₂");
  updateChartWithPhi();
}

function updateChartWithPhi() {
  const phi = parseFloat(document.getElementById('phi').value);

  // Calculate u1 and u2 using the current phi value
  const u1 = epsilon1.map((e1, i) => e1 * Math.cos(phi) - epsilon2[i] * Math.sin(phi));
  const u2 = epsilon1.map((e1, i) => e1 * Math.sin(phi) + epsilon2[i] * Math.cos(phi));

  updateChart(chart2, u1, u2, "Reduced Form Shocks", "u₁", "u₂", true);

  calculateStats(epsilon1, epsilon2, u1, u2);
}

function updateChart(chart, xData, yData, title, xLabel, yLabel, animate = false) {
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

function calculateStats(epsilon1, epsilon2, u1, u2) {
  const stats = {
    epsilon: {
      covariance: mean(epsilon1.map((e1, i) => e1 * epsilon2[i])),
      coskewness1: mean(epsilon1.map((e1, i) => e1 * e1 * epsilon2[i])),
      coskewness2: mean(epsilon1.map((e1, i) => e1 * epsilon2[i] * epsilon2[i])),
      cokurtosis1: mean(epsilon1.map((e1, i) => e1 * e1 * e1 * epsilon2[i])),
      cokurtosis2: mean(epsilon1.map((e1, i) => e1 * epsilon2[i] * epsilon2[i] * epsilon2[i])),
      cokurtosis3: mean(epsilon1.map((e1, i) => e1 * e1 * epsilon2[i] * epsilon2[i])) - 1
    },
    u: {
      covariance: mean(u1.map((u1, i) => u1 * u2[i])),
      coskewness1: mean(u1.map((u1, i) => u1 * u1 * u2[i])),
      coskewness2: mean(u1.map((u1, i) => u1 * u2[i] * u2[i])),
      cokurtosis1: mean(u1.map((u1, i) => u1 * u1 * u1 * u2[i])),
      cokurtosis2: mean(u1.map((u1, i) => u1 * u2[i] * u2[i] * u2[i])),
      cokurtosis3: mean(u1.map((u1, i) => u1 * u1 * u2[i] * u2[i])) - 1
    },
    epsilon_additional: {
      mean1: mean(epsilon1),
      mean2: mean(epsilon2),
      mean_squared1: mean(epsilon1.map(e => e * e)),
      mean_squared2: mean(epsilon2.map(e => e * e)),
      mean_cubed1: mean(epsilon1.map(e => e * e * e)),
      mean_cubed2: mean(epsilon2.map(e => e * e * e)),
      mean_fourth1: mean(epsilon1.map(e => e * e * e * e)),
      mean_fourth2: mean(epsilon2.map(e => e * e * e * e))
    },
    u_additional: {
      mean1: mean(u1),
      mean2: mean(u2),
      mean_squared1: mean(u1.map(u => u * u)),
      mean_squared2: mean(u2.map(u => u * u)),
      mean_cubed1: mean(u1.map(u => u * u * u)),
      mean_cubed2: mean(u2.map(u => u * u * u)),
      mean_fourth1: mean(u1.map(u => u * u * u * u)),
      mean_fourth2: mean(u2.map(u => u * u * u * u))
    }
  };

  function createAdditionalTable(data, title, symbol) {
    return `
    <h3>${title}</h3>
    <table class="stats-table">
    <tr>
    <th> </th>
    <th>Formula</th>
    <th>$$i=1$$</th>
    <th>$$i=2$$</th>
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

  const createTable = (data, title, symbol) => `
  <h3>${title} co-moments</h3>
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

  document.getElementById('stats-epsilon').innerHTML = createTable(stats.epsilon, "ε", "ε");
  document.getElementById('stats-epsilon-additional').innerHTML = createAdditionalTable(stats.epsilon_additional, "ε moments", "ε");
  document.getElementById('stats-u').innerHTML = createTable(stats.u, "u", "u");
  document.getElementById('stats-u-additional').innerHTML = createAdditionalTable(stats.u_additional, "u moments", "u");
}

function mean(arr) {
  return arr.reduce((a, b) => a + b) / arr.length;
}

document.getElementById('phi').addEventListener('input', function() {
  const phiValue = parseFloat(this.value);
  document.getElementById('phiValue').textContent = phiValue.toFixed(2);
  updateBMatrix(phiValue);
  updateChartWithPhi();
});

document.getElementById('T').addEventListener('input', function() {
  generateNewData();
});

window.onload = function() {
  const ctx1 = document.getElementById('scatterPlot1').getContext('2d');
  const ctx2 = document.getElementById('scatterPlot2').getContext('2d');

  const chartConfig = {
  type: 'scatter',
  data: {
    datasets: [{
      label: 'Data',
      data: [],
      backgroundColor: 'rgba(75, 192, 192, 0.6)'
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
          size: 18 // Increase font size for the title
        }
      },
      legend: {
        display: false // Disable the legend
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: '',
          font: {
            size: 16 // Increase font size for the x-axis label
          }
        }
      },
      y: {
        title: {
          display: true,
          text: '',
          font: {
            size: 16 // Increase font size for the y-axis label
          }
        }
      }
    }
  }
};

  chart1 = new Chart(ctx1, JSON.parse(JSON.stringify(chartConfig)));
  chart2 = new Chart(ctx2, JSON.parse(JSON.stringify(chartConfig)));

  generateNewData();
  updateBMatrix(parseFloat(document.getElementById('phi').value));
  MathJax.typeset();
};