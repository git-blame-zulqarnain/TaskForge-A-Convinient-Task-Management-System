import React from 'react';

const TaskItem = ({ task, onDeleteTask, onEditTask }) => {
  const handleDelete = () => {
    if (window.confirm(`Delete task: "${task.title}"?`)) {
      onDeleteTask(task._id);
    }
  };

  const handleEdit = () => {
    onEditTask(task);
  };

  const statusClass = `status-${task.status.toLowerCase().replace(/ /g, '-')}`;

  return (
    <li className={`task-item ${statusClass}`}>
      <div className="task-item-header">
        <h3 className="task-item-title">{task.title}</h3>
        <div className="task-item-actions">
          <button onClick={handleEdit} className="button-icon button-edit-icon" aria-label={`Edit ${task.title}`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{width: '1.25em', height: '1.25em'}}>
              <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
              <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
            </svg>
          </button>
          <button onClick={handleDelete} className="button-icon button-delete-icon" aria-label={`Delete ${task.title}`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{width: '1.25em', height: '1.25em'}}>
              <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25V4c.827-.05 1.66-.075 2.5-.075zM8.47 9.47a.75.75 0 011.06 0l1.5 1.5a.75.75 0 01-1.06 1.06l-1.5-1.5a.75.75 0 010-1.06zm3.06 0a.75.75 0 011.06 0l1.5 1.5a.75.75 0 11-1.06 1.06l-1.5-1.5a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      {task.description && <p className="task-item-description">{task.description}</p>}
      <div className="task-item-meta">
        <span className="task-status-badge">{task.status}</span>
        {task.dueDate && (
          <span className="task-due-date-text">
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </li>
  );
};

export default TaskItem;