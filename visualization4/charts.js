function getScatterConfig() {
  ScatterConfig = {
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

  return ScatterConfig
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
 

function updateChartScatter(chart, xData, yData, title, xLabel, yLabel, animate = false) {
   

  if (!chart) return; 
  
  
  const newData = xData.map((x, i) => ({x: x, y: yData[i]}    ));
  

  chart.data.datasets[0].data = newData;
  
  // The selected point will be updated in highlightPointOnBothCharts
  chart.data.datasets[1].data = [];

  chart.options.plugins.title.text = title;
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


