# Abstract

This study proposes a combination of a statistical identification approach with potentially invalid short-run zero restrictions. The estimator shrinks towards imposed restrictions and stops shrinkage when the data provide evidence against a restriction.
\rev{We} demonstrate \rev{that} incorporating valid restrictions through the shrinkage approach enhances the accuracy of the statistically identified estimator and the impact of invalid restrictions decreases as the sample size \rev{increases}. Applying the estimator to an oil market model indicates that incorporating stock market data into the analysis is crucial, as it enables the identification of information shocks, which are shown to be important drivers of the oil price.


# Introcution
Traditional approaches to identifying structural vector autoregressions (SVAR) typically impose economically motivated restrictions, often restricting how structural shocks affect the variables in the SVAR simultaneously. More recently, \rev{identification approaches imposing structure on the stochastic properties of the shocks, such as time-varying volatility or statistical independence under non-Gaussianity, have been developed.}
Although statistical identification methods do not rely on economically motivated restrictions for identification, \rev{prior economic knowledge remains essential for interpreting and labeling the identified shocks, and therefore conducting economically meaningful structural analysis. Identification approaches based on economic restrictions and statistical properties mainly differ in how theoretical knowledge is used when estimating the SVAR.}
 

 
\rev{This paper introduces a novel estimation procedure of a statistically identified SVAR by incorporating  short-run restrictions on impulse responses in a flexible and data-driven manner. Specifically, we propose a ridge-regularized GMM estimator that allows for potentially invalid zero restrictions on simultaneous impulse responses, ensuring that restrictions are neither imposed dogmatically nor ignored entirely.} The estimator relies on non-Gaussian and (mean) independent shocks for identification, \rev{while the ridge penalty serves to shrink impulse responses toward imposed restrictions.} In contrast to traditional estimation approaches that treat restrictions as binding constraints, the proposed shrinkage estimator can stop shrinkage towards restrictions if the data present evidence against them. This approach seeks to enhance the efficiency of the statistically identified estimator through valid restrictions while mitigating the impact of invalid restrictions when the data provide evidence against them.


\rev{A crucial part of our approach lies in the adaptive weighting of the ridge penalty of the short-run restrictions.} It induces an important feature: It becomes cheap to deviate from invalid restrictions and costly to deviate from valid restrictions. \rev{This adaptive shrinkage mechanism effectively navigates the bias-variance trade-off in a data-driven way, provided that statistical identification is feasible without the restrictions. The success of this strategy hinges on a separate identification mechanism, which supplies evidence in favor of or against the imposed restrictions, thereby guiding the estimator's shrinkage behavior.}


\rev{Our identification strategy builds upon} non-Gaussian and (mean) independent shocks. 
The assumption of independent shocks often faces the objection that shocks driven by the same volatility process are not independent, \cite{montiel2022svar}. 
Recent studies yield identification results under more relaxed assumptions regarding the (in)dependencies of shocks; see \cite{guay2021identification},  \cite{mesters2022non}, or \cite{anttonen2023bayesian}. This study proposes a new identification result based on the non-Gaussianity of the shocks. For skewed shocks, identification requires only mean independent shocks and allows for a common volatility process. For shocks with zero-skewness but non-zero excess kurtosis, \rev{independence remains necessary for identification.}

\rev{While imposing minimal structure on the stochastic properties of shocks enhances robustness -- such as the proposed estimator that only minimizes second- to fourth-order  moment conditions implied by mean independence -- it often comes at the expense of efficiency. The ridge penalty is introduced precisely to counteract this efficiency loss by leveraging prior economic knowledge on contemporaneous relationships. We investigate the estimator's asymptotic properties and demonstrate that under our choice of penalty term and adaptive weights, no asymptotic bias is introduced when restrictions are misspecified, while efficiency gains are realized when the restrictions hold, relative to the unpenalized estimator. Monte Carlo simulations further illustrate the interplay between restrictions and statistical identification: Valid restrictions enhance the accuracy of the statistically identified estimator, whereas the influence of invalid restrictions diminishes as empirical evidence accumulates against them.
}

Bayesian approaches offer a natural \rev{alternative for incorporating} economic knowledge using the prior distribution of the parameters.  Moreover,  Bayesian SVARs identified by independence and non-Gaussianity allow for updating economically motivated priors, see  \cite{lanne2020identification}, \cite{anttonen2021statistically},  \cite{braun2021importance}, and \cite{keweloh2023estimating}.
Nevertheless, the incorporation of prior economic knowledge, specifically the imposition of economically motivated zero restrictions, has deep roots in the frequentist SVAR literature as well. However, \rev{the conventional frequentist treatment of restrictions is often rigid, treating them as hard constraints,} lacking the ability to gather and utilize empirical evidence against a given restriction. \rev{Our approach departs from this paradigm by introducing} a non-dogmatic frequentist framework \rev{that flexibly incorporates economic restrictions while allowing for empirical rejection when warranted.}

 

 # Overview: SVAR

 We consider an $n$-dimensional SVAR  where $y_t=[y_{1t} ,...,y_{nt} ]'$ are endogenous variables with
\begin{align}
\label{eq: SVAR}
y_t =  \nu +  A_1 y_{t-1} + ... + A_p y_{t-p}  + u_t 
\quad \text{and} \quad
u_t=   B_0  \varepsilon_{t} ,
\end{align}
with reduced-form errors $u_t=[u_{1t} ,...,u_{nt} ]'$, structural shocks $\varepsilon_t=[\varepsilon_{1t},...,\varepsilon_{nt}]'$ with mean zero and unit variance, and $B_0 \in \mathbb{B} := \{B \in \mathbb{R}^{n \times n} | \text{det}(B)\neq 0 \}$ and $A_0:= B_0^{-1}$.  
To simply, we focus on the simultaneous interaction $u_t =   B_0  \varepsilon_{t}$ and treat $u_t$ as observable.\footnote{ \sw{Throughout the paper, it is assumed that the reduced-form VAR is correctly specified.} In practice, SVAR models are often estimated in a two-step procedure where the reduced-form model is first estimated using LS and the structural simultaneous relation is estimated in the second step. Simulations analyzing the performance of the two-step approach can be found in Appendix \ref{appendix: sec: Finite sample performance} and show little differences compared to the simulations in the main text. 
} Define the innovations obtained by \rev{transforming} the reduced form shocks as
\begin{align}
\label{eq: define unmixed innovations}
e(B)_t := B^{-1} u_t, \ B \in \mathbb{B}.
\end{align} 
For $B=B_0$, the innovations \rev{coincide with} the structural shocks. \rev{However, in practice, $B_0$ is unknown and } identification of the SVAR comes down to formulating a set of equations that guarantee the equivalence between innovations and structural shocks.

Typically, identification relies on the assumption that structural shocks are uncorrelated, which implies that the matrix $B$ should yield uncorrelated innovations. However, this restriction alone does not uniquely determine $B_0$. Traditional approaches resolve this by imposing additional structure on the system—for example, by assuming $(n(n-1))/2$ short-run exclusion restrictions. While these assumptions can point-identify the model, they render the SVAR just-identified, meaning that incorrect restrictions cannot be detected even in large samples.
More recently, a growing literature proposes identification based on the stochastic properties of the structural shocks. These approaches include time-varying volatility   or  non-Gaussian and independence of the shocks, see \cite{lewis2025identification} for a comprehensive overview. 
 

Figure~\ref{fig: Illustration} illustrates how non-Gaussianity and independence can help identify the structural shocks. The left panel displays independent shocks $\varepsilon_t$, where $\varepsilon_{2t}$ is visibly left-skewed—large negative values occur more frequently than large positive ones. The right panel shows a rotated version $e_t$ of these shocks, which remains uncorrelated but is no longer independent. For example, when $e_{1t}$ is strongly negative, $e_{2t}$ is more likely to be positive. This violation of independence is apparent in the joint distribution: while the upper-left quadrant is dense, the lower-left is sparse. Thus, higher-order moments like coskewness can detect such dependence, distinguishing rotated innovations from the true structural shocks.

We begin our analysis with a simple estimator for non-Gaussian SVARs that assumes mutually independent structural shocks. These assumptions are formalized below and will be revisited and relaxed in Section \ref{sec: new ng-estimator}.
\begin{assumption}
\label{assumption:independence}
    The structural shocks $\varepsilon_t$ are mutually independent, with at most one shock having zero skewness and zero excess kurtosis.
\end{assumption}
Under this assumption, we estimate the structural impact matrix using the continuously updating estimator (CUE) proposed by \cite{keweloh2020generalized}:
\begin{align}
	\label{eq: gmm}
	\hat{B}_T    := \argmin \limits_{B \in 	 \bar{\mathbb{B}}  } \text{ }
	g_T(B)'
	W(B)
	g_T(B), 
\end{align}   
where $g_T(B)$ collects (co-)variance, coskewness, and cokurtosis moment conditions, $W(B)$ is the efficient continuously updated weighting matrix, and $\bar{\mathbb{B}}$ denotes a set of unique sign-permutation representatives. The estimator is point-identified under Assumption~\ref{assumption:independence}, and consistency, $\sqrt{T}$-consistency, and asymptotic normality follow from standard regularity conditions; see \cite{hall2005generalized}.

This setup serves as a baseline for our main contribution in Sections~\ref{sec: Ridge SVAR-GMM  estimator}   and~\ref{sec:Asymptotic properties and adaptive weights} where we propose to include short-run zero restrictions into statistically identified SVARs via a ridge-regularized estimator. The ridge-based approach can be applied to any statistically identified SVAR estimator. We begin with the simple non-Gaussian estimator. In Section~\ref{sec: new ng-estimator}, we return to the purely statistical estimator and explore how the identification assumptions can be weakened, including relaxing full independence in favor of mean independence and allowing for common volatility components.


# Incorporating potentially invalid restrictions


This section proposes to incorporate potentially invalid short-run zero restrictions using a ridge penalty with adaptive weights into the non-Gaussian SVAR estimation.
Unlike conventional SVAR methods that rely on restrictions for identification, the proposed methodology leverages restrictions as a means of incorporating the researchers' a priori economic knowledge to increase the precision and efficiency of the estimation in comparison to an estimator relying only on the non-Gaussianity of the shocks.
Moreover, combining statistical identification with restrictions using a shrinkage mechanism enables the data to provide evidence against invalid restrictions and prevent shrinkage toward them.

We propose an estimator that incorporates short-run zero restrictions using a ridge penalty with adaptive weights. Combining statistical identification with restrictions using a shrinkage mechanism enables the data to provide evidence against invalid restrictions and prevent shrinkage toward them. The following notation is used to denote short-run zero restrictions on $B_0$. Let $\mathcal{R} $ be the set of all pairs $(i,j) $  corresponding to elements $B_{ij}$ of $B_0$ restricted to zero. For example, imposing a recursive order implies that all elements in the upper-triangular of $B_0$ are equal to zero, which corresponds to $ \mathcal{R}=\{i,j \in \{1,...,n\} | j>i \}$.\footnote{
	Proxy variables  can also be   implemented using  short-run restrictions and the ridge estimator proposed in this section can be applied to proxy variables in augmented proxy SVAR models.  Moreover, the ridge approach can be applied to restrictions in an $A$-type SVAR model with $A_0 u_t = \varepsilon_t$. Lastly, the approach can easily be extended to non-zero restrictions.} The proposed Ridge SVAR-CSUE estimator for the structural parameter matrix $B$ can be written as 
 \begin{align}
 	\label{eq: rcsue}
 	\hat{B}_T    := \argmin \limits_{B \in 	\bar{\mathbb{B}}_{\bar{B}} } \text{ }
 	\left\{
    g_T(B)'
 W(B)
 g_T(B) + \lambda \sum_{(i,j)\in \mathcal{R}}   
   v_{ij} B_{ij}^2 \right\} ,   
 \end{align} 
where $\lambda \geq 0$ is a tuning parameter converging to zero and $v_{ij}$ are the weights of the corresponding restrictions with their exact properties introduced in the next section. The tuning parameter and weights together govern the cost of deviating from the restrictions. Traditional restriction-based estimators rely on restrictions for identification, and hence the restrictions imposed are bindings constraints and can not be rejected by the data. If the tuning parameter and weights of the ridge estimator were set to be infinity, all restrictions become binding, and the ridge estimator collapses to the traditional restriction-based estimator. 
Conversely, estimators based on stochastic properties of the data-generating process, like non-Gaussianity, typically ignore any restrictions offered by a-priori economic knowledge. If the tuning parameter and weights are set to zero, deviating from restrictions induces no penalty at all, making the ridge estimator the same as the SVAR-CSUE estimator obtained solely based on non-Gaussianity. 
\rev{Rather than adopting a dogmatic approach that fixes the weights at either zero or infinity, we advocate a data-driven strategy where the weights are determined from a first-step estimator. Next, we demonstrate that, under this choice of weights and $\lambda = O(T^{-\gamma})$ for $0 < \gamma < 1$, the estimator remains asymptotically unbiased when restrictions are misspecified, while achieving efficiency gains when the restrictions are valid.} 



# Mean independent shocks and non-Gaussian identification
This section returns to the non-Gaussian SVAR estimation and explores how identification can be achieved under weaker assumptions on the dependence structure of the structural shocks. First, we discuss and contrast the concepts of uncorrelatedness, mean independence, and full independence, emphasizing their implications for both identification and causal interpretation. Second, we formalize novel identification conditions under mean independence and introduce a corresponding estimator. Lastly, we propose a novel approach to label the shocks and introduce the Ridge estimator used in the remainder of the study.


\subsection{Dependency assumptions in SVAR models}
While traditional SVAR identification frameworks (using short- or long-run restrictions or sign restrictions) typically rely on the assumption of uncorrelated shocks, the first statistical identification approaches using non-Gaussianity rely on the assumption of independent shocks, see e.g. \cite{lanne2017identification} or \cite{gourieroux2017statistical}.  


Assuming independent shocks is often considered as too restrictive, as it does not allow for shocks affected by a common volatility process; see \cite{montiel2022svar}.
However, one can also argue that the assumption of uncorrelated shocks  might be  too weak. Shocks can be uncorrelated, but dependent in a manner that appears implausible for structural shocks. For instance, if the innovations shown in the right panel of Figure~\ref{fig: Illustration} were misidentified as structural shocks, say a demand shock$e_{1t}$ and a supply shock $e_{2t}$, knowing the value of the demand shock would immediately provide the information on the mean of the supply shock, even though they are uncorrelated.

\rev{In this study, we advocate} for the assumption of mean independent shocks, i.e. $E[\varepsilon_{it} |  \varepsilon_{-it} ]=0$ for $i=1,...,n$ with $ \varepsilon_{-it}:=[\varepsilon_{1t},...,\varepsilon_{(i-1)t},\varepsilon_{(i+1)t},...,\varepsilon_{nt}]$. \rev{Notably, being mean independent is stronger than mere uncorrelatedness,} yet more lenient than assuming full independence. 
Imposing the condition of mean independent shocks excludes dependency structures where one shock provides information about the expectation of another shock, while still allowing for \rev{higher-order dependencies} like a common volatility process.

Indeed, it is crucial to recognize that while traditional identification approaches may primarily utilize the assumption of uncorrelated shocks, the assumption of mean independent shocks is vital when making causal statements about the expected responses of variables to shocks. \rev{Consider a bivariate SVAR, where $b_{11}$ represents the contemporaneous effect of $\varepsilon_{1t}$ on the variable $y_{1t}$ and is typically interpreted as $E[y_{1t } | \varepsilon_{1t} = 1, y_{s, s<t} ] - E[y_{1t } | \varepsilon_{1t} = 0, y_{s, s<t} ]$ \citep[see, e.g.,][]{Shephard2019}.} The assumption of uncorrelated shocks \rev{does not in general guarantee that $E[\varepsilon_{2t} | \varepsilon_{1t} = 1, y_{s, s<t} ] - E[\varepsilon_{2t} | \varepsilon_{1t} = 0, y_{s, s<t}] = 0$, which is required to establish $b_{11} = E[y_{1t } | \varepsilon_{1t} = 1, y_{s, s<t} ] - E[y_{1t } | \varepsilon_{1t} = 0, y_{s, s<t} ] = b_{11} + b_{12}(E[\varepsilon_{2t} | \varepsilon_{1t} = 1, y_{s, s<t} ] - E[\varepsilon_{2t} | \varepsilon_{1t} = 0, y_{s, s<t} ])$.}\footnote{\rev{Another possible interpretation of the contemporaneous effect is $E[y_{1t } | \varepsilon_{t} = \varepsilon_{t}^*, y_{s, s<t} ] - E[y_{1t } | \varepsilon_{t} = 0, y_{s, s<t} ]$, where $ \varepsilon_{t}^* = [1,0]'$. Once we allow potential higher-order dependencies of among the uncorrelated shocks, one might face the problem that the dose of the treatment $\varepsilon_{t}^*$ may not lie within the support of the joint distribution of random vector $\varepsilon_{t}$.} For example, \rev{for uncorrelated shocks $\varepsilon_{1t} \sim N(0,1)$ and $\varepsilon_{2t}=\varepsilon_{1t}^3-3\varepsilon_{1t}$, the vector $ \varepsilon_{t}^* = [1,0]'$ does not lie within the support of the joint distribution of $\varepsilon_t$.}} Instead, it requires mean independent shocks. Therefore, the assumption of mean independence is \rev{often} used implicitly in \rev{many applications} that make causal statements about the expected response of the variables to the shocks, and thus, \rev{it appears reasonable to exploit such assumption} to identify the SVAR.


\subsection{Identification}
We now derive the conditions under which third- and fourth-order moment conditions derived from mutually mean independent shocks identify the SVAR up to labeling of the shocks. For $i,j,k,l \in \{1,...,n\}$,  mutually mean independent shocks with mean zero and unit variance imply	
 (co-)variance conditions 
\begin{align}\label{eq:mom_2}
	E [e(B)_{it}^2 ] -1  = 0   
 \text{ and }  
	E [e(B)_{it}  e(B)_{jt}   ]  = 0,   \text{ for } i <j 
\end{align}
coskewness conditions
\begin{align}
	\label{eq: proof cos1}
	E [e(B)_{it}^2 e(B)_{jt} ]  &= 0,  \text{ for } i \neq j   \\
	\label{eq: proof cos2}
	E [e(B)_{it}  e(B)_{jt} e(B)_{kt} ]  &= 0,   \text{ for } i <j<k    	
\end{align}
and cokurtosis conditions
\begin{align} 
	\label{eq: proof cokurtosis}
	E [e(B)_{it}^3  e(B)_{jt} ] &= 0,   \text{ for } i \neq j \\
	E [e(B)_{it}^2  e(B)_{jt} e(B)_{kt}]  &= 0,   \text{ for } i \neq j, i \neq k, j<k \\
	\label{eq: proof cokurtosis 3}
	E [e(B)_{it}   e(B)_{jt} e(B)_{kt} e(B)_{lt} ]&=0,   \text{ for } i < j<k<l. 
\end{align} 


\rev{In general, the moment conditions implied by mean independent shocks can be written as
\begin{align}
	\label{eq: f}
	f_k(B,u_t) :=\prod_{i=1}^{n} e(B)_{i,t}^{m_i(k)}- c(k), \quad  \text{with}  \quad  E[f_k(B,u_t)] = 0,
\end{align}
for $k = 1, \ldots, K$, where both the power $m_i(k)$ and the constant $c(k) \in \{0, 1\}$ depends on the exact moment condition outlined in \eqref{eq:mom_2}-\eqref{eq: proof cokurtosis 3}.
}



The following proposition establishes conditions under which the second- to fourth-order moment conditions implied by mutually mean independent shocks identify the SVAR.
\begin{proposition}
	\label{proposition: 1}
	Partition the SVAR $u_t = B_0 \varepsilon_t$ into three groups of shocks $\varepsilon_t = [\tilde{\varepsilon}_{1t}, \tilde{\varepsilon}_{2t}  , \tilde{\varepsilon}_{3t} ]'$ where
    $\tilde{\varepsilon}_{1t}$ contains all skewed shocks with arbitrary excess kurtosis,
	   $\tilde{\varepsilon}_{2t}$    contains all shocks with zero skewness and non-zero  excess kurtosis, 
		and   $\tilde{\varepsilon}_{3t}$  contains all shocks with zero skewness and zero excess kurtosis.
	Assume that all shocks are mutually mean independent, i.e., $E[\varepsilon_{it} |  \varepsilon_{-it} ]=0$ for $i=1,...,n$.      \rev{Let $f(B, u_t) = [ f_{1}(B,u_t),...,f_{K}(B,u_t)]'$ be the vector that contains all second- to fourth-order moment conditions implied by mutually mean independent shocks with unit variance such that $E[f(B_0,u_t)] = 0$.}
		  
	\begin{enumerate}
		\item 	The skewed shocks   $\tilde{\varepsilon}_{1t}$  and the corresponding columns of $B_0$ are identified up to sign and permutation.  
		
		\item The shocks with excess kurtosis $\tilde{\varepsilon}_{2t}$    are identified up to sign and permutation together with the corresponding columns of $B_0$ if the shocks contained in $\tilde{\varepsilon}_{2t}$ are mutually independent.  
		
		\item The remaining shocks $\tilde{\varepsilon}_{3t}$ are identified up to an orthogonal rotation. If the set contains only one shock, the shock and the corresponding column of $B_0$ are identified.
	\end{enumerate}	
\end{proposition}
\rev{The proof can be found in the Appendix.\footnote{\rev{The proof of the first statement generalizes Theorem 5.3 in \cite{mesters2022non} to multiple Gaussian shocks.
	The proof of the second statement follows the proof of Theorem 5.10 in \cite{mesters2022non}, however, we replaced the genericity condition used in  \cite{mesters2022non} by the assumption of independent shocks and generalize the statement to multiple Gaussian shocks.
	The proof of the third statement is trivial.}}} The proposition shows that mutually mean independent shocks with non-zero skewness are identified by the moment conditions. This allows identifying skewed shocks even if they are driven by the same volatility process. 
Moreover, if shocks exhibit zero skewness,  the moment conditions still identify the shocks with non-zero excess kurtosis if these shocks are mutually independent.\footnote{
	 Technically, the first statement  only requires that the shocks satisfy all coskewness conditions implied by mean independent shocks and the second statement only requires that the  shocks satisfy all cokurtosis conditions implied by independent shocks. Therefore, the second statement does not necessarily require independent shocks, however, it requires that all cokurtosis conditions resulting from independent shocks hold. However, the conditions do not follow from mean independent shocks, and finding an economically plausible process other than independent shocks that yields shocks satisfying all such conditions is not straightforward.
}
The first statement is a  generalization of moment-based identification results in the literature  (specifically for third moments in \cite{bonhomme2009consistent}   and for arbitrary moments in  \cite{mesters2022non}) to the case with multiple Gaussian shocks, similar to the partial identification results in \cite{maxand2020identification} and \cite{guay2021identification}. \rev{The recent work of \cite{lanne2023Identifying} also provides a similar result following a different proof strategy (see their Proposition 1(i)).}
The second statement is related to the identification result in \cite{lanne2021gmm} based on asymmetric fourth-order moment conditions. However, in contrast to the identification result in \cite{lanne2021gmm} which only provides a local identification result, Proposition \ref{proposition: 1} provides a global identification result up to sign and permutation.
The second statement assumes that the shocks are independent and therefore satisfy the symmetric cokurtosis conditions $E[\varepsilon_{it}^2 \varepsilon_{jt}^2-1]=0$ for $i\neq j$. However, these symmetric conditions are not contained in the moment conditions $E[f(B,u_t)]$. The contribution of the second statement is to show that for independent shocks with sufficient excess kurtosis, the moment conditions $E[f(B,u_t)]$  guarantee global identification.\footnote{
	Note that   while the identification result in \cite{lanne2021gmm} only uses asymmetric fourth-order moment conditions, it still requires the assumption that all cokurtosis conditions (not just the asymmetric ones) implied by mutually independent shocks hold. This assumption is used in the proof of the proposition in \cite{lanne2021gmm}. Therefore, the identification result in \cite{lanne2021gmm} cannot be used to identify an SVAR with shocks affected by the same volatility process.
} Exuding the symmetric cokurtosis moment conditions is important to guarantee identification based on mean independent and skewed shock in the first statement. Specifically, if  the moment conditions   would contain the  symmetric cokurtosis conditions, the first statement would not hold. 



\subsection{Estimation}
We can not combine the identification result in Proposition \ref{proposition: 1} with the ridge penalty to obtain the Ridge SVAR estimator used in the remainder of the study:
 \begin{align}
 	\label{eq: rcsue}
 	\hat{B}_T    := \argmin \limits_{B \in 	\bar{\mathbb{B}}_{\bar{B}} } \text{ }
 	\left\{
    g_T(B)'
 W(B)
 g_T(B) + \lambda \sum_{(i,j)\in \mathcal{R}}   
   v_{ij} B_{ij}^2 \right\} ,   
 \end{align} 
with  $g_T(B)= \frac{1}{T}\sum_{t=1}^{T} f(B,u_t)$  and where $ E[f(B,u_t)]=0$ contains the second- to fourth-order moment conditions implied by mutually mean independent shocks.
Consistency and asymptotic normality \textcolor{red}{...discussed in the previous section still hold....}.

\cite{keweloh2023structural} identifies two small-sample issues with SVAR-GMM estimators based on higher-order moments: (i) the efficient weight matrix is difficult to estimate, and (ii) the estimator tends to bias toward innovations with variances below one. Both issues can be addressed by using the weighting matrix $W(B)=	\left(  {D}(B) {W}  {D}(B)  \right)$ where ${W}$  is the efficient weight matrix assuming serially and mutually independent shocks, and   ${D}(B) :=\text{diag} \left( \prod_{i=1}^{n}  {d}(B)_i^{ m_{i}(1)}   ,...,   \prod_{i=1}^{n} {d}(B)_i^{ m_{i}(K)}  \right)$ with ${d}(B)_i := \frac{1}{ \sqrt{1/T \sum_{t=1}^{T}e(B)_{it}^2 }} $  such that it scales each moment condition by the inverse standard deviations of the involved innovations.  


 
