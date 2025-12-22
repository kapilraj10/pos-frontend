import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { fetchItems } from "../../Service/ItemService";
import { toast } from "react-toastify";

const CategoryList = () => {
  const { categories = [], loading, deleteCategoryById } = useContext(AppContext);

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [contrast, setContrast] = useState(false); // soft accent mode

  useEffect(() => {
    fetchItems()
      .then(res => setItems(res.data))
      .catch(() => toast.error("Failed to load items"));
  }, []);

  const filteredCategories = categories.filter(cat =>
    cat.name?.toLowerCase().includes(search.toLowerCase())
  );

  const getItemCount = id =>
    items.filter(i => String(i.categoryId) === String(id)).length;

  const handleDelete = async () => {
    if (!selectedCategory) return;
    setDeleting(true);

    try {
      await deleteCategoryById(selectedCategory.id);
      toast.success("Category deleted");
      setSelectedCategory(null);
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className={`min-vh-100 py-4 ${
        contrast ? "bg-white" : "bg-light"
      }`}
    >
      <div className="container">

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold mb-0 text-dark">Categories</h4>
            <small className="text-muted">{categories.length} total</small>
          </div>

          <div className="d-flex gap-2 align-items-center">
            <input
              className="form-control form-control-sm"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />

            <button
              className="btn btn-sm btn-outline-dark"
              onClick={() => setContrast(!contrast)}
            >
              {contrast ? "Normal" : "Contrast"}
            </button>
          </div>
        </div>

        {/* Loader */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-dark" />
          </div>
        )}

        {/* Empty */}
        {!loading && filteredCategories.length === 0 && (
          <div className="text-center py-5 bg-white rounded border">
            <p className="text-muted mb-0">No categories found</p>
          </div>
        )}

        {/* Grid */}
        <div className="row g-3">
          {filteredCategories.map(cat => (
            <div className="col-md-6 col-lg-4" key={cat.id}>
              <div
                className={`card h-100 ${
                  contrast ? "border-dark" : "border"
                } shadow-sm`}
              >
                <div className="card-body">

                  <div className="d-flex align-items-center mb-3">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center me-3 fw-bold"
                      style={{
                        width: 42,
                        height: 42,
                        backgroundColor: contrast ? "#212529" : "#dee2e6",
                        color: contrast ? "#fff" : "#212529"
                      }}
                    >
                      {cat.name[0]}
                    </div>

                    <div>
                      <h6 className="mb-0 text-dark">{cat.name}</h6>
                      <small className="text-muted">
                        {getItemCount(cat.id)} items
                      </small>
                    </div>
                  </div>

                  <p className="text-muted small mb-3">
                    {cat.description || "No description"}
                  </p>

                  <div className="text-end">
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => setSelectedCategory(cat)}
                    >
                      Delete
                    </button>
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {selectedCategory && (
          <div className="modal fade show d-block bg-dark bg-opacity-50">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border shadow">
                <div className="modal-body text-center">
                  <h6 className="fw-bold mb-2 text-dark">
                    Delete Category
                  </h6>
                  <p className="text-muted small">
                    Delete <strong>{selectedCategory.name}</strong> permanently?
                  </p>

                  <div className="d-flex gap-2 mt-4">
                    <button
                      className="btn btn-light w-100"
                      onClick={() => setSelectedCategory(null)}
                      disabled={deleting}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-dark w-100"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {deleting ? "Deleting..." : "Delete"}
                    </button>
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
