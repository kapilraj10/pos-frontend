import { useContext, useState, useRef } from 'react'
import Modal from 'bootstrap/js/dist/modal'
import { AppContext } from '../../context/AppContext'
import './CategoryList.css'

const CategoryList = () => {
  const { categories = [], loading, error, deleteCategoryById } = useContext(AppContext)
  const [searchTerm, setSearchTerm] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const modalRef = useRef(null)
  const modalInstanceRef = useRef(null)

  const filteredCategories = categories.filter((cat) => {
    const name = (cat?.name || '').toString()
    const query = searchTerm.toLowerCase()
    return name.toLowerCase().includes(query)
  })
  const openConfirm = (categoryId) => {
    if (!categoryId) return
    setConfirmId(categoryId)
    // Create or reuse a Bootstrap Modal instance (ESM import ensures availability)
    if (!modalInstanceRef.current) {
      modalInstanceRef.current = new Modal(modalRef.current, { backdrop: 'static', keyboard: false })
    }
    modalInstanceRef.current.show()
  }

  const confirmDelete = async () => {
    if (!confirmId) return
    const modal = modalInstanceRef.current || (modalInstanceRef.current = new Modal(modalRef.current))
    try {
      setDeletingId(confirmId)
      await deleteCategoryById(confirmId)
    } catch (e) {
      console.error(e)
    } finally {
      setDeletingId(null)
      setConfirmId(null)
      modal && modal.hide()
    }
  }


  return (
    <div
      className='category-list-container'
      style={{ height: '100vh', overflowY: 'auto', overflowX: 'hidden' }}
    >
      {/* Search Bar */}
      <div className='row pe-2 mb-3'>
        <div className='col-12'>
          <div className='search-container position-relative'>
            <input
              type='text'
              className='form-control search-input'
              placeholder='Search categories...'
              style={{
                borderRadius: '25px',
                paddingLeft: '45px',
                border: '2px solid #e9ecef'
              }}
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
            />
            <i 
              className='bi bi-search position-absolute'
              style={{
                left: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6c757d'
              }}
            ></i>
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div className='row g-3 pe-2'>
        {loading && (
          <div className='col-12'>
            <div className='text-center py-4'>
              <div className='spinner-border text-primary' role='status'>
                <span className='visually-hidden'>Loading...</span>
              </div>
              <div className='text-muted small mt-2'>Loading categories...</div>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className='col-12'>
            <div className='alert alert-danger text-center'>
              <i className='bi bi-exclamation-triangle me-2'></i>
              Failed to load categories
            </div>
          </div>
        )}

        {!loading && !error && categories.length === 0 && searchTerm.trim() === '' && (
          <div className='col-12'>
            <div className='text-center py-5 text-secondary'>
              <i className='bi bi-inbox display-4 d-block mb-2'></i>
              No categories found
            </div>
          </div>
        )}

        {!loading && !error && categories.length > 0 && filteredCategories.length === 0 && (
          <div className='col-12'>
            <div className='text-center py-5 text-secondary'>
              <i className='bi bi-search display-6 d-block mb-2'></i>
              No matching categories for "{searchTerm}"
            </div>
          </div>
        )}

        {!loading && !error &&
          filteredCategories.map((cat, index) => (
            <div key={cat.id || index} className='col-12'>
              <div 
                className='card p-3 category-card'
                style={{ 
                  backgroundColor: cat.bgColor,
                  border: 'none',
                  borderRadius: '15px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                <div className='d-flex align-items-center'>
                  {/* Category Image */}
                  <div style={{ marginRight: '15px' }}>
                    <img
                      src={cat.imgUrl || 'https://placehold.co/50x50'}
                      alt={cat.name}
                      className='category-image'
                    />
                  </div>
                  
                  {/* Category Info */}
                  <div className='flex-grow-1'>
                    <h5 className='mb-1 text-white fw-bold'>{cat.name}</h5>
                    <p className='mb-0 text-white-50'>
                      {cat.itemCount || 5} Items
                    </p>
                  </div>
                  
                  {/* Delete Button */}
                  <div>
                    <button 
                      className='btn btn-light btn-sm delete-btn'
                      style={{
                        borderRadius: '50%',
                        width: '35px',
                        height: '35px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title={!cat.id ? 'Cannot delete: missing ID' : (deletingId === cat.id ? 'Deleting...' : 'Delete')}
                      disabled={!cat.id || deletingId === cat.id}
                      onClick={() => cat.id && openConfirm(cat.id)}
                    >
                      {deletingId === cat.id ? (
                        <span className='spinner-border spinner-border-sm text-danger' role='status' aria-hidden='true'></span>
                      ) : (
                        <i className='bi bi-trash text-danger'></i>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
      {/* Confirm Delete Modal */}
      <div
        className="modal fade"
        id="confirmDeleteModal"
        tabIndex="-1"
        aria-hidden="true"
        ref={modalRef}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content bg-dark text-light border border-secondary">
            <div className="modal-header">
              <h5 className="modal-title">Delete Category</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              Are you sure you want to delete this category?
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                disabled={deletingId !== null}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={confirmDelete}
                disabled={deletingId !== null}
              >
                {deletingId !== null ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoryList