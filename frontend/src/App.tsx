import { useState, useEffect } from "react";
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
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on app mount
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setCurrentPage("dashboard");
      } catch (error) {
        console.error("Error loading user from localStorage:", error);
        localStorage.removeItem("currentUser");
      }
    }
    setLoading(false);
  }, []);

  const handleEnterWorkspace = () => {
    setCurrentPage("signin");
  };

  const handleSignInSuccess = (user: CurrentUser) => {
    setCurrentUser(user);
    localStorage.setItem("currentUser", JSON.stringify(user));
    setCurrentPage("dashboard");
  };

  const handleGoToSignUp = () => {
    setCurrentPage("signup");
  };

  const handleSignUpSuccess = (user: CurrentUser) => {
    setCurrentUser(user);
    localStorage.setItem("currentUser", JSON.stringify(user));
    setCurrentPage("dashboard");
  };

  const handleBackToSignIn = () => {
    setCurrentPage("signin");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    setCurrentPage("home");
  };

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f8fafc",
        fontSize: "18px",
        color: "#0ea5e9",
      }}>
        Loading...
      </div>
    );
  }

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
          userId={currentUser.id}
          onLogout={handleLogout}
        />
      )}
    </>
  );
};

export default App;
