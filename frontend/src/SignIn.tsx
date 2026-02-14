import React, { useState } from "react";

interface SignInProps {
  onSignInSuccess: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onSignInSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy sign-in logic
    if (email && password) {
      console.log("Sign in with:", email, password);
      onSignInSuccess();
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
          Demo credentials: any email/password combination works
        </p>
      </div>
    </div>
  );
};

export default SignIn;
