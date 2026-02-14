import { useState } from "react";
import SignIn from "./SignIn";

const App: React.FC = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);

  const handleEnterWorkspace = () => {
    setIsSignedIn(true);
  };

  const handleSignInSuccess = () => {
    setIsSignedIn(true);
  };

  return (
    <>
      {isSignedIn ? (
        <SignIn onSignInSuccess={handleSignInSuccess} />
      ) : (
        <div className="app">
          <h1 className="title">WORK</h1>

          <p className="subtitle">
            Office Management & Workforce Coordination Platform
          </p>

          <div className="work-box">
            Core office systems will be managed here
          </div>

          <button className="primary-btn" onClick={handleEnterWorkspace}>
            Enter Workspace
          </button>
        </div>
      )}
    </>
  );
};

export default App;
