import React from 'react'
import './ManageItems.css'
import ItemsForm from '../../components/ItemsForm/ItemsForm'
import ItemsList from '../../components/ItemsList/ItemsList'

const ManageItems = () => {
  return (
    <div className='manage-items-container'>
      <div className='left-column'>
        <ItemsForm />
      </div>
      <div className='right-column'>
        <ItemsList />
      </div>
    </div>
  )
}

export default ManageItems