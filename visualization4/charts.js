function getScatterPlotConfig() {
  ChartConfig = {
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

  return ChartConfig
}


function getLossPlotConfig() {
  ChartConfig = {
    type: 'line',
    data: {
      datasets: [{
        data: [],
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1,  // Thinner line
        tension: 0.1,
        pointRadius: 0,  // Remove dots
        pointHoverRadius: 0  // Remove hover effect
      }, {
        data: [],
        borderColor: '#ffa500',
        backgroundColor: '#ffa500',
        pointRadius: 6,
        pointHoverRadius: 8,
        showLine: false
      }, {
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
        legend: {
          display: false // Hide the legend
        },
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
      },
      elements: {
        line: {
          borderWidth: 2  // Set all lines to be thin by default
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
    charts[id] = new Chart(ctx, JSON.parse(JSON.stringify(chartConfig)));
    console.log(`Chart ${id} created`);
  } else {
    console.log(`Element with id ${id} not found`);
  }
}
 
function updateLossPlots(OnlyPoint, chart, phi0, phi, lossFunctions, animate) {
  if (!chart) return;

  if (OnlyPoint) {
    // Update only the current phi point for each loss function
    lossFunctions.forEach((lossObj, index) => {
      const { lossFunction, extraArgs = [], label, color } = lossObj;
      if (label !== 'Critical Value') {
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
            backgroundColor: color || `color${index + 1}`,
            borderColor: '#ffa500',
            pointRadius: 6,
            pointHoverRadius: 8,
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
        borderWidth: 2,  // Ensure thin lines
        pointRadius: 0,  // Remove points
        pointHoverRadius: 0  // Remove hover effect
      };
    
      // Add line style
      if (lineStyle === 'dash') {
        datasetConfig.borderDash = [5, 5];  // Creates a dashed line
      } else if (lineStyle === 'dot') {
        datasetConfig.borderDash = [2, 2];  // Creates a dotted line
      }
      // You can add more line styles as needed
    
      chart.data.datasets.push(datasetConfig);
    
      if (label !== 'Critical Value') {
        // Add current phi point for each loss function
        const currentLoss = lossFunction(...extraArgs, phi);
        chart.data.datasets.push({
          type: 'scatter',
          id: `current_phi_${index}`,
          data: [{x: phi, y: currentLoss}],
          backgroundColor: '#ffa500',
          borderColor: '#ffa500',
          pointRadius: 4,
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
      borderColor: '#ffa500',
      borderWidth: 2,
      pointRadius: 0,
      animation: false
    });

    chart.options.annotation = {
      annotations: [{
        type: 'line',
        mode: 'vertical',
        scaleID: 'x',
        value: phi0,
        borderColor: '#ffa500',
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
        text: 'φ'
      },
      min: 0,
      max: 2.35,
      ticks: {
        callback: function(value) {
          return value.toFixed(2);
        },
        maxTicksLimit: 10
      }
    };
    
    chart.options.scales.y = {
      title: {
        display: true,
        text: 'Loss'
      },
      min: 0,
      max: Math.max(0.5, ...chart.data.datasets.flatMap(dataset => dataset.data.map(point => point.y)))
    };
  }

  chart.update(animate);
}

 

function updateLossPlot(OnlyPoint, chart, phi0, phi, lossFunction, animate, ...args) {
  if (!chart) return;
  
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
      borderColor: '#ffa500',
      borderWidth: 2,
      pointRadius: 0,
      animation: false
    };
    
    chart.options.annotation = {
      annotations: [{
        type: 'line',
        mode: 'vertical',
        scaleID: 'x',
        value: phi0,
        borderColor: '#ffa500',
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
        text: 'φ'
      },
      min: 0,
      max: 2.35,
      ticks: {
        callback: function(value) {
          return value.toFixed(2);
        },
        maxTicksLimit: 10
      }
    };
    
    chart.options.scales.y = {
      title: {
        display: true,
        text: 'Loss'
      },
      min: 0,
      max: Math.max(0.5, ...chart.data.datasets.flatMap(dataset => dataset.data.map(point => point.y)))
    };
  }
  
  chart.update(animate);
}

function updateChartScatter(chart, xData, yData, title, xLabel, yLabel, animate = false) {
  if (!chart) return; 

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
  chart.options.scales.x.title.text = xLabel;
  chart.options.scales.y.title.text = yLabel;

  chart.options.animation = animate ? 
    { duration: 300, easing: 'easeInOutQuad' } : 
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

