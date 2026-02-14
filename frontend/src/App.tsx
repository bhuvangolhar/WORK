import { useState } from "react";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import Welcome from "./Welcome";

type PageType = "home" | "signin" | "signup" | "welcome";

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>("home");

  const handleEnterWorkspace = () => {
    setCurrentPage("signin");
  };

  const handleSignInSuccess = () => {
    setCurrentPage("home");
    // You can add logic here for successful sign in
  };

  const handleGoToSignUp = () => {
    setCurrentPage("signup");
  };

  const handleSignUpSuccess = () => {
    setCurrentPage("welcome");
    // You can add logic here for successful sign up
  };

  const handleBackToSignIn = () => {
    setCurrentPage("signin");
  };

  const handleWelcomeContinue = () => {
    setCurrentPage("home");
    // Redirect to dashboard or another page
  };

  return (
    <>
      {currentPage === "home" && (
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

      {currentPage === "signin" && (
        <SignIn
          onSignInSuccess={handleSignInSuccess}
          onGoToSignUp={handleGoToSignUp}
        />
      )}

      {currentPage === "signup" && (
        <SignUp
          onSignUpSuccess={handleSignUpSuccess}
          onBackToSignIn={handleBackToSignIn}
        />
      )}

      {currentPage === "welcome" && (
        <Welcome onContinue={handleWelcomeContinue} />
      )}
    </>
  );
};

export default App;
