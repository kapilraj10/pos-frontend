import React, { useContext } from 'react'
import './DisplayCategory.css'
import Category from '../Category/Category'
import { AppContext } from '../../context/AppContext'

const DisplayCategory = ({ categories, selectedCategory, setSelectedCategory }) => {
  const { items } = useContext(AppContext)

  return (
    <div className='category-container'>
      <div className='category-scroll'>
        {categories.map(category => {
          const itemCount = items.filter(item => String(item.categoryId) === String(category.id)).length
          const isSelected = String(selectedCategory) === String(category.id)
          
          return (
            <div key={category.id} className='category-item'>
              <Category
                categoryName={category.name}
                imgUrl={category.imgUrl}
                numberOfItems={itemCount}
                bgColor={category.bgColor}
                isSelected={isSelected}
                onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DisplayCategory