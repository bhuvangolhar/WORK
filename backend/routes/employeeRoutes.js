const express = require("express");
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../employeeController");

const router = express.Router();

// Get all employees for a user
router.get("/:userId", getEmployees);

// Get single employee
router.get("/detail/:employeeId", getEmployeeById);

// Create a new employee
router.post("/", createEmployee);

// Update an employee
router.put("/:employeeId", updateEmployee);

// Delete an employee
router.delete("/:employeeId", deleteEmployee);

module.exports = router;
