import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import { fetchItems } from "../../Service/ItemService";
import "./CategoryList.css";

const CategoryList = () => {
  const { categories = [], deleteCategoryById } = useContext(AppContext);

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // table controls
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchItems()
      .then((res) => setItems(res.data || []))
      .catch(() => toast.error("Failed to load items"));
  }, []);

  const filtered = categories.filter((c) =>
    `${c.name || ""} ${c.description || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const av = String(a[sortField] ?? "").toLowerCase();
    const bv = String(b[sortField] ?? "").toLowerCase();
    if (av < bv) return sortDirection === "asc" ? -1 : 1;
    if (av > bv) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => setPage(1), [search, pageSize]);

  const toggleSort = (field) => {
    if (sortField === field) setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getItemCount = (id) => items.filter((i) => String(i.categoryId) === String(id)).length;

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await deleteCategoryById(id);
      toast.success("Category deleted");
      setSelectedCategory(null);
    } catch {
      toast.error("Failed to delete category");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="container-fluid py-4 category-list">
      {/* Use full-width container to avoid Bootstrap's fixed max-width container */}
      <div className="container-fluid px-4">

        {/* Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 px-3">
          <div>
            <h5 className="fw-bold mb-1">Categories</h5>
            <small className="text-muted">{categories.length} categories</small>
          </div>

          <div className="input-group" style={{ maxWidth: 320 }}>
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              className="form-control border-start-0"
              placeholder="Search by name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="row mb-4 px-3">
          <div className="col-md-6 col-lg-4 mb-3">
            <div className="card border shadow-sm">
              <div className="card-body py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="fw-bold mb-0">{categories.length}</h3>
                    <small className="text-muted">Total Categories</small>
                  </div>
                  <div className="bg-primary bg-opacity-10 rounded p-2">
                    <i className="bi bi-tags text-primary"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-4 mb-3">
            <div className="card border shadow-sm">
              <div className="card-body py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="fw-bold mb-0">{items.length}</h3>
                    <small className="text-muted">Total Items</small>
                  </div>
                  <div className="bg-success bg-opacity-10 rounded p-2">
                    <i className="bi bi-box-seam text-success"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-4 mb-3">
            <div className="card border shadow-sm">
              <div className="card-body py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="fw-bold mb-0">{Math.max(...categories.map(c => getItemCount(c.id)), 0)}</h3>
                    <small className="text-muted">Max items in a category</small>
                  </div>
                  <div className="bg-secondary bg-opacity-10 rounded p-2">
                    <i className="bi bi-graph-up text-secondary"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card border shadow-sm w-100">
          <div className="card-body p-0">
            <div className="table-responsive">
              {/* ensure table takes full available width */}
              <table className="table table-hover align-middle mb-0 w-100">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4" style={{ cursor: "pointer" }} onClick={() => toggleSort('name')}>
                      Category {sortField === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('description')}>
                      Description {sortField === 'description' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th>Items</th>
                    <th className="text-end pe-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-5">
                        <div className="py-4">
                          <i className="bi bi-tag text-muted" style={{ fontSize: '3rem' }}></i>
                          <p className="text-muted mt-3 mb-0">{search ? 'No matching categories' : 'No categories available'}</p>
                        </div>
                      </td>
                    </tr>
                  )}

                  {paged.map((cat) => (
                    <tr key={cat.id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                            style={{ width: 40, height: 40, backgroundColor: '#6c757d' }}
                          >
                            {String(cat.name || '')[0]?.toUpperCase() || 'C'}
                          </div>
                          <div>
                            <div className="fw-medium">{cat.name}</div>
                            <small className="text-muted">ID: {String(cat.id ?? '').substring(0, 8)}{cat.id ? '...' : ''}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="text-dark small">{cat.description || '—'}</span>
                      </td>

                      <td>
                        <span className="text-muted">{getItemCount(cat.id)}</span>
                      </td>

                      <td className="text-end pe-4">
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setSelectedCategory(cat)}
                          disabled={deleting && selectedCategory?.id === cat.id}
                        >
                          {deleting && selectedCategory?.id === cat.id ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                              Deleting
                            </>
                          ) : (
                            <>
                              <i className="bi bi-trash me-1"></i>
                              Delete
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="category-cards mt-3 d-md-none px-3">
              {paged.map((cat, idx) => (
                <div className="category-card" key={cat.id ?? idx}>
                  <div className="left">
                    <div className="avatar-circle">{String(cat.name || '')[0]?.toUpperCase() || 'C'}</div>
                    <div>
                      <div className="fw-medium">{cat.name}</div>
                      <div className="meta">{cat.description || '—'}</div>
                    </div>
                  </div>
                  <div className="right d-flex align-items-center gap-2">
                    <div className="text-muted">{getItemCount(cat.id)} items</div>
                    <button className="btn btn-sm btn-outline-danger action-btn" onClick={() => setSelectedCategory(cat)}>
                      <i className="bi bi-trash me-1"></i>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer / pagination */}
            {filtered.length > 0 && (
              <div className="card-footer bg-white border-top py-3">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <div className="d-flex align-items-center gap-3">
                    <small className="text-muted">Showing {((currentPage - 1) * pageSize) + (paged.length)} of {filtered.length} categories</small>
                    <select className="form-select form-select-sm" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} style={{ width: 90 }}>
                      <option value={5}>5 / page</option>
                      <option value={10}>10 / page</option>
                      <option value={20}>20 / page</option>
                    </select>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <button className="btn btn-sm btn-outline-secondary" disabled={currentPage <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</button>
                    <div className="px-2">Page {currentPage} / {totalPages}</div>
                    <button className="btn btn-sm btn-outline-secondary" disabled={currentPage >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Delete Modal */}
        {selectedCategory && (
          <div className="modal fade show d-block bg-dark bg-opacity-50">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border shadow">
                <div className="modal-body text-center">
                  <h6 className="fw-bold mb-2 text-dark">Delete Category</h6>
                  <p className="text-muted small">Delete <strong>{selectedCategory.name}</strong> permanently?</p>

                  <div className="d-flex gap-2 mt-4">
                    <button className="btn btn-light w-100" onClick={() => setSelectedCategory(null)} disabled={deleting}>Cancel</button>
                    <button className="btn btn-danger w-100" onClick={() => handleDelete(selectedCategory.id)} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CategoryList;
