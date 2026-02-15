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

// Project-specific configuration
const API_ENDPOINT = "http://localhost:3001";
const PROJECT_ID = "WORK_PROJECT_3001"; // Unique identifier for this project
const STORAGE_KEY = `currentUser_${PROJECT_ID}`;
const PROJECT_KEY = `projectId_${PROJECT_ID}`;

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>("home");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on app mount with project validation
  useEffect(() => {
    const savedProjectId = localStorage.getItem(PROJECT_KEY);
    const savedUser = localStorage.getItem(STORAGE_KEY);
    
    // Clear data if project ID doesn't match (prevents cross-project user leakage)
    if (savedProjectId !== PROJECT_ID) {
      // Clear all project-related localStorage items
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("currentUser_") || key.startsWith("projectId_")) {
          localStorage.removeItem(key);
        }
      });
      setLoading(false);
      return;
    }
    
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        
        // Verify user exists in current backend by making a test call
        verifyUserExists(user);
        
        setCurrentUser(user);
        setCurrentPage("dashboard");
      } catch (error) {
        console.error("Error loading user from localStorage:", error);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(PROJECT_KEY);
      }
    }
    setLoading(false);
  }, []);

  // Verify user exists in the current backend database
  const verifyUserExists = async (user: CurrentUser) => {
    try {
      const response = await fetch(`${API_ENDPOINT}/api/auth/users`);
      const data = await response.json();
      if (data.success && Array.isArray(data.users)) {
        // Check if the current user exists in the database
        const userExists = data.users.some((dbUser: any) => dbUser.id === user.id);
        if (!userExists) {
          // User doesn't exist in this project's database, clear the cache
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(PROJECT_KEY);
          setCurrentUser(null);
          setCurrentPage("home");
        }
      }
    } catch (error) {
      console.error("Error verifying user existence:", error);
    }
  };

  const handleEnterWorkspace = () => {
    setCurrentPage("signin");
  };

  const handleSignInSuccess = (user: CurrentUser) => {
    setCurrentUser(user);
    // Store with project-specific keys
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(PROJECT_KEY, PROJECT_ID);
    setCurrentPage("dashboard");
  };

  const handleGoToSignUp = () => {
    setCurrentPage("signup");
  };

  const handleSignUpSuccess = (user: CurrentUser) => {
    setCurrentUser(user);
    // Store with project-specific keys
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(PROJECT_KEY, PROJECT_ID);
    setCurrentPage("dashboard");
  };

  const handleBackToSignIn = () => {
    setCurrentPage("signin");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    // Clear project-specific localStorage
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PROJECT_KEY);
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
