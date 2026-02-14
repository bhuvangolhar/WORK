const pool = require("./db");

// Create users table if it doesn't exist
const initializeDatabase = async () => {
  try {
    const connection = await pool.getConnection();

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fullName VARCHAR(255) NOT NULL,
        organizationName VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phoneNo VARCHAR(20) NOT NULL,
        password VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    await connection.execute(createTableQuery);
    console.log("Users table initialized successfully");
    connection.release();
  } catch (error) {
    console.error("Database initialization error:", error.message);
  }
};

module.exports = initializeDatabase;
