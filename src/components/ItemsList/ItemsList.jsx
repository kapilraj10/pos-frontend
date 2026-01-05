import React, { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import "./ItemsList.css";

const ItemsList = () => {
  const { items = [], categories = [], deleteItemById, updateItem } = useContext(AppContext);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editing, setEditing] = useState(false);

  const getCategoryName = (id) =>
    categories.find(c => String(c.id) === String(id))?.name || "Unknown";

  const getCategoryColor = (id) => {
    const category = categories.find(c => String(c.id) === String(id));
    return category?.bgColor || "#6c757d";
  };

  const filteredItems = items.filter(item =>
    `${item.name} ${item.description} ${getCategoryName(item.categoryId)}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!selectedItem) return;
    setDeleting(true);
    try {
      await deleteItemById(selectedItem.id);
      toast.success("Item deleted successfully");
      setSelectedItem(null);
    } catch {
      toast.error("Failed to delete item");
    } finally {
      setDeleting(false);
    }
  };

  const handleEditSave = async () => {
    if (!editForm || !editItem) return;
    setEditing(true);
    try {
      await updateItem({
        id: editForm.id,
        name: editForm.name,
        price: editForm.price,
        description: editForm.description,
        category: editForm.category,
        stock: editForm.stock,
        file: editForm.file,
      });
      setEditItem(null);
      setEditForm(null);
      toast.success("Item updated");
    } catch {
      toast.error("Failed to update item");
    } finally {
      setEditing(false);
    }
  };

  const handleEditCancel = () => {
    setEditItem(null);
    setEditForm(null);
  };

  return (
    <div className="container-fluid py-4 items-list">
      <div className="container-fluid px-4">
        {/* Header */}
        <div className="row mb-4 align-items-center">
          <div className="col-md-6 mb-3 mb-md-0">
            <div>
              <h2 className="h4 fw-bold mb-1">Items</h2>
              <p className="text-muted mb-0">{items.length} total items in inventory</p>
            </div>
          </div>

          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                className="form-control border-start-0"
                placeholder="Search items by name, description or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className="btn btn-outline-secondary border-start-0"
                  onClick={() => setSearch("")}
                  type="button"
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="row mb-4">
          <div className="col-md-4 mb-3">
            <div className="card border shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="fw-bold mb-0">{items.length}</h3>
                    <small className="text-muted">Total Items</small>
                  </div>
                  <div className="bg-primary bg-opacity-10 rounded p-2">
                    <i className="bi bi-box text-primary"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div className="card border shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="fw-bold mb-0">
                      रु {items.reduce((sum, item) => sum + (Number(item.price) || 0), 0).toFixed(2)}
                    </h3>
                    <small className="text-muted">Total Value</small>
                  </div>
                  <div className="bg-success bg-opacity-10 rounded p-2">
                    <i className="bi bi-currency-rupee text-success"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div className="card border shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="fw-bold mb-0">{categories.length}</h3>
                    <small className="text-muted">Categories</small>
                  </div>
                  <div className="bg-info bg-opacity-10 rounded p-2">
                    <i className="bi bi-tags text-info"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="card border shadow-sm w-100">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 w-100">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4" style={{ minWidth: '250px' }}>Item</th>
                    <th style={{ minWidth: '120px' }}>Category</th>
                    <th style={{ minWidth: '100px' }}>Stock</th>
                    <th style={{ minWidth: '100px' }}>Price</th>
                    <th className="d-none d-lg-table-cell" style={{ minWidth: '200px' }}>Description</th>
                    <th className="text-end pe-4" style={{ minWidth: '180px' }}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5">
                        <div className="py-4">
                          <i className="bi bi-box text-muted" style={{ fontSize: "3rem" }}></i>
                          <p className="text-muted mt-3 mb-0">
                            {search ? "No matching items found" : "No items available"}
                          </p>
                          {search && (
                            <button
                              className="btn btn-sm btn-outline-secondary mt-2"
                              onClick={() => setSearch("")}
                            >
                              Clear Search
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map(item => (
                      <tr key={item.id} className="align-middle">
                        <td className="ps-4 py-3">
                          <div className="d-flex align-items-center gap-3">
                            {item.imgUrl ? (
                              <img
                                src={item.imgUrl}
                                alt={item.name}
                                className="rounded"
                                style={{
                                  width: '50px',
                                  height: '50px',
                                  objectFit: 'cover',
                                  border: '2px solid #e9ecef'
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div
                              className="rounded d-flex align-items-center justify-content-center fw-bold text-white"
                              style={{
                                width: 50,
                                height: 50,
                                backgroundColor: getCategoryColor(item.categoryId),
                                fontSize: "1.25rem",
                                display: item.imgUrl ? 'none' : 'flex'
                              }}
                            >
                              {item.name?.[0]?.toUpperCase() || "I"}
                            </div>
                            <div className="flex-grow-1">
                              <div className="fw-semibold text-dark mb-1" style={{ fontSize: '0.95rem' }}>
                                {item.name}
                              </div>
                              <small className="text-muted d-block d-lg-none">
                                {item.description ?
                                  (item.description.length > 40 ? item.description.substring(0, 40) + "..." : item.description)
                                  : "No description"}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td className="py-3">
                          <span
                            className="badge px-3 py-2"
                            style={{
                              backgroundColor: getCategoryColor(item.categoryId),
                              color: "white",
                              fontSize: '0.75rem',
                              fontWeight: '500'
                            }}
                          >
                            {getCategoryName(item.categoryId)}
                          </span>
                        </td>

                        <td className="py-3">
                          <span
                            className={`badge px-3 py-2 ${(item.stock ?? 0) === 0 ? 'bg-danger' :
                                (item.stock ?? 0) <= 5 ? 'bg-warning text-dark' :
                                  'bg-success'
                              }`}
                            style={{ fontSize: '0.8rem', fontWeight: '600' }}
                          >
                            {item.stock ?? 0}
                            <i className={`bi ${(item.stock ?? 0) === 0 ? 'bi-x-circle' :
                                (item.stock ?? 0) <= 5 ? 'bi-exclamation-triangle' :
                                  'bi-check-circle'
                              } ms-1`}></i>
                          </span>
                        </td>

                        <td className="py-3">
                          <span className="fw-bold text-success" style={{ fontSize: '0.95rem' }}>
                            रु {Number(item.price).toFixed(2)}
                          </span>
                        </td>

                        <td className="d-none d-lg-table-cell py-3">
                          <div
                            className="text-muted"
                            style={{
                              maxWidth: '250px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontSize: '0.875rem'
                            }}
                            title={item.description}
                          >
                            {item.description || (
                              <span className="fst-italic">No description</span>
                            )}
                          </div>
                        </td>

                        <td className="text-end pe-4 py-3">
                          <div className="d-flex justify-content-end gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary px-3"
                              style={{ fontSize: '0.85rem' }}
                              onClick={() => {
                                setEditForm({
                                  id: item.id,
                                  name: item.name || "",
                                  price: item.price || 0,
                                  description: item.description || "",
                                  category: item.categoryId || item.category || "",
                                  stock: item.stock ?? 0,
                                  file: null,
                                });
                                setSelectedItem(null);
                                setEditItem(item);
                              }}
                              title="Edit item"
                            >
                              <i className="bi bi-pencil-square me-1"></i>
                              <span className="d-none d-xl-inline">Edit</span>
                            </button>

                            <button
                              className="btn btn-sm btn-outline-danger px-3"
                              style={{ fontSize: '0.85rem' }}
                              onClick={() => setSelectedItem(item)}
                              title="Delete item"
                            >
                              <i className="bi bi-trash3 me-1"></i>
                              <span className="d-none d-xl-inline">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            {filteredItems.length > 0 && (
              <div className="card-footer bg-light border-top py-3">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <small className="text-muted">
                    <i className="bi bi-list-check me-1"></i>
                    Showing <strong>{filteredItems.length}</strong> of <strong>{items.length}</strong> items
                  </small>
                  {search && (
                    <small className="badge bg-primary">
                      <i className="bi bi-search me-1"></i>
                      {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}
                    </small>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {selectedItem && (
          <div
            className="modal fade show d-block"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header border-bottom">
                  <div className="d-flex align-items-center">
                    <div className="bg-danger bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="bi bi-exclamation-triangle text-danger"></i>
                    </div>
                    <div>
                      <h5 className="modal-title mb-0">Delete Item</h5>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setSelectedItem(null)}
                    disabled={deleting}
                    aria-label="Close"
                  ></button>
                </div>

                <div className="modal-body py-4">
                  <div className="text-center mb-3">
                    <div
                      className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                      style={{
                        backgroundColor: getCategoryColor(selectedItem.categoryId),
                        width: '60px',
                        height: '60px'
                      }}
                    >
                      <span className="text-white fw-bold fs-4">
                        {selectedItem.name?.[0]?.toUpperCase() || "I"}
                      </span>
                    </div>
                    <h6 className="fw-bold mb-1">{selectedItem.name}</h6>
                    <div className="text-muted mb-3">
                      <span className="badge me-2"
                        style={{
                          backgroundColor: getCategoryColor(selectedItem.categoryId),
                          color: "white"
                        }}
                      >
                        {getCategoryName(selectedItem.categoryId)}
                      </span>
                      <span className="fw-bold text-success">
                        रु {Number(selectedItem.price).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <p className="text-center mb-4">
                    Are you sure you want to delete this item?
                    This action cannot be undone.
                  </p>

                  <div className="alert alert-warning mb-0">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    This item will be permanently removed from your inventory.
                  </div>
                </div>

                <div className="modal-footer border-top">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setSelectedItem(null)}
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Deleting...
                      </>
                    ) : (
                      'Delete Item'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Item Modal */}
        {editForm && (
          <div
            className="modal fade show d-block"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Item</h5>
                  <button type="button" className="btn-close" onClick={handleEditCancel}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input className="form-control" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Price</label>
                    <input type="number" className="form-control" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Stock</label>
                    <input type="number" min={0} className="form-control" value={editForm.stock} onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" rows={3} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}>
                      <option value="">Select</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Image (optional)</label>
                    <input type="file" className="form-control" onChange={(e) => setEditForm({ ...editForm, file: e.target.files[0] })} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-outline-secondary" onClick={handleEditCancel} disabled={editing}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleEditSave} disabled={editing}>{editing ? 'Saving...' : 'Save changes'}</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemsList;