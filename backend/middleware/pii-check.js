// PII Detection and Redaction Middleware

const { detectPII, redactPII, verifyRedaction } = require('../utils/pii-patterns');

/**
 * Check for PII in resume
 * If found, return alert to frontend
 * If not found, proceed to redaction
 */
function checkPII(req, res, next) {
  const { resume } = req.body;

  const detected = detectPII(resume);

  if (detected.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Personal information detected in resume',
      code: 'PII_DETECTED',
      detectedPII: detected.map(p => ({
        type: p.type,
        label: p.label,
        count: p.count,
        sample: p.sample
      })),
      instruction: `We detected ${detected.length} type(s) of personal information in your resume. For your privacy and security, please remove this information before submission. Detected:\n${detected.map(p => `- ${p.label} (${p.count} found)`).join('\n')}`
    });
  }

  next();
}

/**
 * Redact PII from resume before LLM processing
 */
function redactPIIMiddleware(req, res, next) {
  const { resume } = req.body;

  // Redact PII
  const redacted = redactPII(resume);

  // Verify redaction was successful
  const remaining = verifyRedaction(redacted);
  if (remaining.length > 0) {
    return res.status(500).json({
      success: false,
      error: 'Failed to redact all personal information',
      code: 'REDACTION_FAILED',
      remaining: remaining.map(p => p.label)
    });
  }

  // Store redacted version
  req.body.redactedResume = redacted;

  next();
}

module.exports = {
  checkPII,
  redactPIIMiddleware
};
