

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

function createPopup(icon, className) {
  const content = icon.getAttribute(className === 'info-popup' ? 'data-info' : 'data-ref');
  
  // Remove any existing pop-ups
  const existingPopup = document.querySelector('.info-popup');
  if (existingPopup) {
    existingPopup.remove();
  }
  
  // Create and position the pop-up
  const popup = document.createElement('div');
  popup.className = className;
  popup.innerHTML = content;
  document.body.appendChild(popup);
  
  const iconRect = icon.getBoundingClientRect();
  popup.style.left = `${iconRect.left + window.scrollX}px`;
  popup.style.top = `${iconRect.bottom + window.scrollY + 5}px`;
  popup.style.display = 'block';
  
  // Ensure the popup doesn't go off-screen
  const popupRect = popup.getBoundingClientRect();
  if (popupRect.right > window.innerWidth) {
    popup.style.left = `${window.innerWidth - popupRect.width - 10}px`;
  }
  
  // Process LaTeX in the popup
  MathJax.typesetPromise([popup]).then(() => {
    // Reposition after typesetting (LaTeX rendering might change size)
    const newPopupRect = popup.getBoundingClientRect();
    if (newPopupRect.right > window.innerWidth) {
      popup.style.left = `${window.innerWidth - newPopupRect.width - 10}px`;
    }
  });
  
  // Close the pop-up when clicking outside
  document.addEventListener('click', function closePopup(event) {
    if (!popup.contains(event.target) && event.target !== icon) {
      popup.remove();
      document.removeEventListener('click', closePopup);
    }
  });
}

// Add event listeners for info and ref icons
function setupInfoIcons() {
  document.querySelectorAll('.info-icon').forEach(icon => {
    icon.addEventListener('click', function(e) {
      createPopup(this, 'info-popup');
      e.stopPropagation();
    });
  });
    
} 