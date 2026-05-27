// Main App Component

import ResumeUpload from "./components/ResumeUpload";
import ErrorBoundary from "./components/ErrorBoundary";
import "./App.css";

export default function App() {
  return (
    <ErrorBoundary>
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <div className="header-title">
              <svg className="header-icon" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                {/* Robot body */}
                <g>
                  {/* Robot head */}
                  <rect x="50" y="20" width="100" height="80" rx="8" fill="none" stroke="currentColor" strokeWidth="3"/>
                  {/* Robot eyes */}
                  <circle cx="70" cy="45" r="8" fill="currentColor"/>
                  <circle cx="130" cy="45" r="8" fill="currentColor"/>
                  {/* Robot smile */}
                  <path d="M 70 65 Q 100 75 130 65" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>

                  {/* Robot left arm */}
                  <rect x="20" y="110" width="30" height="12" rx="6" fill="currentColor"/>

                  {/* Robot body */}
                  <rect x="60" y="100" width="80" height="70" rx="8" fill="none" stroke="currentColor" strokeWidth="3"/>

                  {/* Robot right arm with pen */}
                  <rect x="150" y="110" width="30" height="12" rx="6" fill="currentColor"/>
                  {/* Pen in hand */}
                  <circle cx="182" cy="115" r="5" fill="currentColor"/>
                  <line x1="182" y1="115" x2="195" y2="90" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>

                  {/* Paper under robot */}
                  <rect x="100" y="150" width="70" height="50" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.8"/>
                  {/* Lines on paper */}
                  <line x1="110" y1="165" x2="160" y2="165" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
                  <line x1="110" y1="175" x2="160" y2="175" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
                  <line x1="110" y1="185" x2="155" y2="185" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
                </g>
              </svg>
              <h1>Resume Screening AI</h1>
            </div>
            <p className="tagline">
              AI-powered resume analysis, interview generation, and recruiter insights
            </p>
          </div>
        </header>

        <main className="app-main">
          <ResumeUpload />
        </main>

        <footer className="app-footer">
          <p>
            Powered by Hugging Face Inference APIs • Llama 3.1 + DeepSeek + OpenHermes •{" "}
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              View Source
            </a>
          </p>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
