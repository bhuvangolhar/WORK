const pool = require("./db");

// Get all employees for a user
const getEmployees = async (req, res) => {
  try {
    const { userId } = req.params;
    const connection = await pool.getConnection();

    const query = "SELECT * FROM employees WHERE userId = ? ORDER BY createdAt DESC";
    const [employees] = await connection.execute(query, [userId]);

    connection.release();
    res.json({ success: true, employees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single employee
const getEmployeeById = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const connection = await pool.getConnection();

    const query = "SELECT * FROM employees WHERE id = ?";
    const [employees] = await connection.execute(query, [employeeId]);

    connection.release();

    if (employees.length === 0) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    res.json({ success: true, employee: employees[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new employee
const createEmployee = async (req, res) => {
  try {
    const {
      userId,
      fullName,
      email,
      phoneNo,
      position,
      department,
      employmentType,
      joinDate,
      status,
      reportingTo,
      address,
      emergencyContactName,
      emergencyContactPhone,
      skills,
      salary,
    } = req.body;

    if (!userId || !fullName || !email || !position || !department || !joinDate) {
      return res.status(400).json({
        success: false,
        message: "userId, fullName, email, position, department, and joinDate are required",
      });
    }

    const connection = await pool.getConnection();

    const query = `
      INSERT INTO employees (
        userId, fullName, email, phoneNo, position, department, 
        employmentType, joinDate, status, reportingTo, address, 
        emergencyContactName, emergencyContactPhone, skills, salary
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await connection.execute(query, [
      userId,
      fullName,
      email,
      phoneNo || null,
      position,
      department,
      employmentType || "Full-time",
      joinDate,
      status || "Active",
      reportingTo || null,
      address || null,
      emergencyContactName || null,
      emergencyContactPhone || null,
      skills || null,
      salary || null,
    ]);

    connection.release();

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      employeeId: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update an employee
const updateEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const {
      fullName,
      email,
      phoneNo,
      position,
      department,
      employmentType,
      joinDate,
      status,
      reportingTo,
      address,
      emergencyContactName,
      emergencyContactPhone,
      skills,
      salary,
    } = req.body;

    const connection = await pool.getConnection();

    const query = `
      UPDATE employees 
      SET fullName = ?, email = ?, phoneNo = ?, position = ?, department = ?, 
          employmentType = ?, joinDate = ?, status = ?, reportingTo = ?, address = ?, 
          emergencyContactName = ?, emergencyContactPhone = ?, skills = ?, salary = ?
      WHERE id = ?
    `;

    const [result] = await connection.execute(query, [
      fullName,
      email,
      phoneNo || null,
      position,
      department,
      employmentType,
      joinDate,
      status,
      reportingTo || null,
      address || null,
      emergencyContactName || null,
      emergencyContactPhone || null,
      skills || null,
      salary || null,
      employeeId,
    ]);

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    res.json({ success: true, message: "Employee updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete an employee
const deleteEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const connection = await pool.getConnection();

    const query = "DELETE FROM employees WHERE id = ?";
    const [result] = await connection.execute(query, [employeeId]);

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    res.json({ success: true, message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
