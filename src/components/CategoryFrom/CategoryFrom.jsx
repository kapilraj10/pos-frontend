import React, { useContext, useState, useRef } from "react";
import { AppContext } from "../../context/AppContext.jsx";
import { addCategory } from "../../Service/CategoryService.js";
import { toast } from "react-toastify";
import "./CategoryFrom.css";

const CategoryForm = () => {
  const { categories, setCategories } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

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
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = null;
      }
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-5 category-form">
      <div className="card border-0 shadow-sm w-100">
        <div className="card-body p-3 p-sm-4">
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
                ref={fileInputRef}
                type="file"
                className="form-control"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setImageFile(file || null);
                  if (file) setPreviewUrl(URL.createObjectURL(file));
                }}
              />

              {previewUrl && (
                <div className="mt-3 category-image-preview">
                  <img src={previewUrl} alt="preview" />
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="d-flex gap-2 form-actions">
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
                  setPreviewUrl(null);
                  if (fileInputRef.current) fileInputRef.current.value = null;
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
