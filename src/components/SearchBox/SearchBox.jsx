import React, { useState } from 'react'
import './SearchBox.css'

const SearchBox = ({ onSearch }) => {
  const [searchText, setSearchText] = useState('');

  const handleInputChange = (e) => {
    setSearchText(e.target.value);
    onSearch(e.target.value);
  }

  return (
    <div className='search-box-wrapper'>
      <input 
        className='search-input' 
        placeholder='Search items...' 
        value={searchText} 
        onChange={handleInputChange} 
      />
      <span className='search-icon'>
        <i className='bi bi-search'></i>
      </span>
    </div>
  )
}

export default SearchBox