// Input Validation Middleware

/**
 * Validate resume input
 */
function validateResumeInput(req, res, next) {
  const { resume, jobDescription } = req.body;

  // Check resume exists
  if (!resume) {
    return res.status(400).json({
      success: false,
      error: 'Resume text is required',
      code: 'MISSING_RESUME'
    });
  }

  // Check resume is string
  if (typeof resume !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Resume must be a string',
      code: 'INVALID_RESUME_TYPE'
    });
  }

  // Check resume length
  const resumeLength = resume.trim().length;
  if (resumeLength < 100) {
    return res.status(400).json({
      success: false,
      error: 'Resume too short (minimum 100 characters)',
      code: 'RESUME_TOO_SHORT'
    });
  }

  if (resumeLength > 10000) {
    return res.status(400).json({
      success: false,
      error: 'Resume too long (maximum 10000 characters)',
      code: 'RESUME_TOO_LONG'
    });
  }

  // Validate job description if provided
  if (jobDescription) {
    if (typeof jobDescription !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Job description must be a string',
        code: 'INVALID_JOB_DESCRIPTION_TYPE'
      });
    }

    if (jobDescription.length > 5000) {
      return res.status(400).json({
        success: false,
        error: 'Job description too long (maximum 5000 characters)',
        code: 'JOB_DESCRIPTION_TOO_LONG'
      });
    }
  }

  // Sanitize inputs (remove excess whitespace)
  req.body.resume = resume.trim();
  if (jobDescription) {
    req.body.jobDescription = jobDescription.trim();
  }

  next();
}

module.exports = {
  validateResumeInput
};
