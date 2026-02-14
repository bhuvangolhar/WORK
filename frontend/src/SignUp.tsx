import React, { useState } from "react";

interface SignUpUserData {
  email: string;
  password: string;
  fullName: string;
  organizationName: string;
  phoneNo: string;
  verifyPassword: string;
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.fullName.trim()) {
      setError("Full name is required");
      return;
    }
    if (!formData.organizationName.trim()) {
      setError("Organization name is required");
      return;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }
    if (!formData.phoneNo.trim()) {
      setError("Phone number is required");
      return;
    }
    if (!formData.password) {
      setError("Password is required");
      return;
    }
    if (formData.password !== formData.verifyPassword) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // Dummy sign-up logic
    console.log("Sign up with:", formData);
    onSignUpSuccess(formData);
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
            />
          </div>

          <button type="submit" className="signup-btn">
            Sign Up
          </button>
        </form>

        <p className="signup-footer">
          Already have an account?{" "}
          <button
            type="button"
            className="link-btn"
            onClick={onBackToSignIn}
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
