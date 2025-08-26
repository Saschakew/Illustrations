function getInputValue(elementId, defaultValue = 0) {
    const element = document.getElementById(elementId);
    if (element) {
      const parsed = parseFloat(element.value);
      // Only fall back when the value is not a valid number (e.g., empty or NaN).
      return Number.isNaN(parsed) ? defaultValue : parsed;
    } else {
      console.log(`Element with id '${elementId}' not found. Using default value.`);
      return defaultValue;
    }
  }