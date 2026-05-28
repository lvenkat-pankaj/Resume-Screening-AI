// Resume Screening Workflow Engine

const { callHuggingFace, extractJSON } = require('./hf-service');
const prompts = require('../utils/prompts');
const { validateCompleteWorkflow, sanitizeResponse } = require('../utils/safety-validator');

/**
 * Main workflow: Screen resume through 3-step process
 * @param {string} redactedResume - PII-redacted resume text
 * @param {string} jobDescription - Optional job description
 * @returns {Promise<Object>} Complete workflow results
 */
async function screenResume(redactedResume, jobDescription) {
  const workflow = {};

  try {
    // Step 1: Extract skills and calculate match score
    console.log('Step 1: Extracting resume data...');
    workflow.step1_extraction = await extractResume(redactedResume, jobDescription);

    if (!workflow.step1_extraction || typeof workflow.step1_extraction.match_score !== 'number') {
      throw new Error('Invalid extraction response: missing match_score');
    }

    // Step 2: Decision logic and conditional generation
    console.log('Step 2: Making decision and generating response...');
    const matched = workflow.step1_extraction.match_score >= 70;
    workflow.decision = {
      match_score: workflow.step1_extraction.match_score,
      threshold: 70,
      matched,
      path: matched ? 'INTERVIEW' : 'REJECTION'
    };

    if (matched) {
      workflow.step2_generation = await generateInterviewQuestions(
        workflow.step1_extraction.skills,
        workflow.step1_extraction.match_reasons
      );

      if (!Array.isArray(workflow.step2_generation.questions) || workflow.step2_generation.questions.length === 0) {
        throw new Error('Invalid interview generation: no questions');
      }
    } else {
      workflow.step2_generation = await generateRejectionGuidance(
        workflow.step1_extraction.missing_skills,
        workflow.step1_extraction.strengths
      );

      if (!Array.isArray(workflow.step2_generation.improvement_suggestions) || workflow.step2_generation.improvement_suggestions.length === 0) {
        throw new Error('Invalid rejection guidance: no suggestions');
      }
    }

    // Step 3: Generate recruiter summary
    console.log('Step 3: Generating recruiter summary...');
    workflow.step3_summary = await generateSummary(
      {
        match_score: workflow.step1_extraction.match_score,
        experience_years: workflow.step1_extraction.experience_years,
        skills: workflow.step1_extraction.skills
      },
      matched,
      JSON.stringify(workflow.step2_generation, null, 2)
    );

    if (!workflow.step3_summary || !workflow.step3_summary.summary) {
      throw new Error('Invalid summary response: missing summary text');
    }

    // AI Safety: Validate complete workflow
    console.log('🔒 AI Safety: Validating complete workflow...');
    const safetyValidation = validateCompleteWorkflow(workflow);
    if (!safetyValidation.isValid) {
      console.error('❌ Safety validation failed:', safetyValidation.errors);
      throw new Error(`Safety validation failed: ${safetyValidation.errors[0]}`);
    }
    console.log('✅ Safety validation passed');

    // AI Safety: Sanitize response to remove harmful content
    console.log('🔒 AI Safety: Sanitizing response...');
    const sanitizedWorkflow = sanitizeResponse(workflow);

    return sanitizedWorkflow;
  } catch (error) {
    console.error('Workflow error:', error);
    throw error;
  }
}

/**
 * Step 1: Extract resume information
 */
async function extractResume(resume, jobDescription) {
  try {
    const prompt = prompts.extraction(resume, jobDescription);
    const response = await callHuggingFace('extraction', prompt);
    const data = extractJSON(response);

    // Validate required fields
    if (typeof data.match_score !== 'number' || data.match_score < 0 || data.match_score > 100) {
      throw new Error('Invalid match_score in extraction response');
    }

    if (!Array.isArray(data.skills)) {
      throw new Error('Skills must be an array');
    }

    return {
      skills: data.skills || [],
      experience_years: data.experience_years || 0,
      strengths: data.strengths || [],
      missing_skills: data.missing_skills || [],
      match_score: Math.round(data.match_score),
      match_reasons: data.match_reasons || 'N/A'
    };
  } catch (error) {
    const err = new Error(`Extraction failed: ${error.message}`);
    err.code = 'INVALID_EXTRACTION';
    err.step = 1;
    throw err;
  }
}

/**
 * Step 2A: Generate interview questions (for matched candidates)
 */
async function generateInterviewQuestions(skills, matchReason) {
  try {
    const prompt = prompts.interview(skills, matchReason);
    const response = await callHuggingFace('interview', prompt);
    const data = extractJSON(response);

    if (!Array.isArray(data.questions)) {
      throw new Error('Questions must be an array');
    }

    return {
      questions: data.questions || [],
      difficulty: data.difficulty || 'advanced'
    };
  } catch (error) {
    const err = new Error(`Interview generation failed: ${error.message}`);
    err.code = 'INTERVIEW_GENERATION_FAILED';
    err.step = 2;
    throw err;
  }
}

/**
 * Step 2B: Generate rejection guidance (for non-matched candidates)
 */
async function generateRejectionGuidance(missingSkills, strengths) {
  try {
    const prompt = prompts.rejection(missingSkills, strengths);
    const response = await callHuggingFace('rejection', prompt);
    const data = extractJSON(response);

    if (!Array.isArray(data.improvement_suggestions)) {
      throw new Error('Suggestions must be an array');
    }

    return {
      rejection_reason: data.rejection_reason || 'N/A',
      improvement_suggestions: data.improvement_suggestions || [],
      time_to_reapply: data.time_to_reapply || '6-12 months'
    };
  } catch (error) {
    const err = new Error(`Rejection guidance failed: ${error.message}`);
    err.code = 'REJECTION_GENERATION_FAILED';
    err.step = 2;
    throw err;
  }
}

/**
 * Step 3: Generate recruiter summary
 */
async function generateSummary(candidateProfile, matched, details) {
  try {
    const prompt = prompts.summary(candidateProfile, matched, details);
    const response = await callHuggingFace('summary', prompt);
    const data = extractJSON(response);

    if (!Array.isArray(data.next_steps)) {
      throw new Error('Next steps must be an array');
    }

    return {
      summary: data.summary || 'N/A',
      recommendation: data.recommendation || (matched ? 'PROCEED_TO_INTERVIEW' : 'REQUEST_IMPROVEMENT'),
      next_steps: data.next_steps || []
    };
  } catch (error) {
    const err = new Error(`Summary generation failed: ${error.message}`);
    err.code = 'SUMMARY_GENERATION_FAILED';
    err.step = 3;
    throw err;
  }
}

module.exports = {
  screenResume,
  extractResume,
  generateInterviewQuestions,
  generateRejectionGuidance,
  generateSummary
};
