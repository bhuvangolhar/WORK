import { useState } from "react";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import Welcome from "./Welcome";

type PageType = "home" | "signin" | "signup" | "welcome";

interface SignedUpUser {
  email: string;
  password: string;
  fullName: string;
  organizationName: string;
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>("home");
  const [signedUpUsers, setSignedUpUsers] = useState<SignedUpUser[]>([]);
  const [currentUser, setCurrentUser] = useState<SignedUpUser | null>(null);

  const handleEnterWorkspace = () => {
    setCurrentPage("signin");
  };

  const handleSignInSuccess = (email: string, password: string) => {
    // Check if user exists in signed up users
    const user = signedUpUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      setCurrentUser(user);
      setCurrentPage("welcome");
    } else {
      setCurrentPage("home");
    }
  };

  const handleGoToSignUp = () => {
    setCurrentPage("signup");
  };

  const handleSignUpSuccess = (userData: SignedUpUser) => {
    // Add user to signed up users list
    setSignedUpUsers((prev) => [...prev, userData]);
    setCurrentUser(userData);
    setCurrentPage("welcome");
  };

  const handleBackToSignIn = () => {
    setCurrentPage("signin");
  };

  const handleWelcomeContinue = () => {
    setCurrentPage("home");
    setCurrentUser(null);
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

      {currentPage === "welcome" && currentUser && (
        <Welcome 
          onContinue={handleWelcomeContinue}
          userName={currentUser.fullName}
          organizationName={currentUser.organizationName}
        />
      )}
    </>
  );
};

export default App;
