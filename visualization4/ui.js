

// UI Initialization
function setupStickyInputContainer() {
    // Setup sticky input container
    const inputContainer = document.querySelector('.input-container');
  
    if (inputContainer) {
      const inputContainerTop = inputContainer.offsetTop;
      const paddingTop = 15; // Account for the existing padding-top
    
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

  
  
  
  
  function setupNavigationMenu() {
     // Setup navigation menu toggle
  document.getElementById('menu-toggle').addEventListener('click', function() {
    document.querySelector('nav').classList.toggle('expanded');
  });

  // Setup navigation links
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
      // If it's not a hash link, let the browser handle navigation
    });
  });
}