import { useState } from "react";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import Dashboard from "./Dashboard";

type PageType = "home" | "signin" | "signup" | "dashboard";

interface CurrentUser {
  id: number;
  fullName: string;
  organizationName: string;
  email: string;
  phoneNo: string;
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>("home");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const handleEnterWorkspace = () => {
    setCurrentPage("signin");
  };

  const handleSignInSuccess = (user: CurrentUser) => {
    setCurrentUser(user);
    setCurrentPage("dashboard");
  };

  const handleGoToSignUp = () => {
    setCurrentPage("signup");
  };

  const handleSignUpSuccess = (user: CurrentUser) => {
    setCurrentUser(user);
    setCurrentPage("dashboard");
  };

  const handleBackToSignIn = () => {
    setCurrentPage("signin");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage("home");
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

      {currentPage === "dashboard" && currentUser && (
        <Dashboard 
          userName={currentUser.fullName}
          organizationName={currentUser.organizationName}
          onLogout={handleLogout}
        />
      )}
    </>
  );
};

export default App;
