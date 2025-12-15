import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';

const ItemsList = () => {
  const { items, categories, deleteItemById } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => 
      String(cat.id) === String(categoryId) || 
      String(cat.categoryId) === String(categoryId)
    );
    return category?.name || "Unknown";
  };

  const openDeleteModal = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    const itemId = itemToDelete.id || itemToDelete.itemId || itemToDelete._id;
    setDeleting(true);

    try {
      await deleteItemById(itemId);
      toast.success(`"${itemToDelete.name}" deleted successfully!`);
      closeDeleteModal();
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete item");
    } finally {
      setDeleting(false);
    }
  };

  const filteredItems = items.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="items-list-container">
        <div className="list-header">
          <h4 className="list-title">Items List</h4>
          <div className="search-container">
            <div className="search-input-group">
              <i className="bi bi-search search-icon"></i>
              <input
                type="text"
                className="search-input"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchTerm("")}
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-inbox"></i>
            <p className="empty-message">
              {searchTerm ? "No items match your search." : "No items available. Add some items to get started."}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="items-table">
              <thead>
                <tr>
                  <th className="image-column">Image</th>
                  <th className="name-column">Name</th>
                  <th className="category-column">Category</th>
                  <th className="price-column">Price (रु)</th>
                  <th className="description-column">Description</th>
                  <th className="actions-column">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, index) => {
                  const itemId = item.id || item.itemId || item._id;
                  
                  return (
                    <tr key={itemId || index} className="table-row">
                      <td className="image-cell">
                        <div className="item-image-wrapper">
                          {item.imgUrl ? (
                            <img 
                              src={item.imgUrl} 
                              alt={item.name} 
                              className="item-image"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://i.postimg.cc/NGZyjq9c/BG-IPHONE-2048px-IPHONE-17-PRO-MAX-BACK.webp';
                              }}
                            />
                          ) : (
                            <div className="image-placeholder">
                              <i className="bi bi-image"></i>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="name-cell">
                        <span className="item-name">{item.name}</span>
                      </td>
                      <td className="category-cell">
                        <span className="category-badge">{getCategoryName(item.categoryId)}</span>
                      </td>
                      <td className="price-cell">
                        <span className="price-value">रु {Number(item.price).toFixed(2)}</span>
                      </td>
                      <td className="description-cell">
                        <span className="description-text" title={item.description}>
                          {item.description || "-"}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button
                          className="delete-btn"
                          onClick={() => openDeleteModal(item)}
                          title="Delete item"
                        >
                          <i className="bi bi-trash"></i>
                          <span className="btn-text">Delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h5 className="modal-title">Confirm Delete</h5>
              <button 
                type="button" 
                className="modal-close" 
                onClick={closeDeleteModal}
                disabled={deleting}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="warning-icon">
                <i className="bi bi-exclamation-triangle"></i>
              </div>
              <p className="delete-warning">
                Are you sure you want to delete this item? This action cannot be undone.
              </p>
              {itemToDelete && (
                <div className="item-details">
                  <div className="detail-row">
                    <span className="detail-label">Item:</span>
                    <span className="detail-value">{itemToDelete.name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Category:</span>
                    <span className="detail-value">{getCategoryName(itemToDelete.categoryId)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Price:</span>
                    <span className="detail-value">रु {Number(itemToDelete.price).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={closeDeleteModal}
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="confirm-delete-btn" 
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <span className="delete-spinner"></span>
                    Deleting...
                  </>
                ) : (
                  'Delete Item'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .items-list-container {
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 0;
          background: #0a0a0a;
          color: #ffffff;
        }
        
        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #1f1f1f;
        }
        
        .list-title {
          color: #ffffff;
          font-size: 20px;
          font-weight: 700;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
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
          left: 14px;
          color: #6b7280;
          font-size: 14px;
          pointer-events: none;
        }
        
        .search-input {
          background-color: #111111;
          border: 1px solid #222222;
          border-radius: 8px;
          color: #ffffff;
          padding: 10px 40px 10px 40px;
          font-size: 13px;
          width: 280px;
          transition: all 0.2s ease;
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
          right: 10px;
          background: #1a1a1a;
          border: 1px solid #333;
          color: #9ca3af;
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          transition: all 0.2s;
        }
        
        .clear-search:hover {
          background-color: #252525;
          color: #ffffff;
        }
        
        .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          padding: 50px 20px;
          background: #0d0d0d;
          border-radius: 12px;
          border: 1px dashed #222;
        }
        
        .empty-state i {
          font-size: 56px;
          margin-bottom: 16px;
          opacity: 0.4;
          color: #667eea;
        }
        
        .empty-message {
          font-size: 14px;
          text-align: center;
          max-width: 350px;
          margin: 0;
          color: #9ca3af;
          line-height: 1.5;
        }
        
        .table-container {
          flex: 1;
          overflow-y: auto;
          overflow-x: auto;
          border-radius: 12px;
          border: 1px solid #1f1f1f;
          background: #0d0d0d;
          max-height: 600px;
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
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 800px;
          color: #ffffff;
        }
        
        .items-table thead {
          background: #151515;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        
        .items-table th {
          color: #9ca3af;
          font-weight: 600;
          font-size: 11px;
          text-align: left;
          padding: 14px 16px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #222;
        }
        
        .items-table tbody tr {
          border-bottom: 1px solid #1a1a1a;
          transition: all 0.2s ease;
          background-color: transparent;
        }
        
        .items-table tbody tr:last-child {
          border-bottom: none;
        }
        
        .items-table tbody tr:hover {
          background: #151515;
        }
        
        .items-table td {
          padding: 12px 16px;
          color: #ffffff;
          font-size: 13px;
          vertical-align: middle;
          border-bottom: 1px solid #1a1a1a;
        }
        
        .item-image-wrapper {
          width: 48px;
          height: 48px;
        }
        
        .item-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 6px;
          border: 1px solid #333;
          transition: all 0.2s ease;
        }

        .item-image:hover {
          transform: scale(1.05);
          border-color: #667eea;
        }
        
        .image-placeholder {
          width: 100%;
          height: 100%;
          background: #1a1a1a;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          font-size: 18px;
        }
        
        .item-name {
          font-weight: 600;
          color: #ffffff;
          font-size: 14px;
        }

        .category-badge {
          background: #1a1a1a;
          color: #9ca3af;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          border: 1px solid #333;
          display: inline-block;
        }
        
        .price-value {
          font-weight: 700;
          color: #10b981;
          font-size: 14px;
        }
        
        .description-text {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 220px;
          line-height: 1.4;
          color: #6b7280;
          font-size: 12px;
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
        
        .delete-btn:hover {
          background: #ef4444;
          color: #ffffff;
        }
        
        .btn-text {
          display: inline;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
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
          max-width: 420px;
          border: 1px solid #222;
          animation: modalSlideIn 0.2s ease;
        }

        @keyframes modalSlideIn {
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
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #222;
        }
        
        .modal-title {
          color: #ffffff;
          font-size: 18px;
          font-weight: 600;
          margin: 0;
        }
        
        .modal-close {
          background: transparent;
          border: 1px solid #333;
          color: #9ca3af;
          cursor: pointer;
          font-size: 16px;
          padding: 6px;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .modal-close:hover:not(:disabled) {
          color: #ffffff;
          background: #1a1a1a;
        }
        
        .modal-body {
          padding: 24px 20px;
          text-align: center;
        }
        
        .warning-icon {
          width: 48px;
          height: 48px;
          background: #fbbf24;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .warning-icon i {
          color: #000000;
          font-size: 24px;
        }
        
        .delete-warning {
          color: #9ca3af;
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 16px;
        }
        
        .item-details {
          background: #0a0a0a;
          border-radius: 8px;
          padding: 14px;
          margin-top: 16px;
          text-align: left;
          border: 1px solid #1f1f1f;
        }
        
        .detail-row {
          display: flex;
          margin-bottom: 10px;
          align-items: center;
        }
        
        .detail-row:last-child {
          margin-bottom: 0;
        }
        
        .detail-label {
          color: #6b7280;
          font-size: 13px;
          width: 80px;
          flex-shrink: 0;
          font-weight: 500;
        }
        
        .detail-value {
          color: #ffffff;
          font-size: 13px;
          font-weight: 500;
          flex: 1;
        }
        
        .modal-footer {
          display: flex;
          gap: 10px;
          padding: 16px 20px;
          border-top: 1px solid #222;
        }
        
        .cancel-btn {
          flex: 1;
          background: transparent;
          color: #9ca3af;
          border: 1px solid #333;
          border-radius: 6px;
          padding: 10px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .cancel-btn:hover:not(:disabled) {
          background: #1a1a1a;
          color: #ffffff;
        }
        
        .confirm-delete-btn {
          flex: 1;
          background: #ef4444;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          padding: 10px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        
        .confirm-delete-btn:hover:not(:disabled) {
          background: #dc2626;
        }
        
        .confirm-delete-btn:disabled,
        .cancel-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: #333;
        }
        
        .delete-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Responsive Styles */
        @media (max-width: 1200px) {
          .list-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          
          .search-input {
            width: 100%;
          }
        }
        
        @media (max-width: 768px) {
          .list-title {
            font-size: 16px;
          }
          
          .items-table th,
          .items-table td {
            padding: 10px 12px;
            font-size: 12px;
          }
          
          .btn-text {
            display: none;
          }
          
          .delete-btn {
            padding: 6px;
          }
          
          .search-input {
            width: 100%;
          }
        }
        
        @media (max-width: 480px) {
          .modal-container {
            max-width: 100%;
          }
          
          .modal-footer {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
};

export default ItemsList;