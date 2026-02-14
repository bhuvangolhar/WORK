const express = require("express");
const { getTasks, createTask, updateTask, deleteTask } = require("../taskController");

const router = express.Router();

// Get all tasks for a user
router.get("/:userId", getTasks);

// Create a new task
router.post("/", createTask);

// Update a task
router.put("/:taskId", updateTask);

// Delete a task
router.delete("/:taskId", deleteTask);

module.exports = router;
