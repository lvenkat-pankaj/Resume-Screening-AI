/**
 * LLM Output Safety Validator
 *
 * Validates all LLM responses before returning to users
 * Prevents harmful content, misinformation, and unsafe outputs
 */

const SAFETY_RULES = {
  // Harmful content detection
  HARMFUL_PATTERNS: [
    /illegal/i,
    /harm|hurt|violence|attack/i,
    /hack|exploit|vulnerability/i,
    /discriminat|racist|sexist/i,
    /hate|slur/i,
  ],

  // Misinformation detection
  MISINFORMATION_PATTERNS: [
    /definitely\s+(?:not\s+)?(?:true|false)/i,
    /100%\s+(?:certain|sure)/i,
    /guarantee/i,
  ],

  // Quality checks
  MIN_RESPONSE_LENGTH: 10,
  MAX_RESPONSE_LENGTH: 5000,

  // Field-specific rules
  FIELD_RULES: {
    match_score: {
      type: 'number',
      min: 0,
      max: 100,
      description: 'Match score must be 0-100'
    },
    skills: {
      type: 'array',
      minLength: 1,
      maxLength: 20,
      description: 'Skills array must have 1-20 items'
    },
    questions: {
      type: 'array',
      minLength: 5,
      maxLength: 10,
      description: 'Interview questions must be 5-10 items'
    },
    summary: {
      type: 'string',
      minLength: 50,
      maxLength: 2000,
      description: 'Summary must be 50-2000 characters'
    },
    improvement_suggestions: {
      type: 'array',
      minLength: 2,
      maxLength: 10,
      description: 'Improvement suggestions must have 2-10 items'
    },
    recommendation: {
      type: 'string',
      enum: ['PROCEED_TO_INTERVIEW', 'REQUEST_IMPROVEMENT'],
      description: 'Recommendation must be valid enum value'
    }
  }
};

/**
 * Validates LLM response for harmful content
 * @param {string} text - Text to validate
 * @param {string} fieldName - Name of field being validated
 * @returns {Object} Validation result { isValid: bool, error: string|null }
 */
function validateHarmfulContent(text, fieldName = 'response') {
  if (!text || typeof text !== 'string') {
    return { isValid: true }; // Skip validation for non-strings
  }

  // Check for harmful patterns
  for (const pattern of SAFETY_RULES.HARMFUL_PATTERNS) {
    if (pattern.test(text)) {
      return {
        isValid: false,
        error: `Harmful content detected in ${fieldName}: contains flagged pattern`,
        severity: 'HIGH'
      };
    }
  }

  // Check for misinformation patterns
  for (const pattern of SAFETY_RULES.MISINFORMATION_PATTERNS) {
    if (pattern.test(text)) {
      return {
        isValid: false,
        error: `Misinformation detected in ${fieldName}: contains overconfident claims`,
        severity: 'MEDIUM'
      };
    }
  }

  return { isValid: true };
}

/**
 * Validates response field against expected schema
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of field
 * @param {Object} rule - Validation rule from FIELD_RULES
 * @returns {Object} Validation result
 */
function validateFieldSchema(value, fieldName, rule) {
  // Type validation
  if (rule.type === 'number') {
    if (typeof value !== 'number') {
      return {
        isValid: false,
        error: `${fieldName} must be a number, got ${typeof value}`
      };
    }
    if (value < rule.min || value > rule.max) {
      return {
        isValid: false,
        error: `${fieldName} out of range: ${rule.min}-${rule.max}, got ${value}`
      };
    }
  }

  // Array validation
  if (rule.type === 'array') {
    if (!Array.isArray(value)) {
      return {
        isValid: false,
        error: `${fieldName} must be an array, got ${typeof value}`
      };
    }
    if (value.length < rule.minLength || value.length > rule.maxLength) {
      return {
        isValid: false,
        error: `${fieldName} length out of range: ${rule.minLength}-${rule.maxLength}, got ${value.length}`
      };
    }
    // Validate each item in array
    for (let i = 0; i < value.length; i++) {
      if (typeof value[i] !== 'string' || value[i].trim().length === 0) {
        return {
          isValid: false,
          error: `${fieldName}[${i}] must be non-empty string`
        };
      }
    }
  }

  // String validation
  if (rule.type === 'string') {
    if (typeof value !== 'string') {
      return {
        isValid: false,
        error: `${fieldName} must be a string, got ${typeof value}`
      };
    }
    if (value.length < rule.minLength || value.length > rule.maxLength) {
      return {
        isValid: false,
        error: `${fieldName} length out of range: ${rule.minLength}-${rule.maxLength}, got ${value.length}`
      };
    }

    // Check for harmful content in text fields
    const harmfulCheck = validateHarmfulContent(value, fieldName);
    if (!harmfulCheck.isValid) {
      return harmfulCheck;
    }
  }

  // Enum validation
  if (rule.enum) {
    if (!rule.enum.includes(value)) {
      return {
        isValid: false,
        error: `${fieldName} must be one of: ${rule.enum.join(', ')}, got ${value}`
      };
    }
  }

  return { isValid: true };
}

/**
 * Validates Step 1 extraction response
 * @param {Object} data - Extraction response
 * @returns {Object} Validation result
 */
function validateExtractionResponse(data) {
  const required = ['match_score', 'skills', 'strengths', 'missing_skills', 'match_reasons'];

  // Check required fields
  for (const field of required) {
    if (!(field in data)) {
      return {
        isValid: false,
        error: `Missing required field: ${field}`
      };
    }
  }

  // Validate match_score
  const scoreRule = SAFETY_RULES.FIELD_RULES.match_score;
  const scoreValidation = validateFieldSchema(data.match_score, 'match_score', scoreRule);
  if (!scoreValidation.isValid) return scoreValidation;

  // Validate skills array
  const skillsRule = SAFETY_RULES.FIELD_RULES.skills;
  const skillsValidation = validateFieldSchema(data.skills, 'skills', skillsRule);
  if (!skillsValidation.isValid) return skillsValidation;

  // Validate match_reasons text
  const reasonsCheck = validateHarmfulContent(data.match_reasons, 'match_reasons');
  if (!reasonsCheck.isValid) return reasonsCheck;

  // Validate strengths and missing_skills arrays
  if (!Array.isArray(data.strengths) || !Array.isArray(data.missing_skills)) {
    return {
      isValid: false,
      error: 'strengths and missing_skills must be arrays'
    };
  }

  return { isValid: true };
}

/**
 * Validates Step 2 interview generation response
 * @param {Object} data - Interview generation response
 * @returns {Object} Validation result
 */
function validateInterviewResponse(data) {
  // Check required fields
  if (!('questions' in data) || !('difficulty' in data)) {
    return {
      isValid: false,
      error: 'Missing required fields: questions, difficulty'
    };
  }

  // Validate questions array
  const questionsRule = SAFETY_RULES.FIELD_RULES.questions;
  const questionsValidation = validateFieldSchema(data.questions, 'questions', questionsRule);
  if (!questionsValidation.isValid) return questionsValidation;

  // Validate difficulty level
  if (!['easy', 'intermediate', 'advanced'].includes(data.difficulty)) {
    return {
      isValid: false,
      error: `Invalid difficulty level: ${data.difficulty}`
    };
  }

  return { isValid: true };
}

/**
 * Validates Step 2 rejection guidance response
 * @param {Object} data - Rejection guidance response
 * @returns {Object} Validation result
 */
function validateRejectionResponse(data) {
  // Check required fields
  if (!('rejection_reason' in data) || !('improvement_suggestions' in data)) {
    return {
      isValid: false,
      error: 'Missing required fields: rejection_reason, improvement_suggestions'
    };
  }

  // Validate rejection_reason text
  const reasonCheck = validateHarmfulContent(data.rejection_reason, 'rejection_reason');
  if (!reasonCheck.isValid) return reasonCheck;

  // Validate improvement_suggestions array
  const suggestionsRule = SAFETY_RULES.FIELD_RULES.improvement_suggestions;
  const suggestionsValidation = validateFieldSchema(
    data.improvement_suggestions,
    'improvement_suggestions',
    suggestionsRule
  );
  if (!suggestionsValidation.isValid) return suggestionsValidation;

  return { isValid: true };
}

/**
 * Validates Step 3 summary response
 * @param {Object} data - Summary response
 * @returns {Object} Validation result
 */
function validateSummaryResponse(data) {
  // Check required fields
  if (!('summary' in data) || !('recommendation' in data) || !('next_steps' in data)) {
    return {
      isValid: false,
      error: 'Missing required fields: summary, recommendation, next_steps'
    };
  }

  // Validate summary text
  const summaryRule = SAFETY_RULES.FIELD_RULES.summary;
  const summaryValidation = validateFieldSchema(data.summary, 'summary', summaryRule);
  if (!summaryValidation.isValid) return summaryValidation;

  // Validate recommendation
  const recommendationRule = SAFETY_RULES.FIELD_RULES.recommendation;
  const recommendationValidation = validateFieldSchema(
    data.recommendation,
    'recommendation',
    recommendationRule
  );
  if (!recommendationValidation.isValid) return recommendationValidation;

  // Validate next_steps array
  if (!Array.isArray(data.next_steps) || data.next_steps.length === 0) {
    return {
      isValid: false,
      error: 'next_steps must be a non-empty array'
    };
  }

  return { isValid: true };
}

/**
 * Main validation function for complete workflow
 * @param {Object} workflow - Complete workflow response
 * @returns {Object} Validation result with summary
 */
function validateCompleteWorkflow(workflow) {
  const results = {
    isValid: true,
    validations: [],
    errors: []
  };

  // Validate extraction
  const extractionValidation = validateExtractionResponse(workflow.step1_extraction);
  results.validations.push({
    step: 'extraction',
    result: extractionValidation
  });
  if (!extractionValidation.isValid) {
    results.isValid = false;
    results.errors.push(`Step 1 (Extraction): ${extractionValidation.error}`);
  }

  // Validate decision
  if (!workflow.decision || typeof workflow.decision.matched !== 'boolean') {
    results.isValid = false;
    results.errors.push('Invalid decision object');
  }

  // Validate Step 2 based on decision
  if (workflow.decision.matched) {
    const interviewValidation = validateInterviewResponse(workflow.step2_generation);
    results.validations.push({
      step: 'interview_generation',
      result: interviewValidation
    });
    if (!interviewValidation.isValid) {
      results.isValid = false;
      results.errors.push(`Step 2A (Interview): ${interviewValidation.error}`);
    }
  } else {
    const rejectionValidation = validateRejectionResponse(workflow.step2_generation);
    results.validations.push({
      step: 'rejection_guidance',
      result: rejectionValidation
    });
    if (!rejectionValidation.isValid) {
      results.isValid = false;
      results.errors.push(`Step 2B (Rejection): ${rejectionValidation.error}`);
    }
  }

  // Validate summary
  const summaryValidation = validateSummaryResponse(workflow.step3_summary);
  results.validations.push({
    step: 'summary',
    result: summaryValidation
  });
  if (!summaryValidation.isValid) {
    results.isValid = false;
    results.errors.push(`Step 3 (Summary): ${summaryValidation.error}`);
  }

  return results;
}

/**
 * Sanitizes response to remove any potentially harmful content
 * @param {Object} data - Response object to sanitize
 * @returns {Object} Sanitized response
 */
function sanitizeResponse(data) {
  if (typeof data === 'string') {
    // Remove control characters
    let sanitized = data.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

    // Remove potential script content
    sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
    sanitized = sanitized.replace(/javascript:/gi, '');

    return sanitized;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeResponse(item));
  }

  if (typeof data === 'object' && data !== null) {
    const sanitized = {};
    for (const key in data) {
      sanitized[key] = sanitizeResponse(data[key]);
    }
    return sanitized;
  }

  return data;
}

module.exports = {
  validateHarmfulContent,
  validateExtractionResponse,
  validateInterviewResponse,
  validateRejectionResponse,
  validateSummaryResponse,
  validateCompleteWorkflow,
  sanitizeResponse,
  SAFETY_RULES
};
