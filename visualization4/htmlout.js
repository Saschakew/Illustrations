function insertEqSVAR(B0){
    const matrixHtml0 = ` 
    $$
        \\begin{bmatrix} u_{1,t}   \\\\ u_{2,t}  \\end{bmatrix} 
         =  
      \\begin{bmatrix} 
  ${B0[0][0].toFixed(2)} & ${B0[0][1].toFixed(2)} \\\\ 
  ${B0[1][0].toFixed(2)} & ${B0[1][1].toFixed(2)} 
  \\end{bmatrix} 
    \\begin{bmatrix} \\epsilon_{1,t}   \\\\ \\epsilon_{2,t}  \\end{bmatrix}
         $$ `;

   
  const b0Element = document.getElementById('current-B0'); 
  if (b0Element){
   b0Element.innerHTML = matrixHtml0; 
  }

   // Trigger MathJax to render the new content
   if (typeof MathJax !== 'undefined') {
    MathJax.typeset();
  }
}

function insertEqSVARe(B){
    A = math.inv(B);
    const matrixHtml = ` 
    $$
        \\begin{bmatrix} e_{1,t}   \\\\ e_{2,t}  \\end{bmatrix} 
         =  
      \\begin{bmatrix} 
  ${A[0][0].toFixed(2)} & ${A[0][1].toFixed(2)} \\\\ 
  ${A[1][0].toFixed(2)} & ${A[1][1].toFixed(2)} 
  \\end{bmatrix} 
    \\begin{bmatrix} u_{1,t}   \\\\ u_{2,t}  \\end{bmatrix}
         $$ `;

   
  const bElement = document.getElementById('current-B'); 
  if (bElement) {
    bElement.innerHTML = matrixHtml; 
  }
   // Trigger MathJax to render the new content
   if (typeof MathJax !== 'undefined') {
    MathJax.typeset();
  }
}

function insertEqZ(gamma1, gamma2, gamma3){
  const matrixHtml = ` 
  $$
      z_{t}
       =   
    ${gamma1.toFixed(2)} \\epsilon_{1,t} + ${gamma2.toFixed(2)} \\epsilon_{2,t} + ${gamma3.toFixed(2)} \\eta_t
  $$ `;

 
const bElement = document.getElementById('current-z'); 
if (bElement) {
  bElement.innerHTML = matrixHtml; 
}
 // Trigger MathJax to render the new content
 if (typeof MathJax !== 'undefined') {
  MathJax.typeset();
}
}

function insertEqNG(){ 

  const mean = (arr) => arr.reduce((sum, val) => sum + val, 0) / T;
  const skewness1 = mean(epsilon1.map(d => d * d *d));
  const skewness2= mean(epsilon2.map(d => d * d * d));
  const excessKurtosis1= mean(epsilon1.map(d => d * d * d * d)) - 3;
  const excessKurtosis2= mean(epsilon2.map(d => d * d * d * d)) - 3;

  const matrixHtml = `
      <p>Skewness: $E[\\epsilon_{1t}^3]$ = ${skewness1.toFixed(2)}  and $E[\\epsilon_{2t}^3]$ = ${skewness2.toFixed(2)} </p>
      <p>Excess Kurtosis: $E[\\epsilon_{1t}^4-3]$  = ${excessKurtosis1.toFixed(2)} and  $E[\\epsilon_{21t}^4-3]$  = ${excessKurtosis2.toFixed(2)}  </p>
    `;

 
const bElement = document.getElementById('current-nG'); 
if (bElement) {
  bElement.innerHTML = matrixHtml; 
}
 // Trigger MathJax to render the new content
 if (typeof MathJax !== 'undefined') {
  MathJax.typeset();
}
}




function createTable(id,HTMLInsert) {
  const element = document.getElementById(id, );
    if (element) {
      element.innerHTML = HTMLInsert;
    }
}

function createTableDependency(thisStats) {
  HTMLInsert =   createHTMLTableDependency( thisStats, "Co-moments of innovations e ", "e");
  createTable('stats-e',HTMLInsert)
}

function createTableCovariance(thisStats) {
  HTMLInsert =   createHTMLTableCovariance( thisStats, "Loss based on uncorrelated shocks", "e");
  createTable('stats-e',HTMLInsert)
}
function createTableZCovariance(thisStats) {
  HTMLInsert =   createHTMLTableZCovariance( thisStats, "Loss based on   proxy", "z", "e");
  createTable('stats-ze',HTMLInsert)
}

function createTableZ2Covariance(u1, u2, z1, z2, phi ) {

  loss1 = lossZ1(u1, u2, z1, z2,W, phi);
  loss2 = lossZ2(u1, u2, z1, z2,W, phi);
  loss3 = lossZ12(u1, u2, z1, z2, W,phi); 
  HTMLInsert =   `
  <h3>Loss based on   proxy</h3>
  <table class="stats-table"> 
    <tr>
      <td class="measure">Loss z₁:</td>
      <td class="formula">mean(z₁  * e₂)^2 =  ${loss1.toFixed(3)}</td>
    </tr>  
    <tr>
      <td class="measure">Loss z₂:</td>
      <td class="formula">mean(z₂  * e₂)^2 =  ${loss2.toFixed(3)}</td>
    </tr>   
    <tr>
      <td class="measure">Loss sum:</td>
      <td class="formula">... =  ${loss3.toFixed(3)}</td>
    </tr>  
    <tr>
      <td class="measure">Critical value:</td>
      <td class="formula"> chisquare(1) =  ${(2.706 / T).toFixed(3)}</td>
    </tr>  
  </table>
  `; 
  createTable('stats-ze2',HTMLInsert)
}

 


function createHTMLTableDependency(data, title, symbol) {
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
      <td  class="value">${data.covariance.toFixed(2)}</td>
    </tr> 
    <tr>
      <td class="measure">Coskewness </td>
      <td class="formula">mean(${symbol}₁³ * ${symbol}₂)</td>
      <td  class="value">${data.coskewness1.toFixed(2)}</td>
    </tr>
    <tr>
      <td class="measure">Coskewness </td>
      <td class="formula">mean(${symbol}₁ * ${symbol}₂³)</td>
      <td  class="value">${data.coskewness2.toFixed(2)}</td>
    </tr>
    <tr>
      <td class="measure">Cokurtosis </td>
      <td class="formula">mean(${symbol}₁³ * ${symbol}₂)</td>
      <td  class="value">${data.cokurtosis1.toFixed(2)}</td>
    </tr>
    <tr>
      <td class="measure">Cokurtosis </td>
      <td class="formula">mean(${symbol}₁ * ${symbol}₂³)</td>
      <td  class="value">${data.cokurtosis2.toFixed(2)}</td>
    </tr>
    <tr>
      <td class="measure">Cokurtosis </td>
      <td class="formula">mean(${symbol}₁² * ${symbol}₂² - 1 ) </td>
      <td  class="value">${data.cokurtosis3.toFixed(2)}</td>
    </tr>
    <tr>
      <td class="measure">Loss</td>
      <td class="formula"> </td>
      <td  class="value">${data.loss.toFixed(2)}</td>
    </tr>
  </table>
  `; 
}

function createHTMLTableCovariance(data, title, symbol) {
  return `
  <h3>${title}</h3>
  <table class="stats-table"> 
    <tr>
      <td class="measure">Loss:</td>
      <td class="formula">mean(${symbol}₁ * ${symbol}₂)^2 =  ${Math.pow(data.covariance, 2).toFixed(2)}</td>
    </tr>  
  </table>
  `; 
}
function createHTMLTableZCovariance(data, title, symbol1, symbol2) {
  return `
  <h3>${title}</h3>
  <table class="stats-table"> 
    <tr>
      <td class="measure">Loss:</td>
      <td class="formula">mean(${symbol1}  * ${symbol2}₂)^2 =  ${Math.pow(data.covariance, 2).toFixed(2)}</td>
    </tr>  
  </table>
  `; 
}
 
