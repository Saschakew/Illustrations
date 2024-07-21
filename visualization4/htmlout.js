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

  b0Element.innerHTML = matrixHtml0; 

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

  bElement.innerHTML = matrixHtml; 

   // Trigger MathJax to render the new content
   if (typeof MathJax !== 'undefined') {
    MathJax.typeset();
  }
}