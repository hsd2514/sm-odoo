/**
 * Centralized error handling utility
 */

/**
 * Handle API errors and show user-friendly messages
 * @param {Error} error - The error object
 * @param {string} defaultMessage - Default message if error details not available
 * @param {Function} onError - Optional callback function
 */
export function handleApiError(error, defaultMessage = 'An error occurred', onError = null) {
  console.error('API Error:', error);
  
  let errorMessage = defaultMessage;
  
  if (error.response?.data?.detail) {
    errorMessage = error.response.data.detail;
  } else if (error.response?.data?.message) {
    errorMessage = error.response.data.message;
  } else if (error.message) {
    errorMessage = error.message;
  }
  
  // Show alert to user
  alert(errorMessage);
  
  // Call optional callback
  if (onError) {
    onError(error);
  }
}

/**
 * Show confirmation dialog
 * @param {string} message - Confirmation message
 * @returns {boolean} - True if confirmed, false otherwise
 */
export function confirmAction(message) {
  return window.confirm(message);
}

