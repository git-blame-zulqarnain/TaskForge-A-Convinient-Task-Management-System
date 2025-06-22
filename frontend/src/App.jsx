import React, { useState, useEffect, useCallback } from 'react'; 
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { useAuth } from './context/AuthContext'; 
import { getTasksSummaryStats } from './services/taskService';
import ProgressBar from './components/ProgressBar';
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
  
}) => (
  <div className="dashboard-layout">
    <section
      id="task-form-section"
      aria-labelledby="form-heading"
      className="form-area glass-card"
    >
      <TaskForm
        onTaskSaved={onTaskSaved}
        taskToEdit={taskToEdit}
        onCancelEdit={onCancelEdit}
      />
    </section>

    <section
      aria-labelledby="list-heading"
      className="list-area glass-card"
    >
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
      />
    </section>
  </div>
);

function App() {
  const [refreshTaskListSignal, setRefreshTaskListSignal] = useState(0);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const { authState, logout, getSocketInstance } = useAuth();

  const [overallProgress, setOverallProgress] = useState();
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [progressError, setProgressError] = useState(null);

  const fetchOverallProgress = useCallback(async () => {
    if (!authState.isAuthenticated) return;
    try {
      setLoadingProgress(true);
      setProgressError(null);
      const stats = await getTasksSummaryStats();
      const percentage = stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0;
      setOverallProgress({
        totalTasks: stats.totalTasks,
        completedTasks: stats.completedTasks,
        percentage: percentage,
      });
    } catch (err) {
      console.error("Error fetching overall progress in App:", err);
      setProgressError('Could not load progress.');
    } finally {
      setLoadingProgress(false);
    }
  }, [authState.isAuthenticated]);

  useEffect(() => {
    if (authState.isAuthenticated) {
      fetchOverallProgress();
    } else {
      setOverallProgress({ totalTasks: 0, completedTasks: 0, percentage: 0 });
      setLoadingProgress(false);
    }
  }, [authState.isAuthenticated, fetchOverallProgress]);

  const handleTaskCreatedOrUpdated = () => { 
    console.log("App.jsx: Task created, updated, or deleted. Refreshing list and progress.");
    setRefreshTaskListSignal(prev => prev + 1);
    fetchOverallProgress();
    setTaskToEdit(null);
  };

  useEffect(() => {
    if (authState.isAuthenticated && authState.user?._id) {
      const socket = getSocketInstance(); 

      if (socket) {
        console.log("App.jsx: Setting up socket event listeners for notifications (socket ID:", socket.id, ")");

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
          console.log("App.jsx: Cleaning up socket event listeners.");
          socket.off('newTaskShared', handleNewTaskShared);
          socket.off('taskStatusUpdated', handleTaskStatusUpdated);
        };
      } else {
        console.log("App.jsx: Socket instance not available yet for setting listeners.");
      }
    }

  }, [authState.isAuthenticated, authState.user?._id, getSocketInstance, handleTaskCreatedOrUpdated]);


  const handleEditTask = (task) => {};
  const handleCancelEdit = () => {};
  const handleLogout = () => {};

  return (
    <Router>
      <div className="app-container">
        <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
        />
        <header className="app-header"></header>
        <main className="app-main-content-area">
          <Routes>
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
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          </Routes>
        </main>
        <footer className="app-footer"></footer>
      </div>
    </Router>
  );
}

export default App;