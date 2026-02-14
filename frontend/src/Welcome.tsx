import React from "react";

interface WelcomeProps {
  onContinue: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onContinue }) => {
  return (
    <div className="welcome-container">
      <div className="welcome-box">
        <div className="welcome-icon">✓</div>
        <h1 className="welcome-title">Welcome to WORK!</h1>
        
        <p className="welcome-subtitle">
          Your account has been successfully created
        </p>

        <div className="welcome-message">
          <p>
            Get ready to streamline your office management and workforce coordination with our powerful platform.
          </p>
        </div>

        <div className="welcome-features">
          <div className="feature">
            <span className="feature-icon">📊</span>
            <p>Track productivity and team performance</p>
          </div>
          <div className="feature">
            <span className="feature-icon">👥</span>
            <p>Manage your workforce efficiently</p>
          </div>
          <div className="feature">
            <span className="feature-icon">📅</span>
            <p>Schedule and coordinate seamlessly</p>
          </div>
        </div>

        <button className="welcome-btn" onClick={onContinue}>
          Continue to Dashboard
        </button>

        <p className="welcome-footer">
          Let's get started with your workspace!
        </p>
      </div>
    </div>
  );
};

export default Welcome;
