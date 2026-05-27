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
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .form-section {
          text-align: center;
          margin-bottom: 30px;
        }

        .form-section h2 {
          margin: 0 0 10px;
          color: #1976d2;
        }

        .subtitle {
          color: #666;
          margin: 0;
        }

        .form-group {
          margin-bottom: 20px;
        }

        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #333;
        }

        textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: monospace;
          font-size: 14px;
          resize: vertical;
        }

        textarea:focus {
          outline: none;
          border-color: #1976d2;
          box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
        }

        input[type="file"] {
          padding: 8px;
        }

        small {
          display: block;
          color: #999;
          margin-top: 4px;
          font-size: 12px;
        }

        .btn-submit {
          width: 100%;
          padding: 12px;
          background: #1976d2;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-submit:hover:not(:disabled) {
          background: #1565c0;
        }

        .btn-submit:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .error-message {
          background: #ffebee;
          color: #c62828;
          padding: 12px;
          border-radius: 4px;
          margin: 15px 0;
          border-left: 4px solid #c62828;
        }

        .loading-overlay {
          background: rgba(0, 0, 0, 0.5);
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
        }

        .timeout-warning {
          background: #fff3cd;
          color: #856404;
          border: 1px solid #ffc107;
          border-radius: 4px;
          padding: 12px 16px;
          margin-top: 20px;
          text-align: center;
          max-width: 400px;
          font-size: 14px;
        }

        .timeout-warning p {
          margin: 0;
        }
      `}</style>
    </div>
  );
}
