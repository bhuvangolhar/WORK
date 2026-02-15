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

interface Employee {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  phoneNo: string;
  position: string;
  department: string;
  employmentType: "Full-time" | "Part-time" | "Contract" | "Intern";
  joinDate: string;
  status: "Active" | "Inactive" | "On Leave";
  reportingTo: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  skills: string;
  salary: number;
}

interface FileData {
  id: number;
  userId: number;
  fileName: string;
  originalFileName: string;
  fileType: string;
  fileSize: number;
  fileCategory: "Note" | "Document" | "Data" | "Statistics" | "Report" | "Other" | "Spreadsheet" | "Presentation";
  description: string;
  tags: string;
  uploadedDate: string;
  updatedDate: string;
  filePath: string;
}

interface DashboardProps {
  userName: string;
  organizationName: string;
  onLogout: () => void;
  userId?: number;
}

// Project-specific configuration (must match App.tsx)
const API_ENDPOINT = "http://localhost:3001";
const PROJECT_ID = "WORK_PROJECT_3001";
const STORAGE_KEY = `currentUser_${PROJECT_ID}`;

const Dashboard: React.FC<DashboardProps> = ({
  userName,
  organizationName,
  onLogout,
  userId: propUserId,
}) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [files, setFiles] = useState<FileData[]>([]);
  const [fileStats, setFileStats] = useState({ totalFiles: 0, totalSize: 0, byCategory: [] });
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileSearch, setFileSearch] = useState("");
  const [fileCategory, setFileCategory] = useState("All");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    status: "Pending" as const,
    priority: "Medium" as const,
    dueDate: "",
  });
  const [employeeFormData, setEmployeeFormData] = useState({
    fullName: "",
    email: "",
    phoneNo: "",
    position: "",
    department: "Engineering",
    employmentType: "Full-time" as const,
    joinDate: "",
    status: "Active" as const,
    reportingTo: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    skills: "",
    salary: "",
  });

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Settings state
  const [activeSettingsTab, setActiveSettingsTab] = useState("organization");
  const [settingsData, setSettingsData] = useState({
    // Organization Settings
    organizationName: organizationName || "Your Company",
    organizationEmail: "organization@email.com",
    organizationPhone: "+1 (555) 000-0000",
    organizationAddress: "123 Business Street, City, State 12345",
    organizationWebsite: "www.company.com",
    organizationLogo: "Logo URL",
    
    // Account Settings
    accountTimeZone: "EST",
    accountLanguage: "English",
    accountDateFormat: "MM/DD/YYYY",
    
    // Security Settings
    twoFactorEnabled: false,
    passwordExpiry: "90",
    loginAttempts: "5",
    sessionTimeout: "30",
    ipRestriction: false,
    
    // Notification Settings
    emailNotifications: true,
    taskReminders: true,
    weeklyReports: false,
    dailyDigest: true,
    slackIntegration: false,
    
    // Privacy Settings
    dataRetention: "12",
    profileVisibility: "Team Only",
    activityTracking: true,
    analyticsTracking: true,
    
    // API Settings
    apiKeysEnabled: false,
    apiRateLimit: "1000",
    webhooksEnabled: false,
    
    // System Settings
    maintenanceMode: false,
    autoBackup: true,
    backupFrequency: "Daily",
    debugMode: false,
  });

  // Get userId from project-specific localStorage
  const getUserId = () => {
    const currentUser = localStorage.getItem(STORAGE_KEY);
    if (currentUser) {
      const user = JSON.parse(currentUser);
      return user.id || propUserId;
    }
    return propUserId;
  };

  const userId = getUserId();

  // Calendar helper functions
  const getDaysInMonth = (month: number, year: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number): number => {
    return new Date(year, month, 1).getDay();
  };

  const getTasksForDate = (date: Date): Task[] => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => task.dueDate && task.dueDate.split('T')[0] === dateStr);
  };

  const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const previousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getTodayTasks = (): Task[] => {
    return getTasksForDate(new Date());
  };

  const getTaskColor = (task: Task): string => {
    if (task.status === "Completed") return "#10b981"; // green
    if (task.priority === "High") return "#ef4444"; // red
    if (task.priority === "Medium") return "#f59e0b"; // orange
    return "#3b82f6"; // blue
  };

  // Analytics helper functions
  const getTaskStats = () => {
    const completed = tasks.filter(t => t.status === "Completed").length;
    const inProgress = tasks.filter(t => t.status === "In Progress").length;
    const pending = tasks.filter(t => t.status === "Pending").length;
    const total = tasks.length;
    
    return {
      total,
      completed,
      inProgress,
      pending,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  };

  const getPriorityStats = () => {
    const high = tasks.filter(t => t.priority === "High").length;
    const medium = tasks.filter(t => t.priority === "Medium").length;
    const low = tasks.filter(t => t.priority === "Low").length;
    return { high, medium, low };
  };

  const getDepartmentStats = () => {
    const dept: Record<string, number> = {};
    employees.forEach(emp => {
      dept[emp.department] = (dept[emp.department] || 0) + 1;
    });
    return Object.entries(dept).map(([name, count]) => ({ name, count }));
  };

  const getProductivityTrend = () => {
    // Mock data for 7 days
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, idx) => ({
      day,
      value: 65 + Math.floor(Math.random() * 35),
    }));
  };

  const getTaskCompletionTrend = () => {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    return weeks.map((week, idx) => ({
      week,
      completed: 5 + idx * 3,
      total: 15 + idx * 2,
    }));
  };

  const getEmployeePerformance = () => {
    const names = ['Alice Johnson', 'Bob Wilson', 'Catherine Lee', 'David Park', 'Emma Brown'];
    return names.map(name => ({
      name,
      performance: 55 + Math.floor(Math.random() * 40),
    }));
  };

  // Fetch data on component mount
  useEffect(() => {
    if (userId) {
      fetchTasks();
      fetchEmployees();
    }
  }, [userId]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/tasks/${userId}`);
      const data = await response.json();
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/employees/${userId}`);
      const data = await response.json();
      if (data.success) {
        setEmployees(data.employees);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  // Task Management
  const handleAddTask = () => {
    setEditingTask(null);
    setTaskFormData({
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
    setTaskFormData({
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
        const response = await fetch(`http://localhost:3001/api/tasks/${taskId}`, {
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
    if (!taskFormData.title.trim()) {
      alert("Please enter a task title");
      return;
    }

    try {
      setLoading(true);

      if (editingTask) {
        const response = await fetch(`http://localhost:3001/api/tasks/${editingTask.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskFormData),
        });
        const data = await response.json();
        if (data.success) {
          setTasks(tasks.map((t) => (t.id === editingTask.id ? { ...t, ...taskFormData } : t)));
          setShowTaskModal(false);
        }
      } else {
        const response = await fetch("http://localhost:3001/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            ...taskFormData,
          }),
        });
        const data = await response.json();
        if (data.success) {
          fetchTasks();
          setShowTaskModal(false);
        }
      }
    } catch (error) {
      console.error("Error saving task:", error);
    } finally {
      setLoading(false);
    }
  };

  // Employee Management
  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setEmployeeFormData({
      fullName: "",
      email: "",
      phoneNo: "",
      position: "",
      department: "Engineering",
      employmentType: "Full-time",
      joinDate: "",
      status: "Active",
      reportingTo: "",
      address: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      skills: "",
      salary: "",
    });
    setShowEmployeeModal(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setEmployeeFormData({
      fullName: employee.fullName,
      email: employee.email,
      phoneNo: employee.phoneNo || "",
      position: employee.position,
      department: employee.department,
      employmentType: employee.employmentType,
      joinDate: employee.joinDate,
      status: employee.status,
      reportingTo: employee.reportingTo || "",
      address: employee.address || "",
      emergencyContactName: employee.emergencyContactName || "",
      emergencyContactPhone: employee.emergencyContactPhone || "",
      skills: employee.skills || "",
      salary: employee.salary ? employee.salary.toString() : "",
    });
    setShowEmployeeModal(true);
  };

  const handleDeleteEmployee = async (employeeId: number) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      try {
        const response = await fetch(`http://localhost:3001/api/employees/${employeeId}`, {
          method: "DELETE",
        });
        const data = await response.json();
        if (data.success) {
          setEmployees(employees.filter((e) => e.id !== employeeId));
        }
      } catch (error) {
        console.error("Error deleting employee:", error);
      }
    }
  };

  const handleSaveEmployee = async () => {
    if (!employeeFormData.fullName.trim() || !employeeFormData.email.trim() || !employeeFormData.position.trim() || !employeeFormData.joinDate) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      if (editingEmployee) {
        const response = await fetch(`http://localhost:5000/api/employees/${editingEmployee.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...employeeFormData,
            salary: employeeFormData.salary ? parseFloat(employeeFormData.salary) : null,
          }),
        });
        const data = await response.json();
        if (data.success) {
          fetchEmployees();
          setShowEmployeeModal(false);
        }
      } else {
        const response = await fetch("http://localhost:3001/api/employees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            ...employeeFormData,
            salary: employeeFormData.salary ? parseFloat(employeeFormData.salary) : null,
          }),
        });
        const data = await response.json();
        if (data.success) {
          fetchEmployees();
          setShowEmployeeModal(false);
        }
      }
    } catch (error) {
      console.error("Error saving employee:", error);
    } finally {
      setLoading(false);
    }
  };

  // File Management Functions
  const fetchFiles = async () => {
    try {
      const params = new URLSearchParams();
      if (fileCategory !== "All") params.append("category", fileCategory);
      if (fileSearch) params.append("search", fileSearch);

      const response = await fetch(`http://localhost:3001/api/files/${userId}?${params}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.success) {
        setFiles(data.files);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const fetchFileStats = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/files/${userId}/stats`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.success) {
        setFileStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching file stats:", error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList) return;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId.toString());
      formData.append("fileCategory", fileCategory !== "All" ? fileCategory : "Document");

      try {
        setUploadProgress(Math.floor(((i + 1) / fileList.length) * 100));
        const response = await fetch("http://localhost:3001/api/files/upload", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        if (data.success) {
          fetchFiles();
          fetchFileStats();
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
    setUploadProgress(0);
    event.target.value = "";
  };

  const handleDeleteFile = async (fileId: number) => {
    if (confirm("Are you sure you want to delete this file?")) {
      try {
        const response = await fetch(`http://localhost:3001/api/files/${fileId}`, {
          method: "DELETE",
        });
        const data = await response.json();
        if (data.success) {
          fetchFiles();
          fetchFileStats();
        }
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    }
  };

  const handleDownloadFile = (fileId: number, fileName: string) => {
    const link = document.createElement("a");
    link.href = `http://localhost:3001/api/files/download/${fileId}`;
    link.download = fileName;
    link.click();
  };

  // Fetch files when tab changes or search/category changes
  useEffect(() => {
    if (activeTab === "files" && userId) {
      fetchFiles();
      fetchFileStats();
    }
  }, [activeTab, userId, fileSearch, fileCategory]);


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

  // SVG Chart Components
  const PieChart = ({ data, colors, title }: { data: Array<{ label: string; value: number }>; colors: string[]; title: string }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = -90;

    const segments = data.map((item, idx) => {
      const sliceAngle = (item.value / total) * 360;
      const startAngle = (currentAngle * Math.PI) / 180;
      const endAngle = ((currentAngle + sliceAngle) * Math.PI) / 180;

      const x1 = 100 + 90 * Math.cos(startAngle);
      const y1 = 100 + 90 * Math.sin(startAngle);
      const x2 = 100 + 90 * Math.cos(endAngle);
      const y2 = 100 + 90 * Math.sin(endAngle);

      const largeArc = sliceAngle > 180 ? 1 : 0;
      const pathData = [
        `M 100 100`,
        `L ${x1} ${y1}`,
        `A 90 90 0 ${largeArc} 1 ${x2} ${y2}`,
        `Z`,
      ].join(' ');

      currentAngle += sliceAngle;

      return (
        <g key={idx}>
          <path d={pathData} fill={colors[idx % colors.length]} stroke="white" strokeWidth="2" />
        </g>
      );
    });

    return (
      <svg viewBox="0 0 200 200" style={{ maxWidth: "200px", height: "200px" }}>
        {segments}
      </svg>
    );
  };

  const LineChart = ({ data, title, maxValue }: { data: Array<{ day?: string; week?: string; value?: number; completed?: number; total?: number }>; title: string; maxValue?: number }) => {
    const width = 400;
    const height = 200;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const max = maxValue || Math.max(...data.map(d => d.value || d.completed || 0));
    const points = data.map((d, idx) => {
      const x = padding + (idx / (data.length - 1)) * chartWidth;
      const y = height - padding - ((d.value || d.completed || 0) / max) * chartHeight;
      return { x, y, value: d.value || d.completed || 0 };
    });

    const pathData = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
      <svg viewBox={`0 0 ${width} ${height}`} style={{ maxWidth: "100%", height: "auto" }}>
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map(i => (
          <line
            key={`grid-${i}`}
            x1={padding}
            y1={padding + (i * chartHeight) / 4}
            x2={width - padding}
            y2={padding + (i * chartHeight) / 4}
            stroke="#e2e8f0"
            strokeDasharray="4"
          />
        ))}

        {/* Axes */}
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#64748b" strokeWidth="2" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#64748b" strokeWidth="2" />

        {/* Line */}
        <path d={pathData} fill="none" stroke="#0ea5e9" strokeWidth="3" />

        {/* Points */}
        {points.map((p, idx) => (
          <circle key={idx} cx={p.x} cy={p.y} r="4" fill="#0ea5e9" />
        ))}

        {/* Labels */}
        {data.map((d, idx) => {
          const x = padding + (idx / (data.length - 1)) * chartWidth;
          return (
            <text key={`label-${idx}`} x={x} y={height - padding + 20} textAnchor="middle" fontSize="12" fill="#64748b">
              {d.day || d.week || ""}
            </text>
          );
        })}
      </svg>
    );
  };

  const BarChart = ({ data, title }: { data: Array<{ name: string; performance: number }>; title: string }) => {
    const width = 400;
    const height = 250;
    const padding = 40;
    const barWidth = (width - padding * 2) / data.length;
    const chartHeight = height - padding * 2;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} style={{ maxWidth: "100%", height: "auto" }}>
        {/* Axes */}
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#64748b" strokeWidth="2" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#64748b" strokeWidth="2" />

        {/* Bars */}
        {data.map((item, idx) => {
          const barHeight = (item.performance / 100) * chartHeight;
          const x = padding + idx * barWidth + barWidth * 0.1;
          const y = height - padding - barHeight;

          return (
            <g key={idx}>
              <rect x={x} y={y} width={barWidth * 0.8} height={barHeight} fill="#0ea5e9" rx="4" />
              <text
                x={x + barWidth * 0.4}
                y={height - padding + 20}
                textAnchor="middle"
                fontSize="12"
                fill="#64748b"
              >
                {item.name.split(' ')[0]}
              </text>
              <text
                x={x + barWidth * 0.4}
                y={y - 5}
                textAnchor="middle"
                fontSize="11"
                fontWeight="bold"
                fill="#0f172a"
              >
                {item.performance}%
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

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
              className={`nav-item ${activeTab === "files" ? "active" : ""}`}
              onClick={() => setActiveTab("files")}
            >
              <span className="nav-icon">📁</span>
              <span>Files</span>
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
                  <button className="add-btn" onClick={handleAddEmployee}>+ Add Employee</button>
                </div>
                {employees.length === 0 ? (
                  <p style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
                    No employees yet. Click "+ Add Employee" to create one.
                  </p>
                ) : (
                  <div className="employees-grid">
                    {employees.map((emp) => (
                      <div key={emp.id} className="employee-card">
                        <div className="employee-card-header">
                          <div className="employee-avatar">
                            {emp.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="employee-basic">
                            <h3>{emp.fullName}</h3>
                            <p className="position">{emp.position}</p>
                            <p className="email">{emp.email}</p>
                          </div>
                          <span className={`status-badge ${emp.status.toLowerCase()}`}>
                            {emp.status}
                          </span>
                        </div>
                        <div className="employee-details">
                          <div className="detail-row">
                            <span className="label">Department:</span>
                            <span className="value">{emp.department}</span>
                          </div>
                          <div className="detail-row">
                            <span className="label">Employment Type:</span>
                            <span className="value">{emp.employmentType}</span>
                          </div>
                          <div className="detail-row">
                            <span className="label">Join Date:</span>
                            <span className="value">{new Date(emp.joinDate).toLocaleDateString()}</span>
                          </div>
                          {emp.phoneNo && (
                            <div className="detail-row">
                              <span className="label">Phone:</span>
                              <span className="value">{emp.phoneNo}</span>
                            </div>
                          )}
                          {emp.reportingTo && (
                            <div className="detail-row">
                              <span className="label">Reports To:</span>
                              <span className="value">{emp.reportingTo}</span>
                            </div>
                          )}
                          {emp.skills && (
                            <div className="detail-row full">
                              <span className="label">Skills:</span>
                              <span className="value">{emp.skills}</span>
                            </div>
                          )}
                          {emp.salary && (
                            <div className="detail-row">
                              <span className="label">Salary:</span>
                              <span className="value salary">₹{emp.salary.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                        <div className="employee-actions">
                          <button className="edit-btn" onClick={() => handleEditEmployee(emp)}>Edit</button>
                          <button className="delete-btn" onClick={() => handleDeleteEmployee(emp.id)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

          {activeTab === "files" && (
            <div className="content-section">
              <h2>📁 Files & Documents</h2>
              
              {/* File Statistics */}
              <div className="file-stats-grid">
                <div className="stat-card">
                  <p className="stat-value">{fileStats.totalFiles}</p>
                  <p className="stat-label">Total Files</p>
                </div>
                <div className="stat-card">
                  <p className="stat-value">{(fileStats.totalSize / 1024 / 1024).toFixed(2)} MB</p>
                  <p className="stat-label">Total Size</p>
                </div>
              </div>

              {/* Upload Area */}
              <div className="section-card">
                <div className="upload-area">
                  <label className="upload-label">
                    <div className="upload-content">
                      <div className="upload-icon">📤</div>
                      <p className="upload-text">Drag and drop files here or click to browse</p>
                      <p className="upload-hint">Supported: PDF, Word, Excel, Images, Text, ZIP (Max 50MB)</p>
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        style={{ display: "none" }}
                      />
                    </div>
                  </label>
                  {uploadProgress > 0 && (
                    <div className="upload-progress">
                      <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                      <p>{uploadProgress}%</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Search and Filter */}
              <div className="section-card">
                <div className="file-controls">
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={fileSearch}
                    onChange={(e) => setFileSearch(e.target.value)}
                    className="file-search"
                  />
                  <select
                    value={fileCategory}
                    onChange={(e) => setFileCategory(e.target.value)}
                    className="file-category-filter"
                  >
                    <option value="All">All Categories</option>
                    <option value="Note">Notes</option>
                    <option value="Document">Documents</option>
                    <option value="Data">Data</option>
                    <option value="Statistics">Statistics</option>
                    <option value="Report">Reports</option>
                    <option value="Spreadsheet">Spreadsheets</option>
                    <option value="Presentation">Presentations</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Files List */}
                {files.length === 0 ? (
                  <p style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
                    No files yet. Upload files to get started.
                  </p>
                ) : (
                  <div className="files-grid">
                    {files.map((file) => (
                      <div key={file.id} className="file-card">
                        <div className="file-icon">
                          {file.fileType.includes("pdf") ? "📄" : file.fileType.includes("word") ? "📝" : file.fileType.includes("sheet") ? "📊" : file.fileType.includes("image") ? "🖼️" : "📎"}
                        </div>
                        <div className="file-info">
                          <h4>{file.originalFileName}</h4>
                          <p className="file-meta">
                            {(file.fileSize / 1024).toFixed(2)} KB • {new Date(file.uploadedDate).toLocaleDateString()}
                          </p>
                          <p className="file-category-badge">{file.fileCategory}</p>
                          {file.description && <p className="file-description">{file.description}</p>}
                          {file.tags && <p className="file-tags">Tags: {file.tags}</p>}
                        </div>
                        <div className="file-actions">
                          <button className="download-btn" onClick={() => handleDownloadFile(file.id, file.originalFileName)}>
                            Download
                          </button>
                          <button className="delete-btn" onClick={() => handleDeleteFile(file.id)}>
                            Delete
                          </button>
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
              <h2>Team Schedule & Calendar</h2>
              <div className="calendar-container">
                {/* Calendar Header with Navigation */}
                <div className="calendar-header">
                  <button className="nav-button" onClick={previousMonth}>
                    ← Previous
                  </button>
                  <h3>
                    {new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </h3>
                  <button className="nav-button" onClick={nextMonth}>
                    Next →
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="calendar-wrapper">
                  {/* Weekday Headers */}
                  <div className="calendar-weekdays">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="weekday-header">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="calendar-days">
                    {Array.from({ length: getFirstDayOfMonth(currentMonth, currentYear) }).map(
                      (_, index) => (
                        <div key={`empty-${index}`} className="calendar-day empty"></div>
                      )
                    )}

                    {Array.from({ length: getDaysInMonth(currentMonth, currentYear) }).map(
                      (_, index) => {
                        const date = new Date(currentYear, currentMonth, index + 1);
                        const dayTasks = getTasksForDate(date);
                        const isToday =
                          date.toDateString() === new Date().toDateString();
                        const isSelected =
                          date.toDateString() === selectedDate.toDateString();

                        return (
                          <div
                            key={`day-${index + 1}`}
                            className={`calendar-day ${isToday ? 'today' : ''} ${
                              isSelected ? 'selected' : ''
                            }`}
                            onClick={() => setSelectedDate(date)}
                          >
                            <div className="day-number">{index + 1}</div>
                            {dayTasks.length > 0 && (
                              <div className="day-tasks">
                                {dayTasks.slice(0, 2).map((task) => (
                                  <div
                                    key={task.id}
                                    className="task-indicator"
                                    style={{
                                      backgroundColor: getTaskColor(task),
                                    }}
                                    title={task.title}
                                  ></div>
                                ))}
                                {dayTasks.length > 2 && (
                                  <div className="task-more">+{dayTasks.length - 2}</div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Selected Date Tasks */}
                <div className="selected-date-container">
                  <div className="selected-date-header">
                    <h3>
                      Tasks for {formatDateForDisplay(selectedDate)}
                    </h3>
                    <button
                      className="quick-add-button"
                      onClick={() => {
                        setEditingTask(null);
                        setTaskFormData({
                          title: "",
                          description: "",
                          status: "Pending",
                          priority: "Medium",
                          dueDate: selectedDate.toISOString().split('T')[0],
                        });
                        setShowTaskModal(true);
                      }}
                    >
                      + Add Task
                    </button>
                  </div>

                  <div className="selected-date-tasks">
                    {getTasksForDate(selectedDate).length === 0 ? (
                      <p className="no-tasks-message">No tasks scheduled for this date</p>
                    ) : (
                      getTasksForDate(selectedDate).map((task) => (
                        <div key={task.id} className="task-event-card">
                          <div className="task-event-left">
                            <div
                              className="task-event-color"
                              style={{
                                backgroundColor: getTaskColor(task),
                              }}
                            ></div>
                          </div>
                          <div className="task-event-content">
                            <h4>{task.title}</h4>
                            {task.description && (
                              <p className="task-description">{task.description}</p>
                            )}
                            <div className="task-event-meta">
                              <span className={`status-badge status-${task.status.toLowerCase()}`}>
                                {task.status}
                              </span>
                              <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
                                {task.priority}
                              </span>
                            </div>
                          </div>
                          <div className="task-event-actions">
                            <button
                              onClick={() => {
                                setEditingTask(task);
                                setTaskFormData({
                                  title: task.title,
                                  description: task.description,
                                  status: task.status as "Pending" | "In Progress" | "Completed",
                                  priority: task.priority as "Low" | "Medium" | "High",
                                  dueDate: task.dueDate,
                                });
                                setShowTaskModal(true);
                              }}
                              className="icon-button"
                              title="Edit task"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="icon-button delete"
                              title="Delete task"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Today's Overview */}
                  {getTodayTasks().length > 0 && (
                    <div className="todays-overview">
                      <h4>Today's Tasks ({getTodayTasks().length})</h4>
                      <div className="today-tasks-list">
                        {getTodayTasks().map((task) => (
                          <div key={task.id} className="today-task-item">
                            <span className="task-title">{task.title}</span>
                            <span className={`status-badge status-${task.status.toLowerCase()}`}>
                              {task.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="content-section">
              <h2>Reports & Analytics</h2>

              {/* Key Metrics Cards */}
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-icon" style={{ backgroundColor: "#0ea5e9" }}>📊</div>
                  <h3>Total Tasks</h3>
                  <p className="metric-value">{getTaskStats().total}</p>
                  <p className="metric-label">Across all projects</p>
                </div>
                <div className="metric-card">
                  <div className="metric-icon" style={{ backgroundColor: "#10b981" }}>✓</div>
                  <h3>Completed</h3>
                  <p className="metric-value">{getTaskStats().completed}</p>
                  <p className="metric-label">{getTaskStats().completionRate}% completion rate</p>
                </div>
                <div className="metric-card">
                  <div className="metric-icon" style={{ backgroundColor: "#f59e0b" }}>⏳</div>
                  <h3>In Progress</h3>
                  <p className="metric-value">{getTaskStats().inProgress}</p>
                  <p className="metric-label">Active tasks</p>
                </div>
                <div className="metric-card">
                  <div className="metric-icon" style={{ backgroundColor: "#ef4444" }}>⚠️</div>
                  <h3>Pending</h3>
                  <p className="metric-value">{getTaskStats().pending}</p>
                  <p className="metric-label">Awaiting action</p>
                </div>
                <div className="metric-card">
                  <div className="metric-icon" style={{ backgroundColor: "#8b5cf6" }}>👥</div>
                  <h3>Team Members</h3>
                  <p className="metric-value">{employees.length}</p>
                  <p className="metric-label">Active employees</p>
                </div>
                <div className="metric-card">
                  <div className="metric-icon" style={{ backgroundColor: "#ec4899" }}>📁</div>
                  <h3>Total Files</h3>
                  <p className="metric-value">{files.length}</p>
                  <p className="metric-label">Uploaded documents</p>
                </div>
              </div>

              {/* Charts Section */}
              <div className="charts-section">
                {/* First Row */}
                <div className="chart-row">
                  {/* Task Status Pie Chart */}
                  <div className="chart-card">
                    <h3>Task Status Distribution</h3>
                    <div className="chart-wrapper">
                      <div className="chart-display">
                        <PieChart
                          data={[
                            { label: "Completed", value: getTaskStats().completed },
                            { label: "In Progress", value: getTaskStats().inProgress },
                            { label: "Pending", value: getTaskStats().pending },
                          ]}
                          colors={["#10b981", "#3b82f6", "#f59e0b"]}
                          title="Task Status"
                        />
                      </div>
                      <div className="chart-legend">
                        <div className="legend-item">
                          <span className="legend-color" style={{ backgroundColor: "#10b981" }}></span>
                          <span>Completed</span>
                          <span className="legend-value">{getTaskStats().completed}</span>
                        </div>
                        <div className="legend-item">
                          <span className="legend-color" style={{ backgroundColor: "#3b82f6" }}></span>
                          <span>In Progress</span>
                          <span className="legend-value">{getTaskStats().inProgress}</span>
                        </div>
                        <div className="legend-item">
                          <span className="legend-color" style={{ backgroundColor: "#f59e0b" }}></span>
                          <span>Pending</span>
                          <span className="legend-value">{getTaskStats().pending}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Priority Distribution Pie Chart */}
                  <div className="chart-card">
                    <h3>Task Priority Breakdown</h3>
                    <div className="chart-wrapper">
                      <div className="chart-display">
                        <PieChart
                          data={[
                            { label: "High", value: getPriorityStats().high },
                            { label: "Medium", value: getPriorityStats().medium },
                            { label: "Low", value: getPriorityStats().low },
                          ]}
                          colors={["#ef4444", "#f59e0b", "#3b82f6"]}
                          title="Task Priority"
                        />
                      </div>
                      <div className="chart-legend">
                        <div className="legend-item">
                          <span className="legend-color" style={{ backgroundColor: "#ef4444" }}></span>
                          <span>High</span>
                          <span className="legend-value">{getPriorityStats().high}</span>
                        </div>
                        <div className="legend-item">
                          <span className="legend-color" style={{ backgroundColor: "#f59e0b" }}></span>
                          <span>Medium</span>
                          <span className="legend-value">{getPriorityStats().medium}</span>
                        </div>
                        <div className="legend-item">
                          <span className="legend-color" style={{ backgroundColor: "#3b82f6" }}></span>
                          <span>Low</span>
                          <span className="legend-value">{getPriorityStats().low}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Department Distribution */}
                  <div className="chart-card">
                    <h3>Team by Department</h3>
                    <div className="chart-wrapper">
                      <div className="chart-display">
                        <PieChart
                          data={getDepartmentStats().map(d => ({ label: d.name, value: d.count }))}
                          colors={["#0ea5e9", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"]}
                          title="Departments"
                        />
                      </div>
                      <div className="chart-legend">
                        {getDepartmentStats().map((dept, idx) => (
                          <div key={idx} className="legend-item">
                            <span className="legend-color" style={{ backgroundColor: ["#0ea5e9", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"][idx] }}></span>
                            <span>{dept.name}</span>
                            <span className="legend-value">{dept.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Second Row - Line Charts */}
                <div className="chart-row">
                  <div className="chart-card full-width">
                    <h3>Productivity Trend (Last 7 Days)</h3>
                    <div className="line-chart-container">
                      <LineChart data={getProductivityTrend()} title="Daily Productivity" maxValue={100} />
                    </div>
                    <div className="chart-stats">
                      <div className="stat-box">
                        <span className="stat-label">Average</span>
                        <span className="stat-value">82%</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-label">Peak</span>
                        <span className="stat-value">95%</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-label">Trend</span>
                        <span className="stat-value" style={{ color: "#10b981" }}>↑ 12%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Third Row - Task Completion and Performance */}
                <div className="chart-row">
                  <div className="chart-card full-width">
                    <h3>Task Completion Trend (Monthly)</h3>
                    <div className="line-chart-container">
                      <LineChart data={getTaskCompletionTrend()} title="Monthly Completion" maxValue={25} />
                    </div>
                  </div>
                </div>

                {/* Fourth Row - Employee Performance */}
                <div className="chart-row">
                  <div className="chart-card full-width">
                    <h3>Employee Performance Score</h3>
                    <div className="bar-chart-container">
                      <BarChart data={getEmployeePerformance()} title="Performance" />
                    </div>
                  </div>
                </div>

                {/* Fifth Row - Summary Cards */}
                <div className="summary-cards">
                  <div className="summary-card">
                    <h4>Overall Productivity</h4>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: "85%" }}></div>
                    </div>
                    <p className="progress-text">85% • Team performing above target</p>
                  </div>

                  <div className="summary-card">
                    <h4>Project Completion</h4>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: "72%", backgroundColor: "#10b981" }}></div>
                    </div>
                    <p className="progress-text">72% • 18 of 25 projects completed</p>
                  </div>

                  <div className="summary-card">
                    <h4>Team Attendance</h4>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: "96%", backgroundColor: "#8b5cf6" }}></div>
                    </div>
                    <p className="progress-text">96% • Excellent attendance record</p>
                  </div>

                  <div className="summary-card">
                    <h4>Quality Metrics</h4>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: "88%", backgroundColor: "#ec4899" }}></div>
                    </div>
                    <p className="progress-text">88% • High quality standards met</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="content-section">
              <h2>Settings & Configuration</h2>
              
              <div className="settings-container">
                {/* Settings Sidebar Navigation */}
                <div className="settings-sidebar">
                  <nav className="settings-nav">
                    <button
                      className={`settings-nav-item ${activeSettingsTab === "organization" ? "active" : ""}`}
                      onClick={() => setActiveSettingsTab("organization")}
                    >
                      <span className="nav-icon">🏢</span>
                      <span className="nav-label">Organization</span>
                    </button>
                    <button
                      className={`settings-nav-item ${activeSettingsTab === "account" ? "active" : ""}`}
                      onClick={() => setActiveSettingsTab("account")}
                    >
                      <span className="nav-icon">👤</span>
                      <span className="nav-label">Account</span>
                    </button>
                    <button
                      className={`settings-nav-item ${activeSettingsTab === "security" ? "active" : ""}`}
                      onClick={() => setActiveSettingsTab("security")}
                    >
                      <span className="nav-icon">🔒</span>
                      <span className="nav-label">Security</span>
                    </button>
                    <button
                      className={`settings-nav-item ${activeSettingsTab === "notifications" ? "active" : ""}`}
                      onClick={() => setActiveSettingsTab("notifications")}
                    >
                      <span className="nav-icon">🔔</span>
                      <span className="nav-label">Notifications</span>
                    </button>
                    <button
                      className={`settings-nav-item ${activeSettingsTab === "privacy" ? "active" : ""}`}
                      onClick={() => setActiveSettingsTab("privacy")}
                    >
                      <span className="nav-icon">🔐</span>
                      <span className="nav-label">Privacy</span>
                    </button>
                    <button
                      className={`settings-nav-item ${activeSettingsTab === "api" ? "active" : ""}`}
                      onClick={() => setActiveSettingsTab("api")}
                    >
                      <span className="nav-icon">⚙️</span>
                      <span className="nav-label">API</span>
                    </button>
                    <button
                      className={`settings-nav-item ${activeSettingsTab === "system" ? "active" : ""}`}
                      onClick={() => setActiveSettingsTab("system")}
                    >
                      <span className="nav-icon">💻</span>
                      <span className="nav-label">System</span>
                    </button>
                  </nav>
                </div>

                {/* Settings Content */}
                <div className="settings-content">
                  {/* Organization Settings */}
                  {activeSettingsTab === "organization" && (
                    <div className="settings-panel">
                      <div className="panel-header">
                        <h3>Organization Settings</h3>
                        <p>Manage your organization details and branding</p>
                      </div>

                      <div className="settings-section">
                        <h4>Basic Information</h4>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Organization Name *</label>
                            <input
                              type="text"
                              value={settingsData.organizationName}
                              onChange={(e) => setSettingsData({ ...settingsData, organizationName: e.target.value })}
                              placeholder="Enter organization name"
                            />
                          </div>
                          <div className="form-group">
                            <label>Industry Type</label>
                            <select>
                              <option value="">Select Industry</option>
                              <option value="tech">Technology</option>
                              <option value="finance">Finance</option>
                              <option value="retail">Retail</option>
                              <option value="healthcare">Healthcare</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="settings-section">
                        <h4>Contact Information</h4>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Email Address</label>
                            <input
                              type="email"
                              value={settingsData.organizationEmail}
                              onChange={(e) => setSettingsData({ ...settingsData, organizationEmail: e.target.value })}
                              placeholder="organization@email.com"
                            />
                          </div>
                          <div className="form-group">
                            <label>Phone Number</label>
                            <input
                              type="tel"
                              value={settingsData.organizationPhone}
                              onChange={(e) => setSettingsData({ ...settingsData, organizationPhone: e.target.value })}
                              placeholder="+1 (555) 000-0000"
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Address</label>
                          <textarea
                            value={settingsData.organizationAddress}
                            onChange={(e) => setSettingsData({ ...settingsData, organizationAddress: e.target.value })}
                            placeholder="123 Business Street, City, State 12345"
                            rows={2}
                          ></textarea>
                        </div>
                      </div>

                      <div className="settings-section">
                        <h4>Online Presence</h4>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Website URL</label>
                            <input
                              type="url"
                              value={settingsData.organizationWebsite}
                              onChange={(e) => setSettingsData({ ...settingsData, organizationWebsite: e.target.value })}
                              placeholder="www.company.com"
                            />
                          </div>
                          <div className="form-group">
                            <label>Logo URL</label>
                            <input
                              type="url"
                              value={settingsData.organizationLogo}
                              onChange={(e) => setSettingsData({ ...settingsData, organizationLogo: e.target.value })}
                              placeholder="Logo URL"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="settings-actions">
                        <button className="btn-primary">Save Changes</button>
                        <button className="btn-secondary">Discard</button>
                      </div>
                    </div>
                  )}

                  {/* Account Settings */}
                  {activeSettingsTab === "account" && (
                    <div className="settings-panel">
                      <div className="panel-header">
                        <h3>Account Settings</h3>
                        <p>Customize your account preferences</p>
                      </div>

                      <div className="settings-section">
                        <h4>Regional Preferences</h4>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Time Zone</label>
                            <select value={settingsData.accountTimeZone} onChange={(e) => setSettingsData({ ...settingsData, accountTimeZone: e.target.value })}>
                              <option value="EST">Eastern Standard Time</option>
                              <option value="CST">Central Standard Time</option>
                              <option value="MST">Mountain Standard Time</option>
                              <option value="PST">Pacific Standard Time</option>
                              <option value="GMT">Greenwich Mean Time</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Language</label>
                            <select value={settingsData.accountLanguage} onChange={(e) => setSettingsData({ ...settingsData, accountLanguage: e.target.value })}>
                              <option value="English">English</option>
                              <option value="Spanish">Spanish</option>
                              <option value="French">French</option>
                              <option value="German">German</option>
                              <option value="Chinese">Chinese</option>
                            </select>
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Date Format</label>
                          <select value={settingsData.accountDateFormat} onChange={(e) => setSettingsData({ ...settingsData, accountDateFormat: e.target.value })}>
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                          </select>
                        </div>
                      </div>

                      <div className="settings-section">
                        <h4>Theme & Display</h4>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Color Scheme</label>
                            <select>
                              <option value="light">Light</option>
                              <option value="dark">Dark</option>
                              <option value="auto">Auto (based on system)</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Items Per Page</label>
                            <select>
                              <option value="10">10</option>
                              <option value="25">25</option>
                              <option value="50">50</option>
                              <option value="100">100</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="settings-actions">
                        <button className="btn-primary">Save Changes</button>
                        <button className="btn-secondary">Discard</button>
                      </div>
                    </div>
                  )}

                  {/* Security Settings */}
                  {activeSettingsTab === "security" && (
                    <div className="settings-panel">
                      <div className="panel-header">
                        <h3>Security Settings</h3>
                        <p>Protect your account and data</p>
                      </div>

                      <div className="settings-section">
                        <h4>Authentication</h4>
                        <div className="toggle-item">
                          <div className="toggle-content">
                            <label>Two-Factor Authentication</label>
                            <p className="setting-description">Add an extra layer of security to your account</p>
                          </div>
                          <label className="toggle-switch">
                            <input type="checkbox" checked={settingsData.twoFactorEnabled} onChange={(e) => setSettingsData({ ...settingsData, twoFactorEnabled: e.target.checked })} />
                            <span></span>
                          </label>
                        </div>
                      </div>

                      <div className="settings-section">
                        <h4>Password Policy</h4>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Password Expiry (days)</label>
                            <input
                              type="number"
                              value={settingsData.passwordExpiry}
                              onChange={(e) => setSettingsData({ ...settingsData, passwordExpiry: e.target.value })}
                              placeholder="90"
                            />
                          </div>
                          <div className="form-group">
                            <label>Failed Login Attempts</label>
                            <input
                              type="number"
                              value={settingsData.loginAttempts}
                              onChange={(e) => setSettingsData({ ...settingsData, loginAttempts: e.target.value })}
                              placeholder="5"
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Session Timeout (minutes)</label>
                          <input
                            type="number"
                            value={settingsData.sessionTimeout}
                            onChange={(e) => setSettingsData({ ...settingsData, sessionTimeout: e.target.value })}
                            placeholder="30"
                          />
                        </div>
                      </div>

                      <div className="settings-section">
                        <h4>Access Control</h4>
                        <div className="toggle-item">
                          <div className="toggle-content">
                            <label>IP Address Restriction</label>
                            <p className="setting-description">Only allow access from specific IP addresses</p>
                          </div>
                          <label className="toggle-switch">
                            <input type="checkbox" checked={settingsData.ipRestriction} onChange={(e) => setSettingsData({ ...settingsData, ipRestriction: e.target.checked })} />
                            <span></span>
                          </label>
                        </div>
                        {settingsData.ipRestriction && (
                          <div className="form-group">
                            <label>Allowed IP Addresses</label>
                            <textarea placeholder="Enter IP addresses, one per line" rows={3}></textarea>
                          </div>
                        )}
                      </div>

                      <div className="settings-actions">
                        <button className="btn-primary">Save Changes</button>
                        <button className="btn-secondary">Discard</button>
                      </div>
                    </div>
                  )}

                  {/* Notification Settings */}
                  {activeSettingsTab === "notifications" && (
                    <div className="settings-panel">
                      <div className="panel-header">
                        <h3>Notification Preferences</h3>
                        <p>Control how and when you receive notifications</p>
                      </div>

                      <div className="settings-section">
                        <h4>Email Notifications</h4>
                        <div className="toggle-item">
                          <div className="toggle-content">
                            <label>Email Notifications</label>
                            <p className="setting-description">Receive important updates via email</p>
                          </div>
                          <label className="toggle-switch">
                            <input type="checkbox" checked={settingsData.emailNotifications} onChange={(e) => setSettingsData({ ...settingsData, emailNotifications: e.target.checked })} />
                            <span></span>
                          </label>
                        </div>
                        <div className="toggle-item">
                          <div className="toggle-content">
                            <label>Task Reminders</label>
                            <p className="setting-description">Get notified about upcoming task deadlines</p>
                          </div>
                          <label className="toggle-switch">
                            <input type="checkbox" checked={settingsData.taskReminders} onChange={(e) => setSettingsData({ ...settingsData, taskReminders: e.target.checked })} />
                            <span></span>
                          </label>
                        </div>
                      </div>

                      <div className="settings-section">
                        <h4>Report & Summary</h4>
                        <div className="toggle-item">
                          <div className="toggle-content">
                            <label>Weekly Reports</label>
                            <p className="setting-description">Receive weekly team performance reports</p>
                          </div>
                          <label className="toggle-switch">
                            <input type="checkbox" checked={settingsData.weeklyReports} onChange={(e) => setSettingsData({ ...settingsData, weeklyReports: e.target.checked })} />
                            <span></span>
                          </label>
                        </div>
                        <div className="toggle-item">
                          <div className="toggle-content">
                            <label>Daily Digest</label>
                            <p className="setting-description">Get a daily summary of activities</p>
                          </div>
                          <label className="toggle-switch">
                            <input type="checkbox" checked={settingsData.dailyDigest} onChange={(e) => setSettingsData({ ...settingsData, dailyDigest: e.target.checked })} />
                            <span></span>
                          </label>
                        </div>
                      </div>

                      <div className="settings-section">
                        <h4>Integrations</h4>
                        <div className="toggle-item">
                          <div className="toggle-content">
                            <label>Slack Notifications</label>
                            <p className="setting-description">Send notifications to Slack</p>
                          </div>
                          <label className="toggle-switch">
                            <input type="checkbox" checked={settingsData.slackIntegration} onChange={(e) => setSettingsData({ ...settingsData, slackIntegration: e.target.checked })} />
                            <span></span>
                          </label>
                        </div>
                      </div>

                      <div className="settings-actions">
                        <button className="btn-primary">Save Changes</button>
                        <button className="btn-secondary">Discard</button>
                      </div>
                    </div>
                  )}

                  {/* Privacy Settings */}
                  {activeSettingsTab === "privacy" && (
                    <div className="settings-panel">
                      <div className="panel-header">
                        <h3>Privacy & Data</h3>
                        <p>Manage your privacy preferences and data</p>
                      </div>

                      <div className="settings-section">
                        <h4>Data Retention</h4>
                        <div className="form-group">
                          <label>Retain Data For (months)</label>
                          <input
                            type="number"
                            value={settingsData.dataRetention}
                            onChange={(e) => setSettingsData({ ...settingsData, dataRetention: e.target.value })}
                            placeholder="12"
                          />
                          <p className="setting-description">Automatically delete data older than specified period</p>
                        </div>
                      </div>

                      <div className="settings-section">
                        <h4>Profile Visibility</h4>
                        <div className="form-group">
                          <label>Who can see your profile?</label>
                          <select value={settingsData.profileVisibility} onChange={(e) => setSettingsData({ ...settingsData, profileVisibility: e.target.value })}>
                            <option value="Private">Private (Only me)</option>
                            <option value="Team Only">Team Only</option>
                            <option value="Organization">Organization</option>
                            <option value="Public">Public</option>
                          </select>
                        </div>
                      </div>

                      <div className="settings-section">
                        <h4>Activity & Analytics</h4>
                        <div className="toggle-item">
                          <div className="toggle-content">
                            <label>Activity Tracking</label>
                            <p className="setting-description">Allow system to track your activity for analytics</p>
                          </div>
                          <label className="toggle-switch">
                            <input type="checkbox" checked={settingsData.activityTracking} onChange={(e) => setSettingsData({ ...settingsData, activityTracking: e.target.checked })} />
                            <span></span>
                          </label>
                        </div>
                        <div className="toggle-item">
                          <div className="toggle-content">
                            <label>Analytics Tracking</label>
                            <p className="setting-description">Help us improve by sharing analytics data</p>
                          </div>
                          <label className="toggle-switch">
                            <input type="checkbox" checked={settingsData.analyticsTracking} onChange={(e) => setSettingsData({ ...settingsData, analyticsTracking: e.target.checked })} />
                            <span></span>
                          </label>
                        </div>
                      </div>

                      <div className="settings-actions">
                        <button className="btn-primary">Save Changes</button>
                        <button className="btn-secondary">Discard</button>
                      </div>
                    </div>
                  )}

                  {/* API Settings */}
                  {activeSettingsTab === "api" && (
                    <div className="settings-panel">
                      <div className="panel-header">
                        <h3>API & Integration</h3>
                        <p>Manage API keys and integrations</p>
                      </div>

                      <div className="settings-section">
                        <h4>API Access</h4>
                        <div className="toggle-item">
                          <div className="toggle-content">
                            <label>Enable API Access</label>
                            <p className="setting-description">Allow third-party applications to access your data</p>
                          </div>
                          <label className="toggle-switch">
                            <input type="checkbox" checked={settingsData.apiKeysEnabled} onChange={(e) => setSettingsData({ ...settingsData, apiKeysEnabled: e.target.checked })} />
                            <span></span>
                          </label>
                        </div>
                      </div>

                      {settingsData.apiKeysEnabled && (
                        <div className="settings-section">
                          <h4>API Keys</h4>
                          <div className="api-key-item">
                            <div className="api-key-info">
                              <p className="api-key-name">Production Key</p>
                              <p className="api-key-value">sk_live_1234567890abcdef...</p>
                              <p className="api-key-meta">Created on Feb 15, 2026</p>
                            </div>
                            <button className="btn-small">Regenerate</button>
                          </div>
                          <button className="btn-secondary">+ Generate New Key</button>
                        </div>
                      )}

                      <div className="settings-section">
                        <h4>Rate Limiting</h4>
                        <div className="form-group">
                          <label>API Rate Limit (requests/hour)</label>
                          <input
                            type="number"
                            value={settingsData.apiRateLimit}
                            onChange={(e) => setSettingsData({ ...settingsData, apiRateLimit: e.target.value })}
                            placeholder="1000"
                          />
                        </div>
                      </div>

                      <div className="settings-section">
                        <h4>Webhooks</h4>
                        <div className="toggle-item">
                          <div className="toggle-content">
                            <label>Enable Webhooks</label>
                            <p className="setting-description">Receive real-time event notifications</p>
                          </div>
                          <label className="toggle-switch">
                            <input type="checkbox" checked={settingsData.webhooksEnabled} onChange={(e) => setSettingsData({ ...settingsData, webhooksEnabled: e.target.checked })} />
                            <span></span>
                          </label>
                        </div>
                      </div>

                      <div className="settings-actions">
                        <button className="btn-primary">Save Changes</button>
                        <button className="btn-secondary">Discard</button>
                      </div>
                    </div>
                  )}

                  {/* System Settings */}
                  {activeSettingsTab === "system" && (
                    <div className="settings-panel">
                      <div className="panel-header">
                        <h3>System Administration</h3>
                        <p>System-wide configuration and maintenance</p>
                      </div>

                      <div className="settings-section">
                        <h4>Maintenance</h4>
                        <div className="toggle-item">
                          <div className="toggle-content">
                            <label>Maintenance Mode</label>
                            <p className="setting-description">Temporarily disable access for non-admins</p>
                          </div>
                          <label className="toggle-switch">
                            <input type="checkbox" checked={settingsData.maintenanceMode} onChange={(e) => setSettingsData({ ...settingsData, maintenanceMode: e.target.checked })} />
                            <span></span>
                          </label>
                        </div>
                      </div>

                      <div className="settings-section">
                        <h4>Backup & Recovery</h4>
                        <div className="toggle-item">
                          <div className="toggle-content">
                            <label>Automatic Backups</label>
                            <p className="setting-description">Automatically backup your data</p>
                          </div>
                          <label className="toggle-switch">
                            <input type="checkbox" checked={settingsData.autoBackup} onChange={(e) => setSettingsData({ ...settingsData, autoBackup: e.target.checked })} />
                            <span></span>
                          </label>
                        </div>
                        {settingsData.autoBackup && (
                          <div className="form-group">
                            <label>Backup Frequency</label>
                            <select value={settingsData.backupFrequency} onChange={(e) => setSettingsData({ ...settingsData, backupFrequency: e.target.value })}>
                              <option value="Hourly">Hourly</option>
                              <option value="Daily">Daily</option>
                              <option value="Weekly">Weekly</option>
                              <option value="Monthly">Monthly</option>
                            </select>
                          </div>
                        )}
                      </div>

                      <div className="settings-section">
                        <h4>Debugging</h4>
                        <div className="toggle-item">
                          <div className="toggle-content">
                            <label>Debug Mode</label>
                            <p className="setting-description">Enable detailed error logging and debugging</p>
                          </div>
                          <label className="toggle-switch">
                            <input type="checkbox" checked={settingsData.debugMode} onChange={(e) => setSettingsData({ ...settingsData, debugMode: e.target.checked })} />
                            <span></span>
                          </label>
                        </div>
                      </div>

                      <div className="settings-section">
                        <h4>Danger Zone</h4>
                        <div className="danger-zone">
                          <button className="btn-danger">Clear All Cache</button>
                          <button className="btn-danger">Reset to Defaults</button>
                          <button className="btn-danger">Delete All Data</button>
                        </div>
                      </div>

                      <div className="settings-actions">
                        <button className="btn-primary">Save Changes</button>
                        <button className="btn-secondary">Discard</button>
                      </div>
                    </div>
                  )}
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
                    value={taskFormData.title}
                    onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                    placeholder="Enter task title"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={taskFormData.description}
                    onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                    placeholder="Enter task description"
                    rows={4}
                  ></textarea>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={taskFormData.status}
                      onChange={(e) => setTaskFormData({ ...taskFormData, status: e.target.value as any })}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      value={taskFormData.priority}
                      onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value as any })}
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
                    value={taskFormData.dueDate}
                    onChange={(e) => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
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

        {/* Employee Modal */}
        {showEmployeeModal && (
          <div className="modal-overlay">
            <div className="modal modal-large">
              <div className="modal-header">
                <h2>{editingEmployee ? "Edit Employee" : "Add New Employee"}</h2>
                <button className="modal-close" onClick={() => setShowEmployeeModal(false)}>✕</button>
              </div>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={employeeFormData.fullName}
                      onChange={(e) => setEmployeeFormData({ ...employeeFormData, fullName: e.target.value })}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={employeeFormData.email}
                      onChange={(e) => setEmployeeFormData({ ...employeeFormData, email: e.target.value })}
                      placeholder="Enter email"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={employeeFormData.phoneNo}
                      onChange={(e) => setEmployeeFormData({ ...employeeFormData, phoneNo: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="form-group">
                    <label>Position *</label>
                    <input
                      type="text"
                      value={employeeFormData.position}
                      onChange={(e) => setEmployeeFormData({ ...employeeFormData, position: e.target.value })}
                      placeholder="e.g., Senior Developer"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Department *</label>
                    <select
                      value={employeeFormData.department}
                      onChange={(e) => setEmployeeFormData({ ...employeeFormData, department: e.target.value })}
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Design">Design</option>
                      <option value="Sales">Sales</option>
                      <option value="HR">HR</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Finance">Finance</option>
                      <option value="Operations">Operations</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Employment Type</label>
                    <select
                      value={employeeFormData.employmentType}
                      onChange={(e) => setEmployeeFormData({ ...employeeFormData, employmentType: e.target.value as any })}
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Intern">Intern</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Join Date *</label>
                    <input
                      type="date"
                      value={employeeFormData.joinDate}
                      onChange={(e) => setEmployeeFormData({ ...employeeFormData, joinDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={employeeFormData.status}
                      onChange={(e) => setEmployeeFormData({ ...employeeFormData, status: e.target.value as any })}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Reporting To</label>
                    <input
                      type="text"
                      value={employeeFormData.reportingTo}
                      onChange={(e) => setEmployeeFormData({ ...employeeFormData, reportingTo: e.target.value })}
                      placeholder="Manager's name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Salary</label>
                    <input
                      type="number"
                      value={employeeFormData.salary}
                      onChange={(e) => setEmployeeFormData({ ...employeeFormData, salary: e.target.value })}
                      placeholder="Annual salary"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    value={employeeFormData.address}
                    onChange={(e) => setEmployeeFormData({ ...employeeFormData, address: e.target.value })}
                    placeholder="Enter address"
                    rows={2}
                  ></textarea>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Emergency Contact Name</label>
                    <input
                      type="text"
                      value={employeeFormData.emergencyContactName}
                      onChange={(e) => setEmployeeFormData({ ...employeeFormData, emergencyContactName: e.target.value })}
                      placeholder="Contact name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Emergency Contact Phone</label>
                    <input
                      type="tel"
                      value={employeeFormData.emergencyContactPhone}
                      onChange={(e) => setEmployeeFormData({ ...employeeFormData, emergencyContactPhone: e.target.value })}
                      placeholder="Contact phone"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Skills</label>
                  <textarea
                    value={employeeFormData.skills}
                    onChange={(e) => setEmployeeFormData({ ...employeeFormData, skills: e.target.value })}
                    placeholder="e.g., React, Node.js, TypeScript"
                    rows={2}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowEmployeeModal(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleSaveEmployee} disabled={loading}>
                  {loading ? "Saving..." : editingEmployee ? "Update Employee" : "Add Employee"}
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
