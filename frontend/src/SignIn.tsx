import React, { useState } from "react";

interface SignInProps {
  onSignInSuccess: (email: string, password: string) => void;
  onGoToSignUp: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onSignInSuccess, onGoToSignUp }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Pass credentials to parent for validation
    if (email && password) {
      console.log("Sign in with:", email, password);
      onSignInSuccess(email, password);
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-box">
        <h1 className="signin-title">WORK</h1>
        <p className="signin-subtitle">Sign In to Your Workspace</p>

        <form onSubmit={handleSubmit} className="signin-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="signin-btn">
            Sign In
          </button>
        </form>

        <p className="signin-footer">
          Don't have an account?{" "}
          <button
            type="button"
            className="link-btn"
            onClick={onGoToSignUp}
          >
            Sign Up
          </button>
        </p>

        <p className="signin-demo">
          Demo credentials: any email/password combination works
        </p>
      </div>
    </div>
  );
};

export default SignIn;
