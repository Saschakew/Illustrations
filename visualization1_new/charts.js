// Apply global Chart.js defaults to match site theme
(function applyChartThemeDefaults() {
  if (typeof Chart === 'undefined') return;
  try {
    const styles = getComputedStyle(document.documentElement);
    const text = (styles.getPropertyValue('--text') || '#0f172a').trim();
    const muted = (styles.getPropertyValue('--muted') || '#6b7280').trim();
    const border = (styles.getPropertyValue('--border') || '#e5e7eb').trim();
    const card = (styles.getPropertyValue('--card') || '#ffffff').trim();

    Chart.defaults.font = Chart.defaults.font || {};
    Chart.defaults.font.family = "Lato, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'";
    Chart.defaults.font.size = 12;
    Chart.defaults.color = muted;

    // Scales and grid
    Chart.defaults.scale = Chart.defaults.scale || {};
    Chart.defaults.scale.grid = Chart.defaults.scale.grid || {};
    Chart.defaults.scale.grid.color = border;
    Chart.defaults.scale.grid.drawBorder = false;

    // Elements
    Chart.defaults.elements = Chart.defaults.elements || {};
    Chart.defaults.elements.point = Chart.defaults.elements.point || {};
    Chart.defaults.elements.point.borderWidth = 1.5;

    // Tooltip base styling
    Chart.defaults.plugins = Chart.defaults.plugins || {};
    Chart.defaults.plugins.tooltip = Chart.defaults.plugins.tooltip || {};
    Chart.defaults.plugins.tooltip.backgroundColor = (function() {
      // Derive tooltip background from CSS var --card with 0.95 alpha
      const c = (styles.getPropertyValue('--card') || '#ffffff').trim();
      // If rgb/rgba string, reuse components and apply alpha
      if (c.startsWith('rgb')) {
        const parts = c.replace(/rgba?\(/, '').replace(')', '').split(',').map(s => s.trim());
        const r = parts[0], g = parts[1], b = parts[2];
        return `rgba(${r}, ${g}, ${b}, 0.95)`;
      }
      // Assume hex (#rgb or #rrggbb)
      const m = c.replace('#','');
      const hex = m.length === 3 ? m.split('').map(ch => ch + ch).join('') : m;
      const bigint = parseInt(hex, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgba(${r}, ${g}, ${b}, 0.95)`;
    })();
    Chart.defaults.plugins.tooltip.titleColor = text;
    Chart.defaults.plugins.tooltip.bodyColor = text;
    Chart.defaults.plugins.tooltip.borderColor = border;
    Chart.defaults.plugins.tooltip.borderWidth = 1;
  } catch (e) {
    console.warn('Chart theme defaults could not be applied:', e);
  }
})();

// Deep clone utility that preserves function properties
function cloneConfigPreserveFns(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(cloneConfigPreserveFns);
  const cloned = {};
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    const v = obj[key];
    cloned[key] = (typeof v === 'function') ? v : cloneConfigPreserveFns(v);
  }
  return cloned;
}

// Expose theme-based accent colors derived from CSS variables
function getThemeAccents() {
  const styles = getComputedStyle(document.documentElement);
  // Prefer alias variables for parity; fall back to brand variables
  const primary = (styles.getPropertyValue('--color-primary') || styles.getPropertyValue('--brand') || '#ff8c00').trim();
  const accent = (styles.getPropertyValue('--color-accent') || styles.getPropertyValue('--brand-grad-end') || '#ffb34d').trim();

  function hexToRgb(hex) {
    const m = hex.replace('#','');
    const bigint = parseInt(m.length === 3 ? m.split('').map(c => c + c).join('') : m, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
  }

  function rgba(hex, a) {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  return {
    color1: primary,
    color2: accent,
    color3: rgba(primary, 0.55)
  };
}

function getScatterPlotConfig() {
  // Pull theme colors from CSS variables for cohesive styling
  const styles = getComputedStyle(document.documentElement);
  const primary = (styles.getPropertyValue('--color-primary') || styles.getPropertyValue('--brand') || '#ff8c00').trim();
  // Prefer provided weak; otherwise derive from primary with alpha
  const brandWeakVar = (styles.getPropertyValue('--brand-weak') || '').trim();
  const brandWeak = brandWeakVar && brandWeakVar.length > 0 ? brandWeakVar : (function(hex){
    const m = hex.replace('#','');
    const full = m.length === 3 ? m.split('').map(c => c + c).join('') : m;
    const v = parseInt(full, 16);
    const r = (v >> 16) & 255, g = (v >> 8) & 255, b = v & 255;
    return `rgba(${r}, ${g}, ${b}, 0.12)`;
  })(primary);
  const text = (styles.getPropertyValue('--text') || '#0f172a').trim();
  const muted = (styles.getPropertyValue('--muted') || '#6b7280').trim();
  const border = (styles.getPropertyValue('--border') || '#e5e7eb').trim();
  const card = (styles.getPropertyValue('--card') || '#ffffff').trim();

  let ChartConfig = {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Data',
        data: [],
        backgroundColor: brandWeak,
        borderColor: primary,
        pointBorderWidth: 1.5,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: primary,
      }, {
        label: 'Selected Point',
        data: [],
        backgroundColor: card,
        borderColor: primary,
        pointBorderWidth: 2.5,
        pointRadius: 6,
        pointHoverRadius: 8
      }]
    },
    options: { 
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 1.1,
      layout: { padding: 4 },
      interaction: { intersect: false, mode: 'nearest' },
      onClick: (event, elements, chart) => handleChartClick(event, elements, chart),
      plugins: {
        title: {
          display: true,
          text: '',
          color: text,
          font: { size: 16, weight: '600' }
        },
        legend: { display: false },
        tooltip: {
          enabled: true,
          filter: (item) => item.datasetIndex === 0, // only main dataset
          callbacks: {
            label: (ctx) => `(${ctx.parsed.x.toFixed(2)}, ${ctx.parsed.y.toFixed(2)})`
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: '',
            color: muted,
            font: { size: 14 }
          },
          ticks: { color: muted },
          grid: { color: border, drawBorder: false }
        },
        y: {
          title: {
            display: true,
            text: '',
            color: muted,
            font: { size: 14 }
          },
          ticks: { color: muted },
          grid: { color: border, drawBorder: false }
        }
      } 
    }
  };

  return ChartConfig
}


function getLossPlotConfig() {
  // Pull theme colors from CSS variables for cohesive styling
  const styles = getComputedStyle(document.documentElement);
  const text = (styles.getPropertyValue('--text') || '#0f172a').trim();
  const muted = (styles.getPropertyValue('--muted') || '#6b7280').trim();
  const border = (styles.getPropertyValue('--border') || '#e5e7eb').trim();
  const { color1: brand, color2: brandEnd } = getThemeAccents();

  let ChartConfig = {
    type: 'line',
    data: {
      datasets: [{
        data: [],
        borderColor: brand,
        borderWidth: 2,
        tension: 0.25,
        pointRadius: 0,  // Remove dots
        pointHoverRadius: 0  // Remove hover effect
      }, {
        data: [],
        borderColor: brand,
        backgroundColor: brand,
        pointRadius: 5,
        pointHoverRadius: 7,
        showLine: false
      }, {
        data: [],
        borderColor: brandEnd,
        backgroundColor: brandEnd,
        pointRadius: 5,
        pointHoverRadius: 7,
        showLine: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      // aspectRatio is ignored when maintainAspectRatio is false; CSS height controls the canvas size
      plugins: {
        legend: {
          display: false // Hide the legend
        },
        title: {
          display: false,
          text: 'Loss Plot'
        },
        tooltip: {
          enabled: true,
          intersect: false,
          mode: 'index',
          backgroundColor: (function(){
            const styles = getComputedStyle(document.documentElement);
            const c = (styles.getPropertyValue('--card') || '#ffffff').trim();
            if (c.startsWith('rgb')) {
              const parts = c.replace(/rgba?\(/, '').replace(')', '').split(',').map(s => s.trim());
              const r = parts[0], g = parts[1], b = parts[2];
              return `rgba(${r}, ${g}, ${b}, 0.95)`;
            }
            const m = c.replace('#','');
            const hex = m.length === 3 ? m.split('').map(ch => ch + ch).join('') : m;
            const bigint = parseInt(hex, 16);
            const r = (bigint >> 16) & 255;
            const g = (bigint >> 8) & 255;
            const b = bigint & 255;
            return `rgba(${r}, ${g}, ${b}, 0.95)`;
          })(),
          titleColor: text,
          bodyColor: text,
          borderColor: border,
          borderWidth: 1,
          titleFont: { weight: '600' },
          padding: 8
        }
      },
      interaction: {
        intersect: false,
        mode: 'nearest'
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'ϕ',
            color: muted
          },
          ticks: { color: muted },
          grid: { color: border, drawBorder: false }
        },
        y: {
          title: {
            display: true,
            text: 'Loss',
            color: muted
          },
          ticks: { color: muted },
          grid: { color: border, drawBorder: false }
        }
      },
      elements: {
        line: {
          borderWidth: 2.5,
          tension: 0.25,
          borderCapStyle: 'round',
          borderJoinStyle: 'round'  // Smoother lines
        },
        point: {
          radius: 0  // Remove all points by default
        }
      }
    }
  }

  return ChartConfig;
}



function createChart(id,chartConfig) {
  const element = document.getElementById(id);
  if (element) {
    const ctx = element.getContext('2d');
    charts[id] = new Chart(ctx, cloneConfigPreserveFns(chartConfig));
    console.log(`Chart ${id} created`);
  } else {
    console.log(`Element with id ${id} not found`);
  }
}
 
function updateLossPlots(OnlyPoint, chart, phi0, phi, lossFunctions, animate) {
  if (!chart) return;
  // Themed colors for axes/grid and reference lines
  const styles = getComputedStyle(document.documentElement);
  const muted = (styles.getPropertyValue('--muted') || '#6b7280').trim();
  const border = (styles.getPropertyValue('--border') || '#e5e7eb').trim();
  const card = (styles.getPropertyValue('--card') || '#ffffff').trim();

  if (OnlyPoint) {
    // Update only the current phi point for each loss function
    lossFunctions.forEach((lossObj, index) => {
      const { lossFunction, extraArgs = [], label, color } = lossObj;
      if (label !== 'Reference Line') {
        // Calculate the current loss for the new phi
        const currentLoss = lossFunction(...extraArgs, phi);

        // Find the corresponding scatter dataset (current phi point)
        const scatterDatasetIndex = chart.data.datasets.findIndex(dataset => 
          dataset.type === 'scatter' && dataset.id === `current_phi_${index}`
        );

        if (scatterDatasetIndex !== -1) {
          // Update the existing scatter dataset
          chart.data.datasets[scatterDatasetIndex].data = [{x: phi, y: currentLoss}];
        } else {
          // If the scatter dataset doesn't exist, create a new one
          chart.data.datasets.push({
            type: 'scatter',
            id: `current_phi_${index}`,
            data: [{x: phi, y: currentLoss}],
            backgroundColor: card,
            borderColor: color || `color${index + 1}`,
            borderWidth: 2.5,
            pointRadius: 5,
            pointHoverRadius: 6,
          });
        }
      }
    });
  } else {
    const xValues = Array.from({length: 236}, (_, i) => i * 0.01);
    // Clear existing datasets
    chart.data.datasets = [];

    // Add a dataset for each loss function
    lossFunctions.forEach((lossObj, index) => {
      const { lossFunction, extraArgs = [], label, color, lineStyle } = lossObj;
      const yValues = xValues.map(x => lossFunction(...extraArgs, x));
    
      let datasetConfig = {
        data: xValues.map((x, i) => ({x: x, y: yValues[i]})),
        borderColor: color || `color${index + 1}`,
        fill: false,
        borderWidth: 2.5,
        tension: 0.25,
        borderCapStyle: 'round',
        borderJoinStyle: 'round',
        pointRadius: 0,
        pointHoverRadius: 0
      };
    
      // Add line style
      if (lineStyle === 'dash') {
        datasetConfig.borderDash = [5, 5];  // Creates a dashed line
      } else if (lineStyle === 'dot') {
        datasetConfig.borderDash = [2, 2];  // Creates a dotted line
      }
      // You can add more line styles as needed
    
      chart.data.datasets.push(datasetConfig);
    
      if (label !== 'Reference Line') {
        // Add current phi point for each loss function
        const currentLoss = lossFunction(...extraArgs, phi);
        chart.data.datasets.push({
          type: 'scatter',
          id: `current_phi_${index}`,
          data: [{x: phi, y: currentLoss}],
          backgroundColor: card,
          borderColor: color || `color${index + 1}`,
          borderWidth: 2.5,
          pointRadius: 5,
          pointHoverRadius: 6
        });
      }
    });

    chart.data.labels = xValues.map(x => x.toFixed(2));

    // Update the phi0 line
    const yMin = Math.min(0, ...chart.data.datasets.flatMap(dataset => dataset.data.map(point => point.y)));
    const yMax = Math.max(0.5, ...chart.data.datasets.flatMap(dataset => dataset.data.map(point => point.y)));

    chart.data.datasets.push({
      type: 'line',
      data: [
        { x: phi0, y: yMin },
        { x: phi0, y: yMax }
      ],
      borderColor: muted,
      borderWidth: 2,
      borderDash: [6, 3],
      pointRadius: 0,
      animation: false
    });

    chart.options.annotation = {
      annotations: [{
        type: 'line',
        mode: 'vertical',
        scaleID: 'x',
        value: phi0,
        borderColor: muted,
        borderWidth: 2,
        label: {
          enabled: false,
        }
      }]
    };
    
    chart.options.scales.x = {
      type: 'linear',
      position: 'bottom',
      title: {
        display: true,
        text: 'φ',
        color: muted
      },
      min: 0,
      max: 2.35,
      ticks: {
        color: muted,
        callback: function(value) {
          return value.toFixed(2);
        },
        maxTicksLimit: 10
      },
      grid: { color: border, drawBorder: false }
    };
    
    chart.options.scales.y = {
      title: {
        display: true,
        text: 'Loss',
        color: muted
      },
      min: 0,
      max: Math.max(0.5, ...chart.data.datasets.flatMap(dataset => dataset.data.map(point => point.y))),
      ticks: { color: muted },
      grid: { color: border, drawBorder: false }
    };
  }

  chart.update(animate);
}

 

function updateLossPlot(OnlyPoint, chart, phi0, phi, lossFunction, animate, ...args) {
  if (!chart) return;
  // Themed colors for axes/grid and reference lines
  const styles = getComputedStyle(document.documentElement);
  const muted = (styles.getPropertyValue('--muted') || '#6b7280').trim();
  const border = (styles.getPropertyValue('--border') || '#e5e7eb').trim();
  
  if (OnlyPoint == true) {
    // Update the current phi point
    const currentLoss = lossFunction(...args, phi);
    chart.data.datasets[1].data = [{
      x: phi,
      y: currentLoss
    }];
  } else {
    // Update the current phi point
    const currentLoss = lossFunction(...args, phi);
    chart.data.datasets[1].data = [{
      x: phi,
      y: currentLoss
    }];

    const xValues = Array.from({length: 236}, (_, i) => i * 0.01);
    const yValues = xValues.map(x => lossFunction(...args, x));
    
    chart.data.labels = xValues.map(x => x.toFixed(2));
    chart.data.datasets[0].data = xValues.map((x, i) => ({x: x, y: yValues[i]}));
    
    // Update the phi0 point 
    const yMin = Math.min(0, ...chart.data.datasets[0].data.map(point => point.y));
    const yMax = Math.max(0.5, ...chart.data.datasets[0].data.map(point => point.y));
    
    chart.data.datasets[2] = {
      type: 'line',
      data: [
        { x: phi0, y: yMin },
        { x: phi0, y: yMax }
      ],
      borderColor: muted,
      borderWidth: 2,
      borderDash: [6, 3],
      pointRadius: 0,
      animation: false
    };
    
    chart.options.annotation = {
      annotations: [{
        type: 'line',
        mode: 'vertical',
        scaleID: 'x',
        value: phi0,
        borderColor: muted,
        borderWidth: 2,
        label: {
          enabled: false
        }
      }]
    };
    
    chart.options.scales.x = {
      type: 'linear',
      position: 'bottom',
      title: {
        display: true,
        text: 'φ',
        color: muted
      },
      min: 0,
      max: 2.35,
      ticks: {
        color: muted,
        callback: function(value) {
          return value.toFixed(2);
        },
        maxTicksLimit: 10
      },
      grid: { color: border, drawBorder: false }
    };
    
    chart.options.scales.y = {
      title: {
        display: true,
        text: 'Loss',
        color: muted
      },
      min: 0,
      max: Math.max(0.5, ...chart.data.datasets.flatMap(dataset => dataset.data.map(point => point.y))),
      ticks: { color: muted },
      grid: { color: border, drawBorder: false }
    };
  }
  
  chart.update(animate);
}

function updateChartScatter(chart, xData, yData, title, xLabel, yLabel, animate = false) {
  if (!chart) return; 
  const styles = getComputedStyle(document.documentElement);
  const text = (styles.getPropertyValue('--text') || '#0f172a').trim();
  const muted = (styles.getPropertyValue('--muted') || '#6b7280').trim();
  const border = (styles.getPropertyValue('--border') || '#e5e7eb').trim();
  const card = (styles.getPropertyValue('--card') || '#ffffff').trim();

  const newData = xData.map((x, i) => ({ x: x, y: yData[i] }));

  chart.data.datasets[0].data = newData;
  
  // The selected point will be updated in highlightPointOnBothCharts
  chart.data.datasets[1].data = [];

  // Calculate covariance
  const meanX = xData.reduce((sum, x) => sum + x, 0) / xData.length;
  const meanY = yData.reduce((sum, y) => sum + y, 0) / yData.length;
  const meanProduct = xData.reduce((sum, x, i) => sum + (x - meanX) * (yData[i] - meanY), 0) / (xData.length - 1);

  // Append covariance to the title
  const updatedTitle = `${title} E[${xLabel} ${yLabel}] = ${meanProduct.toFixed(2)}`;

  chart.options.plugins.title.text = updatedTitle;
  chart.options.plugins.title.color = text;
  chart.options.scales.x.title.text = xLabel;
  chart.options.scales.x.title.color = muted;
  chart.options.scales.y.title.text = yLabel;
  chart.options.scales.y.title.color = muted;
  chart.options.scales.x.ticks = { ...(chart.options.scales.x.ticks||{}), color: muted };
  chart.options.scales.y.ticks = { ...(chart.options.scales.y.ticks||{}), color: muted };
  chart.options.scales.x.grid = { ...(chart.options.scales.x.grid||{}), color: border, drawBorder: false };
  chart.options.scales.y.grid = { ...(chart.options.scales.y.grid||{}), color: border, drawBorder: false };

  chart.options.animation = animate ? 
    { duration: 400, easing: 'easeOutCubic' } : 
    { duration: 0 };

  // Maintain the selected point
  if (selectedPointIndex !== null) {
    highlightPointOnAllCharts(selectedPointIndex);
  }

  chart.update();
}

function updateChartWithPhi(  ) { 

  if (charts.scatterPlot2) { 
    updateChartScatter(charts.scatterPlot2, u1, u2, "Reduced Form Shocks", "u₁", "u₂", true);
  }
 
  if (charts.scatterPlot3) {
    updateChartScatter(charts.scatterPlot3, e1, e2, "Innovations", "e₁", "e₂", true);
  }
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
    if (charts.scatterPlotZ1Eps1) highlightPoint(charts.scatterPlotZ1Eps1, index); 
    if (charts.scatterPlotZ1Eps2) highlightPoint(charts.scatterPlotZ1Eps2, index);
    if (charts.scatterPlotZ1E1) highlightPoint(charts.scatterPlotZ1E1, index); 
    if (charts.scatterPlotZ1E2) highlightPoint(charts.scatterPlotZ1E2, index);
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



  function animateBallRolling(chart, lossFunction, lossType, initialPhi, callbacks = [], ...args) {
    const stepSize = 0.01;
    const maxSteps = 300;
    let step = 0;
    let isAnimating = true;
    let stuckAtBorder = false;
    const delayBetweenSteps = 0; // milliseconds
    let timeoutId;
    let currentPhi = initialPhi;

    function calculateLoss(phi) {
        return lossType === 'min' ? lossFunction(...args, phi) : -lossFunction(...args, phi);
    }

    function updateUI(currentPhi) {
      phi = currentPhi;
        callbacks.forEach(callback => {
            try {
                callback(currentPhi);
            } catch (error) {
                console.error("Error in callback:", error);
            }
        });
    }

    function cleanup() {
        isAnimating = false;
        clearTimeout(timeoutId);
        removeEventListeners();
    }

    function stopAnimation() {
        cleanup();
        console.log("Animation stopped");
    }

    function addEventListeners() {
        removeEventListeners(); // Remove existing listeners before adding new ones
        const inputs = document.querySelectorAll('input, button');
        inputs.forEach(input => {
            input.addEventListener('click', stopAnimation);
            input.addEventListener('touchstart', stopAnimation);
        });
    }

    function removeEventListeners() {
        const inputs = document.querySelectorAll('input, button');
        inputs.forEach(input => {
            input.removeEventListener('click', stopAnimation);
            input.removeEventListener('touchstart', stopAnimation);
        });
    }

    addEventListeners();

    function animate() {
        if (!isAnimating || step >= maxSteps || stuckAtBorder) {
            console.log(isAnimating ? (stuckAtBorder ? "Stuck at border" : "Maximum steps reached") : "Animation stopped");
            cleanup();
            return;
        }

        try {
            const currentLoss = calculateLoss(currentPhi);
            const leftLoss = calculateLoss(currentPhi - stepSize);
            const rightLoss = calculateLoss(currentPhi + stepSize);

            let newPhi = currentPhi;
            if (leftLoss < currentLoss && leftLoss < rightLoss) {
                newPhi = Math.max(0, currentPhi - stepSize);
            } else if (rightLoss < currentLoss && rightLoss < leftLoss) {
                newPhi = Math.min(2.35, currentPhi + stepSize);
            } else {
                console.log("Optima reached");
                stuckAtBorder = true;
            }
             

            // Check if the ball is stuck at the border
            if (newPhi === 0 || newPhi === 2.35) {
                stuckAtBorder = true;
            }

            currentPhi = newPhi;

            // Update the chart and UI every 5 step 
            if (step % 3 === 0) {
                updateUI(currentPhi);
            } 

            step++;

            // Schedule the next step
            timeoutId = setTimeout(animate, delayBetweenSteps);
        } catch (error) {
            console.error("Error during animation step:", error);
            cleanup();
        }
    }

    // Start the animation
    updateUI(currentPhi); // Update UI with initial state
    timeoutId = setTimeout(animate, delayBetweenSteps);

    // Return the stopAnimation function
    return stopAnimation;
}
