const pool = require("./db");

// Get all tasks for a user
const getTasks = async (req, res) => {
  try {
    const { userId } = req.params;
    const connection = await pool.getConnection();

    const query = "SELECT * FROM tasks WHERE userId = ? ORDER BY createdAt DESC";
    const [tasks] = await connection.execute(query, [userId]);

    connection.release();
    res.json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new task
const createTask = async (req, res) => {
  try {
    const { userId, title, description, status, priority, dueDate } = req.body;

    if (!userId || !title) {
      return res.status(400).json({ success: false, message: "userId and title are required" });
    }

    const connection = await pool.getConnection();

    const query = `
      INSERT INTO tasks (userId, title, description, status, priority, dueDate) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await connection.execute(query, [
      userId,
      title,
      description || null,
      status || "Pending",
      priority || "Medium",
      dueDate || null,
    ]);

    connection.release();

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      taskId: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a task
const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, priority, dueDate } = req.body;

    const connection = await pool.getConnection();

    const query = `
      UPDATE tasks 
      SET title = ?, description = ?, status = ?, priority = ?, dueDate = ? 
      WHERE id = ?
    `;
    const [result] = await connection.execute(query, [
      title,
      description || null,
      status,
      priority,
      dueDate || null,
      taskId,
    ]);

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.json({ success: true, message: "Task updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const connection = await pool.getConnection();

    const query = "DELETE FROM tasks WHERE id = ?";
    const [result] = await connection.execute(query, [taskId]);

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};
