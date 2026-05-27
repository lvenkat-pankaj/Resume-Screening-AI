// Results Panel Component
// Displays the complete screening results

export default function ResultsPanel({ results, onReset }) {
  if (!results || !results.workflow || !results.summary) {
    return (
      <div className="error-container">
        <h2>❌ Invalid Results</h2>
        <p>Received incomplete data from server.</p>
        <button onClick={onReset} className="btn-reset">
          Try Again
        </button>
      </div>
    );
  }

  const { workflow, summary } = results;
  const { step1_extraction: extraction, decision, step2_generation: generation } = workflow;

  if (!extraction || !decision || !generation) {
    return (
      <div className="error-container">
        <h2>❌ Missing Data</h2>
        <p>Some required data is missing from the response.</p>
        <button onClick={onReset} className="btn-reset">
          Try Again
        </button>
      </div>
    );
  }

  const isMatched = decision.matched === true;

  return (
    <div className="results-container">
      <div className="results-header">
        <h2>Screening Results</h2>
        <button onClick={onReset} className="btn-reset">
          Screen Another Resume
        </button>
      </div>

      {/* Match Score Banner */}
      <div className={`match-banner ${isMatched ? "matched" : "not-matched"}`}>
        <div className="score-display">
          <span className="score">{summary.candidate_match_score}%</span>
          <span className="label">Match Score</span>
        </div>
        <div className="status-info">
          <p className="status">{isMatched ? "✅ Strong Candidate" : "❌ Does Not Meet Requirements"}</p>
          <p className="threshold">
            Threshold: {decision.threshold}% • Path: {decision.path}
          </p>
        </div>
      </div>

      {/* Step 1: Extraction Results */}
      <div className="result-section">
        <h3>📊 Extracted Information (Step 1)</h3>
        <div className="info-grid">
          <div className="info-card">
            <h4>Skills</h4>
            <div className="tags">
              {Array.isArray(extraction.skills) && extraction.skills.length > 0 ? (
                extraction.skills.map((skill, idx) => (
                  <span key={idx} className="tag">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="no-data">No skills detected</p>
              )}
            </div>
          </div>

          <div className="info-card">
            <h4>Experience</h4>
            <p className="metric">{extraction.experience_years} years</p>
          </div>

          <div className="info-card">
            <h4>Key Strengths</h4>
            <ul className="list">
              {Array.isArray(extraction.strengths) && extraction.strengths.length > 0 ? (
                extraction.strengths.map((strength, idx) => (
                  <li key={idx}>{strength}</li>
                ))
              ) : (
                <li className="no-data">No strengths detected</li>
              )}
            </ul>
          </div>

          <div className="info-card">
            <h4>Missing Skills</h4>
            <div className="tags gap-red">
              {Array.isArray(extraction.missing_skills) && extraction.missing_skills.length > 0 ? (
                extraction.missing_skills.map((skill, idx) => (
                  <span key={idx} className="tag red">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="no-data">No missing skills</p>
              )}
            </div>
          </div>
        </div>
        <p className="reason">{extraction.match_reasons}</p>
      </div>

      {/* Step 2: Conditional Output */}
      <div className="result-section">
        {isMatched ? (
          <>
            <h3>🎯 Interview Questions (Step 2 - Matched Path)</h3>
            <div className="questions-list">
              {Array.isArray(generation.questions) && generation.questions.length > 0 ? (
                generation.questions.map((question, idx) => (
                  <div key={idx} className="question-item">
                    <span className="q-number">Q{idx + 1}</span>
                    <p>{question || "(Empty question)"}</p>
                  </div>
                ))
              ) : (
                <p className="no-data">No interview questions generated</p>
              )}
            </div>
            <p className="difficulty">Difficulty Level: {generation.difficulty || "Not specified"}</p>
          </>
        ) : (
          <>
            <h3>📝 Improvement Path (Step 2 - Not Matched)</h3>
            <div className="rejection-content">
              <p className="rejection-reason">
                <strong>Why Not Matched:</strong> {generation.rejection_reason || "No reason provided"}
              </p>
              <div className="suggestions">
                <h4>Improvement Suggestions:</h4>
                {Array.isArray(generation.improvement_suggestions) && generation.improvement_suggestions.length > 0 ? (
                  <ol>
                    {generation.improvement_suggestions.map((suggestion, idx) => (
                      <li key={idx}>{suggestion || "(Empty suggestion)"}</li>
                    ))}
                  </ol>
                ) : (
                  <p className="no-data">No suggestions provided</p>
                )}
              </div>
              <p className="reapply">
                <strong>Time to Reapply:</strong> {generation.time_to_reapply || "Not specified"}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Step 3: Summary */}
      <div className="result-section">
        <h3>📋 Recruiter Summary (Step 3)</h3>
        <div className="summary-box">
          <p>{summary.executive_summary || "(No summary provided)"}</p>
        </div>
        <div className="summary-meta">
          <p>
            <strong>Recommendation:</strong>{" "}
            <span className={`rec-badge ${(summary.recommendation || "").toLowerCase()}`}>
              {(summary.recommendation || "No recommendation").replace(/_/g, " ")}
            </span>
          </p>
          <div className="next-steps">
            <h4>Next Steps:</h4>
            {Array.isArray(summary.next_steps) && summary.next_steps.length > 0 ? (
              <ol>
                {summary.next_steps.map((step, idx) => (
                  <li key={idx}>{step || "(Empty step)"}</li>
                ))}
              </ol>
            ) : (
              <p className="no-data">No next steps provided</p>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .error-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 40px 20px;
          text-align: center;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .error-container h2 {
          color: #d32f2f;
          margin: 0 0 15px;
        }

        .error-container p {
          color: #666;
          margin: 0 0 20px;
        }

        .btn-reset {
          padding: 10px 20px;
          background: #4caf50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
        }

        .btn-reset:hover {
          background: #45a049;
        }

        .no-data {
          color: #999;
          font-style: italic;
          margin: 10px 0;
        }

        .results-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .results-header h2 {
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 36px;
          font-weight: 800;
        }

        .btn-reset {
          padding: 14px 32px;
          background: linear-gradient(135deg, #f093fb 0%, #764ba2 50%, #667eea 100%);
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 700;
          transition: all 0.3s ease;
          box-shadow: 0 6px 20px rgba(240, 147, 251, 0.4);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-size: 14px;
        }

        .btn-reset:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 10px 28px rgba(240, 147, 251, 0.5);
        }

        .match-banner {
          display: flex;
          align-items: center;
          gap: 30px;
          padding: 40px;
          border-radius: 14px;
          margin-bottom: 32px;
          color: white;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
          position: relative;
          overflow: hidden;
        }

        .match-banner.matched {
          background: linear-gradient(135deg, #10b981 0%, #059669 50%, #34d399 100%);
          background-size: 200% 200%;
          animation: matchGlow 3s ease infinite;
        }

        @keyframes matchGlow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .match-banner.matched::before {
          content: '✓';
          position: absolute;
          top: -30px;
          right: -30px;
          font-size: 120px;
          opacity: 0.15;
          animation: pulse 2s ease-in-out infinite;
        }

        .match-banner.not-matched {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #f87171 100%);
          background-size: 200% 200%;
          animation: rejectGlow 3s ease infinite;
        }

        @keyframes rejectGlow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .match-banner.not-matched::before {
          content: '✕';
          position: absolute;
          top: -30px;
          right: -30px;
          font-size: 120px;
          opacity: 0.15;
          animation: shake 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0) rotateZ(0); }
          25% { transform: translateX(-5px) rotateZ(-2deg); }
          75% { transform: translateX(5px) rotateZ(2deg); }
        }

        .score-display {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .score {
          font-size: 48px;
          font-weight: bold;
        }

        .label {
          font-size: 14px;
          opacity: 0.9;
        }

        .status-info {
          flex: 1;
        }

        .status {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .threshold {
          margin: 5px 0 0;
          font-size: 14px;
          opacity: 0.9;
        }

        .result-section {
          background: linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,255,0.95) 100%);
          border: 2px solid rgba(102, 126, 234, 0.2);
          border-radius: 14px;
          padding: 32px;
          margin-bottom: 28px;
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.12);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .result-section::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -10%;
          width: 250px;
          height: 250px;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="rgba(240,147,251,0.06)"/></svg>') no-repeat;
          background-size: contain;
          pointer-events: none;
        }

        .result-section:hover {
          border-color: rgba(240, 147, 251, 0.4);
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.18);
          transform: translateY(-2px);
        }

        .result-section h3 {
          margin-top: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 22px;
          font-weight: 700;
          position: relative;
          z-index: 1;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 18px;
          margin: 20px 0;
        }

        .info-card {
          background: linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%);
          padding: 20px;
          border-radius: 10px;
          border: 1px solid rgba(102, 126, 234, 0.1);
          transition: all 0.3s ease;
        }

        .info-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.15);
          border-color: rgba(102, 126, 234, 0.3);
        }

        .info-card h4 {
          margin-top: 0;
          color: #667eea;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin: 12px 0 0 0;
        }

        .tags.gap-red {
          gap: 10px;
        }

        .tag {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%);
          background-size: 200% 200%;
          color: white;
          padding: 9px 16px;
          border-radius: 25px;
          font-size: 13px;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          transition: all 0.3s ease;
          animation: tagGlow 3s ease infinite;
        }

        @keyframes tagGlow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .tag:hover {
          transform: scale(1.08) translateY(-2px);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
        }

        .tag.red {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #f87171 100%);
          background-size: 200% 200%;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .list li {
          padding: 6px 0;
          color: #555;
        }

        .list li:before {
          content: "✓ ";
          color: #4caf50;
          font-weight: bold;
        }

        .metric {
          margin: 0;
          font-size: 24px;
          font-weight: bold;
          color: #1976d2;
        }

        .reason {
          color: #666;
          font-size: 14px;
          margin-top: 10px;
        }

        .questions-list {
          background: #f9f9f9;
          padding: 15px;
          border-radius: 4px;
          margin: 15px 0;
        }

        .question-item {
          display: flex;
          gap: 15px;
          padding: 12px;
          margin: 8px 0;
          background: white;
          border-radius: 4px;
          border-left: 4px solid #2196f3;
        }

        .q-number {
          min-width: 40px;
          font-weight: bold;
          color: #2196f3;
        }

        .question-item p {
          margin: 0;
          color: #333;
        }

        .difficulty {
          color: #666;
          font-size: 14px;
          margin-top: 10px;
        }

        .rejection-content {
          background: #fff3cd;
          padding: 15px;
          border-radius: 4px;
          margin: 15px 0;
        }

        .rejection-reason {
          margin-top: 0;
          color: #856404;
        }

        .suggestions {
          background: white;
          padding: 12px;
          border-radius: 4px;
          margin: 12px 0;
        }

        .suggestions h4 {
          margin-top: 0;
          color: #333;
        }

        .suggestions ol {
          margin: 10px 0;
          color: #555;
        }

        .suggestions li {
          margin: 8px 0;
        }

        .reapply {
          color: #856404;
          margin-bottom: 0;
        }

        .summary-box {
          background: #f0f7ff;
          padding: 15px;
          border-radius: 4px;
          border-left: 4px solid #1976d2;
          line-height: 1.6;
          margin: 15px 0;
        }

        .summary-meta {
          margin-top: 15px;
        }

        .rec-badge {
          padding: 6px 12px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 12px;
        }

        .rec-badge.proceed_to_interview {
          background: #c8e6c9;
          color: #2e7d32;
        }

        .rec-badge.request_improvements {
          background: #ffccbc;
          color: #d84315;
        }

        .next-steps {
          background: #f5f5f5;
          padding: 12px;
          border-radius: 4px;
          margin-top: 12px;
        }

        .next-steps h4 {
          margin-top: 0;
        }

        .next-steps ol {
          margin: 10px 0;
          color: #555;
        }
      `}</style>
    </div>
  );
}
