import React, { useState } from 'react'

const SearchBox = ({ onSearch }) => {
  const [searchText, setSearchText] = useState('');

  const handleInputChange = (e) => {
    setSearchText(e.target.value);
    onSearch(e.target.value);
  }

  return (
    <div className='input-group mb-3'>
      <input 
        className='form-control' 
        placeholder='Search Items......' 
        value={searchText} 
        onChange={handleInputChange} 
      />
      <span className='input-group-text bg-warning'>
        <i className='bi bi-search'></i>
      </span>
    </div>
  )
}

export default SearchBox