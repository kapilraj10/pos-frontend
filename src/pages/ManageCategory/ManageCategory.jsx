import React from 'react'
import './ManageCategory.css'
import CategoryForm from '../../components/CategoryFrom/CategoryFrom'
import CategoryList from '../../components/CategoryList/CategoryList'

const ManageCategory = () => {
  return (
   <div className='manage-category-container'>
    <div className='left-column'>
      <CategoryForm />
    </div>
    <div className='right-column'>
      <CategoryList />
    </div>
   </div>
  )
}

export default ManageCategory