import React, { useState, useEffect, useCallback } from 'react'; 
import TaskItem from './TaskItem';
import FilterControls from './FilterControls';
import { getAllTasks, deleteTask as deleteTaskService } from '../services/taskService';


const TaskList = ({ onEditTask, key: refreshKey, onTaskSavedForProgressRefresh }) => {
  const [tasks, setTasks] = useState([]); // This is the filtered list
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: '' });

  const fetchDisplayTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedTasks = await getAllTasks({
        search: filters.search,
        status: filters.status
      });
      setTasks(fetchedTasks);
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks.');
      console.error("Fetch tasks error detail:", err);
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.status]);

  useEffect(() => {
    fetchDisplayTasks();
  }, [fetchDisplayTasks, refreshKey]);

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTaskService(taskId);
      if (onTaskSavedForProgressRefresh) {
        onTaskSavedForProgressRefresh();
      }
    } catch (err) {
      console.error("Delete task error detail:", err);
      setError(err.message || 'Failed to delete task.');
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
  };

  if (loading && tasks.length === 0 && !error) return <div className="loading-text">Loading tasks...</div>;
  if (error && !loading) return <div className="error-text">Error: {error} Couldn't Load Tasks</div>;

  return (
    <div className="task-list-section-content"> 
      <FilterControls onFilterChange={handleFilterChange} />

      <h2 className="task-list-title" id="list-heading">My Tasks</h2>

      {!loading && tasks.length === 0 && (
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
            />
          ))}
        </ul>
      )}

      {loading && tasks.length > 0 && <p className="loading-text" style={{ marginTop: '1rem' }}>Updating list...</p>}
    </div>
  );
};

export default TaskList;