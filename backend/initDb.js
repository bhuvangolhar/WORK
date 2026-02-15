const pool = require("./db");

// Create users, employees, tasks and files tables if they don't exist
const initializeDatabase = async () => {
  try {
    const connection = await pool.getConnection();

    const createUsersTableQuery = `
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

    const createEmployeesTableQuery = `
      CREATE TABLE IF NOT EXISTS employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        fullName VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phoneNo VARCHAR(20),
        position VARCHAR(255) NOT NULL,
        department VARCHAR(255) NOT NULL,
        employmentType ENUM('Full-time', 'Part-time', 'Contract', 'Intern') DEFAULT 'Full-time',
        joinDate DATE NOT NULL,
        status ENUM('Active', 'Inactive', 'On Leave') DEFAULT 'Active',
        reportingTo VARCHAR(255),
        address VARCHAR(500),
        emergencyContactName VARCHAR(255),
        emergencyContactPhone VARCHAR(20),
        skills VARCHAR(500),
        salary DECIMAL(12, 2),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        INDEX (userId)
      )
    `;

    const createTasksTableQuery = `
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending',
        priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
        dueDate DATE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    const createFilesTableQuery = `
      CREATE TABLE IF NOT EXISTS files (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        fileName VARCHAR(255) NOT NULL,
        originalFileName VARCHAR(255) NOT NULL,
        fileType VARCHAR(50),
        fileSize INT,
        fileCategory ENUM('Note', 'Document', 'Data', 'Statistics', 'Report', 'Other', 'Spreadsheet', 'Presentation') DEFAULT 'Document',
        description TEXT,
        tags VARCHAR(500),
        uploadedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        filePath VARCHAR(500),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        INDEX (userId),
        INDEX (fileCategory),
        FULLTEXT INDEX ftSearch (fileName, description, tags)
      )
    `;

    await connection.execute(createUsersTableQuery);
    await connection.execute(createEmployeesTableQuery);
    await connection.execute(createTasksTableQuery);
    await connection.execute(createFilesTableQuery);
    
    console.log("Database tables initialized successfully");
    connection.release();
  } catch (error) {
    console.error("Database initialization error:", error.message);
  }
};

module.exports = initializeDatabase;
