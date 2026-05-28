// Global Error Handler Middleware

function errorHandler(err, req, res, next) {
  console.error('Error:', {
    message: err.message,
    code: err.code,
    step: err.step,
    stack: err.stack
  });

  // HF Token missing
  if (err.message && err.message.includes('HF_TOKEN')) {
    return res.status(500).json({
      success: false,
      error: 'Server configuration error: HF_TOKEN not set',
      code: 'CONFIGURATION_ERROR'
    });
  }

  // LLM API errors
  if (err.message && err.message.includes('HF API')) {
    return res.status(503).json({
      success: false,
      error: 'AI service temporarily unavailable: ' + err.message,
      code: 'API_UNAVAILABLE',
      step: err.step
    });
  }

  // Extraction/Generation errors
  if (err.code) {
    return res.status(500).json({
      success: false,
      error: err.message,
      code: err.code,
      step: err.step
    });
  }

  // Generic error
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.path}`,
    code: 'NOT_FOUND'
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
