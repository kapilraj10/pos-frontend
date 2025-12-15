import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { deleteUser } from '../../Service/UserService'

const UserList = ({ users = [], setUsers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const name = (user.name || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    const role = (user.role || '').toLowerCase();
    return name.includes(searchLower) || email.includes(searchLower) || role.includes(searchLower);
  });

  const handleDeleteClick = (user) => {
    const userId = user.id || user.userId || user._id;
    if (!userId) {
      toast.error("Cannot delete: User ID is missing");
      return;
    }
    setUserToDelete({ ...user, userId });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete?.userId) return;
    
    console.log("Attempting to delete user with ID:", userToDelete.userId);
    
    try {
      setDeletingId(userToDelete.userId);
      const response = await deleteUser(userToDelete.userId);
      console.log("Delete response:", response);
      
      setUsers(prevUsers => prevUsers.filter(user => 
        user.id !== userToDelete.userId && 
        user.userId !== userToDelete.userId && 
        user._id !== userToDelete.userId
      ));
      
      toast.success("User deleted successfully");
      setShowDeleteModal(false);
    } catch (e) {
      console.error("Error in deleting user:", e);
      console.error("Error response:", e?.response?.data);
      const errorMsg = e?.response?.data?.message || e?.response?.data?.error || "Failed to delete user";
      toast.error(errorMsg);
    } finally {
      setDeletingId(null);
      setUserToDelete(null);
    }
  };

  const getRoleColor = (role) => {
    if (role === 'ROLE_ADMIN' || role === 'ADMIN') {
      return { background: 'linear-gradient(135deg, #ed8936, #dd6b20)', color: 'white' };
    }
    return { background: 'linear-gradient(135deg, #4299e1, #3182ce)', color: 'white' };
  };

  const getRoleDisplay = (role) => {
    if (role === 'ROLE_ADMIN') return 'Administrator';
    if (role === 'ROLE_USER') return 'User';
    return role || 'User';
  };

  return (
    <div className="user-list-container">
      <div className="list-header">
        <div>
          <h3 className="list-title">Users Management</h3>
          <p className="list-subtitle">Manage user accounts and permissions</p>
        </div>
        <div className="search-container">
          <div className="search-input-group">
            <i className="bi bi-search search-icon"></i>
            <input
              type="text"
              className="search-input"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="clear-search"
                onClick={() => setSearchTerm("")}
                title="Clear search"
              >
                <i className="bi bi-x"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bi bi-people"></i>
          </div>
          <div className="stat-content">
            <h4 className="stat-number">{users.length}</h4>
            <p className="stat-label">Total Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bi bi-shield-check"></i>
          </div>
          <div className="stat-content">
            <h4 className="stat-number">
              {users.filter(u => u.role === 'ROLE_ADMIN' || u.role === 'ADMIN').length}
            </h4>
            <p className="stat-label">Administrators</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bi bi-person"></i>
          </div>
          <div className="stat-content">
            <h4 className="stat-number">
              {users.filter(u => u.role === 'ROLE_USER' || (!u.role || u.role === 'USER')).length}
            </h4>
            <p className="stat-label">Regular Users</p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {users.length === 0 ? (
        <div className="empty-state">
          <div className="empty-illustration">
            <i className="bi bi-people"></i>
          </div>
          <p className="empty-title">No users found</p>
          <p className="empty-subtitle">Create your first user to get started</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-illustration">
            <i className="bi bi-search"></i>
          </div>
          <p className="empty-title">No matching users found</p>
          <p className="empty-subtitle">Try a different search term</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th className="user-column">User</th>
                <th className="email-column">Email</th>
                <th className="role-column">Role</th>
                <th className="actions-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => {
                const userId = user.id || user.userId || user._id;
                const roleStyle = getRoleColor(user.role);
                
                return (
                  <tr key={userId || index} className="table-row">
                    <td className="user-cell">
                      <div className="user-info">
                        <div className="user-avatar">
                          <span className="avatar-text">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </span>
                        </div>
                        <div className="user-details">
                          <h5 className="user-name">{user.name || 'N/A'}</h5>
                          <p className="user-id">ID: {userId || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="email-cell">
                      <a href={`mailto:${user.email}`} className="email-link">
                        <i className="bi bi-envelope"></i>
                        {user.email || 'N/A'}
                      </a>
                    </td>
                    <td className="role-cell">
                      <span className="role-badge" style={roleStyle}>
                        <i className={`bi ${user.role === 'ROLE_ADMIN' ? 'bi-shield-check' : 'bi-person'}`}></i>
                        {getRoleDisplay(user.role)}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteClick(user)}
                          disabled={deletingId === userId}
                          title="Delete user"
                        >
                          {deletingId === userId ? (
                            <span className="delete-spinner"></span>
                          ) : (
                            <i className="bi bi-trash"></i>
                          )}
                          <span className="btn-text">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div className="modal-icon">
                <i className="bi bi-exclamation-triangle"></i>
              </div>
              <h4 className="modal-title">Delete User</h4>
              <button 
                className="modal-close"
                onClick={() => setShowDeleteModal(false)}
                disabled={deletingId !== null}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <p className="delete-warning">
                Are you sure you want to delete user <strong>"{userToDelete?.name}"</strong>? 
                This action cannot be undone.
              </p>
              {userToDelete && (
                <div className="delete-details">
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{userToDelete.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Role:</span>
                    <span className="detail-value">{getRoleDisplay(userToDelete.role)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">User ID:</span>
                    <span className="detail-value">{userToDelete.userId}</span>
                  </div>
                </div>
              )}
              <div className="warning-note">
                <i className="bi bi-info-circle"></i>
                This will permanently remove the user from the system.
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowDeleteModal(false)}
                disabled={deletingId !== null}
              >
                Cancel
              </button>
              <button 
                className="confirm-delete-btn"
                onClick={confirmDelete}
                disabled={deletingId !== null}
              >
                {deletingId !== null ? (
                  <>
                    <span className="btn-spinner"></span>
                    Deleting...
                  </>
                ) : (
                  'Delete User'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .user-list-container {
          background: #0a0a0a;
          border: 1px solid #1f1f1f;
          border-radius: 8px;
          padding: 16px;
        }
        
        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #1f1f1f;
          flex-wrap: wrap;
          gap: 12px;
        }
        
        .list-title {
          color: #ffffff;
          font-size: 15px;
          font-weight: 600;
          margin: 0 0 2px 0;
        }
        
        .list-subtitle {
          color: #6b7280;
          font-size: 12px;
          margin: 0;
        }
        
        .search-input-group {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .search-icon {
          position: absolute;
          left: 10px;
          color: #4b5563;
          font-size: 13px;
          pointer-events: none;
        }
        
        .search-input {
          background: #111111;
          border: 1px solid #222;
          border-radius: 6px;
          color: #ffffff;
          padding: 8px 32px 8px 32px;
          font-size: 13px;
          width: 220px;
          transition: border-color 0.2s;
        }
        
        .search-input:focus {
          outline: none;
          border-color: #667eea;
        }
        
        .search-input::placeholder {
          color: #4b5563;
        }
        
        .clear-search {
          position: absolute;
          right: 8px;
          background: none;
          border: none;
          color: #4b5563;
          cursor: pointer;
          padding: 2px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }
        
        .clear-search:hover {
          color: #9ca3af;
        }
        
        .stats-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }
        
        .stat-card {
          background: #111111;
          border: 1px solid #1f1f1f;
          border-radius: 6px;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .stat-icon {
          width: 36px;
          height: 36px;
          background: #1f1f1f;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #667eea;
          font-size: 16px;
        }
        
        .stat-number {
          color: #ffffff;
          font-size: 18px;
          font-weight: 600;
          margin: 0;
        }
        
        .stat-label {
          color: #6b7280;
          font-size: 11px;
          margin: 0;
        }
        
        .table-container {
          overflow-x: auto;
          border: 1px solid #1f1f1f;
          border-radius: 6px;
        }
        
        .users-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 600px;
        }
        
        .users-table thead {
          background: #111111;
        }
        
        .users-table th {
          color: #9ca3af;
          font-weight: 500;
          font-size: 11px;
          text-align: left;
          padding: 10px 12px;
          border-bottom: 1px solid #1f1f1f;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .users-table tbody tr {
          border-bottom: 1px solid #1f1f1f;
          transition: background-color 0.2s;
        }
        
        .users-table tbody tr:last-child {
          border-bottom: none;
        }
        
        .users-table tbody tr:hover {
          background: #111111;
        }
        
        .users-table td {
          padding: 10px 12px;
          color: #e5e7eb;
          font-size: 13px;
          vertical-align: middle;
        }
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .user-avatar {
          width: 32px;
          height: 32px;
          background: #667eea;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 13px;
        }
        
        .user-name {
          color: #ffffff;
          font-size: 13px;
          font-weight: 500;
          margin: 0 0 2px 0;
        }
        
        .user-id {
          color: #6b7280;
          font-size: 11px;
          font-family: monospace;
          margin: 0;
        }
        
        .email-link {
          color: #9ca3af;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          transition: color 0.2s;
        }
        
        .email-link:hover {
          color: #667eea;
        }
        
        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
          white-space: nowrap;
        }
        
        .action-buttons {
          display: flex;
          gap: 6px;
        }
        
        .delete-btn {
          background: transparent;
          color: #ef4444;
          border: 1px solid #ef4444;
          border-radius: 4px;
          padding: 0;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .delete-btn:hover:not(:disabled) {
          background: #ef4444;
          color: white;
        }
        
        .delete-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .delete-spinner {
          width: 12px;
          height: 12px;
          border: 2px solid rgba(239, 68, 68, 0.3);
          border-radius: 50%;
          border-top-color: #ef4444;
          animation: spin 1s linear infinite;
        }
        
        .empty-state {
          padding: 40px 20px;
          text-align: center;
        }
        
        .empty-illustration {
          font-size: 48px;
          color: #333;
          margin-bottom: 12px;
        }
        
        .empty-title {
          color: #9ca3af;
          font-size: 14px;
          font-weight: 500;
          margin: 0 0 4px 0;
        }
        
        .empty-subtitle {
          color: #6b7280;
          font-size: 12px;
          margin: 0;
        }
        
        .loading-state {
          padding: 40px;
          text-align: center;
        }
        
        .spinner-large {
          width: 32px;
          height: 32px;
          border: 3px solid #222;
          border-radius: 50%;
          border-top-color: #667eea;
          animation: spin 1s linear infinite;
          margin: 0 auto 12px;
        }
        
        .loading-text {
          color: #6b7280;
          font-size: 13px;
        }
        
        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        
        .modal-container {
          background: #0d0d0d;
          border: 1px solid #1f1f1f;
          border-radius: 8px;
          width: 100%;
          max-width: 400px;
        }
        
        .modal-header {
          display: flex;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid #1f1f1f;
        }
        
        .modal-icon {
          width: 32px;
          height: 32px;
          background: #ef4444;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          color: white;
          font-size: 14px;
        }
        
        .modal-title {
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          margin: 0;
          flex: 1;
        }
        
        .modal-close {
          background: none;
          border: none;
          color: #6b7280;
          font-size: 18px;
          cursor: pointer;
          padding: 2px;
          border-radius: 4px;
          transition: color 0.2s;
        }
        
        .modal-close:hover:not(:disabled) {
          color: #9ca3af;
        }
        
        .modal-body {
          padding: 16px;
        }
        
        .delete-warning {
          color: #e5e7eb;
          font-size: 13px;
          line-height: 1.5;
          margin: 0 0 16px 0;
        }
        
        .delete-details {
          background: #111111;
          border: 1px solid #1f1f1f;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 12px;
        }
        
        .detail-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
          font-size: 12px;
        }
        
        .detail-item:last-child {
          margin-bottom: 0;
        }
        
        .detail-label {
          color: #6b7280;
        }
        
        .detail-value {
          color: #ffffff;
          font-weight: 500;
        }
        
        .warning-note {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #f59e0b;
          font-size: 12px;
          background: rgba(245, 158, 11, 0.1);
          padding: 10px;
          border-radius: 4px;
          border: 1px solid rgba(245, 158, 11, 0.2);
        }
        
        .modal-footer {
          display: flex;
          gap: 10px;
          padding: 12px 16px 16px;
        }
        
        .cancel-btn, .confirm-delete-btn {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .cancel-btn {
          background: #1f1f1f;
          color: #e5e7eb;
        }
        
        .cancel-btn:hover:not(:disabled) {
          background: #2a2a2a;
        }
        
        .confirm-delete-btn {
          background: #ef4444;
          color: white;
        }
        
        .confirm-delete-btn:hover:not(:disabled) {
          background: #dc2626;
        }
        
        .confirm-delete-btn:disabled, .cancel-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .btn-spinner {
          width: 12px;
          height: 12px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s linear infinite;
          margin-right: 6px;
          display: inline-block;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .list-header {
            flex-direction: column;
            align-items: stretch;
          }
          
          .search-input {
            width: 100%;
          }
          
          .stats-container {
            grid-template-columns: 1fr;
          }
          
          .btn-text {
            display: none;
          }
          
          .delete-btn {
            padding: 0;
          }
        }
      `}</style>
    </div>
  )
}

export default UserList;