import React, { useContext, useEffect, useState } from "react";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext.jsx";
import { addCategory } from "../../Service/CategoryService.js";
import { toast } from "react-toastify";

const CategoryForm = () => {
  const { setCategories, categories } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [data, setData] = useState({
    name: "",
    description: "",
    bgColor: "#2c2c2c",
  });

  useEffect(() => {
    if (!imageFile) return setPreviewUrl(null);
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files?.[0] ?? null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.name?.trim()) return toast.error("Name is required");

    setLoading(true);
    try {
      // Prepare JSON metadata
      const categoryJson = {
        name: data.name,
        description: data.description,
        bgColor: data.bgColor,
      };

      const formData = new FormData();
      formData.append("category", new Blob([JSON.stringify(categoryJson)], { type: "application/json" }));
      if (imageFile) formData.append("file", imageFile); // Only one key for backend

      const res = await addCategory(formData);

      if (res.status === 200 || res.status === 201) {
        setCategories([...(categories || []), res.data]);
        toast.success("Category created successfully!");
        setData({ name: "", description: "", bgColor: "#2c2c2c" });
        setImageFile(null);
      } else {
        toast.error("Failed to create category");
      }
    } catch (err) {
      console.error("Request error:", err);

      if (err?.response?.status === 403) {
        toast.error("Access denied. Admin role required.");
      } else if (err?.response?.status === 400) {
        toast.error("Invalid category data. Please check the fields.");
      } else if (err?.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error(err.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="card col-md-6 shadow border-0">
          <div className="card-body">
            <h4 className="mb-4 text-center text-primary fw-bold">Add New Category</h4>

            <form onSubmit={handleSubmit}>
              <div className="mb-3 text-center">
                <label htmlFor="image" style={{ cursor: "pointer" }}>
                  <img
                    src={previewUrl || assets.upload}
                    alt="Category"
                    width={100}
                    height={100}
                    style={{ objectFit: "cover", cursor: "pointer" }}
                    className="rounded border mb-2"
                  />
                </label>
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </div>

              <div className="mb-3">
                <label>Name</label>
                <input name="name" value={data.name} onChange={onChangeHandler} className="form-control" required />
              </div>

              <div className="mb-3">
                <label>Description</label>
                <textarea name="description" value={data.description} onChange={onChangeHandler} className="form-control" />
              </div>

              <div className="mb-4">
                <label>Background Color</label>
                <div className="d-flex gap-3 align-items-center">
                  <input
                    type="color"
                    name="bgColor"
                    value={data.bgColor}
                    onChange={onChangeHandler}
                    style={{ width: 60, height: 40, border: "none" }}
                  />
                  <span style={{ background: data.bgColor, padding: "8px 12px", borderRadius: 8 }}>{data.bgColor}</span>
                </div>
              </div>

              <button className="btn btn-primary w-100" disabled={loading}>
                {loading ? "Saving..." : "Save Category"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryForm;
