import React, { useState, useEffect } from 'react';
import { createTask, updateTask as updateTaskService } from '../services/taskService';

const TaskForm = ({ onTaskSaved, taskToEdit, onCancelEdit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Pending');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(taskToEdit);

  useEffect(() => {
    if (isEditing && taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setStatus(taskToEdit.status || 'Pending');
      setDueDate(taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().split('T')[0] : '');
    } else {
      setTitle('');
      setDescription('');
      setStatus('Pending');
      setDueDate('');
    }
  }, [taskToEdit, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const taskData = { title, description, status, ...(dueDate && { dueDate }) };

    try {
      if (isEditing) {
        await updateTaskService(taskToEdit._id, taskData);
      } else {
        await createTask(taskData);
      }
      if (onTaskSaved) {
        onTaskSaved();
      }
    } catch (err) {
      const errorMessages = err.response?.data?.errors?.map(er => er.msg).join(', ') || err.message || 'Failed to save task.';
      setError(errorMessages);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card">
      <h2 id="form-heading" className="card-title">{isEditing ? 'Edit Task' : 'Create New Task'}</h2>
      {error && <p className="error-text" style={{ marginBottom: '1rem' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title" className="form-label">Title <span style={{ color: '#f87171' }}>*</span></label>
          <input
            type="text"
            id="title"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={isSubmitting}
            placeholder="Enter task title"
          />
        </div>
        <div className="form-group">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            id="description"
            className="form-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            rows="4"
            placeholder="Enter task details"
          />
        </div>
        <div className="form-group">
          <label htmlFor="status" className="form-label">Status</label>
          <select id="status" className="form-select" value={status} onChange={(e) => setStatus(e.target.value)} disabled={isSubmitting}>
            <option value="Pending">Pending</option>
            <option value="Working">Working</option>
            <option value="Finished">Finished</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="dueDate" className="form-label">Due Date</label>
          <input
            type="date"
            id="dueDate"
            className="form-input"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="button button-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : (isEditing ? 'Update Task' : 'Add Task')}
          </button>
          {isEditing && (
            <button type="button" onClick={onCancelEdit} className="button button-secondary" disabled={isSubmitting}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TaskForm;    