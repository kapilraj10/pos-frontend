import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext.jsx";
import { addCategory } from "../../Service/CategoryService.js";
import { toast } from "react-toastify";

const CategoryForm = () => {
  const { setCategories, categories } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const [data, setData] = useState({
    name: "",
    description: "",
    bgColor: "#4f46e5",
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

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
    } else {
      toast.error("Please drop an image file");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.name?.trim()) return toast.error("Category name is required");

    setLoading(true);
    try {
      const categoryJson = {
        name: data.name,
        description: data.description,
        bgColor: data.bgColor,
      };

      const formData = new FormData();
      formData.append("category", new Blob([JSON.stringify(categoryJson)], { type: "application/json" }));
      if (imageFile) formData.append("file", imageFile);

      const res = await addCategory(formData);

      if (res.status === 200 || res.status === 201) {
        setCategories([...(categories || []), res.data]);
        toast.success("Category created successfully!");
        setData({ name: "", description: "", bgColor: "#4f46e5" });
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
    <div className="category-form-container">
      <div className="form-header">
        <h3 className="form-title">Create New Category</h3>
        <p className="form-subtitle">Add a new product category with details</p>
      </div>

      <form onSubmit={handleSubmit} className="category-form">
        {/* Image Upload */}
        <div className="form-section">
          <label className="section-label">Category Image</label>
          <div 
            className={`image-upload-area ${dragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('image-input').click()}
          >
            <input
              id="image-input"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              hidden
            />
            {previewUrl ? (
              <div className="image-preview-container">
                <img src={previewUrl} alt="Preview" className="preview-image" />
                <div className="image-overlay">
                  <i className="bi bi-arrow-repeat"></i>
                  <span>Change Image</span>
                </div>
              </div>
            ) : (
              <div className="upload-placeholder">
                <i className="bi bi-cloud-arrow-up"></i>
                <p className="upload-text">Click to upload or drag & drop</p>
                <p className="upload-hint">PNG, JPG up to 5MB</p>
              </div>
            )}
          </div>
          {imageFile && (
            <p className="file-name">{imageFile.name}</p>
          )}
        </div>

        {/* Name Field */}
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Category Name
            <span className="required">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={data.name}
            onChange={onChangeHandler}
            className="form-input"
            placeholder="Enter category name"
            required
          />
        </div>

        {/* Description Field */}
        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={data.description}
            onChange={onChangeHandler}
            className="form-textarea"
            placeholder="Enter category description (optional)"
            rows="3"
          />
        </div>

        {/* Color Picker */}
        <div className="form-group">
          <label className="form-label">
            Category Color
          </label>
          <div className="color-picker-container">
            <input
              type="color"
              id="bgColor"
              name="bgColor"
              value={data.bgColor}
              onChange={onChangeHandler}
              className="color-input"
            />
            <div className="color-preview" style={{ backgroundColor: data.bgColor }}>
              <span className="color-value">{data.bgColor}</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          className="submit-button"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Creating...
            </>
          ) : (
            <>
              <i className="bi bi-plus-circle"></i>
              Create Category
            </>
          )}
        </button>
      </form>

      <style>{`
        .category-form-container {
          background: #0a0a0a;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #1f1f1f;
        }
        
        .form-header {
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #1f1f1f;
        }
        
        .form-title {
          color: #ffffff;
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 2px 0;
        }
        
        .form-subtitle {
          color: #6b7280;
          font-size: 12px;
          margin: 0;
        }
        
        .category-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        
        .form-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .section-label {
          color: #9ca3af;
          font-size: 12px;
          font-weight: 500;
        }
        
        .image-upload-area {
          border: 1px dashed #333;
          border-radius: 6px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s;
          background-color: #111111;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .image-upload-area:hover {
          border-color: #667eea;
        }
        
        .image-upload-area.drag-over {
          border-color: #667eea;
          background-color: #151515;
        }
        
        .image-preview-container {
          position: relative;
          width: 50px;
          height: 50px;
          border-radius: 6px;
          overflow: hidden;
          flex-shrink: 0;
        }
        
        .preview-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          opacity: 0;
          transition: opacity 0.2s;
        }
        
        .image-preview-container:hover .image-overlay {
          opacity: 1;
        }
        
        .image-overlay i {
          font-size: 16px;
        }
        
        .image-overlay span {
          display: none;
        }
        
        .upload-placeholder {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #6b7280;
          flex: 1;
        }
        
        .upload-placeholder i {
          font-size: 20px;
          color: #667eea;
        }
        
        .upload-text {
          margin: 0;
          font-size: 12px;
          font-weight: 500;
          color: #9ca3af;
        }
        
        .upload-hint {
          margin: 0;
          font-size: 11px;
          color: #4b5563;
        }
        
        .file-name {
          font-size: 11px;
          color: #6b7280;
          margin: 4px 0 0 0;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .form-label {
          color: #9ca3af;
          font-size: 12px;
          font-weight: 500;
        }
        
        .required {
          color: #ef4444;
          margin-left: 2px;
        }
        
        .form-input, .form-textarea {
          background-color: #111111;
          border: 1px solid #222;
          border-radius: 6px;
          color: #ffffff;
          padding: 10px 12px;
          font-size: 13px;
          transition: all 0.2s;
        }
        
        .form-input:focus, .form-textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.15);
        }
        
        .form-input::placeholder, .form-textarea::placeholder {
          color: #4b5563;
        }
        
        .form-textarea {
          resize: vertical;
          min-height: 60px;
          font-family: inherit;
        }
        
        .color-picker-container {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        
        .color-input {
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          padding: 0;
          background: transparent;
        }
        
        .color-input::-webkit-color-swatch-wrapper {
          padding: 0;
        }
        
        .color-input::-webkit-color-swatch {
          border: 1px solid #333;
          border-radius: 6px;
        }
        
        .color-preview {
          flex: 1;
          padding: 10px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 500;
          color: white;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          height: 40px;
        }
        
        .submit-button {
          background: #667eea;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          padding: 10px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 4px;
        }
        
        .submit-button:hover:not(:disabled) {
          background: #5a6fd6;
        }
        
        .submit-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CategoryForm;