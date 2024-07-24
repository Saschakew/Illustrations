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
  }

  return ChartConfig
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
 
function updateLossPlot(chart,phi0,phi,lossFunction) { 

  if (!chart) return; 
 
    const xValues = Array.from({length: 159}, (_, i) => i * 0.01);
    const yValues = xValues.map(x => lossFunction(u1, u2, x));

    chart.data.labels = xValues.map(x => x.toFixed(2));
    chart.data.datasets[0].data = xValues.map((x, i) => ({x: x, y: yValues[i]}));

    // Update the current phi point
    const currentLoss = lossFunction(e1, e2, phi);
    chart.data.datasets[1].data = [{
      x: phi,
      y: currentLoss
    }];

    // Update the phi0 point
    const phi0Loss = lossFunction(u1, u2, phi0);
    const yMin = Math.min(0,...chart.data.datasets[0].data.map(point => point.y));
    const yMax = Math.max(0.5,...chart.data.datasets[0].data.map(point => point.y));

 
    chart.data.datasets[2] = {
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

    chart.options.annotation = {
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

    chart.options.scales.x = {
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
    
    chart.options.scales.y = {
      title: {
        display: true,
        text: 'Loss'
      },
      min: 0,
      max: Math.max(0.5, ...yValues, currentLoss, phi0Loss)
    };

    chart.update();

 
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
  const covariance = xData.reduce((sum, x, i) => sum + (x - meanX) * (yData[i] - meanY), 0) / (xData.length - 1);

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



  function animateBallRolling(chart, lossFunction,lossType,currentPhi,callbacks = []) {  
    const stepSize = 0.01;
    const maxSteps = 100;
    let step = 0;
    let animationId;
    let isAnimating = true;
    let stuckAtBorder = false;
  
    function calculateLoss(phi) {
      return lossType === 'min' ? lossFunction(u1, u2, phi) : -lossFunction(u1, u2, phi);
    }
  
    function updateChart(phi, loss) { 
      chart.data.datasets[1].data = [{ x: phi, y: Math.abs(loss) }];
      chart.update('none');
    }
  
    function updateUI(phi) {
      callbacks.forEach(callback => callback(phi));


    }
  
    function stopAnimation() {
      isAnimating = false;
      cancelAnimationFrame(animationId);
      removeEventListeners();
      console.log("Animation stopped by user input");
    }
  
    function addEventListeners() {
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
        input.addEventListener('touchstart', stopAnimation);
      });
    }
  
    addEventListeners();
  
    function animate() {
      if (!isAnimating || step >= maxSteps || stuckAtBorder) {
        console.log(isAnimating ? (stuckAtBorder ? "Stuck at border" : "Maximum steps reached") : "Animation stopped");
        removeEventListeners();
        return ;
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
        stuckAtBorder = true; // Mark as stuck at border to ensure final update
      }
  
      // Check if the ball is stuck at the border
      if (newPhi === 0 || newPhi === 1.57) {
        stuckAtBorder = true;
      }
  
      currentPhi = newPhi;
      const newLoss = calculateLoss(currentPhi);
  
      // Update the chart and UI every 5th step or on the last step
      if (step % 2 === 0 || step === maxSteps - 1 || stuckAtBorder) {
        updateChart(currentPhi, newLoss);
        updateUI(currentPhi); 
        phi = currentPhi;
      }
  
      step++;
      animationId = requestAnimationFrame(animate);

    }
  
    animate(); 
  }

