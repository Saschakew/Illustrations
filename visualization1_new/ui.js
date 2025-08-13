

// UI Initialization
function setupStickyInputContainer() {
  // Removed JS-based sticky behavior to avoid layout shifts that caused the nav to flicker.
  // The nav already uses CSS `position: sticky; top: 0; z-index: 900;`, which is sufficient.
  // Intentionally no-op.
}

function positionPopup(popup, popupContent) {
  const inputContainer = document.querySelector('.input-container');
  const inputContainerRect = inputContainer.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const popupHeight = popupContent.offsetHeight;

  let topPosition = Math.max(inputContainerRect.bottom + 10, (viewportHeight - popupHeight) / 2);
  topPosition = Math.min(topPosition, viewportHeight - popupHeight - 10);

  popupContent.style.top = `${topPosition}px`;
  popupContent.style.transform = 'translateX(-50%)';
}

function setupPopup(popupIds) {
  popupIds.forEach(id => {
    const label = document.getElementById(`${id}-label`);
    const popup = document.getElementById(`${id}-popup`);
    if (!label || !popup) {
      try { console.warn(`[POPUPS] Skipping id="${id}": label or popup not found`); } catch (e) {}
      return;
    }
    const closeBtn = popup.querySelector('.close');
    const popupContent = popup.querySelector('.popup-content');

    // Ensure popup is hidden on page load
    popup.style.display = 'none';

    label.addEventListener('click', function(event) {
      event.preventDefault();
      popup.style.display = 'block';
      positionPopup(popup, popupContent);
    });

    closeBtn.addEventListener('click', function() {
      popup.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
      if (event.target == popup) {
        popup.style.display = 'none';
      }
    });
  });

  window.addEventListener('resize', function() {
    popupIds.forEach(id => {
      const popup = document.getElementById(`${id}-popup`);
      if (!popup) { return; }
      const popupContent = popup.querySelector('.popup-content');
      if (popup.style.display === 'block') {
        positionPopup(popup, popupContent);
      }
    });
  });

  window.addEventListener('scroll', function() {
    popupIds.forEach(id => {
      const popup = document.getElementById(`${id}-popup`);
      if (!popup) { return; }
      const popupContent = popup.querySelector('.popup-content');
      if (popup.style.display === 'block') {
        positionPopup(popup, popupContent);
      }
    });
  });
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
      // On pages without an input-content-wrapper (e.g., index), guard against null
      if (inputContentWrapper && inputContentWrapper.classList.contains('expanded')) {
        inputContentWrapper.classList.remove('expanded');
      }
      nav.classList.toggle('expanded');
    });
  } else {
    console.log('Menu toggle or nav not found. Expand/collapse functionality not applied.');
  }
}

function createPopup(icon, className) {
  console.debug('[POPUPS] createPopup called', { className, hasMathJax: !!(window.MathJax) });
  const content = icon.getAttribute(className === 'info-popup' ? 'data-info' : 'data-ref');
  if (!content) {
    console.warn('[POPUPS] No content found on icon for', className, icon);
  }
  
  // Remove any existing pop-ups
  const existingPopups = document.querySelectorAll('.info-popup, .ref-popup');
  if (existingPopups.length) {
    console.debug('[POPUPS] Removing existing popups:', existingPopups.length);
  }
  existingPopups.forEach(p => p.remove());
  
  // Create and position the pop-up
  const popup = document.createElement('div');
  popup.className = className;
  popup.innerHTML = content;
  document.body.appendChild(popup);
  
  const iconRect = icon.getBoundingClientRect();
  popup.style.left = `${iconRect.left + window.scrollX}px`;
  popup.style.top = `${iconRect.bottom + window.scrollY + 5}px`;
  popup.style.display = 'block';
  console.debug('[POPUPS] Popup created at', { left: popup.style.left, top: popup.style.top });
  
  // Ensure the popup doesn't go off-screen
  const popupRect = popup.getBoundingClientRect();
  if (popupRect.right > window.innerWidth) {
    popup.style.left = `${window.innerWidth - popupRect.width - 10}px`;
    console.debug('[POPUPS] Adjusted popup to fit viewport', { left: popup.style.left });
  }
  
  // Process LaTeX in the popup (guard if MathJax is unavailable)
  try {
    if (window.MathJax && MathJax.typesetPromise) {
      MathJax.typesetPromise([popup]).then(() => {
        // Reposition after typesetting (LaTeX rendering might change size)
        const newPopupRect = popup.getBoundingClientRect();
        if (newPopupRect.right > window.innerWidth) {
          popup.style.left = `${window.innerWidth - newPopupRect.width - 10}px`;
        }
        console.debug('[POPUPS] MathJax typeset complete for popup');
      }).catch(() => {});
    }
  } catch (e) {}
  
  // Close the pop-up when clicking outside
  document.addEventListener('click', function closePopup(event) {
    if (!popup.contains(event.target) && event.target !== icon) {
      popup.remove();
      document.removeEventListener('click', closePopup);
    }
  });
}

// Highlight the current page in the navigation and set aria-current
function setupActiveNavLink() {
  const links = document.querySelectorAll('nav a');
  if (!links || links.length === 0) return;
  const urlNoHashOrQuery = window.location.href.split('#')[0].split('?')[0];
  let path = urlNoHashOrQuery.split('/').pop();
  if (!path || path === '') path = 'index.html';
  links.forEach(a => {
    const href = a.getAttribute('href');
    if (href === path) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    } else {
      a.classList.remove('active');
      a.removeAttribute('aria-current');
    }
  });
}

// Add event listeners for info and ref icons
function setupInfoIcons() {
  const icons = document.querySelectorAll('.info-icon');
  console.debug('[POPUPS] setupInfoIcons: icons found =', icons.length);
  // Prevent duplicate delegated listeners if initializeCommonUI runs more than once
  if (document.__infoIconDelegated) {
    console.debug('[POPUPS] Delegated listener already attached');
    return;
  }
  document.addEventListener('click', function(e) {
    const icon = e.target && e.target.closest ? e.target.closest('.info-icon') : null;
    if (icon) {
      console.debug('[POPUPS] info-icon clicked', icon);
      e.stopPropagation();
      createPopup(icon, 'info-popup');
    }
  });
  // mark as attached
  document.__infoIconDelegated = true;
}

// Common UI initializer to reduce repetition across pages
function initializeCommonUI() {
  try { setupStickyInputContainer(); } catch (e) { console.warn('[UI] setupStickyInputContainer error', e); }
  try { setupNavigationMenu(); } catch (e) { console.warn('[UI] setupNavigationMenu error', e); }
  try { setupActiveNavLink(); } catch (e) { console.warn('[UI] setupActiveNavLink error', e); }
  try { setupInputContentWrapper(); } catch (e) { console.warn('[UI] setupInputContentWrapper error', e); }

  console.debug('[UI] initializeCommonUI completed');
}