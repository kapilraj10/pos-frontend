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
    <div className="container py-4">
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold mb-1">Categories</h2>
              <p className="text-muted mb-0">Manage your product categories</p>
            </div>
            <div className="badge bg-primary bg-opacity-10 text-primary px-3 py-2">
              <i className="bi bi-grid me-1"></i>
              {categories.length} Categories
            </div>
          </div>

          {/* Search Bar */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => setSearchTerm("")}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 rounded p-3 me-3">
                      <i className="bi bi-grid-3x3 text-primary fs-4"></i>
                    </div>
                    <div>
                      <h3 className="mb-0 fw-bold">{categories.length}</h3>
                      <p className="text-muted mb-0">Total Categories</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="bg-success bg-opacity-10 rounded p-3 me-3">
                      <i className="bi bi-box text-success fs-4"></i>
                    </div>
                    <div>
                      <h3 className="mb-0 fw-bold">{items.length}</h3>
                      <p className="text-muted mb-0">Total Items</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted">Loading categories...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Failed to load categories
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredCategories.length === 0 && (
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <div className="mb-3">
                  <i className="bi bi-folder-x text-muted" style={{ fontSize: '3rem' }}></i>
                </div>
                <h5 className="mb-2">
                  {searchTerm ? 'No matching categories found' : 'No categories yet'}
                </h5>
                <p className="text-muted mb-0">
                  {searchTerm ? 'Try a different search term' : 'Create your first category to get started'}
                </p>
              </div>
            </div>
          )}

          {/* Categories List */}
          {!loading && !error && filteredCategories.length > 0 && (
            <div className="card border-0 shadow-sm">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4">Name</th>
                        <th>Description</th>
                        <th>Items</th>
                        <th>Color</th>
                        <th className="text-end pe-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCategories.map((cat, index) => {
                        const itemCount = getItemCount(cat.id)
                        
                        return (
                          <tr key={cat.id || index}>
                            <td className="ps-4">
                              <div className="d-flex align-items-center">
                                <div className="me-3">
                                  <div className="bg-light rounded-circle p-2">
                                    <i className="bi bi-folder text-muted"></i>
                                  </div>
                                </div>
                                <div>
                                  <h6 className="mb-0 fw-semibold">{cat.name}</h6>
                                  <small className="text-muted">ID: #{cat.id || 'N/A'}</small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="text-truncate" style={{ maxWidth: '250px' }}>
                                {cat.description || <span className="text-muted">No description</span>}
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark border">
                                <i className="bi bi-box me-1"></i>
                                {itemCount} items
                              </span>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div 
                                  className="rounded-circle me-2"
                                  style={{
                                    width: '20px',
                                    height: '20px',
                                    backgroundColor: cat.bgColor || '#4f46e5'
                                  }}
                                ></div>
                                <small className="text-muted">{cat.bgColor || '#4f46e5'}</small>
                              </div>
                            </td>
                            <td className="text-end pe-4">
                              <button
                                className="btn btn-sm btn-outline-dark"
                                onClick={() => handleDeleteClick(cat)}
                                disabled={deletingId === cat.id}
                              >
                                {deletingId === cat.id ? (
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
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Results Count */}
          {!loading && filteredCategories.length > 0 && (
            <div className="mt-3 text-end">
              <small className="text-muted">
                Showing {filteredCategories.length} of {categories.length} categories
              </small>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-bottom">
                <div className="d-flex align-items-center">
                  <div className="bg-warning bg-opacity-10 rounded-circle p-2 me-3">
                    <i className="bi bi-exclamation-triangle text-warning"></i>
                  </div>
                  <div>
                    <h5 className="modal-title mb-0">Delete Category</h5>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deletingId !== null}
                ></button>
              </div>
              
              <div className="modal-body py-4">
                <p className="mb-4">
                  Are you sure you want to delete <strong>"{categoryToDelete?.name}"</strong>? 
                  This action cannot be undone.
                </p>
                
                {categoryToDelete && (
                  <div className="bg-light rounded p-3 mb-3">
                    <div className="row">
                      <div className="col-6">
                        <small className="text-muted d-block">Items in category</small>
                        <strong>{getItemCount(categoryToDelete.id)} items</strong>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block">Category ID</small>
                        <strong>#{categoryToDelete.id}</strong>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="alert alert-warning mb-0">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Items in this category will not be deleted, but will lose their category assignment.
                </div>
              </div>
              
              <div className="modal-footer border-top">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deletingId !== null}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-dark"
                  onClick={confirmDelete}
                  disabled={deletingId !== null}
                >
                  {deletingId !== null ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Deleting...
                    </>
                  ) : (
                    'Delete Category'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS */}
      <style jsx>{`
        .table > :not(:first-child) {
          border-top: none;
        }
        
        .table tbody tr:hover {
          background-color: #f8f9fa;
        }
        
        .modal {
          backdrop-filter: blur(5px);
        }
        
        .modal-content {
          border-radius: 12px;
        }
        
        @media (max-width: 768px) {
          .table-responsive {
            font-size: 0.875rem;
          }
          
          .table th,
          .table td {
            padding: 0.75rem;
          }
          
          .btn-sm {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  )
}

export default CategoryList