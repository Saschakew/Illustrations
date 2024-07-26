
function generateMixedNormalData(length, s) {
    return Array.from({length}, () => {
      if (Math.random() < 0.9) {
        // 90% standard normal
        return normalRandom() - 0.1*s;
      } else {
        // 10% normal with mean s and variance 1
        return normalRandom() + s - 0.1*s;
      }
    });
  }
  
  function normalRandom() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }
  
  
  function NormalizeData(rawEpsilon1, rawEpsilon2){
    // Compute sample means and covariance matrix
    const mean1 = rawEpsilon1.reduce((a, b) => a + b, 0) / T;
    const mean2 = rawEpsilon2.reduce((a, b) => a + b, 0) / T;
    let cov11 = 0, cov12 = 0, cov22 = 0;
    for (let i = 0; i < T; i++) {
      cov11 += (rawEpsilon1[i] - mean1) * (rawEpsilon1[i] - mean1);
      cov12 += (rawEpsilon1[i] - mean1) * (rawEpsilon2[i] - mean2);
      cov22 += (rawEpsilon2[i] - mean2) * (rawEpsilon2[i] - mean2);
    }
    cov11 /= T - 1;
    cov12 /= T - 1;
    cov22 /= T - 1;
  
    // Compute Cholesky decomposition
    const L11 = Math.sqrt(cov11);
    const L21 = cov12 / L11;
    const L22 = Math.sqrt(cov22 - L21 * L21);
  
    // Orthogonalize and normalize the shocks
    epsilon1 = new Array(T);
    epsilon2 = new Array(T);
    for (let i = 0; i < T; i++) {
      epsilon1[i] = (rawEpsilon1[i] - mean1) / L11;
      epsilon2[i] = ((rawEpsilon2[i] - mean2) - L21 * epsilon1[i]) / L22;
    }
  
    // Ensure zero mean and unit variance
    let newMean1 = 0, newMean2 = 0, newVar1 = 0, newVar2 = 0;
    for (let i = 0; i < T; i++) {
      newMean1 += epsilon1[i];
      newMean2 += epsilon2[i];
    }
    newMean1 /= T;
    newMean2 /= T;
  
    for (let i = 0; i < T; i++) {
      epsilon1[i] -= newMean1;
      epsilon2[i] -= newMean2;
      newVar1 += epsilon1[i] * epsilon1[i];
      newVar2 += epsilon2[i] * epsilon2[i];
    }
    newVar1 = Math.sqrt(newVar1 / (T ));
    newVar2 = Math.sqrt(newVar2 / (T ));
  
    for (let i = 0; i < T; i++) {
      epsilon1[i] /= newVar1;
      epsilon2[i] /= newVar2;
    }
    
    selectedPointIndex = null;
  
    return [epsilon1, epsilon2]
  
  }
  


function getU(epsilon1, epsilon2, Bthis) {
//  console.log( Bthis);
//  console.log( epsilon1); 
  u1 = epsilon1.map((d, i) => Bthis[0][0] * d + Bthis[0][1] * epsilon2[i]);
  u2 = epsilon1.map((d, i) => Bthis[1][0] * d + Bthis[1][1] * epsilon2[i]);
 // console.log(u1);
  return  [u1, u2] ;
}

function getE(u1, u2, Bthis) {  
  A = math.inv(Bthis); 
  e1 = u1.map((u1, i) => A[0][0] * u1 + A[0][1] * u2[i]);
  e2 = u1.map((u1, i) => A[1][0] * u1 + A[1][1] * u2[i]);
  return  [e1, e2] ;
}