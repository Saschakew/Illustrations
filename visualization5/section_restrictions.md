Lets start working on @estimation_restrictions.html in @index.html . 

First, explain that in an application we only observe the reduced form shocks u_t and try to recover the structural shocks epsilont_t. We know, epsilon_t = inv(B_0) u_t, however, B_0 is ofcourse unknown. We can define inovations e_t(B) = inv(B) u_t , which yield innovations for any invertible B and they are equal to the structural shocks if B=B_0. We can now use the assumption that the structural shocks epsilon_t are uncorrelated and have unit variance, impose the same assumption on the innovations e_t(B) which narrows down the set of possible B matrices.


Specifically, we can use the sample covariance matrix Sigma_T := mean[u_t u_t'] and B^{\text{Chol}} := Cholesky(Sigma_T) and B=B^{\text{Chol}} Q(\phi) where Q(\phi) is a 2x2 orthogonal matrix which depends only on a single parameter phi. 
It holds that, for e_t(B) = B^{-1} u_t with B=B^{\text{Chol}} Q(\phi) we have 
E[e_t(B) e_t(B)'] = I, meaning we obtain unit variance and uncorrelated innovations for every matrix B=B^{\text{Chol}} Q(\phi). 

We use Q(\phi) = \begin{pmatrix} \cos(\phi) & -\sin(\phi) \\ \sin(\phi) & \cos(\phi) \end{pmatrix} and phi \in [0, \pi/2] to parameterize the orthogonal matrix Q(\phi). 




Imposing the restriction that B_0 is recursive, meaning the value b_{12} = 0, reduces phi to a single possible value equal to (? can you use B=B^{\text{Chol}} Q(\phi) and b_{12} = 0 to calculate the value of phi? show which value phi corresponds to the restrictions and which B matrix it yields. )

Use the same formular to compute the "true" value of phi for the true B_0 matrix. Lets call them phi_0^{\text{rec}} and phi_0^{\text{non-rec}}. This requires to know Sigma  := E[u_t u_t'] instead of Sigma_T := mean[u_t u_t']. To approximate it, internally create a large test sample size of T=5000 and use it to approximate Sigma. 

Create a new simulation-controls menu similar to the menu in svar_setup.html. With the ability to switch B_0, create new data. However, replace the T slider with a phi slider with range [0, \pi/2] and step 0.01. 


For each selected phi value, add a text which shows the corresponding B matrix B=B^{\text{Chol}} Q(\phi).

Create a new left side scatter plot for the innovations e_t(B) = B^{-1} u_t for the current B=B^{	ext{Chol}} Q(\phi).

Create a second right side plot which shows the mean(e_{1t} * e_{2t}) on y for all possible phi values on x. Highlight the current value of phi with a vertical line. Also highlight the value of phi corresponding to the recursive restriction.  Also highlight phi_0^{\text{rec}} or  phi_0^{\text{non-rec}} depending on the switch where we select B_0 recursive or B_0 non-recursive.

