import React from 'react'
import './ManageItems.css'
import ItemsForm from '../../components/ItemsForm/ItemsForm'
import ItemsList from '../../components/ItemsList/ItemsList'

const ManageItems = () => {
  return (
    <div className='category-container text-light'>
      <div className='left-colum'>
        <ItemsForm />
      </div>
      <div className='right-colum'>
        <ItemsList />
      </div>
    </div>
  )
}

export default ManageItems