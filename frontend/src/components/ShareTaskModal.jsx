import React, { useState, useEffect } from 'react';
import { getUsersForSharing, shareTaskWithUser } from '../services/taskService';
import { useAuth } from '../context/AuthContext'; 

const ShareTaskModal = ({ taskToShare, onClose, onTaskShared }) => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [emailToShare, setEmailToShare] = useState('');
  const [shareBy, setShareBy] = useState('email'); 
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const { authState } = useAuth(); 

  useEffect(() => {
    if (shareBy === 'id') {
      const fetchUsers = async () => {
        setIsLoadingUsers(true);
        setError(null);
        try {
          const fetchedUsers = await getUsersForSharing();
          const taskOwnerId = taskToShare.user?._id || taskToShare.user; 
          const alreadySharedIds = taskToShare.sharedWith?.map(u => u._id || u) || [];
          const currentUserId = authState.user?._id;

          const availableUsers = fetchedUsers.filter(user =>
            user._id !== taskOwnerId &&
            user._id !== currentUserId && 
            !alreadySharedIds.includes(user._id)
          );
          setUsers(availableUsers);
        } catch (err) {
          setError('Failed to load users. You can try sharing by email.');
          console.error("Error fetching users for sharing:", err);
        } finally {
          setIsLoadingUsers(false);
        }
      };
      fetchUsers();
    }
  }, [shareBy, taskToShare, authState.user?._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSharing(true);
    setError(null);
    setSuccessMessage(null);

    let sharePayload;
    let identifierForMessage;

    if (shareBy === 'email') {
        if (!emailToShare.trim()) {
            setError("Please enter an email address to share with.");
            setIsSharing(false);
            return;
        }
        sharePayload = { emailToShareWith: emailToShare.trim() };
        identifierForMessage = emailToShare.trim();
    } else {
        if (!selectedUserId) {
            setError("Please select a user from the list to share with.");
            setIsSharing(false);
            return;
        }
        sharePayload = { userIdToShareWith: selectedUserId };
        const selectedUserName = users.find(u => u._id === selectedUserId)?.name;
        identifierForMessage = selectedUserName || `user ID ${selectedUserId}`;
    }

    try {
      const updatedTask = await shareTaskWithUser(taskToShare._id, sharePayload);
      setSuccessMessage(`Task successfully shared with ${identifierForMessage}.`);
      if (onTaskShared) {
        onTaskShared(updatedTask);
      }
      setEmailToShare('');
      setSelectedUserId('');
    } catch (err) {
      setError(err.message || 'Failed to share task. The user might not exist or the task is already shared.');
      console.error("Error sharing task:", err);
    } finally {
      setIsSharing(false);
    }
  };

  if (!taskToShare) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
        <h2 className="card-title">Share Task: "{taskToShare.title}"</h2>
        <button onClick={onClose} className="modal-close-button" aria-label="Close modal">×</button>

        {error && <p className="error-text" style={{ marginBottom: '1rem' }}>{error}</p>}
        {successMessage && <p className="success-text" style={{ marginBottom: '1rem' }}>{successMessage}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="share-by-method">Share by:</label>
            <select id="share-by-method" className="form-select" value={shareBy} onChange={(e) => { setShareBy(e.target.value); setError(null); setSuccessMessage(null); setSelectedUserId(''); setEmailToShare(''); }}>
              <option value="email">Email Address</option>
              <option value="id">Select User from List</option>
            </select>
          </div>

          {shareBy === 'email' && (
            <div className="form-group">
              <label htmlFor="share-email" className="form-label">User's Email:</label>
              <input
                type="email"
                id="share-email"
                className="form-input"
                value={emailToShare}
                onChange={(e) => setEmailToShare(e.target.value)}
                placeholder="user@example.com"
                disabled={isSharing}
                required={shareBy === 'email'}
              />
            </div>
          )}

          {shareBy === 'id' && (
            <div className="form-group">
              <label htmlFor="share-user-id" className="form-label">Select User:</label>
              {isLoadingUsers ? <p className="loading-text" style={{fontSize: '0.875rem', padding: '0.5rem'}}>Loading users...</p> : (
                users.length > 0 ? (
                  <select
                    id="share-user-id"
                    className="form-select"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    disabled={isSharing}
                    required={shareBy === 'id'}
                  >
                    <option value="">-- Select a user --</option>
                    {users.map(user => (
                      <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
                    ))}
                  </select>
                ) : (
                  <p className="no-tasks-text" style={{fontSize: '0.875rem', padding: '0.5rem'}}>No other users available to share with.</p>
                )
              )}
            </div>
          )}

          <div className="form-actions" style={{ marginTop: '1.5rem' }}>
            <button type="submit" className="button button-primary" disabled={isSharing || (shareBy === 'id' && isLoadingUsers) || (shareBy === 'id' && users.length > 0 && !selectedUserId) }>
              {isSharing ? 'Sharing...' : 'Share Task'}
            </button>
            <button type="button" onClick={onClose} className="button button-secondary" disabled={isSharing}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShareTaskModal;