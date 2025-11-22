import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { deleteUser } from '../../Service/UserService'

const UserList = ({ users = [], setUsers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const name = (user.name || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    return name.includes(searchLower) || email.includes(searchLower);
  });

  const deleteByUserId = async (id) => {
    if (!id) {
      console.error("No ID provided for deletion");
      return;
    }
    
    console.log("Attempting to delete user with ID:", id);
    
    try {
      setDeletingId(id);
      const response = await deleteUser(id);
      console.log("Delete response:", response);
      
      // Filter by multiple possible ID field names
      setUsers(prevUsers => prevUsers.filter(user => 
        user.id !== id && user.userId !== id && user._id !== id
      ));
      
      toast.success("User deleted successfully");
    } catch (e) {
      console.error("Error in deleting user:", e);
      console.error("Error response:", e?.response?.data);
      const errorMsg = e?.response?.data?.message || e?.response?.data?.error || "Failed to delete user";
      toast.error(errorMsg);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className='category-list-container' style={{ height: '100vh', overflowY: 'auto', overflowX: 'hidden' }}>
      {/* Search Bar */}
      <div className='row pe-2 mb-3'>
        <div className='col-12'>
          <div className='search-container position-relative'>
            <input
              type='text'
              className='form-control search-input'
              placeholder='Search by name or email...'
              style={{
                borderRadius: '25px',
                paddingLeft: '45px',
                border: '2px solid #e9ecef'
              }}
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
            />
            <i 
              className='bi bi-search position-absolute'
              style={{
                left: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6c757d'
              }}
            ></i>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className='row pe-2'>
        {users.length === 0 && searchTerm.trim() === '' && (
          <div className='col-12'>
            <div className='text-center py-5 text-secondary'>
              <i className='bi bi-inbox display-4 d-block mb-2'></i>
              No users found
            </div>
          </div>
        )}

        {users.length > 0 && filteredUsers.length === 0 && (
          <div className='col-12'>
            <div className='text-center py-5 text-secondary'>
              <i className='bi bi-search display-6 d-block mb-2'></i>
              No matching users for "{searchTerm}"
            </div>
          </div>
        )}

        {filteredUsers.length > 0 && (
          <div className='col-12'>
            <div className='table-responsive'>
              <table className='table table-hover'>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => {
                    const userId = user.id || user.userId || user._id;
                    if (index === 0) console.log("User object structure:", user); // Debug first user
                    
                    return (
                      <tr key={userId || index}>
                        <td>{user.name || 'N/A'}</td>
                        <td>{user.email || 'N/A'}</td>
                        <td>
                          <span className={`badge ${user.role === 'ROLE_ADMIN' || user.role === 'ADMIN' ? 'bg-danger' : 'bg-primary'}`}>
                            {user.role || 'USER'}
                          </span>
                        </td>
                        <td>
                          <button
                            className='btn btn-sm btn-danger'
                            disabled={!userId || deletingId === userId}
                            onClick={() => deleteByUserId(userId)}
                            title={!userId ? 'Cannot delete: No ID found' : 'Delete user'}
                          >
                            {deletingId === userId ? (
                              <span className='spinner-border spinner-border-sm' role='status'></span>
                            ) : (
                              <i className='bi bi-trash'></i>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserList