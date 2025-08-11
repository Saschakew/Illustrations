function createEventListener(elementId, ...callbacks) {
  const element = document.getElementById(elementId);
  if (element) {
    element.addEventListener('input', function() {
      const value = parseFloat(this.value);
      
      // Update the value display element if it exists
      const valueDisplayElement = document.getElementById(`${elementId}Value`);
      if (valueDisplayElement) {
        valueDisplayElement.textContent = value.toFixed(2);
      }
      
      // Execute all provided callback functions
      callbacks.forEach(callback => {
        if (typeof callback === 'function') {
          callback(value, elementId);
        }
      });

      //console.log(`Updated value for ${elementId}: ${value}`);
      
      // Return the current value
      return value;
    });
    
    // Return the initial value
    return parseFloat(element.value);
  } else {
    console.log(`Element with id '${elementId}' not found`);
    return null;
  }
}