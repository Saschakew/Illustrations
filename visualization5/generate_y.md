# Generating the Observed Variables (y_t)

This guide explains how the observed time series variables, denoted as \(y_t\), are generated within the Structural Vector Autoregression (SVAR) model framework used in this visualization.

## Overview

The \(y_t\) series represent the economic variables whose behavior we are modeling and analyzing. In a typical SVAR model, \(y_t\) is determined by its own lagged values, the VAR model coefficients, and the reduced-form shocks \(u_t\).

For a VAR(p) model, the equation for \(y_t\) is:

\[ y_t = c + A_1 y_{t-1} + A_2 y_{t-2} + \dots + A_p y_{t-p} + u_t \]

Where:
- \(y_t = \begin{bmatrix} y_{1t} \\ y_{2t} \end{bmatrix}\) is the vector of observed variables at time \(t\).
- \(c\) is a vector of constants (intercepts).
- \(A_i\) are the \(2 \times 2\) coefficient matrices for the \(i^{th}\) lag.
- \(u_t = \begin{bmatrix} u_{1t} \\ u_{2t} \end{bmatrix}\) is the vector of reduced-form shocks at time \(t\).

In this specific implementation, we often work with a VAR(1) model for simplicity:

\[ y_t = A_1 y_{t-1} + u_t \]

(Assuming \(c=0\) or incorporated elsewhere for the simulation's purpose).

## Inputs for Generating \(y_t\)

1.  **Reduced-Form Shocks (\(u_t\))**: These are generated as described in the `generate_u.md` guide. They are the immediate impulses that drive changes in \(y_t\) that are not explained by its own past.
2.  **VAR Coefficient Matrix (\(A_1\) or \(A_p\))**: These matrices define the relationship between the current values of \(y_t\) and its past values. They are typically pre-defined.
3.  **Initial Values (\(y_0\) or \(y_{-1}, \dots, y_{-p+1}\))**: The generation process is iterative, so we need starting values for the \(y\) series.

## Generation Process

The \(y_t\) series are generated iteratively, starting from the initial values and applying the VAR equation for each time period \(t = 1, 2, \dots, T\).

*(Details of the iterative calculation and specific JavaScript functions will be added here after code review.)*

## Relevant JavaScript Functions

*(Specific functions and code snippets from the project will be detailed here.)*
