import React, { useState } from "react";

interface SignInProps {
  onSignInSuccess: (user: {
    id: number;
    fullName: string;
    organizationName: string;
    email: string;
    phoneNo: string;
  }) => void;
  onGoToSignUp: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onSignInSuccess, onGoToSignUp }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Sign in failed");
        setLoading(false);
        return;
      }

      onSignInSuccess(data.user);
    } catch (err) {
      setError("Unable to connect to server. Please try again.");
      console.error("Sign in error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-box">
        <h1 className="signin-title">WORK</h1>
        <p className="signin-subtitle">Sign In to Your Workspace</p>

        {error && <div className="error-message">{error}</div>}

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
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          <button type="submit" className="signin-btn" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="signin-footer">
          Don't have an account?{" "}
          <button
            type="button"
            className="link-btn"
            onClick={onGoToSignUp}
            disabled={loading}
          >
            Sign Up
          </button>
        </p>

        <p className="signin-demo">
          Demo credentials: You need a previously signed up account
        </p>
      </div>
    </div>
  );
};

export default SignIn;
