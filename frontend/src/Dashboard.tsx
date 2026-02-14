import React, { useState } from "react";

interface DashboardProps {
  userName: string;
  organizationName: string;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  userName,
  organizationName,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [employees, setEmployees] = useState([
    { id: 1, name: "John Smith", position: "Senior Dev", status: "Present" },
    { id: 2, name: "Sarah Johnson", position: "Designer", status: "Present" },
    { id: 3, name: "Mike Davis", position: "Manager", status: "Away" },
  ]);

  const [tasks] = useState([
    { id: 1, title: "Website Redesign", status: "In Progress", priority: "High" },
    { id: 2, title: "API Integration", status: "Pending", priority: "High" },
    { id: 3, title: "Database Migration", status: "Completed", priority: "Medium" },
  ]);

  const stats = [
    { label: "Total Employees", value: "24", icon: "👥" },
    { label: "Active Projects", value: "8", icon: "📊" },
    { label: "Tasks Today", value: "12", icon: "✓" },
    { label: "Meeting Hours", value: "6h", icon: "📅" },
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
              className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              <span className="nav-icon">📊</span>
              <span>Overview</span>
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
          {activeTab === "overview" && (
            <div className="content-section">
              <h2>Dashboard Overview</h2>

              {/* Stats Cards */}
              <div className="stats-grid">
                {stats.map((stat, index) => (
                  <div key={index} className="stat-card">
                    <div className="stat-icon">{stat.icon}</div>
                    <div className="stat-content">
                      <p className="stat-value">{stat.value}</p>
                      <p className="stat-label">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="quick-section">
                <div className="section-card">
                  <h3>Recent Activity</h3>
                  <ul className="activity-list">
                    <li>
                      <span className="activity-icon">✓</span>
                      <span>John Smith marked task as completed</span>
                      <span className="time">2 hours ago</span>
                    </li>
                    <li>
                      <span className="activity-icon">📌</span>
                      <span>New project "Mobile App" started</span>
                      <span className="time">4 hours ago</span>
                    </li>
                    <li>
                      <span className="activity-icon">👤</span>
                      <span>Sarah Johnson checked in</span>
                      <span className="time">6 hours ago</span>
                    </li>
                  </ul>
                </div>

                <div className="section-card">
                  <h3>Upcoming Events</h3>
                  <ul className="events-list">
                    <li>
                      <span className="event-time">10:00 AM</span>
                      <span className="event-title">Team Standup</span>
                    </li>
                    <li>
                      <span className="event-time">02:00 PM</span>
                      <span className="event-title">Client Meeting</span>
                    </li>
                    <li>
                      <span className="event-time">04:00 PM</span>
                      <span className="event-title">Project Review</span>
                    </li>
                  </ul>
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
                          <span
                            className={`status-badge ${emp.status.toLowerCase()}`}
                          >
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
                  <button className="add-btn">+ New Task</button>
                </div>
                <div className="tasks-list">
                  {tasks.map((task) => (
                    <div key={task.id} className="task-item">
                      <div className="task-info">
                        <h4>{task.title}</h4>
                        <p>Status: {task.status}</p>
                      </div>
                      <span
                        className={`priority-badge ${task.priority.toLowerCase()}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
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
      </div>
    </div>
  );
};

export default Dashboard;
