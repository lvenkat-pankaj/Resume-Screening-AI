const { sanitizeInput, escapePromptText } = require('./input-sanitizer');

const prompts = {
  extraction: (resume, jobDescription) => {
    const cleanResume = escapePromptText(sanitizeInput(resume));
    const cleanJobDesc = jobDescription ? escapePromptText(sanitizeInput(jobDescription)) : '';
    return `You are an expert recruiter and resume analyst. Analyze the following resume and job description to assess candidate fit.

Resume:
${cleanResume}

Job Description (or Senior SDE role if not provided):
${cleanJobDesc || 'Senior Software Engineer: Looking for candidate with 5+ years of experience in full-stack development, proficiency in Node.js and React, cloud deployment experience (AWS/GCP), and strong system design skills.'}

Extract and return ONLY a valid JSON object with NO markdown formatting, with the following structure:
{
  "skills": ["skill1", "skill2", "skill3"],
  "experience_years": <number>,
  "strengths": ["strength1", "strength2", "strength3"],
  "missing_skills": ["missing1", "missing2"],
  "match_score": <number between 0 and 100>,
  "match_reasons": "explanation of score"
}

Rules:
- Match score: 0-100, where 100 is perfect match
- Return ONLY JSON, no markdown backticks or extra text
- Ensure valid JSON syntax`;
  },

  interview: (skills, matchReason) => `You are an expert technical interviewer. Based on the candidate's skills and profile, generate 5 advanced technical interview questions.

Candidate Skills: ${Array.isArray(skills) ? skills.map(s => escapePromptText(sanitizeInput(s))).join(', ') : 'N/A'}
Profile Summary: ${escapePromptText(sanitizeInput(matchReason))}

Generate 5 challenging technical questions appropriate for this candidate's skill level. Return ONLY a valid JSON object with NO markdown formatting:
{
  "questions": ["q1", "q2", "q3", "q4", "q5"],
  "difficulty": "advanced"
}

Rules:
- Questions should be challenging but solvable for someone with these skills
- Include mix of design, coding, and behavioral questions
- Return ONLY JSON, no markdown backticks or extra text`,

  rejection: (missingSkills, strengths) => `You are an experienced recruiter. A candidate did not meet the minimum requirements for this role. Provide constructive feedback and improvement suggestions.

Candidate Strengths: ${Array.isArray(strengths) ? strengths.map(s => escapePromptText(sanitizeInput(s))).join(', ') : 'N/A'}
Missing Critical Skills: ${Array.isArray(missingSkills) ? missingSkills.map(s => escapePromptText(sanitizeInput(s))).join(', ') : 'N/A'}

Provide constructive feedback and concrete improvement suggestions. Return ONLY a valid JSON object with NO markdown formatting:
{
  "rejection_reason": "explanation of why candidate doesn't meet requirements",
  "improvement_suggestions": ["s1", "s2", "s3"],
  "time_to_reapply": "estimated time to develop needed skills"
}

Rules:
- Be respectful and constructive
- Provide concrete, actionable suggestions
- Estimate realistic timeframes for skill development
- Return ONLY JSON, no markdown backticks or extra text`,

  summary: (candidateProfile, matched, details) => `You are an executive recruiter. Write a professional summary for a resume screening decision.

Candidate Profile:
- Match Score: ${candidateProfile.match_score}
- Experience: ${candidateProfile.experience_years} years
- Key Skills: ${Array.isArray(candidateProfile.skills) ? candidateProfile.skills.map(s => escapePromptText(sanitizeInput(s))).join(', ') : 'N/A'}

Decision: ${matched ? 'MATCHED - Proceed to interview' : 'NOT MATCHED - Needs development'}

Details:
${escapePromptText(sanitizeInput(details))}

Write a 100-150 word executive recruiter summary. Return ONLY a valid JSON object with NO markdown formatting:
{
  "summary": "professional summary text",
  "recommendation": "${matched ? 'PROCEED_TO_INTERVIEW' : 'REQUEST_IMPROVEMENT'}",
  "next_steps": ["a1", "a2", "a3"]
}

Rules:
- Summary should be professional and concise
- Focus on potential and next steps
- Return ONLY JSON, no markdown backticks or extra text`
};

module.exports = prompts;
