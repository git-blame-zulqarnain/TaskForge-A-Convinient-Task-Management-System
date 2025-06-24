import React, { useState, useEffect, useCallback } from 'react';
import TaskItem from './TaskItem';
import FilterControls from './FilterControls'; 
import { getAllTasks, deleteTask as deleteTaskService } from '../services/taskService';

const TaskList = ({ onEditTask, key: refreshKey, onTaskSavedForProgressRefresh, onShareTask }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: '' });

  const fetchDisplayTasks = useCallback(async () => {
    console.log("TaskList: Fetching tasks with filters:", filters, "RefreshKey:", refreshKey);
    try {
      setLoading(true);
      setError(null); 
      const fetchedTasks = await getAllTasks({
        search: filters.search,
        status: filters.status
      });
      setTasks(fetchedTasks || []); 
    } catch (err) {
      const errorMessage = err?.message || 'Failed to fetch tasks.';
      setError(errorMessage);
      console.error("TaskList: Fetch tasks error detail:", err);
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.status]); 
  useEffect(() => {
    console.log("TaskList: useEffect triggered due to change in fetchDisplayTasks or refreshKey. Current refreshKey:", refreshKey);
    fetchDisplayTasks();
  }, [fetchDisplayTasks, refreshKey]);

  const handleDeleteTask = async (taskId) => {
    console.log("TaskList: Attempting to delete task ID:", taskId);
    try {
      await deleteTaskService(taskId);
      setError(null); 
      if (onTaskSavedForProgressRefresh) {
        console.log("TaskList: Delete successful, calling onTaskSavedForProgressRefresh.");
        onTaskSavedForProgressRefresh(); 
      }
    } catch (err) {
      const errorMessage = err?.message || 'Failed to delete task.';
      console.error("TaskList: Delete task error detail:", err);
      setError(errorMessage); 
    }
  };

  const handleFilterChange = (newFilters) => {
    console.log("TaskList: Filters changed:", newFilters);
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
  };

  if (loading && tasks.length === 0 && !error) {
    console.log("TaskList: Rendering 'Loading tasks...' (initial)");
    return <div className="loading-text">Loading tasks...</div>;
  }

  if (error && !loading) {
    console.log("TaskList: Rendering error -", error);
    return <div className="error-text">Error: {error}</div>; 
  }

  return (
    <div className="task-list-section-content">
      <FilterControls onFilterChange={handleFilterChange} />

      <h2 className="task-list-title" id="list-heading">My Tasks</h2>

      {!loading && !error && tasks.length === 0 && (
        <p className="no-tasks-text">No tasks match your filters, or no tasks created yet!</p>
      )}

      {tasks.length > 0 && (
        <ul className="task-list">
          {tasks.map((task) => (
            <TaskItem
              key={task._id} 
              task={task}
              onDeleteTask={handleDeleteTask}
              onEditTask={onEditTask}
              onShareTask={onShareTask}
            />
          ))}
        </ul>
      )}

      {loading && tasks.length > 0 && (
        <p className="loading-text" style={{ marginTop: '1rem' }}>Updating list...</p>
      )}
    </div>
  );
};

export default TaskList;