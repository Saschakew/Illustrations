# Visualizing Non-Gaussian Shocks: A Reconstruction Guide

This document provides a detailed summary of how a chart visualizing non-Gaussian shocks, particularly the relationship between structural shocks (ε) and reduced-form shocks (u) via a transformation matrix, is typically created. This guide aims to provide the necessary understanding to reconstruct such a chart.

## 1. Core Concepts

### 1.1. Structural Shocks (ε)

*   **Definition**: Structural shocks (ε_t) are the fundamental, economically meaningful, unobserved disturbances that drive the dynamics of a system. In the context of Structural Vector Autoregressions (SVARs), they are assumed to be:
    *   Serially uncorrelated (white noise).
    *   Mutually independent (orthogonal at all leads and lags).
    *   Typically standardized to have zero mean and unit variance, i.e., E[ε_t] = 0 and E[ε_t ε_t'] = I (Identity matrix).
*   **Non-Gaussianity**: The key feature here is that *at least one* (or n-1 out of n shocks, for an n-variable system) structural shock follows a non-Gaussian distribution. Common non-Gaussian distributions include:
    *   Laplace distribution (double exponential)
    *   Student's t-distribution
    *   Mixture of Gaussian distributions
    *   Distributions with skewness and/or excess kurtosis.
*   **Generation for Simulation/Plotting**: To generate structural shocks for visualization:
    1.  Choose the number of structural shocks (e.g., 2 for a 2D plot).
    2.  For each shock ε_i, select a (non-Gaussian, for at least one) probability distribution.
    3.  Draw a large number of samples (e.g., N=1000) from each chosen distribution independently.
    4.  Standardize each series of draws to have a mean of 0 and a variance of 1.

#### 1.1.1. Detailed Generation Examples: Gaussian and Gaussian Mixture

Let's consider generating two structural shocks, `ε_1` and `ε_2`, for `N_samples` observations.

**a) Generating a Standard Gaussian Shock (e.g., ε_1)**

A Gaussian shock is characterized by its mean and standard deviation. For a *standard* Gaussian shock, the mean is 0 and the standard deviation (and variance) is 1.

*   **Drawing Samples**:
    ```python
    # N_samples = 1000 (for example)
    # epsilon_1_gaussian = draw_from_gaussian(N_samples, mean=0, std_dev=1)
    # Python example:
    import numpy as np
    epsilon_1_gaussian = np.random.normal(loc=0.0, scale=1.0, size=N_samples)
    ```
*   Since it's drawn directly with mean 0 and std 1, further standardization is usually not needed unless the drawing function doesn't guarantee it perfectly for a finite sample. For large `N_samples`, `np.mean(epsilon_1_gaussian)` will be close to 0 and `np.std(epsilon_1_gaussian)` close to 1.

**b) Generating a Gaussian Mixture Shock (e.g., ε_2)**

A Gaussian Mixture Model (GMM) shock is drawn from a distribution that is a weighted sum of two or more Gaussian distributions. This can create non-Gaussian features like multimodality or heavy tails/skewness depending on the component parameters. Let's consider a mixture of two Gaussians.

*   **Parameters for a 2-Component Mixture**:
    *   Component 1: Mean `μ_1`, Standard Deviation `σ_1`
    *   Component 2: Mean `μ_2`, Standard Deviation `σ_2`
    *   Weights: `w_1`, `w_2` (where `w_1 + w_2 = 1`, and `w_1, w_2 >= 0`). `w_1` is the probability of drawing from Component 1.

*   **Drawing Samples (N_samples total)**:
    1.  For each sample `i` from 1 to `N_samples`:
        *   Draw a random number `r` from a Uniform(0,1) distribution.
        *   If `r < w_1`, draw the `i`-th sample for `ε_2` from `Gaussian(μ_1, σ_1)`.
        *   Else (if `r >= w_1`), draw the `i`-th sample for `ε_2` from `Gaussian(μ_2, σ_2)`.

    ```python
    # Example Parameters for a bimodal mixture:
    # N_samples = 1000
    # mu1, sigma1 = -2, 0.5  # Mean and std dev for component 1
    # mu2, sigma2 = 2, 0.5   # Mean and std dev for component 2
    # w1 = 0.5               # Weight for component 1 (w2 = 1 - w1 = 0.5)

    # # A simple loop-based approach (less efficient for large N):
    # epsilon_2_mixture_raw = []
    # for _ in range(N_samples):
    #     if np.random.rand() < w1:
    #         sample = np.random.normal(loc=mu1, scale=sigma1)
    #     else:
    #         sample = np.random.normal(loc=mu2, scale=sigma2)
    #     epsilon_2_mixture_raw.append(sample)
    # epsilon_2_mixture_raw = np.array(epsilon_2_mixture_raw)

    # A more vectorized approach in Python:
    # (Assuming N_samples, mu1, sigma1, mu2, sigma2, w1 are defined)
    # import numpy as np # Already imported above for Gaussian example
    n_comp1 = int(N_samples * w1)
    n_comp2 = N_samples - n_comp1
    samples_comp1 = np.random.normal(loc=mu1, scale=sigma1, size=n_comp1)
    samples_comp2 = np.random.normal(loc=mu2, scale=sigma2, size=n_comp2)
    epsilon_2_mixture_raw = np.concatenate((samples_comp1, samples_comp2))
    np.random.shuffle(epsilon_2_mixture_raw) # Important to mix them
    ```

*   **Standardization**: The raw mixture `epsilon_2_mixture_raw` will generally *not* have a mean of 0 and a variance of 1. It's crucial to standardize it:
    ```python
    # epsilon_2_mixture = (epsilon_2_mixture_raw - np.mean(epsilon_2_mixture_raw)) / np.std(epsilon_2_mixture_raw)
    ```
    This ensures `E[ε_2] ≈ 0` and `Var(ε_2) ≈ 1` for the sample, making it comparable to other standardized shocks.

This standardized `epsilon_2_mixture` would then be one of the structural shocks.

    *Example (Python-like pseudocode for 2 shocks):*
    ```
    N_samples = 1000
    epsilon_1 = draw_from_laplace(N_samples, loc=0, scale=1/sqrt(2)) # Laplace has var=2*scale^2
    epsilon_2 = draw_from_student_t(N_samples, df=5) # Student-t
    # Standardize
    epsilon_1 = (epsilon_1 - mean(epsilon_1)) / std(epsilon_1)
    epsilon_2 = (epsilon_2 - mean(epsilon_2)) / std(epsilon_2)
    epsilon = stack([epsilon_1, epsilon_2]) # Shape (2, N_samples)
    ```

### 1.2. Reduced-Form Shocks (u)

*   **Definition**: Reduced-form shocks (u_t) are the residuals obtained from estimating a Vector Autoregression (VAR) model:
    `Y_t = c + A_1 Y_{t-1} + ... + A_p Y_{t-p} + u_t`
    where Y_t is a vector of observed variables.
*   **Properties**:
    *   `E[u_t] = 0`
    *   `E[u_t u_t'] = Σ_u` (covariance matrix of reduced-form shocks).
    *   `u_t` are generally contemporaneously correlated and are mixtures of the underlying structural shocks. They may appear more Gaussian than the individual structural shocks due to the Central Limit Theorem effect if they are linear combinations of many independent variables.
*   **Generation for Simulation/Plotting (given ε)**: If you have generated structural shocks `ε`, you can generate `u` using the transformation described next.

### 1.3. The Transformation Matrix (B / "Rotation Sigma")

*   **Relationship**: Reduced-form shocks `u_t` are linear combinations of structural shocks `ε_t`:
    `u_t = B ε_t`
    Here, `B` is an invertible (n x n) matrix, often called the contemporaneous impact matrix or mixing matrix. The user's term "rotation sigma" likely refers to this matrix `B` or a component of it, as it "rotates" and "scales" the structural shocks to produce the observed reduced-form shocks.
*   **Identification**:
    *   From `u_t = B ε_t` and `E[ε_t ε_t'] = I`, we have `Σ_u = E[u_t u_t'] = B E[ε_t ε_t'] B' = B B'`.
    *   Traditionally, `B` is not uniquely identified from `Σ_u` alone because if `B` is a solution, then `BQ` (where `Q` is any orthogonal matrix, `QQ'=I`) is also a solution, as `(BQ)(BQ)' = BQQ'B' = BB' = Σ_u`.
    *   **Non-Gaussianity helps**: If at least one `ε_i` is non-Gaussian, `B` can be identified up to permutation and scaling of its columns. This is the principle behind Independent Component Analysis (ICA). The goal is to find a matrix `W` (unmixing matrix, `W = B^{-1}`) such that `ε_t = W u_t` results in components of `ε_t` that are as statistically independent and non-Gaussian as possible.
*   **Generation for Simulation/Plotting**:
    1.  Define a matrix `B`. This matrix determines how the structural shocks are mixed. For a 2D example, `B` could be:
        ```
        B = [[b11, b12],
             [b21, b22]]
        ```
        This matrix can be chosen arbitrarily for illustration, or it could be a matrix estimated from actual data using an SVAR model identified via non-Gaussianity (e.g., using ICA on VAR residuals).
    2.  Calculate `u = B @ epsilon` (matrix multiplication).

    *Example (Python-like pseudocode):*
    ```
    B = np.array([[1.0, 0.5],
                  [-0.7, 1.2]])
    u = B @ epsilon # u will be shape (2, N_samples)
    ```

## 2. What the Plot Shows

A "Visualizing Non-Gaussian Shocks" chart typically aims to illustrate:

1.  **The distributions of shocks**:
    *   **Structural shocks (ε)**: Scatter plots of `(ε_1, ε_2)` will show a distribution whose shape reflects the chosen non-Gaussian distributions and their independence (e.g., a cross-like or star-like shape if axes align with shocks, or more generally, a shape whose density contours are not elliptical if non-Gaussian).
    *   **Reduced-form shocks (u)**: Scatter plots of `(u_1, u_2)` will show a "rotated" and "scaled" version of the `ε` scatter plot. The `u` shocks will generally be correlated, and their joint distribution might look more elliptical or "smeared out" compared to `ε`.
2.  **The effect of the transformation `B`**: It visually demonstrates how the independent, non-Gaussian `ε` shocks are mixed by `B` to form the correlated, potentially more Gaussian-looking `u` shocks.
3.  **Marginal distributions**: Histograms or Kernel Density Estimates (KDEs) for each component (`ε_1`, `ε_2`, `u_1`, `u_2`) can highlight:
    *   The non-Gaussian features (e.g., fat tails, skewness) of `ε_i`.
    *   How the marginal distributions of `u_i` might differ, often appearing closer to Gaussian.

## 3. How to Reconstruct the Chart (Step-by-Step)

Let's assume a 2-dimensional system for simplicity.

**Step 1: Generate Structural Shocks (ε)**
*   Choose two (for 2D) independent non-Gaussian distributions (or one Gaussian and one non-Gaussian). For example:
    *   `ε_1 ~ Laplace(0, 1/sqrt(2))` (standardized to unit variance)
    *   `ε_2 ~ t-distribution(df=5)` (standardized to unit variance)
*   Generate `N` samples for each (e.g., `N=2000`).
    ```python
    import numpy as np
    from scipy.stats import laplace, t

    N_samples = 2000

    # Generate epsilon_1 (Laplace)
    eps1_raw = laplace.rvs(loc=0, scale=1/np.sqrt(2), size=N_samples)
    eps1 = (eps1_raw - np.mean(eps1_raw)) / np.std(eps1_raw)

    # Generate epsilon_2 (Student's t)
    eps2_raw = t.rvs(df=5, size=N_samples)
    eps2 = (eps2_raw - np.mean(eps2_raw)) / np.std(eps2_raw)

    epsilon = np.vstack((eps1, eps2)) # Shape: (2, N_samples)
    ```

**Step 2: Define the Mixing Matrix (B)**
*   Choose a 2x2 invertible matrix `B`. This matrix represents the "rotation and scaling" that transforms `ε` into `u`.
    ```python
    B = np.array([[1.0, 0.8],  # Example: b11, b12
                  [0.3, 1.2]]) # Example: b21, b22
    ```
    The choice of `B` will determine the appearance of the `u` shocks. A `B` close to identity will result in `u` looking similar to `ε`. A `B` with significant off-diagonal elements will show more mixing.

**Step 3: Generate Reduced-Form Shocks (u)**
*   Compute `u = B @ ε`.
    ```python
    u = B @ epsilon # Shape: (2, N_samples)
    u1 = u[0, :]
    u2 = u[1, :]
    ```

**Step 4: Plot the Visualizations**
*   Use a plotting library like Matplotlib or Seaborn.

    **a) Scatter Plot of Structural Shocks (ε)**
    *   Plot `ε_1` vs `ε_2`.
    *   This should reflect the independent, non-Gaussian nature. Axes typically correspond to the independent components.
    ```python
    import matplotlib.pyplot as plt

    plt.figure(figsize=(6, 6))
    plt.scatter(eps1, eps2, alpha=0.5, label='Structural Shocks (ε)')
    plt.xlabel('ε_1 (e.g., Laplace)')
    plt.ylabel('ε_2 (e.g., Student-t)')
    plt.title('Scatter Plot of Structural Shocks')
    plt.axhline(0, color='grey', lw=0.5)
    plt.axvline(0, color='grey', lw=0.5)
    plt.axis('equal')
    plt.legend()
    plt.grid(True)
    plt.show()
    ```

    **b) Scatter Plot of Reduced-Form Shocks (u)**
    *   Plot `u_1` vs `u_2`.
    *   This shows the mixed shocks. The cloud of points will be rotated/scaled version of the `ε` plot. `u_1` and `u_2` will typically be correlated.
    ```python
    plt.figure(figsize=(6, 6))
    plt.scatter(u1, u2, alpha=0.5, color='orange', label='Reduced-Form Shocks (u)')
    plt.xlabel('u_1')
    plt.ylabel('u_2')
    plt.title('Scatter Plot of Reduced-Form Shocks')
    plt.axhline(0, color='grey', lw=0.5)
    plt.axvline(0, color='grey', lw=0.5)
    plt.axis('equal') # Keep aspect ratio same as epsilon plot for comparison
    plt.legend()
    plt.grid(True)
    plt.show()
    ```

    **c) (Optional) Combined Plot or Side-by-Side**
    *   Plotting both on the same axes (if scales are comparable) or side-by-side helps visualize the transformation.

    **d) Marginal Distributions (Histograms/KDEs)**
    *   Plot histograms or KDEs for `ε_1`, `ε_2`, `u_1`, and `u_2` to see their individual distributional shapes.
    ```python
    fig, axes = plt.subplots(2, 2, figsize=(12, 10))

    axes[0, 0].hist(eps1, bins=50, density=True, alpha=0.7, label='ε_1')
    axes[0, 0].set_title('Distribution of ε_1 (e.g., Laplace)')
    axes[0, 0].legend()

    axes[0, 1].hist(eps2, bins=50, density=True, alpha=0.7, label='ε_2')
    axes[0, 1].set_title('Distribution of ε_2 (e.g., Student-t)')
    axes[0, 1].legend()

    axes[1, 0].hist(u1, bins=50, density=True, alpha=0.7, color='orange', label='u_1')
    axes[1, 0].set_title('Distribution of u_1')
    axes[1, 0].legend()

    axes[1, 1].hist(u2, bins=50, density=True, alpha=0.7, color='orange', label='u_2')
    axes[1, 1].set_title('Distribution of u_2')
    axes[1, 1].legend()

    plt.tight_layout()
    plt.show()
    ```

## 4. Interpretation of "Rotation Sigma"

The term "rotation sigma" likely refers to the matrix `B`.
*   If `ε` are orthogonal (independent and uncorrelated), `B` transforms this orthogonal basis into a new basis for `u`.
*   If `B` can be decomposed, e.g., via Singular Value Decomposition `B = U S V'`, where `U` and `V` are orthogonal (rotation/reflection) matrices and `S` is a diagonal matrix (scaling), then "rotation" refers to `U` and `V`, and "sigma" (often used for standard deviation or scale) could relate to the scaling factors in `S` or the overall covariance structure `Σ_u = BB'`.
*   In the context of ICA, if one starts with `u` and finds an unmixing matrix `W` such that `ε = W u`, then `B = W^{-1}`. The process of finding `W` often involves "whitening" `u` (making its covariance identity, which removes correlation and scales variances) and then applying a rotation matrix to maximize non-Gaussianity of the resulting components.

This guide provides a comprehensive framework. The specific distributions for `ε`, the exact `B` matrix, and the plotting aesthetics would define the final appearance of *the* "Visualizing Non-Gaussian Shocks" chart the user encountered.
