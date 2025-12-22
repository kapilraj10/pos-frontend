import React, { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext.jsx";
import { addCategory } from "../../Service/CategoryService.js";
import { toast } from "react-toastify";

const CategoryForm = () => {
  const { categories, setCategories } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const [data, setData] = useState({
    name: "",
    description: "",
    bgColor: "#000000",
  });

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!data.name.trim()) {
      return toast.error("Category name is required");
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append(
        "category",
        new Blob([JSON.stringify(data)], { type: "application/json" })
      );
      if (imageFile) formData.append("file", imageFile);

      const res = await addCategory(formData);

      if (res.status === 201 || res.status === 200) {
        setCategories([...(categories || []), res.data]);
        toast.success("Category added");
        setData({ name: "", description: "", bgColor: "#000000" });
        setImageFile(null);
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h5 className="mb-4">Create Category</h5>

          <form onSubmit={handleSubmit}>
            {/* Category Name */}
            <div className="mb-3">
              <label className="form-label">Category Name</label>
              <input
                type="text"
                name="name"
                value={data.name}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter category name"
              />
            </div>

            {/* Description */}
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                value={data.description}
                onChange={handleChange}
                className="form-control"
                rows="3"
                placeholder="Optional description"
              />
            </div>

            {/* Color */}
            <div className="mb-3">
              <label className="form-label">Category Color</label>
              <input
                type="color"
                name="bgColor"
                value={data.bgColor}
                onChange={handleChange}
                className="form-control form-control-color"
              />
            </div>

            {/* Image */}
            <div className="mb-4">
              <label className="form-label">Category Image</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
              />
            </div>

            {/* Buttons */}
            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-dark"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Category"}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setData({ name: "", description: "", bgColor: "#000000" });
                  setImageFile(null);
                }}
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CategoryForm;
