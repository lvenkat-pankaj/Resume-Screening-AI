// PII Detection Patterns

const piiPatterns = {
  email: {
    pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    label: 'Email Address',
    example: 'john.doe@company.com'
  },
  phone: {
    pattern: /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
    label: 'Phone Number',
    example: '(555) 123-4567'
  },
  ssn: {
    pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
    label: 'Social Security Number',
    example: '123-45-6789'
  },
  dob: {
    pattern: /\b(0?[1-9]|1[0-2])[-\/](0?[1-9]|[12]\d|3[01])[-\/](\d{4}|\d{2})\b/g,
    label: 'Date of Birth',
    example: '01/15/1990'
  },
  address: {
    pattern: /\b\d+\s+[a-zA-Z]+\s+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Court|Ct|Drive|Dr|Lane|Ln)/gi,
    label: 'Street Address',
    example: '123 Main Street'
  },
  zipcode: {
    pattern: /\b\d{5}(?:-\d{4})?\b/g,
    label: 'ZIP Code',
    example: '12345 or 12345-6789'
  },
  linkedin: {
    pattern: /linkedin\.com\/in\/[\w\-]{5,30}/gi,
    label: 'LinkedIn Profile',
    example: 'linkedin.com/in/john-doe'
  },
  github: {
    pattern: /github\.com\/[\w\-]{1,39}/gi,
    label: 'GitHub Profile',
    example: 'github.com/john-doe'
  },
  url: {
    pattern: /https?:\/\/[^\s]+/g,
    label: 'Website/URL',
    example: 'https://example.com'
  }
};

/**
 * Detect PII in text
 * @param {string} text - Text to scan
 * @returns {Array} Array of detected PII with types and samples
 */
function detectPII(text) {
  if (!text || typeof text !== 'string') return [];

  const detected = [];
  const seenPatterns = new Set();

  for (const [key, config] of Object.entries(piiPatterns)) {
    const matches = text.match(config.pattern);
    if (matches) {
      // Avoid duplicate detections
      if (!seenPatterns.has(key)) {
        detected.push({
          type: key,
          label: config.label,
          count: matches.length,
          sample: matches[0],
          example: config.example
        });
        seenPatterns.add(key);
      }
    }
  }

  return detected;
}

/**
 * Redact PII from text
 * @param {string} text - Text to redact
 * @returns {string} Text with PII replaced with [REDACTED]
 */
function redactPII(text) {
  if (!text || typeof text !== 'string') return text;

  let redacted = text;

  for (const [key, config] of Object.entries(piiPatterns)) {
    redacted = redacted.replace(config.pattern, '[REDACTED]');
  }

  return redacted;
}

/**
 * Verify PII has been successfully redacted
 * @param {string} text - Text to verify
 * @returns {Array} Any remaining PII found
 */
function verifyRedaction(text) {
  return detectPII(text);
}

module.exports = {
  piiPatterns,
  detectPII,
  redactPII,
  verifyRedaction
};
