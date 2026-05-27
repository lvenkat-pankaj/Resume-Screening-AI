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
          background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%);
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.1);
          backdrop-filter: blur(10px);
        }

        .form-section h2 {
          margin: 0 0 10px;
          color: #667eea;
          font-size: 28px;
          font-weight: 700;
        }

        .subtitle {
          color: #666;
          margin: 0;
          font-size: 15px;
          opacity: 0.85;
        }

        .form-group {
          margin-bottom: 24px;
          background: rgba(255, 255, 255, 0.8);
          padding: 20px;
          border-radius: 10px;
          border: 2px solid rgba(102, 126, 234, 0.1);
          transition: all 0.3s ease;
        }

        .form-group:hover {
          border-color: rgba(102, 126, 234, 0.3);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.08);
        }

        label {
          display: block;
          margin-bottom: 10px;
          font-weight: 600;
          color: #333;
          font-size: 15px;
        }

        textarea {
          width: 100%;
          padding: 14px 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 14px;
          resize: vertical;
          transition: all 0.3s ease;
          background: #fafafa;
        }

        textarea:focus {
          outline: none;
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.12);
        }

        textarea::placeholder {
          color: #999;
        }

        input[type="file"] {
          padding: 10px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          width: 100%;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        input[type="file"]:hover {
          border-color: #667eea;
          background: #f8f9ff;
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
          padding: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-submit:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-submit:disabled {
          background: #ccc;
          cursor: not-allowed;
          box-shadow: none;
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
