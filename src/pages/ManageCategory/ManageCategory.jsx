import React from 'react'
import './ManageCategory.css'
import CategoryForm from '../../components/CategoryFrom/CategoryFrom'
import CategoryList from '../../components/CategoryList/CategoryList'
const ManageCategory = () => {
  return (
   <div className='category-container text-light'>
    <div className='left-colum'>
      <CategoryForm />
    </div>
    <div className='right-colum'>
     
       <CategoryList />
    </div>
   </div>
  )
}

export default ManageCategory