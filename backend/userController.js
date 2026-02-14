const pool = require("./db");
const bcrypt = require("bcryptjs");

// Sign Up - Register new user
const signUp = async (req, res) => {
  try {
    const { fullName, organizationName, email, phoneNo, password } = req.body;

    // Validation
    if (!fullName || !organizationName || !email || !phoneNo || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const connection = await pool.getConnection();

    // Check if user already exists
    const [existingUser] = await connection.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      connection.release();
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await connection.execute(
      "INSERT INTO users (fullName, organizationName, email, phoneNo, password) VALUES (?, ?, ?, ?, ?)",
      [fullName, organizationName, email, phoneNo, hashedPassword]
    );

    connection.release();

    res.status(201).json({
      message: "User registered successfully",
      userId: result.insertId,
      user: {
        id: result.insertId,
        fullName,
        organizationName,
        email,
        phoneNo,
      },
    });
  } catch (error) {
    console.error("Sign up error:", error);
    res.status(500).json({ message: "Server error during sign up" });
  }
};

// Sign In - Authenticate user
const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const connection = await pool.getConnection();

    // Find user by email
    const [users] = await connection.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = users[0];

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      connection.release();
      return res.status(401).json({ message: "Invalid email or password" });
    }

    connection.release();

    res.status(200).json({
      message: "Sign in successful",
      user: {
        id: user.id,
        fullName: user.fullName,
        organizationName: user.organizationName,
        email: user.email,
        phoneNo: user.phoneNo,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Sign in error:", error);
    res.status(500).json({ message: "Server error during sign in" });
  }
};

// Get all users (for testing/admin)
const getAllUsers = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [users] = await connection.execute(
      "SELECT id, fullName, organizationName, email, phoneNo, createdAt FROM users"
    );

    connection.release();

    res.status(200).json({ users });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server error fetching users" });
  }
};

module.exports = {
  signUp,
  signIn,
  getAllUsers,
};
