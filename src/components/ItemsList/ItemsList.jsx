import React, { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const ItemsList = () => {
  const { items = [], categories = [], deleteItemById } = useContext(AppContext);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  return (
    <div className="container-fluid py-4">
      <div className="container-fluid px-3">
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
        <div className="card border shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Item</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th className="d-none d-md-table-cell">Description</th>
                    <th className="text-end pe-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-5">
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
                        <td className="ps-4">
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                              style={{
                                width: 36,
                                height: 36,
                                backgroundColor: getCategoryColor(item.categoryId),
                                fontSize: "0.875rem"
                              }}
                            >
                              {item.name?.[0]?.toUpperCase() || "I"}
                            </div>
                            <div>
                              <div className="fw-semibold">{item.name}</div>
                              <small className="text-muted d-block d-md-none">
                                {item.description ? item.description.substring(0, 30) + "..." : "No description"}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span
                            className="badge px-2 py-1"
                            style={{
                              backgroundColor: getCategoryColor(item.categoryId),
                              color: "white"
                            }}
                          >
                            {getCategoryName(item.categoryId)}
                          </span>
                        </td>

                        <td>
                          <span className="fw-bold text-success">
                            रु {Number(item.price).toFixed(2)}
                          </span>
                        </td>

                        <td className="d-none d-md-table-cell">
                          <div className="text-truncate" style={{ maxWidth: "360px" }}>
                            {item.description || (
                              <span className="text-muted fst-italic">No description</span>
                            )}
                          </div>
                        </td>

                        <td className="text-end pe-4">
                          <button
                            className="btn btn-sm btn-outline-dark"
                            onClick={() => setSelectedItem(item)}
                          >
                            <i className="bi bi-trash me-1"></i>
                            <span className="d-none d-md-inline">Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            {filteredItems.length > 0 && (
              <div className="card-footer bg-white border-top py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    Showing {filteredItems.length} of {items.length} items
                  </small>
                  {search && (
                    <small className="text-muted">
                      Found {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}
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
      </div>
    </div>
  );
};

export default ItemsList;