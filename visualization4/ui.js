

// UI Initialization
function setupStickyInputContainer() {
    // Setup sticky input container
    const inputContainer = document.querySelector('.input-container');
  
    if (inputContainer) {
      const inputContainerTop = inputContainer.offsetTop;
      const paddingTop = 0; // Account for the existing padding-top
    
      function handleScroll() {
        if (window.pageYOffset > inputContainerTop - paddingTop) {
          inputContainer.classList.add('sticky');
          document.body.style.paddingTop = `${inputContainer.offsetHeight + paddingTop}px`;
        } else {
          inputContainer.classList.remove('sticky');
          document.body.style.paddingTop = `${paddingTop}px`;
        }
      }
    
      window.addEventListener('scroll', handleScroll);
    } else {
      console.log('Input container not found. Sticky functionality not applied.');
    }
  
}

  
function setupInputContentWrapper() {
  const inputToggle = document.getElementById('input-toggle');
  const inputContentWrapper = document.querySelector('.input-content-wrapper');
  const nav = document.querySelector('nav');

  if (inputToggle && inputContentWrapper) {
    inputToggle.addEventListener('click', function() {
      if (nav.classList.contains('expanded')) {
        nav.classList.remove('expanded');
      }
      inputContentWrapper.classList.toggle('expanded');
    });
  } else {
    console.log('Input toggle or wrapper not found. Expand/collapse functionality not applied.');
  }
}

function setupNavigationMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const nav = document.querySelector('nav');
  const inputContentWrapper = document.querySelector('.input-content-wrapper');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', function() {
      if (inputContentWrapper.classList.contains('expanded')) {
        inputContentWrapper.classList.remove('expanded');
      }
      nav.classList.toggle('expanded');
    });
  } else {
    console.log('Menu toggle or nav not found. Expand/collapse functionality not applied.');
  }
}