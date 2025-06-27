# Plotly Chart Style Guide

This document establishes visual design standards for all Plotly charts in the project to ensure consistency across visualizations.

## 1. Core Principles

- **Clarity**: Charts should communicate information clearly and effectively
- **Consistency**: All charts should share common visual language
- **Responsiveness**: Charts should adapt to different screen sizes
- **Accessibility**: Consider color contrast and readability

## 2. Color Palette

### Primary Colors
- `#00ADB5` (Teal) - Primary data series
- `#ff7f0e` (Orange) - Secondary/accent data series
- `rgb(252, 81, 133)` (Pink) - Special cases (e.g., innovations)

### Backgrounds
- `#f8f9fa` (Light gray) - Chart paper background
- `#ffffff` (White) - Plot area background

### Text & Lines
- `#222831` (Dark gray) - Titles, axis labels, text
- `#DDDDDD` - Zero lines
- `#EEEEEE` - Grid lines

## 3. Typography

- **Title**: 18px, `#222831`
- **Axis Labels**: 14px, `#222831`
- **Tick Labels**: 12px, `#222831`

## 4. Layout Standards

### Dimensions
- Use `getSquareSize()` helper function for scatter plots
- Maintain consistent margins:
  ```javascript
  margin: { 
    l: 50, // left
    r: 20, // right
    b: 50, // bottom
    t: 50, // top
    pad: 4 // padding
  }
  ```

### Axes
- Always show zero lines (`zeroline: true`)
- Maintain consistent grid lines
- For scatter plots with comparable axes:
  ```javascript
  scaleanchor: "x",
  scaleratio: 1
  ```

## 5. Trace Styles

### Scatter Plots
```javascript
marker: {
  size: 6,
  color: '#00ADB5', // or appropriate series color
  opacity: 0.7,
  line: {
    width: 1,
    color: '#222831' // dark border for contrast
  }
},
hovertemplate: 'X: %{x:.3f}<br>Y: %{y:.3f}<extra></extra>'
```

### Line Plots
```javascript
line: {
  color: '#ff7f0e', // or appropriate series color
  width: 2
},
hovertemplate: 'X: %{x:.3f}<br>Y: %{y:.3f}<extra></extra>'
```

## 6. Responsive Behavior

- Always include `{responsive: true}` in Plotly config
- Use `window.addEventListener('resize', updatePlot)` where appropriate
- Test at different screen sizes

## 7. Helper Functions

Include this standard function for dynamic sizing:

```javascript
function getSquareSize(plotDivElement) {
  if (!plotDivElement) return 300; // default fallback
  const width = plotDivElement.offsetWidth;
  return width > 0 ? width : 300;
}
```

## 8. Example Configurations

### Complete Scatter Plot Example
```javascript
const trace = {
  x: dataX,
  y: dataY,
  mode: 'markers',
  type: 'scatter',
  marker: {
    size: 6,
    color: '#00ADB5',
    opacity: 0.7,
    line: { width: 1, color: '#222831' }
  },
  hoverinfo: 'x+y',
  hovertemplate: 'X: %{x:.3f}<br>Y: %{y:.3f}<extra></extra>'
};

const layout = {
  title: { 
    text: 'Chart Title', 
    font: { size: 18, color: '#222831' } 
  },
  xaxis: {
    title: { text: 'X Axis', font: { size: 14, color: '#222831' } },
    zeroline: true,
    zerolinecolor: '#DDDDDD',
    gridcolor: '#EEEEEE'
  },
  yaxis: {
    title: { text: 'Y Axis', font: { size: 14, color: '#222831' } },
    zeroline: true,
    zerolinecolor: '#DDDDDD',
    gridcolor: '#EEEEEE',
    scaleanchor: "x",
    scaleratio: 1
  },
  width: getSquareSize(plotDivElement),
  height: getSquareSize(plotDivElement),
  margin: { l: 50, r: 20, b: 50, t: 50, pad: 4 },
  paper_bgcolor: '#f8f9fa',
  plot_bgcolor: '#ffffff'
};

Plotly.react(plotDivElement, [trace], layout, {responsive: true});
```

## 9. Maintenance

- Update this guide when introducing new chart types
- Review all charts periodically for consistency
- Document any exceptions with rationale
