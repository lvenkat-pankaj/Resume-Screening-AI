// Input sanitization to prevent prompt injection attacks

/**
 * Sanitize user input to prevent prompt injection
 * @param {string} input - User-supplied input
 * @returns {string} Sanitized input
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove control characters and invisible characters
  let sanitized = input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    .trim();

  // Limit consecutive newlines to prevent prompt injection via whitespace
  sanitized = sanitized.replace(/\n\n\n+/g, '\n\n');

  // Remove escaped newlines and tabs that could be used for injection
  sanitized = sanitized.replace(/\\n|\\r|\\t/g, ' ');

  return sanitized;
}

/**
 * Escape special characters in prompt context
 * Used when inserting user input into LLM prompts
 * @param {string} text - Text to escape
 * @returns {string} Escaped text safe for prompts
 */
function escapePromptText(text) {
  if (typeof text !== 'string') {
    return '';
  }

  // Escape quotes and backslashes
  let escaped = text
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'");

  return escaped;
}

/**
 * Validate that input doesn't contain suspicious patterns
 * @param {string} input - Input to validate
 * @returns {boolean} True if input is valid
 */
function isSuspiciousInput(input) {
  if (typeof input !== 'string') {
    return false;
  }

  const suspiciousPatterns = [
    /ignore.*instructions/i,
    /forget.*everything/i,
    /system.*prompt/i,
    /reset.*instructions/i,
    /override.*rules/i,
    /disregard.*rules/i,
    /following.*instructions/i,
    /new.*instructions/i,
  ];

  return suspiciousPatterns.some(pattern => pattern.test(input));
}

module.exports = {
  sanitizeInput,
  escapePromptText,
  isSuspiciousInput,
};
