import { useContext, useState, useEffect } from 'react'
import { AppContext } from '../../context/AppContext'
import { fetchItems } from '../../Service/ItemService'
import { toast } from 'react-toastify'

const CategoryList = () => {
  const { categories = [], loading, error, deleteCategoryById } = useContext(AppContext)
  const [searchTerm, setSearchTerm] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null)
  const [items, setItems] = useState([])

  useEffect(() => {
    fetchItems().then(res => setItems(res.data))
  }, [])

  const filteredCategories = categories.filter((cat) => {
    const name = (cat?.name || '').toString()
    const query = searchTerm.toLowerCase()
    return name.toLowerCase().includes(query)
  })

  const getItemCount = (categoryId) => {
    return items.filter(item => String(item.categoryId) === String(categoryId)).length
  }

  const handleDeleteClick = (category) => {
    if (!category.id) {
      toast.error("Cannot delete: Category ID is missing")
      return
    }
    setCategoryToDelete(category)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!categoryToDelete?.id) return
    
    setDeletingId(categoryToDelete.id)
    try {
      await deleteCategoryById(categoryToDelete.id)
      toast.success(`Category "${categoryToDelete.name}" deleted successfully`)
      setShowDeleteModal(false)
    } catch (err) {
      console.error(err)
      toast.error("Failed to delete category")
    } finally {
      setDeletingId(null)
      setCategoryToDelete(null)
    }
  }

  return (
    <div className="category-list-container">
      <div className="list-header">
        <div>
          <h3 className="list-title">Categories</h3>
          <p className="list-subtitle">Manage your product categories</p>
        </div>
        <div className="search-container">
          <div className="search-input-group">
            <i className="bi bi-search search-icon"></i>
            <input
              type="text"
              className="search-input"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="clear-search"
                onClick={() => setSearchTerm("")}
                title="Clear search"
              >
                <i className="bi bi-x"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bi bi-grid-3x3-gap"></i>
          </div>
          <div className="stat-content">
            <h4 className="stat-number">{categories.length}</h4>
            <p className="stat-label">Total Categories</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bi bi-box-seam"></i>
          </div>
          <div className="stat-content">
            <h4 className="stat-number">{items.length}</h4>
            <p className="stat-label">Total Items</p>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner-large"></div>
          <p className="loading-text">Loading categories...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <i className="bi bi-exclamation-triangle error-icon"></i>
          <p className="error-message">Failed to load categories</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="empty-state">
          <div className="empty-illustration">
            <i className="bi bi-inbox"></i>
          </div>
          <p className="empty-title">
            {searchTerm ? 'No matching categories found' : 'No categories yet'}
          </p>
          <p className="empty-subtitle">
            {searchTerm ? 'Try a different search term' : 'Create your first category to get started'}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="categories-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Description</th>
                <th>Items</th>
                <th>ID</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((cat, index) => {
                const itemCount = getItemCount(cat.id)
                
                return (
                  <tr key={cat.id || index}>
                    <td>
                      <div className="category-image-wrapper">
                        <img
                          src={cat.imgUrl || 'https://placehold.co/40x40/333/666?text=📁'}
                          alt={cat.name}
                          className="category-image"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = 'https://placehold.co/40x40/333/666?text=📁'
                          }}
                        />
                      </div>
                    </td>
                    <td>
                      <span className="category-name">{cat.name}</span>
                    </td>
                    <td>
                      <span className="category-description">
                        {cat.description || 'No description'}
                      </span>
                    </td>
                    <td>
                      <span className="item-count-badge">
                        <i className="bi bi-box"></i>
                        {itemCount}
                      </span>
                    </td>
                    <td>
                      <span className="category-id">#{cat.id || 'N/A'}</span>
                    </td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteClick(cat)}
                        disabled={deletingId === cat.id}
                        title="Delete"
                      >
                        {deletingId === cat.id ? (
                          <span className="delete-spinner"></span>
                        ) : (
                          <>
                            <i className="bi bi-trash"></i>
                            <span className="btn-text">Delete</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div className="modal-icon">
                <i className="bi bi-exclamation-triangle"></i>
              </div>
              <h4 className="modal-title">Delete Category</h4>
              <button 
                className="modal-close"
                onClick={() => setShowDeleteModal(false)}
                disabled={deletingId !== null}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <p className="delete-warning">
                Are you sure you want to delete <strong>"{categoryToDelete?.name}"</strong>? 
                This action cannot be undone.
              </p>
              {categoryToDelete && (
                <div className="delete-details">
                  <div className="detail-item">
                    <span className="detail-label">Items in category:</span>
                    <span className="detail-value">{getItemCount(categoryToDelete.id)} items</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Category ID:</span>
                    <span className="detail-value">{categoryToDelete.id}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowDeleteModal(false)}
                disabled={deletingId !== null}
              >
                Cancel
              </button>
              <button 
                className="confirm-delete-btn"
                onClick={confirmDelete}
                disabled={deletingId !== null}
              >
                {deletingId !== null ? (
                  <>
                    <span className="btn-spinner"></span>
                    Deleting...
                  </>
                ) : (
                  'Delete Category'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .category-list-container {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: #0a0a0a;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #1f1f1f;
        }
        
        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #1f1f1f;
          flex-wrap: wrap;
          gap: 12px;
        }
        
        .list-title {
          color: #ffffff;
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 4px 0;
        }
        
        .list-subtitle {
          color: #6b7280;
          font-size: 13px;
          margin: 0;
        }
        
        .search-container {
          flex-shrink: 0;
        }
        
        .search-input-group {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .search-icon {
          position: absolute;
          left: 12px;
          color: #6b7280;
          font-size: 14px;
          pointer-events: none;
        }
        
        .search-input {
          background-color: #111111;
          border: 1px solid #222;
          border-radius: 6px;
          color: #ffffff;
          padding: 8px 36px 8px 36px;
          font-size: 13px;
          width: 220px;
          transition: all 0.2s;
        }
        
        .search-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.15);
        }
        
        .search-input::placeholder {
          color: #4b5563;
        }
        
        .clear-search {
          position: absolute;
          right: 8px;
          background: #1a1a1a;
          border: 1px solid #333;
          color: #9ca3af;
          cursor: pointer;
          padding: 2px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          width: 18px;
          height: 18px;
          font-size: 12px;
        }
        
        .clear-search:hover {
          background-color: #252525;
          color: #ffffff;
        }
        
        .stats-container {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }
        
        .stat-card {
          background: #111111;
          border-radius: 8px;
          padding: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid #1f1f1f;
        }
        
        .stat-icon {
          width: 40px;
          height: 40px;
          background: #1a1a1a;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #667eea;
          font-size: 18px;
        }
        
        .stat-content {
          flex: 1;
        }
        
        .stat-number {
          color: #ffffff;
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 2px 0;
        }
        
        .stat-label {
          color: #6b7280;
          font-size: 12px;
          margin: 0;
        }
        
        /* Table Styles */
        .table-container {
          flex: 1;
          overflow-y: auto;
          overflow-x: auto;
          border-radius: 8px;
          border: 1px solid #1f1f1f;
          background: #0d0d0d;
        }
        
        .table-container::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        .table-container::-webkit-scrollbar-track {
          background: #111;
        }
        
        .table-container::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 3px;
        }
        
        .categories-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 600px;
        }
        
        .categories-table thead {
          background: #151515;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        
        .categories-table th {
          color: #9ca3af;
          font-weight: 600;
          font-size: 11px;
          text-align: left;
          padding: 12px 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #222;
        }
        
        .categories-table tbody tr {
          border-bottom: 1px solid #1a1a1a;
          transition: all 0.2s ease;
        }
        
        .categories-table tbody tr:last-child {
          border-bottom: none;
        }
        
        .categories-table tbody tr:hover {
          background: #151515;
        }
        
        .categories-table td {
          padding: 12px 14px;
          color: #ffffff;
          font-size: 13px;
          vertical-align: middle;
        }
        
        .category-image-wrapper {
          width: 40px;
          height: 40px;
          border-radius: 6px;
          overflow: hidden;
          flex-shrink: 0;
        }
        
        .category-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .category-name {
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
        }
        
        .category-description {
          font-size: 12px;
          color: #6b7280;
          max-width: 200px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
        }
        
        .item-count-badge {
          background: #1a1a1a;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #10b981;
          border: 1px solid #222;
        }
        
        .category-id {
          font-size: 12px;
          color: #4b5563;
          font-family: monospace;
        }
        
        .delete-btn {
          background: transparent;
          color: #ef4444;
          border: 1px solid #ef4444;
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .delete-btn:hover:not(:disabled) {
          background: #ef4444;
          color: #ffffff;
        }
        
        .delete-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .btn-text {
          display: inline;
        }
        
        .delete-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(239, 68, 68, 0.3);
          border-radius: 50%;
          border-top-color: #ef4444;
          animation: spin 1s linear infinite;
        }
        
        .loading-state, .error-state, .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          background: #0d0d0d;
          border-radius: 8px;
          border: 1px dashed #222;
        }
        
        .spinner-large {
          width: 36px;
          height: 36px;
          border: 3px solid #222;
          border-radius: 50%;
          border-top-color: #667eea;
          animation: spin 1s linear infinite;
        }
        
        .loading-text {
          color: #6b7280;
          margin-top: 12px;
          font-size: 13px;
        }
        
        .error-icon {
          font-size: 36px;
          color: #ef4444;
          margin-bottom: 12px;
        }
        
        .error-message {
          color: #ef4444;
          font-size: 14px;
          margin: 0;
        }
        
        .empty-illustration {
          font-size: 48px;
          color: #333;
          margin-bottom: 12px;
        }
        
        .empty-title {
          color: #9ca3af;
          font-size: 14px;
          font-weight: 500;
          margin: 0 0 4px 0;
        }
        
        .empty-subtitle {
          color: #6b7280;
          font-size: 12px;
          margin: 0;
        }
        
        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .modal-container {
          background: #111111;
          border-radius: 12px;
          width: 100%;
          max-width: 400px;
          border: 1px solid #222;
          animation: slideIn 0.2s ease;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .modal-header {
          display: flex;
          align-items: center;
          padding: 18px 18px 14px;
          border-bottom: 1px solid #1f1f1f;
        }
        
        .modal-icon {
          width: 36px;
          height: 36px;
          background: #fbbf24;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          color: #000;
          font-size: 18px;
        }
        
        .modal-title {
          color: #ffffff;
          font-size: 16px;
          font-weight: 600;
          margin: 0;
          flex: 1;
        }
        
        .modal-close {
          background: transparent;
          border: 1px solid #333;
          color: #9ca3af;
          font-size: 16px;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: all 0.2s;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .modal-close:hover:not(:disabled) {
          background-color: #1a1a1a;
          color: #ffffff;
        }
        
        .modal-body {
          padding: 16px 18px;
        }
        
        .delete-warning {
          color: #9ca3af;
          font-size: 14px;
          line-height: 1.5;
          margin: 0 0 14px 0;
        }
        
        .delete-warning strong {
          color: #ffffff;
        }
        
        .delete-details {
          background: #0a0a0a;
          border-radius: 8px;
          padding: 12px;
          border: 1px solid #1f1f1f;
        }
        
        .detail-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
        }
        
        .detail-item:last-child {
          margin-bottom: 0;
        }
        
        .detail-label {
          color: #6b7280;
          font-size: 13px;
        }
        
        .detail-value {
          color: #ffffff;
          font-size: 13px;
          font-weight: 500;
        }
        
        .modal-footer {
          display: flex;
          gap: 10px;
          padding: 14px 18px;
          border-top: 1px solid #1f1f1f;
        }
        
        .cancel-btn, .confirm-delete-btn {
          flex: 1;
          padding: 10px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .cancel-btn {
          background-color: transparent;
          color: #9ca3af;
          border: 1px solid #333;
        }
        
        .cancel-btn:hover:not(:disabled) {
          background-color: #1a1a1a;
          color: #ffffff;
        }
        
        .confirm-delete-btn {
          background: #ef4444;
          color: #ffffff;
          border: none;
        }
        
        .confirm-delete-btn:hover:not(:disabled) {
          background: #dc2626;
        }
        
        .confirm-delete-btn:disabled, .cancel-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .btn-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s linear infinite;
          margin-right: 6px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .list-header {
            flex-direction: column;
            align-items: stretch;
          }
          
          .search-input {
            width: 100%;
          }
          
          .list-title {
            font-size: 16px;
          }
          
          .stats-container {
            grid-template-columns: 1fr;
          }
          
          .categories-table th,
          .categories-table td {
            padding: 10px 12px;
            font-size: 12px;
          }
          
          .btn-text {
            display: none;
          }
          
          .delete-btn {
            padding: 6px;
          }
        }
      `}</style>
    </div>
  )
}

export default CategoryList