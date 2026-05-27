export default function LoadingIndicator({ step = 1, totalSteps = 3 }) {
  const stepLabels = [
    "Extracting resume data...",
    "Generating response...",
    "Creating summary...",
  ];

  return (
    <div className="loading-indicator">
      <div className="spinner" />
      <p className="loading-text">{stepLabels[step - 1] || "Processing..."}</p>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${(step / totalSteps) * 100}%` }} />
      </div>
      <p className="progress-text">
        Step {step} of {totalSteps}
      </p>

      <style jsx>{`
        .loading-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          padding: 40px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f0f0f0;
          border-top: 4px solid #1976d2;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .loading-text {
          color: #333;
          font-size: 16px;
          font-weight: 500;
          margin: 0;
          text-align: center;
        }

        .progress-bar {
          width: 100%;
          max-width: 400px;
          height: 8px;
          background: #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #1976d2, #2196f3);
          transition: width 0.3s ease;
        }

        .progress-text {
          color: #999;
          font-size: 12px;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
