import React, { useEffect, useState } from 'react'
import UserForm from '../../components/UserForm/UserForm'
import UserList from '../../components/UserList/UserList'
import './ManageUsers.css'
import { fetchUsers } from '../../Service/UserService'

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);
        const response = await fetchUsers();
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, [])

  return (
    <div className='manage-users-container'>
      <div className='left-column'>
        <UserForm setUsers={setUsers} />
      </div>
      <div className='right-column'>
        {loading ? (
          <div className='loading-state'>
            <div className="spinner-large"></div>
            <p className="loading-text">Loading users...</p>
          </div>
        ) : (
          <UserList users={users} setUsers={setUsers} />
        )}
      </div>
    </div>
  )
}

export default ManageUsers