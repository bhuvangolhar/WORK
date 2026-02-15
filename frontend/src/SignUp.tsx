import React, { useState } from "react";

interface SignUpUserData {
  id: number;
  fullName: string;
  organizationName: string;
  email: string;
  phoneNo: string;
}

interface SignUpProps {
  onSignUpSuccess: (userData: SignUpUserData) => void;
  onBackToSignIn: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSignUpSuccess, onBackToSignIn }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    organizationName: "",
    email: "",
    phoneNo: "",
    password: "",
    verifyPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!formData.fullName.trim()) {
      setError("Full name is required");
      setLoading(false);
      return;
    }
    if (!formData.organizationName.trim()) {
      setError("Organization name is required");
      setLoading(false);
      return;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      setLoading(false);
      return;
    }
    if (!formData.phoneNo.trim()) {
      setError("Phone number is required");
      setLoading(false);
      return;
    }
    if (!formData.password) {
      setError("Password is required");
      setLoading(false);
      return;
    }
    if (formData.password !== formData.verifyPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          organizationName: formData.organizationName,
          email: formData.email,
          phoneNo: formData.phoneNo,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Sign up failed");
        setLoading(false);
        return;
      }

      onSignUpSuccess(data.user);
    } catch (err) {
      setError("Unable to connect to server. Please try again.");
      console.error("Sign up error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h1 className="signup-title">WORK</h1>
        <p className="signup-subtitle">Create Your Account</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="organizationName">Organization Name</label>
            <input
              id="organizationName"
              type="text"
              name="organizationName"
              placeholder="Enter your organization name"
              value={formData.organizationName}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNo">Phone Number</label>
            <input
              id="phoneNo"
              type="tel"
              name="phoneNo"
              placeholder="Enter your phone number"
              value={formData.phoneNo}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="verifyPassword">Verify Password</label>
            <input
              id="verifyPassword"
              type="password"
              name="verifyPassword"
              placeholder="Confirm your password"
              value={formData.verifyPassword}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="signup-footer">
          Already have an account?{" "}
          <button
            type="button"
            className="link-btn"
            onClick={onBackToSignIn}
            disabled={loading}
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
