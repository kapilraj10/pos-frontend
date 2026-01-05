import React, { useContext, useState, useEffect } from 'react'
import './DisplayItems.css'
import { AppContext } from '../../context/AppContext'
import Item from '../Item/Item'
import SearchBox from '../SearchBox/SearchBox'

const DisplayItems = ({ selectedCategory }) => {
  const { items, loading, error } = useContext(AppContext);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Responsive items per page
  const [itemsPerPage, setItemsPerPage] = useState(12);

  useEffect(() => {
    const updateItemsPerPage = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setItemsPerPage(12); // Mobile: 12 items per page
      } else if (width < 1024) {
        setItemsPerPage(12); // Tablet: 12 items per page
      } else {
        setItemsPerPage(12); // Desktop: 12 items per page (4×3)
      }
    };

    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  // Reset to page 1 when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchText]);

  const filteredItems = items.filter(item => {
    if (selectedCategory && String(item.categoryId) !== String(selectedCategory)) {
      return false;
    }

    if (searchText && !item.name.toLowerCase().includes(searchText.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Pagination calculations with responsive items per page
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top of items section when page changes
    const itemsContainer = document.querySelector('.items-container');
    if (itemsContainer) {
      itemsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Generate page numbers to display - Show all pages if <= 10, otherwise use smart ellipsis
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisibleButtons = 8;

    // If total pages is small enough, show all
    if (totalPages <= maxVisibleButtons) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // For many pages, use smart pagination
      if (currentPage <= 4) {
        for (let i = 1; i <= 6; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 5; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  if (loading) {
    return (
      <div className="items-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="loading-text">Loading items...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="items-error">
        <i className="bi bi-exclamation-triangle"></i>
        <span>Failed to load items</span>
      </div>
    )
  }

  if (filteredItems.length === 0) {
    return (
      <div className="items-empty">
        <i className="bi bi-inbox"></i>
        <p>{selectedCategory ? 'No items in this category' : 'No items available'}</p>
      </div>
    )
  }

  return (
    <div className='items-container'>
      {/* Header with Item Count and Search Box */}
      <div className='items-header-wrapper'>
        <div className='items-header'>
          <h5 className='items-count'>{filteredItems.length} Items</h5>
        </div>
        <div className='items-search-container'>
          <SearchBox onSearch={setSearchText} />
        </div>
      </div>

      {/* Items Grid - 3x3 on desktop, 2x2 on tablet, 1x1 on mobile */}
      <div className='items-grid'>
        {currentItems.map((item) => (
          <div key={item.id} className='item-card-wrapper'>
            <Item
              itemName={item.name}
              itemImage={item.imgUrl}
              itemPrice={item.price}
              itemId={item.id}
              stock={item.stock}
            />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='pagination-container'>
          <button
            className='pagination-btn pagination-prev'
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <i className="bi bi-chevron-left"></i>
          </button>

          <div className='pagination-numbers'>
            {getPageNumbers().map((pageNum, index) => (
              pageNum === '...' ? (
                <span key={`ellipsis-${index}`} className='pagination-ellipsis'>...</span>
              ) : (
                <button
                  key={pageNum}
                  className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              )
            ))}
          </div>

          <button
            className='pagination-btn pagination-next'
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  )
}

export default DisplayItems