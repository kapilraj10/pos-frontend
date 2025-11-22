import React, { useState, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import { assets } from "../../assets/assets";

const ItemsForm = () => {
  const { categories, addItem } = useContext(AppContext);

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(assets.upload_area || "/placeholder.png");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    description: ""
  });

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
      // Pass the data as an object, not FormData
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
      setImagePreview(assets.upload_area || "/placeholder.png");

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
    <div
      className="item-form-container container py-4"
      style={{ height: "100vh", overflowY: "auto", overflowX: "hidden" }}
    >
      <div className="row justify-content-center">
        <div className="card col-md-8 shadow-sm border-0">
          <div className="card-body">
            <h4 className="mb-4 text-center text-danger fw-bold">
              Add New Item
            </h4>

            <form onSubmit={handleSubmit}>
              {/* Image Upload */}
              <div className="mb-3 text-center">
                <label htmlFor="image" className="form-label d-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    width={100}
                    height={100}
                    className="rounded border mb-2"
                    style={{ objectFit: "cover", cursor: "pointer" }}
                  />
                </label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  className="form-control"
                  onChange={handleImageChange}
                />
              </div>

              {/* Item Name */}
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Item Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter item name"
                  required
                />
              </div>

              {/* Category */}
              <div className="mb-3">
                <label htmlFor="category" className="form-label">
                  Category
                </label>
                <select
                  name="category"
                  id="category"
                  className="form-select"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">--- Select Category ---</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div className="mb-3">
                <label htmlFor="price" className="form-label">
                  Price
                </label>
                <div className="input-group">
                  <span className="input-group-text">रु</span>
                  <input
                    type="number"
                    name="price"
                    id="price"
                    className="form-control"
                    placeholder="200.00"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="mb-3">
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <textarea
                  rows={4}
                  name="description"
                  id="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Write description here..."
                ></textarea>
              </div>

              {/* Submit Button */}
              <button type="submit" className="btn btn-danger w-100" disabled={loading}>
                {loading ? "Saving..." : "Save Item"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemsForm;
