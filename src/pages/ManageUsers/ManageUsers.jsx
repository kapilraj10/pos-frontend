import React, {  useEffect, useState } from 'react'
import UserForm from '../../components/UserForm/UserForm'
import UserList from '../../components/UserList/UserList'
import './ManageUsers.css'
import { fetchUsers } from '../../Service/UserService'

const ManageUsers = () => {

const [users, setUsers] = useState([]);
const [loading , setLoading] = useState(false);

useEffect(() => {
  async function loadUsers(){
    try{
      setLoading(true);
      const response = await fetchUsers();
      setUsers(response.data);
    } catch (error){
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }
  loadUsers();
}, [])

  return (
    <div className='category-container text-light'>
    <div className='left-colum'>
      <UserForm setUsers={setUsers} />
    </div>
    <div className='right-colum'>
      {loading ? (
        <div className='text-center py-5'>
          <div className='spinner-border text-primary' role='status'>
            <span className='visually-hidden'>Loading...</span>
          </div>
          <div className='text-muted mt-2'>Loading users...</div>
        </div>
      ) : (
        <UserList users={users} setUsers={setUsers} />
      )}
    </div>
   </div>
  )
}

export default ManageUsers