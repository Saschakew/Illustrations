import { updateB0Matrix, updateBMatrix, updateChartWithPhi, generateNewData } from './dataProcessing.js';

export function setupEventListeners() {
  document.getElementById('menu-toggle').addEventListener('click', function() {
    document.querySelector('nav').classList.toggle('expanded');
  });

  document.addEventListener('DOMContentLoaded', function() {
    const inputContainer = document.querySelector('.input-container');
    const inputContainerTop = inputContainer.offsetTop;

    function handleScroll() {
      if (window.pageYOffset > inputContainerTop) {
        inputContainer.classList.add('sticky');
        document.body.style.paddingTop = inputContainer.offsetHeight + 'px';
      } else {
        inputContainer.classList.remove('sticky');
        document.body.style.paddingTop = 0;
      }
    }

    window.addEventListener('scroll', handleScroll);
  });

  document.querySelectorAll('nav ul li a').forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href.startsWith('#')) {
        e.preventDefault();
        document.querySelectorAll('.page').forEach(page => {
          page.style.display = 'none';
        });
        const activePage = document.querySelector(href);
        if (activePage) {
          activePage.style.display = 'block';
        }
      }
    });
  });

  document.getElementById('phi0').addEventListener('input', function() {
    const phiValue0 = parseFloat(this.value);
    document.getElementById('phi0Value').textContent = phiValue0.toFixed(2);
    updateB0Matrix(phiValue0);
    updateChartWithPhi();
  });

  const phiElement = document.getElementById('phi');
  if (phiElement) {
    phiElement.addEventListener('input', function() {
      const phiValue = parseFloat(this.value);
      document.getElementById('phiValue').textContent = phiValue.toFixed(2);
      updateBMatrix(phiValue);
      updateChartWithPhi();   
    });
  }

  document.getElementById('T').addEventListener('input', function() {
    generateNewData();
  });
}