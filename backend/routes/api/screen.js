// Resume Screening API Endpoint

const express = require('express');
const router = express.Router();
const { validateResumeInput } = require('../../middleware/validators');
const { checkPII, redactPIIMiddleware } = require('../../middleware/pii-check');
const { screenResume } = require('../../services/workflow-engine');
const analyticsEngine = require('../../services/analytics-engine');
const crypto = require('crypto');

/**
 * POST /api/screen
 * Screen a resume and return AI analysis
 *
 * Request:
 * {
 *   "resume": "Resume text...",
 *   "jobDescription": "Optional job description"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "workflow": { ... },
 *   "summary": { ... }
 * }
 */
router.post('/screen', validateResumeInput, checkPII, redactPIIMiddleware, async (req, res, next) => {
  const startTime = Date.now();
  const resumeHash = crypto.createHash('sha256').update(req.body.redactedResume).digest('hex').substring(0, 16);

  try {
    const { redactedResume, jobDescription } = req.body;

    console.log('Starting resume screening...');
    const workflow = await screenResume(redactedResume, jobDescription);

    // 📊 Record screening for analytics
    const processingTime = Date.now() - startTime;
    analyticsEngine.recordScreening({
      resumeHash,
      matchScore: workflow.step1_extraction.match_score,
      matched: workflow.decision.matched,
      skills: workflow.step1_extraction.skills,
      processingTime,
      skillsExtracted: true,
      questionsGenerated: !!workflow.step2_generation?.questions,
      summaryGenerated: !!workflow.step3_summary?.summary
    });

    // Prepare summary response
    const summary = {
      candidate_match_score: workflow.step1_extraction.match_score,
      recommendation: workflow.step3_summary.recommendation,
      executive_summary: workflow.step3_summary.summary,
      next_steps: workflow.step3_summary.next_steps
    };

    console.log(`✅ Screening completed in ${processingTime}ms`);

    return res.status(200).json({
      success: true,
      workflow,
      summary,
      processingTime
    });
  } catch (error) {
    // 📊 Log error to analytics
    analyticsEngine.logEvent('ERROR', {
      resumeHash,
      errorType: error.name,
      message: error.message,
      processingTime: Date.now() - startTime
    });

    next(error);
  }
});

/**
 * GET /health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
