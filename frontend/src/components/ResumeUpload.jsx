// Resume Upload Form Component

import { useState, useEffect } from "react";
import { screenResume } from "../api/client";
import PIIAlert from "./PIIAlert";
import LoadingIndicator from "./LoadingIndicator";
import ResultsPanel from "./ResultsPanel";

export default function ResumeUpload() {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [piiAlert, setPIIAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    let timeoutId;
    if (loading) {
      timeoutId = setTimeout(() => {
        setLoadingTimeout(true);
      }, 45000);
    }
    return () => clearTimeout(timeoutId);
  }, [loading]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setResume(event.target.result);
        setError(null);
        setResults(null);
      };
      reader.readAsText(file);
    }
  };

  const handleTextChange = (e) => {
    setResume(e.target.value);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!resume.trim()) {
      setError("Please provide a resume");
      return;
    }

    if (resume.trim().length < 100) {
      setError("Resume must be at least 100 characters");
      return;
    }

    setLoading(true);
    setLoadingTimeout(false);
    setError(null);
    setResults(null);
    setPIIAlert(null);

    const result = await screenResume(resume, jobDescription);

    setLoading(false);
    setLoadingTimeout(false);

    if (!result.success) {
      if (result.code === "PII_DETECTED" || result.error === "PII_DETECTED") {
        setPIIAlert({
          detectedPII: result.detectedPII || [],
          instruction: result.instruction || "Please remove the detected personal information and try again.",
        });
      } else if (result.error === "REQUEST_TIMEOUT" || result.error === "NETWORK_ERROR") {
        setError(result.message + " Try with a shorter resume or check your internet connection.");
      } else {
        setError(result.message || "An error occurred. Please try again.");
      }
      return;
    }

    if (result.workflow && result.summary) {
      setResults(result);
    } else {
      setError("Received incomplete response from server. Please try again.");
    }
  };

  if (piiAlert) {
    return (
      <PIIAlert
        detectedPII={piiAlert.detectedPII}
        instruction={piiAlert.instruction}
        onDismiss={() => setPIIAlert(null)}
      />
    );
  }

  if (results) {
    return (
      <ResultsPanel
        results={results}
        onReset={() => {
          setResults(null);
          setResume("");
          setJobDescription("");
        }}
      />
    );
  }

  return (
    <div className="upload-container">
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Resume Screening AI</h2>
          <p className="subtitle">
            Upload your resume for AI-powered analysis and interview preparation
          </p>
        </div>

        <div className="form-group">
          <label>Resume Text *</label>
          <textarea
            value={resume}
            onChange={handleTextChange}
            placeholder="Paste your resume here or upload a file..."
            rows="10"
            required
          />
          <small>Min 100 characters • Max 5000 characters</small>
        </div>

        <div className="form-group">
          <label htmlFor="file-upload">Or upload a file:</label>
          <input
            id="file-upload"
            type="file"
            accept=".txt,.pdf"
            onChange={handleFileUpload}
          />
        </div>

        <div className="form-group">
          <label>Job Description (Optional)</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description for better matching..."
            rows="6"
          />
          <small>If not provided, defaults to Senior SDE role</small>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={loading} className="btn-submit">
          {loading ? "Analyzing..." : "Screen Resume"}
        </button>
      </form>

      {loading && (
        <div className="loading-overlay">
          <LoadingIndicator step={loading ? 1 : 0} totalSteps={3} />
          {loadingTimeout && (
            <div className="timeout-warning">
              <p>⏱️ This is taking longer than expected. Please wait a bit longer or try with a shorter resume.</p>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .upload-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          position: relative;
        }

        .upload-container::before {
          content: '';
          position: absolute;
          top: -100px;
          left: -50px;
          width: 400px;
          height: 400px;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240"><defs><linearGradient id="paperGrad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"><stop offset="0%25" style="stop-color:rgba(102,126,234,0.2)"/><stop offset="100%25" style="stop-color:rgba(118,75,162,0.1)"/></linearGradient></defs><g transform="translate(10,10)"><rect x="20" y="20" width="160" height="200" rx="10" fill="url(%23paperGrad)" stroke="rgba(102,126,234,0.3)" stroke-width="2"/><circle cx="50" cy="50" r="12" fill="rgba(102,126,234,0.2)"/><line x1="70" y1="45" x2="170" y2="45" stroke="rgba(102,126,234,0.2)" stroke-width="2"/><line x1="70" y1="65" x2="170" y2="65" stroke="rgba(102,126,234,0.2)" stroke-width="2"/><line x1="30" y1="95" x2="170" y2="95" stroke="rgba(102,126,234,0.15)" stroke-width="2"/><line x1="30" y1="115" x2="170" y2="115" stroke="rgba(102,126,234,0.15)" stroke-width="2"/><line x1="30" y1="135" x2="170" y2="135" stroke="rgba(102,126,234,0.15)" stroke-width="2"/><line x1="30" y1="155" x2="140" y2="155" stroke="rgba(102,126,234,0.15)" stroke-width="2"/><g transform="translate(50, 180)"><circle cx="0" cy="0" r="5" fill="rgba(102,126,234,0.2)"/><circle cx="20" cy="0" r="5" fill="rgba(102,126,234,0.2)"/><circle cx="40" cy="0" r="5" fill="rgba(102,126,234,0.2)"/></g></g></svg>') no-repeat;
          background-size: contain;
          opacity: 0.5;
          pointer-events: none;
          animation: float-resume 8s ease-in-out infinite;
          z-index: 0;
        }

        @keyframes float-resume {
          0%, 100% { transform: translateY(0px) rotate(-8deg); }
          50% { transform: translateY(-40px) rotate(-2deg); }
        }

        .upload-container form {
          position: relative;
          z-index: 1;
        }

        .form-section {
          text-align: center;
          margin-bottom: 40px;
          background: linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,249,255,0.95) 100%);
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(102, 126, 234, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(102, 126, 234, 0.15);
          position: relative;
          overflow: hidden;
        }

        .form-section::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -10%;
          width: 300px;
          height: 300px;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="rgba(240,147,251,0.1)"/><circle cx="50" cy="50" r="30" fill="rgba(100,200,255,0.08)"/><circle cx="50" cy="50" r="20" fill="rgba(102,126,234,0.06)"/></svg>') no-repeat;
          background-size: contain;
          pointer-events: none;
        }

        .form-section h2 {
          margin: 0 0 10px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 32px;
          font-weight: 800;
          position: relative;
          z-index: 1;
        }

        .subtitle {
          color: #555;
          margin: 0;
          font-size: 16px;
          opacity: 0.9;
          font-weight: 500;
          position: relative;
          z-index: 1;
        }

        .form-group {
          margin-bottom: 26px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 255, 0.9) 100%);
          padding: 24px;
          border-radius: 12px;
          border: 2px solid rgba(102, 126, 234, 0.15);
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .form-group:hover {
          border-color: rgba(240, 147, 251, 0.4);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.15), 0 2px 8px rgba(240, 147, 251, 0.1);
          transform: translateY(-2px);
        }

        label {
          display: block;
          margin-bottom: 12px;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 15px;
        }

        textarea {
          width: 100%;
          padding: 16px 14px;
          border: 2px solid #e8e8ff;
          border-radius: 10px;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 14px;
          resize: vertical;
          transition: all 0.3s ease;
          background: linear-gradient(135deg, #fafbff 0%, #f8f9ff 100%);
        }

        textarea:focus {
          outline: none;
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15), 0 0 0 8px rgba(240, 147, 251, 0.05);
        }

        textarea::placeholder {
          color: #bbb;
        }

        input[type="file"] {
          padding: 12px;
          border: 2px dashed #e8e8ff;
          border-radius: 10px;
          width: 100%;
          cursor: pointer;
          transition: all 0.3s ease;
          background: linear-gradient(135deg, #fafbff 0%, #f8f9ff 100%);
          font-weight: 500;
          color: #667eea;
        }

        input[type="file"]:hover {
          border-color: #667eea;
          background: linear-gradient(135deg, #f0f4ff 0%, #e8f1ff 100%);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
        }

        small {
          display: block;
          color: #999;
          margin-top: 8px;
          font-size: 13px;
          font-weight: 500;
        }

        .btn-submit {
          width: 100%;
          padding: 18px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%);
          background-size: 300% 300%;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 17px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
          text-transform: uppercase;
          letter-spacing: 1px;
          animation: gradientShiftBtn 3s ease infinite;
        }

        @keyframes gradientShiftBtn {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 12px 30px rgba(102, 126, 234, 0.5);
        }

        .btn-submit:active:not(:disabled) {
          transform: translateY(-1px);
        }

        .btn-submit:disabled {
          background: linear-gradient(135deg, #ccc 0%, #999 100%);
          cursor: not-allowed;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          opacity: 0.7;
        }

        .error-message {
          background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
          color: #c62828;
          padding: 16px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 5px solid #c62828;
          font-weight: 500;
          animation: shake 0.3s ease;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .loading-overlay {
          background: rgba(0, 0, 0, 0.6);
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .timeout-warning {
          background: linear-gradient(135deg, #fff3cd 0%, #ffe082 100%);
          color: #856404;
          border: 2px solid #ffc107;
          border-radius: 8px;
          padding: 16px 20px;
          margin-top: 25px;
          text-align: center;
          max-width: 450px;
          font-size: 14px;
          font-weight: 500;
          box-shadow: 0 4px 12px rgba(255, 193, 7, 0.2);
        }

        .timeout-warning p {
          margin: 0;
        }
      `}</style>
    </div>
  );
}
