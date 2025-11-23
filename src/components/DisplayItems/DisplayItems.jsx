import React, { useContext, useState } from 'react'
import './DisplayItems.css'
import { AppContext } from '../../context/AppContext'
import Item from '../Item/Item'
import SearchBox from '../SearchBox/SearchBox'

const DisplayItems = ({ selectedCategory }) => {
  const { items, loading, error } = useContext(AppContext);
  const [searchText, setSearchText] = useState('');

  
  const filteredItems = items
    .filter(item => {
    
      if (selectedCategory && String(item.categoryId) !== String(selectedCategory)) {
        return false;
      }
      
      if (searchText && !item.name.toLowerCase().includes(searchText.toLowerCase())) {
        return false;
      }
      return true;
    });

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="text-muted small mt-2">Loading items...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <i className="bi bi-exclamation-triangle me-2"></i>
        Failed to load items
      </div>
    )
  }

  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-4 text-muted">
        <i className="bi bi-inbox display-6 d-block mb-2"></i>
        {selectedCategory ? 'No items in this category' : 'No items available'}
      </div>
    )
  }

  return (
    <div className='p-3'>
      <div className='d-flex justify-content-between align-items-center mb-3'>
        <div></div>
        <div>
          <SearchBox onSearch={setSearchText} />
        </div>
      </div>
      <div className='row g-3'>
        {filteredItems.map((item) => (
          <div key={item.id} className='col-md-4 col-sm-6'>
            <Item
              itemName={item.name}
              itemImage={item.imgUrl}
              itemPrice={item.price}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default DisplayItems