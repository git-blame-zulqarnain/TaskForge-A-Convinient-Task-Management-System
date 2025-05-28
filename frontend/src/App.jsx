import React, { useState, useEffect, useCallback } from 'react'; 
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { useAuth } from './context/AuthContext';
import { getTasksSummaryStats } from './services/taskService'; 
import ProgressBar from './components/ProgressBar'; 
import './App.css';

const TaskDashboard = ({
  refreshSignal,
  onEditTask,
  onTaskSaved,
  taskToEdit,
  onCancelEdit,
  overallProgress, 
  loadingProgress
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
  const { authState, logout } = useAuth();

  const [overallProgress, setOverallProgress] = useState({
    totalTasks: 0,
    completedTasks: 0,
    percentage: 0,
  });
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [progressError, setProgressError] = useState(null); 

  const fetchOverallProgress = useCallback(async () => 
    {
    if (!authState.isAuthenticated) return;

    try 
    {
      setLoadingProgress(true);
      setProgressError(null);
      const stats = await getTasksSummaryStats();
      const percentage = stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0;
      setOverallProgress({
        totalTasks: stats.totalTasks,
        completedTasks: stats.completedTasks,
        percentage: percentage,
      });
    } 
    catch (err) 
    {
      console.error("Error fetching overall progress in App:", err);
      setProgressError('Could not load progress.');
    } 
    finally 
    {
      setLoadingProgress(false);
    }
  }, [authState.isAuthenticated]);

  useEffect(() => 
    {
    if (authState.isAuthenticated) {
      fetchOverallProgress();
    } 
    else 
    {
      setOverallProgress({ totalTasks: 0, completedTasks: 0, percentage: 0 });
      setLoadingProgress(false);
    }
  }, [authState.isAuthenticated, fetchOverallProgress]);


  const handleTaskCreatedOrUpdated = () => {
    setRefreshTaskListSignal(prev => prev + 1); 
    fetchOverallProgress(); 
    setTaskToEdit(null);
  };

  const handleEditTask = (task) => {
    setTaskToEdit(task);
    const formSection = document.getElementById('task-form-section');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  const handleCancelEdit = () => {
    setTaskToEdit(null);
  };
  const handleLogout = () => {
    logout();
  };

  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h1 className="app-header-title">TaskForge</h1>
          </Link>
          {authState.isAuthenticated && (
            <button onClick={handleLogout} className="button button-secondary logout-button">
              Logout
            </button>
          )}
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
                  />
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
    </Router>
  );
}

export default App;