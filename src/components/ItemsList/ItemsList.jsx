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
      toast.success(`"${itemToDelete.name}" deleted successfully! 🗑️`);
      closeDeleteModal();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(false);
    }
  };

  const filteredItems = items.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="text-danger fw-bold">Items List</h3>
        <div className="d-flex gap-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '300px' }}
          />
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="alert alert-info text-center">
          {searchTerm ? "No items match your search." : "No items available. Add some items to get started."}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-danger">
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price (रु)</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, index) => {
                const itemId = item.id || item.itemId || item._id;
                if (index === 0) console.log("Item object structure:", item);
                
                return (
                  <tr key={itemId || index}>
                    <td>
                      {item.imgUrl ? (
                        <img 
                          src={item.imgUrl} 
                          alt={item.name} 
                          width={50} 
                          height={50}
                          className="rounded"
                          style={{ objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/50?text=No+Image';
                          }}
                        />
                      ) : (
                        <div 
                          className="bg-secondary rounded d-flex align-items-center justify-content-center"
                          style={{ width: 50, height: 50 }}
                        >
                          <span className="text-white">N/A</span>
                        </div>
                      )}
                    </td>
                    <td className="align-middle">{item.name}</td>
                    <td className="align-middle">{getCategoryName(item.categoryId)}</td>
                    <td className="align-middle">रु {Number(item.price).toFixed(2)}</td>
                    <td className="align-middle">{item.description || "-"}</td>
                    <td className="align-middle">
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => openDeleteModal(item)}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <>
          <div 
            className="modal fade show d-block" 
            tabIndex="-1" 
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-danger text-white">
                  <h5 className="modal-title">⚠️ Confirm Delete</h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white" 
                    onClick={closeDeleteModal}
                    disabled={deleting}
                  ></button>
                </div>
                <div className="modal-body">
                  <p className="mb-2">Are you sure you want to delete this item?</p>
                  {itemToDelete && (
                    <div className="alert alert-warning mb-0">
                      <strong>Item:</strong> {itemToDelete.name}<br />
                      <strong>Category:</strong> {getCategoryName(itemToDelete.categoryId)}<br />
                      <strong>Price:</strong> रु {Number(itemToDelete.price).toFixed(2)}
                    </div>
                  )}
                  <p className="text-danger mt-2 mb-0">
                    <small>⚠️ This action cannot be undone!</small>
                  </p>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={closeDeleteModal}
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger" 
                    onClick={confirmDelete}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Deleting...
                      </>
                    ) : (
                      '🗑️ Yes, Delete'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ItemsList;