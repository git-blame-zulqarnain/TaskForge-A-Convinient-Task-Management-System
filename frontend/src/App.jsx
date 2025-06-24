import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';


import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import ProgressBar from './components/ProgressBar';
import ShareTaskModal from './components/ShareTaskModal';
import NotificationBell from './components/NotificationBell';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';

import { useAuth } from './context/AuthContext';
import { getTasksSummaryStats } from './services/taskService'; 

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './App.css'; 

const TaskDashboard = ({
  refreshSignal,
  onEditTask,
  onTaskSaved,
  taskToEdit,
  onCancelEdit,
  overallProgress,
  loadingProgress,
  onShareTaskTrigger
}) => (
  <div className="dashboard-layout"> 
    <section id="task-form-section" aria-labelledby="form-heading" className="form-area glass-card">
      <TaskForm
        onTaskSaved={onTaskSaved}
        taskToEdit={taskToEdit}
        onCancelEdit={onCancelEdit}
      />
    </section>
    <section aria-labelledby="list-heading" className="list-area glass-card">
      {!loadingProgress && overallProgress && (
        <ProgressBar
          percentage={overallProgress.percentage}
          completedTasks={overallProgress.completedTasks}
          totalTasks={overallProgress.totalTasks}
        />
      )}
      <TaskList
        key={refreshSignal} 
        onEditTask={onEditTask}
        onTaskSavedForProgressRefresh={onTaskSaved} 
        onShareTask={onShareTaskTrigger} 
      />
    </section>
  </div>
);

function App() {
  const { authState, logout, getSocketInstance } = useAuth();
  const [refreshTaskListSignal, setRefreshTaskListSignal] = useState(0);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [overallProgress, setOverallProgress] = useState({ totalTasks: 0, completedTasks: 0, percentage: 0 });
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [taskToShare, setTaskToShare] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const fetchOverallProgress = useCallback(async () => {
    if (!authState.isAuthenticated) {
      setOverallProgress({ totalTasks: 0, completedTasks: 0, percentage: 0 });
      setLoadingProgress(false);
      return;
    }
    try {
      setLoadingProgress(true);
      const stats = await getTasksSummaryStats();
      const percentage = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;
      setOverallProgress({
        totalTasks: stats.totalTasks,
        completedTasks: stats.completedTasks,
        percentage: percentage,
      });
    } catch (err) {
      console.error("Error fetching overall progress in App:", err);
      toast.error("Failed to load task progress stats."); 
    } finally {
      setLoadingProgress(false);
    }
  }, [authState.isAuthenticated]); 

  useEffect(() => {
    fetchOverallProgress();
  }, [fetchOverallProgress]); 

  const handleTaskCreatedOrUpdated = useCallback(() => {
    console.log("App.jsx: Task operation completed. Refreshing list and progress.");
    setRefreshTaskListSignal(prev => prev + 1); 
    fetchOverallProgress();                   
    setTaskToEdit(null);                      
  }, [fetchOverallProgress]); 

  useEffect(() => {
    if (authState.isAuthenticated && authState.user?._id && getSocketInstance) {
      const socket = getSocketInstance();
      if (socket) {
        console.log("App.jsx: Setting up socket event listeners (socket ID:", socket.id, ")");
        const handleNewTaskShared = (data) => {
          console.log('App.jsx - Socket event received: newTaskShared', data);
          toast.info(data.message || `Task "${data.taskTitle || 'A task'}" has been shared with you!`);
          handleTaskCreatedOrUpdated(); 
        };
        const handleTaskStatusUpdated = (data) => {
          console.log('App.jsx - Socket event received: taskStatusUpdated', data);
          toast.success(data.message || `Task "${data.taskTitle}" status updated.`);
          handleTaskCreatedOrUpdated(); 
        };

        socket.on('newTaskShared', handleNewTaskShared);
        socket.on('taskStatusUpdated', handleTaskStatusUpdated);

        return () => { 
          console.log("App.jsx: Cleaning up socket event listeners for socket ID:", socket.id);
          if (socket.connected) { 
            socket.off('newTaskShared', handleNewTaskShared);
            socket.off('taskStatusUpdated', handleTaskStatusUpdated);
          }
        };
      } else {
        console.log("App.jsx: Socket instance not available from context when trying to set listeners.");
      }
    }
  }, [authState.isAuthenticated, authState.user?._id, getSocketInstance, handleTaskCreatedOrUpdated]);

  const handleEditTask = useCallback((task) => {
    setTaskToEdit(task);
    const formSection = document.getElementById('task-form-section');
    if (formSection) formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleCancelEdit = useCallback(() => {
    setTaskToEdit(null);
  }, []);

  const handleShareTaskTrigger = useCallback((task) => {
    setTaskToShare(task);
    setShowShareModal(true);
  }, []);

  const handleCloseShareModal = useCallback(() => {
    setShowShareModal(false);
    setTaskToShare(null);
  }, []);

  const handleTaskSuccessfullyShared = useCallback((updatedTask) => {
    toast.success(`Task "${updatedTask.title || 'Task'}" shared successfully!`);
    handleTaskCreatedOrUpdated(); 
    handleCloseShareModal();
  }, [handleTaskCreatedOrUpdated, handleCloseShareModal]); 

  const handleLogout = useCallback(() => {
    logout(); 
  }, [logout]); 


  return (
    <Router>
      <div className="app-container"> 
        <ToastContainer
          position="top-right"
          autoClose={5000}
          theme={theme} 
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <header className="app-header">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h1 className="app-header-title">TaskForge</h1>
          </Link>
          <div className="header-actions">
            <button onClick={toggleTheme} className="button button-theme-toggle" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
              {theme === 'light' ? '🌙' : '☀️'} 
            </button>
            {authState.isAuthenticated && (
              <Link to="/analytics" className="button button-secondary analytics-button">
                Analytics
              </Link>
            )}
            {authState.isAuthenticated && <NotificationBell />}
            {authState.isAuthenticated && (
              <button onClick={handleLogout} className="button button-secondary logout-button">
                Logout
              </button>
            )}
          </div>
        </header>

        <main className="app-main-content-area">
          <Routes>
            <Route path="/login" element={!authState.isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />} />
            <Route path="/register" element={!authState.isAuthenticated ? <RegisterPage /> : <Navigate to="/" replace />} />
            <Route
              path="/"
              element={
                authState.isAuthenticated ? (
                  <TaskDashboard
                    refreshSignal={refreshTaskListSignal}
                    onEditTask={handleEditTask}
                    onTaskSaved={handleTaskCreatedOrUpdated}
                    taskToEdit={taskToEdit}
                    onCancelEdit={handleCancelEdit}
                    overallProgress={overallProgress}
                    loadingProgress={loadingProgress}
                    onShareTaskTrigger={handleShareTaskTrigger}
                  />
                ) : ( <Navigate to="/login" replace /> )
              }
            />
            <Route
              path="/analytics"
              element={
                authState.isAuthenticated ? (
                  <AnalyticsDashboardPage />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route path="*" element={<Navigate to={authState.isAuthenticated ? "/" : "/login"} replace />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>© {new Date().getFullYear()} Muhammad Zuqlarnain - TaskForge</p>
        </footer>
      </div>
      {showShareModal && taskToShare && (
        <ShareTaskModal
          taskToShare={taskToShare}
          onClose={handleCloseShareModal}
          onTaskShared={handleTaskSuccessfullyShared}
        />
      )}
    </Router>
  );
}

export default App;