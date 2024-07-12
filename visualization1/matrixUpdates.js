// Handle matrix updates

export function updateB0Matrix(phi) {
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

export function updateBMatrix(phi) {
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