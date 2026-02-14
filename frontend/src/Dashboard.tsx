import React, { useState, useEffect } from "react";

interface Task {
  id: number;
  userId: number;
  title: string;
  description: string;
  status: "Pending" | "In Progress" | "Completed";
  priority: "Low" | "Medium" | "High";
  dueDate: string;
  createdAt?: string;
  updatedAt?: string;
}

interface DashboardProps {
  userName: string;
  organizationName: string;
  onLogout: () => void;
  userId?: number;
}

const Dashboard: React.FC<DashboardProps> = ({
  userName,
  organizationName,
  onLogout,
  userId: propUserId,
}) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "Pending" as const,
    priority: "Medium" as const,
    dueDate: "",
  });

  // Get userId from localStorage
  const getUserId = () => {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      const user = JSON.parse(currentUser);
      return user.id || propUserId;
    }
    return propUserId;
  };

  const userId = getUserId();

  // Fetch tasks on component mount
  useEffect(() => {
    if (userId) {
      fetchTasks();
    }
  }, [userId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/tasks/${userId}`);
      const data = await response.json();
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setFormData({
      title: "",
      description: "",
      status: "Pending",
      priority: "Medium",
      dueDate: "",
    });
    setShowTaskModal(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
    });
    setShowTaskModal(true);
  };

  const handleDeleteTask = async (taskId: number) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
          method: "DELETE",
        });
        const data = await response.json();
        if (data.success) {
          setTasks(tasks.filter((t) => t.id !== taskId));
        }
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };

  const handleSaveTask = async () => {
    if (!formData.title.trim()) {
      alert("Please enter a task title");
      return;
    }

    try {
      setLoading(true);

      if (editingTask) {
        // Update existing task
        const response = await fetch(`http://localhost:5000/api/tasks/${editingTask.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        if (data.success) {
          setTasks(tasks.map((t) => (t.id === editingTask.id ? { ...t, ...formData } : t)));
          setShowTaskModal(false);
        }
      } else {
        // Create new task
        const response = await fetch("http://localhost:5000/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            ...formData,
          }),
        });
        const data = await response.json();
        if (data.success) {
          fetchTasks(); // Refresh tasks list
          setShowTaskModal(false);
        }
      }
    } catch (error) {
      console.error("Error saving task:", error);
    } finally {
      setLoading(false);
    }
  };

  const [employees] = useState([
    { id: 1, name: "John Smith", position: "Senior Dev", status: "Present", joinDate: "2022-01-15" },
    { id: 2, name: "Sarah Johnson", position: "Designer", status: "Present", joinDate: "2023-03-20" },
    { id: 3, name: "Mike Davis", position: "Manager", status: "Away", joinDate: "2021-06-10" },
    { id: 4, name: "Emma Wilson", position: "Dev", status: "Present", joinDate: "2024-02-14" },
  ]);

  // Calculate anniversaries
  const today = new Date();
  const anniversaries = employees
    .map((emp) => {
      const joinDate = new Date(emp.joinDate);
      const anniversary = new Date(today.getFullYear(), joinDate.getMonth(), joinDate.getDate());
      const daysUntil = Math.floor((anniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const yearsOfService = today.getFullYear() - joinDate.getFullYear();
      return { ...emp, daysUntil: daysUntil < 0 ? daysUntil + 365 : daysUntil, yearsOfService };
    })
    .filter((emp) => emp.daysUntil <= 30)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  const stats = [
    { label: "Total Employees", value: "24", icon: "👥", color: "#0ea5e9" },
    { label: "Active Projects", value: "8", icon: "📊", color: "#10b981" },
    { label: "Tasks Today", value: "12", icon: "✓", color: "#f59e0b" },
    { label: "Meeting Hours", value: "6h", icon: "📅", color: "#8b5cf6" },
  ];

  const recentEvents = [
    { id: 1, type: "task-completed", user: "John Smith", task: "API Documentation", time: "2 hours ago", icon: "✓" },
    { id: 2, type: "project-started", user: "Sarah Johnson", task: "New Design System", time: "4 hours ago", icon: "🚀" },
    { id: 3, type: "milestone", user: "Team", task: "Q1 Goals Achieved", time: "6 hours ago", icon: "🎯" },
    { id: 4, type: "joined", user: "Emma Wilson", task: "Joined the team", time: "Yesterday", icon: "👤" },
    { id: 5, type: "update", user: "Mike Davis", task: "Project Status Update", time: "2 days ago", icon: "📝" },
  ];

  const departmentData = [
    { name: "Engineering", count: 8, percentage: 33, color: "#0ea5e9" },
    { name: "Design", count: 4, percentage: 17, color: "#10b981" },
    { name: "Sales", count: 6, percentage: 25, color: "#f59e0b" },
    { name: "HR", count: 3, percentage: 13, color: "#8b5cf6" },
    { name: "Other", count: 3, percentage: 12, color: "#ec4899" },
  ];

  const upcomingEvents = [
    { id: 1, title: "Team Standup", time: "10:00 AM", attendees: 12, icon: "📞" },
    { id: 2, title: "Client Meeting", time: "02:00 PM", attendees: 5, icon: "🤝" },
    { id: 3, title: "Project Review", time: "04:00 PM", attendees: 8, icon: "📋" },
  ];

  const performanceData = [
    { week: "Week 1", completed: 12, inProgress: 5, pending: 3 },
    { week: "Week 2", completed: 15, inProgress: 4, pending: 2 },
    { week: "Week 3", completed: 18, inProgress: 3, pending: 2 },
    { week: "Week 4", completed: 20, inProgress: 4, pending: 1 },
  ];

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="dashboard-logo">WORK</h1>
          <div className="header-info">
            <p className="org-name">{organizationName}</p>
          </div>
        </div>
        <div className="header-right">
          <div className="user-profile">
            <div className="user-avatar">{userName.charAt(0).toUpperCase()}</div>
            <div className="user-details">
              <p className="user-name">{userName}</p>
              <p className="user-role">Administrator</p>
            </div>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <span className="nav-icon">📊</span>
              <span>Dashboard</span>
            </button>
            <button
              className={`nav-item ${activeTab === "employees" ? "active" : ""}`}
              onClick={() => setActiveTab("employees")}
            >
              <span className="nav-icon">👥</span>
              <span>Employees</span>
            </button>
            <button
              className={`nav-item ${activeTab === "tasks" ? "active" : ""}`}
              onClick={() => setActiveTab("tasks")}
            >
              <span className="nav-icon">📋</span>
              <span>Tasks</span>
            </button>
            <button
              className={`nav-item ${activeTab === "schedule" ? "active" : ""}`}
              onClick={() => setActiveTab("schedule")}
            >
              <span className="nav-icon">📅</span>
              <span>Schedule</span>
            </button>
            <button
              className={`nav-item ${activeTab === "reports" ? "active" : ""}`}
              onClick={() => setActiveTab("reports")}
            >
              <span className="nav-icon">📈</span>
              <span>Reports</span>
            </button>
            <button
              className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => setActiveTab("settings")}
            >
              <span className="nav-icon">⚙️</span>
              <span>Settings</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="dashboard-content">
          {activeTab === "dashboard" && (
            <div className="content-section">
              <h2>Dashboard</h2>

              {/* Stats Cards */}
              <div className="stats-grid">
                {stats.map((stat, index) => (
                  <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
                    <div className="stat-icon">{stat.icon}</div>
                    <div className="stat-content">
                      <p className="stat-value">{stat.value}</p>
                      <p className="stat-label">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Main Grid */}
              <div className="dashboard-grid">
                {/* Recent Activity */}
                <div className="section-card full-width">
                  <h3>Recent Activity</h3>
                  <div className="activity-feed">
                    {recentEvents.map((event) => (
                      <div key={event.id} className="activity-item">
                        <div className="activity-avatar">{event.icon}</div>
                        <div className="activity-content">
                          <p className="activity-text">
                            <strong>{event.user}</strong> - {event.task}
                          </p>
                          <span className="activity-time">{event.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Department Breakdown - Pie Chart */}
                <div className="section-card">
                  <h3>Department Breakdown</h3>
                  <div className="pie-chart-container">
                    <div className="pie-chart">
                      {departmentData.map((dept, index) => {
                        const startAngle = departmentData.slice(0, index).reduce((sum, d) => sum + d.percentage, 0) * 3.6;
                        const endAngle = startAngle + dept.percentage * 3.6;
                        return (
                          <div
                            key={dept.name}
                            className="pie-segment"
                            style={{
                              background: dept.color,
                              width: "120px",
                              height: "120px",
                              borderRadius: "50%",
                              position: "absolute",
                              clip: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((startAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((startAngle - 90) * Math.PI / 180)}%, ${50 + 50 * Math.cos((endAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((endAngle - 90) * Math.PI / 180)}%)`,
                            }}
                          />
                        );
                      })}
                    </div>
                    <svg width="120" height="120" viewBox="0 0 120 120" className="pie-chart-svg">
                      {departmentData.map((dept, index) => {
                        const total = 100;
                        const startAngle = (departmentData.slice(0, index).reduce((sum, d) => sum + d.percentage, 0) / total) * 2 * Math.PI - Math.PI / 2;
                        const endAngle = ((departmentData.slice(0, index + 1).reduce((sum, d) => sum + d.percentage, 0)) / total) * 2 * Math.PI - Math.PI / 2;
                        const x1 = 60 + 50 * Math.cos(startAngle);
                        const y1 = 60 + 50 * Math.sin(startAngle);
                        const x2 = 60 + 50 * Math.cos(endAngle);
                        const y2 = 60 + 50 * Math.sin(endAngle);
                        const largeArc = dept.percentage > 50 ? 1 : 0;
                        const path = `M 60 60 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`;
                        return (
                          <path key={dept.name} d={path} fill={dept.color} stroke="white" strokeWidth="2" />
                        );
                      })}
                    </svg>
                  </div>
                  <div className="pie-legend">
                    {departmentData.map((dept) => (
                      <div key={dept.name} className="legend-item">
                        <span className="legend-color" style={{ backgroundColor: dept.color }}></span>
                        <span>{dept.name} ({dept.count})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Events */}
                <div className="section-card">
                  <h3>Today's Schedule</h3>
                  <div className="events-timeline">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="timeline-item">
                        <div className="timeline-time">{event.time}</div>
                        <div className="timeline-dot"></div>
                        <div className="timeline-event">
                          <p className="event-title">{event.icon} {event.title}</p>
                          <p className="event-meta">{event.attendees} attendees</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Anniversaries & Joinings */}
                <div className="section-card full-width">
                  <h3>🎉 Upcoming Milestones</h3>
                  <div className="milestones-grid">
                    {anniversaries.length > 0 ? (
                      anniversaries.map((emp) => (
                        <div key={emp.id} className="milestone-card">
                          <div className="milestone-icon">🎂</div>
                          <div className="milestone-info">
                            <p className="milestone-type">Work Anniversary</p>
                            <p className="milestone-name">{emp.name}</p>
                            <p className="milestone-details">
                              {emp.yearsOfService} year{emp.yearsOfService !== 1 ? "s" : ""} • In {emp.daysUntil} days
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="milestone-empty">
                        <p>No anniversaries coming up this month</p>
                      </div>
                    )}
                    {employees.filter(emp => {
                      const joinDate = new Date(emp.joinDate);
                      return joinDate.getFullYear() === today.getFullYear() && joinDate.getMonth() === today.getMonth();
                    }).map((emp) => (
                      <div key={emp.id} className="milestone-card new-joining">
                        <div className="milestone-icon">🆕</div>
                        <div className="milestone-info">
                          <p className="milestone-type">New Joining</p>
                          <p className="milestone-name">{emp.name}</p>
                          <p className="milestone-details">{emp.position}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performance Chart */}
                <div className="section-card full-width">
                  <h3>Task Performance (Weekly)</h3>
                  <div className="bar-chart">
                    {performanceData.map((week) => (
                      <div key={week.week} className="chart-column">
                        <div className="chart-bars">
                          <div
                            className="bar completed"
                            style={{ height: `${(week.completed / 25) * 100}%` }}
                            title={`Completed: ${week.completed}`}
                          ></div>
                          <div
                            className="bar in-progress"
                            style={{ height: `${(week.inProgress / 25) * 100}%` }}
                            title={`In Progress: ${week.inProgress}`}
                          ></div>
                          <div
                            className="bar pending"
                            style={{ height: `${(week.pending / 25) * 100}%` }}
                            title={`Pending: ${week.pending}`}
                          ></div>
                        </div>
                        <p className="chart-label">{week.week}</p>
                      </div>
                    ))}
                  </div>
                  <div className="chart-legend">
                    <span><span className="legend-box completed"></span> Completed</span>
                    <span><span className="legend-box in-progress"></span> In Progress</span>
                    <span><span className="legend-box pending"></span> Pending</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="section-card">
                  <h3>Team Statistics</h3>
                  <div className="quick-stats">
                    <div className="stat-row">
                      <span>Average Tasks/Day</span>
                      <strong>3.2</strong>
                    </div>
                    <div className="stat-row">
                      <span>Completion Rate</span>
                      <strong>94%</strong>
                    </div>
                    <div className="stat-row">
                      <span>Team Efficiency</span>
                      <strong>87%</strong>
                    </div>
                    <div className="stat-row">
                      <span>On-Time Delivery</span>
                      <strong>91%</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "employees" && (
            <div className="content-section">
              <h2>Employee Management</h2>
              <div className="section-card">
                <div className="table-header">
                  <button className="add-btn">+ Add Employee</button>
                </div>
                <table className="employees-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Position</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp) => (
                      <tr key={emp.id}>
                        <td>{emp.name}</td>
                        <td>{emp.position}</td>
                        <td>
                          <span className={`status-badge ${emp.status.toLowerCase()}`}>
                            {emp.status}
                          </span>
                        </td>
                        <td>
                          <button className="action-btn">View</button>
                          <button className="action-btn">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "tasks" && (
            <div className="content-section">
              <h2>Task Management</h2>
              <div className="section-card">
                <div className="table-header">
                  <button className="add-btn" onClick={handleAddTask}>+ New Task</button>
                </div>
                {loading ? (
                  <p style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>Loading tasks...</p>
                ) : tasks.length === 0 ? (
                  <p style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>No tasks yet. Click "+ New Task" to create one.</p>
                ) : (
                  <div className="tasks-list">
                    {tasks.map((task) => (
                      <div key={task.id} className="task-item">
                        <div className="task-info">
                          <h4>{task.title}</h4>
                          {task.description && <p>{task.description}</p>}
                          <div className="task-meta">
                            <span className={`status-badge ${task.status.toLowerCase().replace(" ", "-")}`}>
                              {task.status}
                            </span>
                            <span className={`priority-badge ${task.priority.toLowerCase()}`}>
                              {task.priority}
                            </span>
                            {task.dueDate && <span className="due-date">Due: {task.dueDate}</span>}
                          </div>
                        </div>
                        <div className="task-actions">
                          <button className="edit-btn" onClick={() => handleEditTask(task)}>Edit</button>
                          <button className="delete-btn" onClick={() => handleDeleteTask(task.id)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "schedule" && (
            <div className="content-section">
              <h2>Team Schedule</h2>
              <div className="section-card">
                <div className="calendar-placeholder">
                  <div className="placeholder-icon">📅</div>
                  <p>Calendar view coming soon</p>
                  <p style={{ fontSize: "14px", color: "#64748b" }}>
                    Schedule management and team availability tracking
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="content-section">
              <h2>Reports & Analytics</h2>
              <div className="reports-grid">
                <div className="section-card">
                  <h3>Productivity Score</h3>
                  <div className="report-chart">
                    <div className="chart-bar" style={{ width: "85%" }}></div>
                    <p>85% - Team performing above target</p>
                  </div>
                </div>
                <div className="section-card">
                  <h3>Project Completion</h3>
                  <div className="report-chart">
                    <div className="chart-bar complete" style={{ width: "72%" }}></div>
                    <p>72% - 18 of 25 projects completed</p>
                  </div>
                </div>
                <div className="section-card">
                  <h3>Attendance Rate</h3>
                  <div className="report-chart">
                    <div className="chart-bar" style={{ width: "96%" }}></div>
                    <p>96% - Excellent attendance</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="content-section">
              <h2>Settings</h2>
              <div className="section-card">
                <div className="settings-group">
                  <h3>Organization Settings</h3>
                  <div className="setting-item">
                    <label>Organization Name</label>
                    <input type="text" defaultValue={organizationName} />
                  </div>
                  <div className="setting-item">
                    <label>Email</label>
                    <input type="email" placeholder="organization@email.com" />
                  </div>
                  <div className="setting-item">
                    <label>Phone</label>
                    <input type="tel" placeholder="+1 (555) 000-0000" />
                  </div>
                </div>

                <div className="settings-group">
                  <h3>Notification Settings</h3>
                  <label className="checkbox-label">
                    <input type="checkbox" defaultChecked />
                    <span>Email Notifications</span>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" defaultChecked />
                    <span>Task Reminders</span>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" />
                    <span>Weekly Reports</span>
                  </label>
                </div>

                <div className="settings-actions">
                  <button className="save-btn">Save Changes</button>
                  <button className="cancel-btn">Cancel</button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Task Modal */}
        {showTaskModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>{editingTask ? "Edit Task" : "Create New Task"}</h2>
                <button className="modal-close" onClick={() => setShowTaskModal(false)}>✕</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Task Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter task title"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter task description"
                    rows={4}
                  ></textarea>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleSaveTask} disabled={loading}>
                  {loading ? "Saving..." : editingTask ? "Update Task" : "Create Task"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
