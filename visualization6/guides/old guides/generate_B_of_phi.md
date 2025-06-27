# Generating B(phi): From Angle to Structural Matrix

This document explains how the matrix \(B(\phi)\) is constructed. This matrix is crucial for identifying structural shocks from an estimated VAR model using a rotation angle \(\phi\). The process involves several steps: calculating the covariance matrix of reduced-form shocks, performing a Cholesky decomposition, generating a rotation matrix from \(\phi\), and finally combining these to form \(B(\phi)\).

These operations are typically found in `public/js/SVARMath.js`.

## Overall Process:

1.  **Obtain Reduced-Form Shocks (u<sub>t</sub>)**: The series \(u_{1t}\) and \(u_{2t}\) are required. Their generation is detailed in `generate_u.md`.
2.  **Compute Covariance Matrix (Σ<sub>u</sub>)**: Calculate the covariance matrix of \(u_t\).
3.  **Cholesky Decomposition (P)**: Decompose \(\Sigma_u\) into \(P P'\), where P is a lower-triangular matrix.
4.  **Generate Rotation Matrix (R(φ))**: Create an orthogonal rotation matrix based on the angle \(\phi\).
5.  **Construct B(φ)**: Compute \(B(\phi) = P \cdot R(\phi)\).

---

## Step 1: Computing the Covariance Matrix (Σ<sub>u</sub>) of Reduced-Form Shocks

The first step is to estimate the covariance matrix of the reduced-form residuals \(u_t = [u_{1t}, u_{2t}]'\). This matrix, denoted \(\Sigma_u\), is a 2x2 matrix:

\(\Sigma_u = \begin{pmatrix} \text{var}(u_1) & \text{cov}(u_1, u_2) \\ \text{cov}(u_1, u_2) & \text{var}(u_2) \end{pmatrix}\)

The variances and covariance are typically sample estimates. For series \(u_{1t}\) and \(u_{2t}\) of length T:
*   \(\text{mean}(u_1) = \frac{1}{T} \sum_{t=1}^{T} u_{1t}\)
*   \(\text{var}(u_1) = \frac{1}{T} \sum_{t=1}^{T} (u_{1t} - \text{mean}(u_1))^2\)
*   \(\text{cov}(u_1, u_2) = \frac{1}{T} \sum_{t=1}^{T} (u_{1t} - \text{mean}(u_1))(u_{2t} - \text{mean}(u_2))\)
(Note: The implementation uses T as the divisor, which is common, though T-1 is used for an unbiased sample estimate.)

**JavaScript Implementation (`SVARMath.calculateCovarianceMatrix`):**
```javascript
window.SVARMath.calculateCovarianceMatrix = function(u1_t, u2_t) {
    if (!u1_t || !u2_t || u1_t.length !== u2_t.length || u1_t.length === 0) {
        console.error('[SVARMath] Invalid input for covariance matrix calculation.');
        return null;
    }
    const n = u1_t.length;
    const mean_u1 = u1_t.reduce((a, b) => a + b, 0) / n;
    const mean_u2 = u2_t.reduce((a, b) => a + b, 0) / n;

    let var_u1 = 0, var_u2 = 0, cov_u1_u2 = 0;
    for (let i = 0; i < n; i++) {
        var_u1 += (u1_t[i] - mean_u1) * (u1_t[i] - mean_u1);
        var_u2 += (u2_t[i] - mean_u2) * (u2_t[i] - mean_u2);
        cov_u1_u2 += (u1_t[i] - mean_u1) * (u2_t[i] - mean_u2);
    }
    const divisor = n; // Or n-1 for sample covariance
    if (divisor === 0) return null;

    return [
        [var_u1 / divisor, cov_u1_u2 / divisor],
        [cov_u1_u2 / divisor, var_u2 / divisor]
    ];
};
```

---

## Step 2: Computing the Cholesky Decomposition (P) of Σ<sub>u</sub>

Once \(\Sigma_u\) is obtained, the next step is to find its Cholesky decomposition. This decomposition finds a lower triangular matrix \(P\) such that \(\Sigma_u = P P'\). For a 2x2 matrix \(\Sigma_u = \begin{pmatrix} a & b \\ b & d \end{pmatrix}\), the Cholesky factor \(P\) is:

\(P = \begin{pmatrix} p_{11} & 0 \\ p_{21} & p_{22} \end{pmatrix}\)

where:
*   \(p_{11} = \sqrt{a}\)
*   \(p_{21} = b / p_{11}\)
*   \(p_{22} = \sqrt{d - p_{21}^2}\)

The matrix \(\Sigma_u\) must be symmetric and positive definite for the Cholesky decomposition to exist and be unique with positive diagonal elements.

**JavaScript Implementation (`SVARMath.choleskyDecomposition`):**
```javascript
window.SVARMath.choleskyDecomposition = function(matrix) {
    if (!matrix || matrix.length !== 2 || matrix[0].length !== 2 || matrix[1].length !== 2) {
        console.error('[SVARMath] Invalid matrix for Cholesky decomposition.');
        return null;
    }
    const a = matrix[0][0];
    const b = matrix[0][1]; // c = matrix[1][0]
    const d = matrix[1][1];

    if (a <= 0) { // Must be positive definite
        console.error('[SVARMath] Cholesky failed: matrix[0][0] must be positive.');
        return null;
    }
    const p11 = Math.sqrt(a);
    const p21 = b / p11;
    const p22_squared = d - p21 * p21;

    if (p22_squared <= 0) { // Must be positive definite
        console.error('[SVARMath] Cholesky failed: matrix is not positive definite (p22_squared <=0).');
        return null;
    }
    const p22 = Math.sqrt(p22_squared);

    return [
        [p11, 0],
        [p21, p22]
    ];
};
```

---

## Step 3: Mapping the Angle φ to an Orthogonal Rotation Matrix R(φ)

The angle \(\phi\) (phi) is used to generate a 2x2 orthogonal rotation matrix \(R(\phi)\). This matrix rotates vectors in a 2D plane without changing their length.

\(R(\phi) = \begin{pmatrix} \cos(\phi) & -\sin(\phi) \\ \sin(\phi) & \cos(\phi) \end{pmatrix}\)

**JavaScript Implementation (`SVARMath.getRotationMatrix`):**
```javascript
window.SVARMath.getRotationMatrix = function(phi) {
    const cosPhi = Math.cos(phi);
    const sinPhi = Math.sin(phi);
    return [
        [cosPhi, -sinPhi],
        [sinPhi, cosPhi]
    ];
};
```
(Note: `SVARMath.getB0Matrix(phi)` is an alias for `getRotationMatrix(phi)` and returns \(R(\phi)\), not the full \(B(\phi)\).)

---

## Step 4: Constructing B(φ) as P ⋅ R(φ)

Finally, the matrix \(B(\phi)\) is constructed by multiplying the Cholesky factor \(P\) (from Step 2) with the rotation matrix \(R(\phi)\) (from Step 3):

\(B(\phi) = P \cdot R(\phi)\)

This multiplication is a standard matrix multiplication.

**JavaScript Implementation (`SVARMath.matrixMultiply`):**
```javascript
window.SVARMath.matrixMultiply = function(matrixA, matrixB) {
    if (!matrixA || !matrixB || matrixA.length !== 2 || matrixA[0].length !== 2 || 
        matrixB.length !== 2 || matrixB[0].length !== 2 || matrixA[1].length !== 2 || matrixB[1].length !== 2) {
        console.error('[SVARMath] Invalid matrices for multiplication.');
        return null;
    }
    const res = [[0, 0], [0, 0]];
    res[0][0] = matrixA[0][0] * matrixB[0][0] + matrixA[0][1] * matrixB[1][0];
    res[0][1] = matrixA[0][0] * matrixB[0][1] + matrixA[0][1] * matrixB[1][1];
    res[1][0] = matrixA[1][0] * matrixB[0][0] + matrixA[1][1] * matrixB[1][0];
    res[1][1] = matrixA[1][0] * matrixB[0][1] + matrixA[1][1] * matrixB[1][1];
    return res;
};
```
So, to get \(B(\phi)\), you would call `SVARMath.matrixMultiply(P, R_phi)`, where `P` is the result of `choleskyDecomposition` and `R_phi` is the result of `getRotationMatrix`.

---

## Summary of Inputs and Outputs for B(φ) Generation:

*   **Inputs**:
    *   `u_1t`, `u_2t`: Arrays of reduced-form shocks (from `generate_u.md` process).
    *   `phi`: The rotation angle in radians.
*   **Intermediate Steps**:
    *   \(\Sigma_u = \text{SVARMath.calculateCovarianceMatrix}(u_{1t}, u_{2t})\)
    *   \(P = \text{SVARMath.choleskyDecomposition}(\Sigma_u)\)
    *   \(R(\phi) = \text{SVARMath.getRotationMatrix}(\phi)\)
*   **Output (B(φ))**:
    *   \(B(\phi) = \text{SVARMath.matrixMultiply}(P, R(\phi))\) (a 2x2 matrix).
