# Guide to Replicating SVAR Identification Charts

This guide details the steps to replicate the "Identified Shocks Scatter Plot" and the "Correlation vs. Rotation Angle Plot" as seen in `svar_rotation_explorer.js`.

**Nomenclature based on `svar_rotation_explorer.js`:**
*   `u_1_t`, `u_2_t`: Original VAR residuals (e.g., `u_i_t_original`, `u_s_t_original`).
*   `Σ_u`: Covariance matrix of VAR residuals.
*   `P` (or `B_chol`): Lower Cholesky factor of `Σ_u`.
*   `θ` (or `angleDegrees`): Rotation angle in degrees.
*   `θ_rad`: Rotation angle in radians.
*   `Q(θ_rad)` (or `O_matrix`): 2x2 orthogonal rotation matrix.
*   `B_0(θ_rad)` (or `B0_current`): Contemporaneous impact matrix, `P * Q(θ_rad)`.
*   `(B_0(θ_rad))^{-1}` (or `B0_current_inv`): Inverse of the impact matrix.
*   `e_1_t(θ_rad)`, `e_2_t(θ_rad)`: Identified structural shocks (e.g., `e_i_t_rotated`, `e_s_t_rotated`).

**I. Data Generation and Prerequisites (DGP)**

1.  **Obtain VAR Residuals (`u_t`)**:
    *   Acquire two time series of residuals from an estimated Vector Autoregression (VAR) model. Let these be `u_1_t = [u_{1,1}, ..., u_{1,N}]` and `u_2_t = [u_{2,1}, ..., u_{2,N}]`. `N` is the number of observations.

2.  **Calculate Covariance Matrix of VAR Residuals (`Σ_u`)**:
    *   `var_u1 = variance(u_1_t)`
    *   `var_u2 = variance(u_2_t)`
    *   `cov_u1u2 = covariance(u_1_t, u_2_t)`
        *   The script's `variance` and `covariance` functions use `(N-1)` in the denominator (sample statistics).
    *   `Σ_u = [[var_u1, cov_u1u2], [cov_u1u2, var_u2]]`.

3.  **Cholesky Decomposition (`P` matrix)**:
    *   Compute the lower Cholesky factor `P` of `Σ_u` such that `P P' = Σ_u`. (Script: `B_chol = cholesky2x2(Σ_u)`).
    *   `P = [[p11, 0], [p21, p22]]` where:
        *   `p11 = sqrt(var_u1)`
        *   `p21 = cov_u1u2 / p11`
        *   `p22 = sqrt(var_u2 - p21^2)`
    *   Ensure `Σ_u` is positive definite (script checks for elements `<= 1e-9`).

**II. Rotation and Structural Shock Identification**

1.  **Rotation Angle (`θ`)**:
    *   Primary parameter, typically from a slider (e.g., -90 to +90 degrees).
    *   Convert to radians: `θ_rad = θ_degrees * (Math.PI / 180)`.

2.  **Orthogonal Rotation Matrix (`Q(θ_rad)`)**:
    *   Script's `O_matrix`: `Q(θ_rad) = [[cos(θ_rad), -sin(θ_rad)], [sin(θ_rad), cos(θ_rad)]]`

3.  **Contemporaneous Impact Matrix (`B_0(θ_rad)`)**:
    *   Relates structural shocks `e_t` to VAR residuals `u_t` via `u_t = B_0(θ_rad) e_t`.
    *   Calculated as `B_0(θ_rad) = P * Q(θ_rad)`. (Script: `B0_current = multiply2x2(B_chol, O_matrix)`).

4.  **Inverse of Impact Matrix (`(B_0(θ_rad))^{-1}`)**:
    *   Needed to find structural shocks: `e_t = (B_0(θ_rad))^{-1} u_t`.
    *   Calculated via `invert2x2(B0_current)`. (Script: `B0_current_inv`).
    *   Ensure `B_0(θ_rad)` is not singular (script checks determinant `abs(det) < 1e-9`).

5.  **Identified Structural Shocks (`e_t(θ_rad)`)**:
    *   For each time `t`: `u_vector_t = [u_{1,t}, u_{2,t}]^T`.
    *   `e_vector_t(θ_rad) = (B_0(θ_rad))^{-1} * u_vector_t`.
    *   This yields two time series: `e_1_t(θ_rad)` and `e_2_t(θ_rad)`.
        *   `e_{1,t}(θ_rad) = B0_current_inv[0][0] * u_{1,t} + B0_current_inv[0][1] * u_{2,t}`
        *   `e_{2,t}(θ_rad) = B0_current_inv[1][0] * u_{1,t} + B0_current_inv[1][1] * u_{2,t}`

**III. Chart 1: Scatter Plot of Identified Shocks `(e_{1,t}(θ), e_{2,t}(θ))`**

*   **HTML Canvas ID**: `rotated-shocks-scatter-chart`
*   **Procedure (for a given `θ_degrees`)**:
    1.  Perform steps II.1 to II.5 to get `e_1_t(θ_rad)` and `e_2_t(θ_rad)`.
    2.  Create a scatter plot: each point `j` is `(e_{1,j}(θ_rad), e_{2,j}(θ_rad))`.
    3.  X-axis label: e.g., "e_i,t (Rotated)".
    4.  Y-axis label: e.g., "e_s,t (Rotated)".
    5.  The script also displays the elements of `B_0(θ_rad)`.

**IV. Chart 2: `Corr(e_{1,t}(θ), e_{2,t}(θ))` vs. Rotation Angle `θ`**

*   **HTML Canvas ID**: `phi-correlation-chart`
*   **Procedure**:
    1.  Define `θ_degrees` range (e.g., -90 to +90, step 1 degree).
    2.  For each `loopAngleDegrees` in this range:
        a.  Convert to `loopAngleRad`.
        b.  Calculate `B_0(loopAngleRad)` and `(B_0(loopAngleRad))^{-1}`.
        c.  Calculate full time series `e_1_t(loopAngleRad)` and `e_2_t(loopAngleRad)`.
        d.  Compute Pearson correlation: `corr = correlation(e_1_t(loopAngleRad), e_2_t(loopAngleRad))`.
            *   Script's `correlation` uses sample statistics (N-1 denominator) and returns `NaN` if a standard deviation is zero.
        e.  Store pair: `(loopAngleDegrees, corr)`.
    3.  Create line plot:
        *   X-axis: `loopAngleDegrees`. Label: "Rotation Angle θ (degrees)".
        *   Y-axis: `corr`. Label: "Correlation(e_i,t, e_s,t)". (Script Y-limits: -1.1 to 1.1).
    4.  Optionally, mark the correlation for the current `θ_degrees` from the slider.
