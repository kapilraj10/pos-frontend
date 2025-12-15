import React, { useState, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import { assets } from "../../assets/assets";

const ItemsForm = () => {
  const { categories, addItem } = useContext(AppContext);

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(assets.upload || "/placeholder.png");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    description: ""
  });

  // Debug categories loading
  console.log("Categories in ItemsForm:", categories);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Item name is required");
      return;
    }
    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }
    if (!formData.price || formData.price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setLoading(true);
    try {
      const itemData = {
        name: formData.name,
        category: formData.category,
        price: formData.price,
        description: formData.description,
        file: image
      };

      await addItem(itemData);

      // Reset form after successful submission
      setFormData({
        name: "",
        category: "",
        price: "",
        description: ""
      });
      setImage(null);
      setImagePreview(assets.upload || "/placeholder.png");

      toast.success("Item added successfully");
    } catch (err) {
      console.error("Error adding item:", err);
      if (err.response?.status === 403) {
        const userRole = localStorage.getItem("role");
        toast.error(`403 Forbidden! Your role: ${userRole}. Backend may need to allow ROLE_ADMIN.`);
      } else {
        toast.error(err?.response?.data?.message || "Failed to add item");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="items-form-container">
      <h4 className="form-title">Add New Item</h4>
      
      <form onSubmit={handleSubmit} className="items-form">
        {/* Image Upload */}
        <div className="form-section">
          <label className="form-label">Preview</label>
          <div className="image-upload-container">
            <label htmlFor="image" className="image-upload-label">
              <div className="image-preview">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="preview-image"
                />
                <div className="upload-overlay">
                  <i className="bi bi-camera"></i>
                  <span>Click to upload</span>
                </div>
              </div>
            </label>
            <input
              type="file"
              id="image"
              accept="image/*"
              className="image-input"
              onChange={handleImageChange}
            />
            <div className="file-info">
              {image ? image.name : "No file chosen"}
            </div>
          </div>
        </div>

        {/* Item Name */}
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Item Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            className="form-control-custom"
            placeholder="Enter item name"
            required
          />
        </div>

        {/* Category */}
        <div className="form-group">
          <label htmlFor="category" className="form-label">
            Category
            {!categories || categories.length === 0 ? (
              <span className="category-note"> (Loading...)</span>
            ) : (
              <span className="category-note"> ({categories.length} available)</span>
            )}
          </label>
          <select
            name="category"
            id="category"
            className="form-select-custom"
            value={formData.category}
            onChange={handleChange}
            required
            disabled={!categories || categories.length === 0}
          >
            <option value="">--- Select Category ---</option>
            {categories && categories.length > 0 ? (
              categories.map((category, index) => (
                <option key={category.id || index} value={category.id}>
                  {category.name}
                </option>
              ))
            ) : (
              <option value="" disabled>No categories available. Please add categories first.</option>
            )}
          </select>
        </div>

        {/* Price */}
        <div className="form-group">
          <label htmlFor="price" className="form-label">
            Price
          </label>
          <div className="price-input-wrapper">
            <span className="currency-symbol">रु</span>
            <input
              type="number"
              name="price"
              id="price"
              className="form-control-custom price-input"
              placeholder="200.00"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            rows={4}
            name="description"
            id="description"
            value={formData.description}
            onChange={handleChange}
            className="form-control-custom textarea-custom"
            placeholder="Write description here..."
          ></textarea>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          className="submit-btn" 
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Saving...
            </>
          ) : "Save Item"}
        </button>
      </form>

      <style>{`
        .items-form-container {
          background: #0a0a0a;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #1f1f1f;
        }
        
        .form-title {
          color: #ffffff;
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 16px 0;
          padding-bottom: 12px;
          border-bottom: 1px solid #1f1f1f;
        }
        
        .items-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        
        .form-section,
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

        .category-note {
          font-size: 11px;
          color: #6b7280;
          font-weight: 400;
        }
        
        .image-upload-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .image-upload-label {
          cursor: pointer;
        }
        
        .image-preview {
          width: 60px;
          height: 60px;
          border: 1px dashed #333;
          border-radius: 6px;
          position: relative;
          overflow: hidden;
        }
        
        .preview-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .upload-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          opacity: 0;
          transition: opacity 0.2s;
        }
        
        .image-upload-label:hover .upload-overlay {
          opacity: 1;
        }
        
        .upload-overlay i {
          font-size: 16px;
        }
        
        .upload-overlay span {
          display: none;
        }
        
        .image-input {
          display: none;
        }
        
        .file-info {
          color: #6b7280;
          font-size: 11px;
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .form-control-custom {
          background-color: #111111;
          border: 1px solid #222;
          border-radius: 6px;
          color: #ffffff;
          padding: 10px 12px;
          font-size: 13px;
          transition: all 0.2s;
        }
        
        .form-control-custom:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.15);
        }
        
        .form-control-custom::placeholder {
          color: #4b5563;
        }
        
        .form-select-custom {
          background-color: #111111;
          border: 1px solid #222;
          border-radius: 6px;
          color: #ffffff;
          padding: 10px 12px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          appearance: none;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 12px 10px;
          padding-right: 36px;
        }
        
        .form-select-custom:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.15);
        }

        .form-select-custom:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .price-input-wrapper {
          display: flex;
          align-items: center;
        }
        
        .currency-symbol {
          background-color: #1a1a1a;
          border: 1px solid #222;
          border-right: none;
          border-radius: 6px 0 0 6px;
          color: #9ca3af;
          padding: 10px 12px;
          font-size: 13px;
        }
        
        .price-input {
          border-radius: 0 6px 6px 0 !important;
          flex: 1;
        }
        
        .textarea-custom {
          resize: vertical;
          min-height: 70px;
          font-family: inherit;
        }
        
        .submit-btn {
          background-color: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 10px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        
        .submit-btn:hover:not(:disabled) {
          background-color: #5a6fd6;
        }
        
        .submit-btn:disabled {
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

export default ItemsForm;