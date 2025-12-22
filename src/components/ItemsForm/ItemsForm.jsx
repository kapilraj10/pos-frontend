import React, { useState, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import "./ItemsForm.css";
import { assets } from "../../assets/assets";
import './ItemsForm.css'

const ItemsForm = () => {
  const { categories, addItem } = useContext(AppContext);

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(assets.upload || "/placeholder.png");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
    stock: 0
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

    if (formData.stock == null || formData.stock < 0) {
      toast.error("Please enter a valid stock (0 or more)");
      return;
    }

    setLoading(true);
    try {
      const itemData = {
        name: formData.name,
        category: formData.category,
        price: formData.price,
        description: formData.description,
        file: image,
        stock: formData.stock
      };

      await addItem(itemData);

      // Reset form after successful submission
      setFormData({
        name: "",
        category: "",
        price: "",
        description: "",
        stock: 0
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

        {/* Stock */}
        <div className="form-group">
          <label htmlFor="stock" className="form-label">Stock</label>
          <input
            type="number"
            name="stock"
            id="stock"
            className="form-control-custom"
            placeholder="0"
            value={formData.stock}
            onChange={handleChange}
            min="0"
            required
          />
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

      {/* styles moved to ItemsForm.css to avoid inline <style> and jsx attribute issues */}
    </div>
  );
};

export default ItemsForm;