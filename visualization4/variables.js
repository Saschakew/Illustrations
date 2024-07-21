function getInputValue(elementId, defaultValue = 0) {
    const element = document.getElementById(elementId);
    if (element) {
      return parseFloat(element.value) || defaultValue;
    } else {
      console.log(`Element with id '${elementId}' not found. Using default value.`);
      return defaultValue;
    }
  }