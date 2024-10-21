const insertEqSVAR = (() => {
  const b0Element = document.getElementById('current-B0');
  let previousMatrixHtml = '';

  const matrixTemplate = (b00, b01, b10, b11) => `
    \\begin{bmatrix} u_{1,t}   \\\\ u_{2,t}  \\end{bmatrix} 
     =  
  \\begin{bmatrix} 
${b00} & ${b01} \\\\ 
${b10} & ${b11} 
\\end{bmatrix} 
\\begin{bmatrix} \\epsilon_{1,t}   \\\\ \\epsilon_{2,t}  \\end{bmatrix}
      `;

  const renderMathJax = (matrixHtml) => {
    if (typeof MathJax === 'undefined') {
      b0Element.textContent = matrixHtml;
      return;
    }

    if (MathJax.tex2svg) {
      const output = MathJax.tex2svg(matrixHtml, {display: true});
      b0Element.innerHTML = '';
      b0Element.appendChild(output);
    } else if (MathJax.typesetPromise) {
      b0Element.innerHTML = `$$${matrixHtml}$$`;
      MathJax.typesetPromise([b0Element]).catch(console.error);
    } else {
      b0Element.textContent = matrixHtml;
    }
  };

  return (B0) => {
    if (!b0Element) return;
    
    const matrixHtml = matrixTemplate(
      B0[0][0].toFixed(2),
      B0[0][1].toFixed(2),
      B0[1][0].toFixed(2),
      B0[1][1].toFixed(2)
    );

    if (matrixHtml === previousMatrixHtml) return;
    previousMatrixHtml = matrixHtml;

    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(() => renderMathJax(matrixHtml));
    } else {
      renderMathJax(matrixHtml);
    }
  };
})();

const insertEqSVARe = (() => {
  const bElement = document.getElementById('current-B');
  let previousMatrixHtml = '';

  const matrixTemplate = (a00, a01, a10, a11) => `
    \\begin{bmatrix} e_{1,t}   \\\\ e_{2,t}  \\end{bmatrix} 
     =  
  \\begin{bmatrix} 
${a00} & ${a01} \\\\ 
${a10} & ${a11} 
\\end{bmatrix} 
\\begin{bmatrix} u_{1,t}   \\\\ u_{2,t}  \\end{bmatrix}
      `;

  const renderMathJax = (matrixHtml) => {
    if (typeof MathJax === 'undefined') {
      bElement.textContent = matrixHtml;
      return;
    }

    if (MathJax.tex2svg) {
      const output = MathJax.tex2svg(matrixHtml, {display: true});
      bElement.innerHTML = '';
      bElement.appendChild(output);
    } else if (MathJax.typesetPromise) {
      bElement.innerHTML = `$$${matrixHtml}$$`;
      MathJax.typesetPromise([bElement]).catch(console.error);
    } else {
      bElement.textContent = matrixHtml;
    }
  };

  return (B) => {
    if (!bElement) return;
    
    const A = math.inv(B);
    const matrixHtml = matrixTemplate(
      A[0][0].toFixed(2),
      A[0][1].toFixed(2),
      A[1][0].toFixed(2),
      A[1][1].toFixed(2)
    );

    if (matrixHtml === previousMatrixHtml) return;
    previousMatrixHtml = matrixHtml;

    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(() => renderMathJax(matrixHtml));
    } else {
      renderMathJax(matrixHtml);
    }
  };
})();

const insertEqZ2 = (() => {
  const elements = {};
  const previousMatrixHtml = {};

  const createMatrixHtml = (rho1, rho2, zname, etaname) => `
    ${zname} = ${rho1.toFixed(2)} \\epsilon_{1,t} + ${rho2.toFixed(2)} \\epsilon_{2,t} + ${etaname}
  `;

  const renderMathJax = (element, matrixHtml) => {
    if (typeof MathJax === 'undefined') {
      element.textContent = matrixHtml;
      return;
    }

    if (MathJax.tex2svg) {
      const output = MathJax.tex2svg(matrixHtml, {display: true});
      element.innerHTML = '';
      element.appendChild(output);
    } else if (MathJax.typesetPromise) {
      element.innerHTML = `$$${matrixHtml}$$`;
      MathJax.typesetPromise([element]).catch(console.error);
    } else {
      element.textContent = matrixHtml;
    }
  };

  return (rho1, rho2, id, zname, etaname) => {
    if (!elements[id]) {
      elements[id] = document.getElementById(id);
      if (!elements[id]) return;
    }

    const matrixHtml = createMatrixHtml(rho1, rho2, zname, etaname);

    if (matrixHtml === previousMatrixHtml[id]) return;
    previousMatrixHtml[id] = matrixHtml;

    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(() => renderMathJax(elements[id], matrixHtml));
    } else {
      renderMathJax(elements[id], matrixHtml);
    }
  };
})();

const insertEqNG = (() => {
  const bElement = document.getElementById('current-nG');
  let previousLatex = '';
  
  const calculateMoments = (arr) => {
    let sum3 = 0, sum4 = 0;
    const len = arr.length;
    for (let i = 0; i < len; i++) {
      const val = arr[i];
      const val2 = val * val;
      sum3 += val2 * val;
      sum4 += val2 * val2;
    }
    return { 
      skewness: sum3 / len, 
      kurtosis: sum4 / len - 3 
    };
  };

  const createLatexString = (moments1, moments2) => `
    \\begin{align*}
    &\\text{Skewness: } E[\\epsilon_{1t}^3] = ${moments1.skewness.toFixed(2)} \\text{ and } E[\\epsilon_{2t}^3] = ${moments2.skewness.toFixed(2)} \\\\
    &\\text{Excess Kurtosis: } E[\\epsilon_{1t}^4-3] = ${moments1.kurtosis.toFixed(2)} \\text{ and } E[\\epsilon_{2t}^4-3] = ${moments2.kurtosis.toFixed(2)}
    \\end{align*}
  `;

  const renderMathJax = (latexString) => {
    if (typeof MathJax === 'undefined') {
      bElement.textContent = latexString;
      return;
    }

    if (MathJax.tex2svg) {
      const output = MathJax.tex2svg(latexString, {display: true});
      bElement.innerHTML = '';
      bElement.appendChild(output);
    } else if (MathJax.typesetPromise) {
      bElement.innerHTML = `$$${latexString}$$`;
      MathJax.typesetPromise([bElement]).catch(console.error);
    } else {
      bElement.textContent = latexString;
    }
  };

  return () => {
    if (!bElement) return;

    const moments1 = calculateMoments(epsilon1);
    const moments2 = calculateMoments(epsilon2);
    const latexString = createLatexString(moments1, moments2);

    if (latexString === previousLatex) return;
    previousLatex = latexString;

    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(() => renderMathJax(latexString));
    } else {
      renderMathJax(latexString);
    }
  };
})();

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

function createTableZ2Covariance(u1, u2, z1, z2, phi, color1, color2, color3) {

  loss1 = lossZ1(u1, u2, z1, z2, W, phi);
  loss2 = lossZ2(u1, u2, z1, z2, W, phi);
  loss3 = lossZ12(u1, u2, z1, z2, W, phi); 
  HTMLInsert = `
  <h3> Loss  based on proxies</h3>
  <table class="stats-table"> 
    <tr>
      <td class="measure"><span style="color: ${color1};">Loss z₁:</span> </td>
      <td class="formula">  ${loss1.toFixed(3)}</td>
    </tr>  
    <tr>
      <td class="measure"><span style="color: ${color2};">Loss z₂:</span></td>
      <td class="formula">  ${loss2.toFixed(3)}</td>
    </tr>   
    <tr>
      <td class="measure"><span style="color: ${color3};">Loss:</span> </td>
      <td class="formula">  ${loss3.toFixed(3)}</td>
    </tr>  
    <tr>
      <td class="measure">Critical value (10%):</td>
      <td class="formula"> ${(2.706 / T).toFixed(3)}</td>
    </tr>  
  </table>
  `; 

  if (loss3 > 2.706 / T) {
    HTMLInsert += `
    <p>Reject  null  at 10% level.</p>
    `
  } else {
    HTMLInsert += `
    <p>Not reject null  at  10% level.</p>
    `
  }
  createTable('stats-ze2', HTMLInsert)
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
      <td class="formula">   ${Math.pow(data.covariance, 2).toFixed(2)}</td>
    </tr>  
  </table>
  `; 
}
function createHTMLTableZCovariance(data, title, symbol1, symbol2) {
  return `
  <h3>${title}</h3>
  <table class="stats-table"> 
    <tr>
      <td class="measure">Loss z₁:</td>
      <td class="formula">  ${Math.pow(data.covariance, 2).toFixed(2)}</td>
    </tr>  
  </table>
  `; 
}
 



