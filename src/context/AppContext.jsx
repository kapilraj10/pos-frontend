/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  fetchCategories,
  deleteCategory as deleteCategoryApi,
  addCategory as addCategoryApi,
} from "../Service/CategoryService";
import {
  fetchItems,
  deleteItem as deleteItemApi,
  addItem as addItemApi,
} from "../Service/ItemService";

export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (item) => {
    const existingItem = cartItems.find(cartItems => cartItems.name === item.name);
    if (existingItem){
      setCartItems(cartItems.map(cartItem => 
        cartItem.name === item.name 
        ? {...existingItem, quantity: existingItem.quantity + 1} 
        : cartItem
      ));
    } else {
      setCartItems([...cartItems, {...item, quantity: 1}]);
    }
  }

const removeFromCart = (itemId) => {
  setCartItems(cartItems.filter(cartItem => cartItem.id !== itemId));
}

const updateQuantity = (itemId, newQuantity) => {
  setCartItems(cartItems.map(cartItem => 
    cartItem.id === itemId 
    ? {...cartItem, quantity: newQuantity} 
    : cartItem
  ));
};


  // Normalize category for frontend
  const normalizeCategory = (raw) => ({
    id: raw?.id ?? raw?.categoryId ?? raw?._id ?? null,
    name: raw?.name ?? raw?.title ?? "Untitled",
    imgUrl: raw?.imgUrl ?? raw?.imageUrl ?? raw?.image ?? null,
    bgColor: raw?.bgColor ?? raw?.backgroundColor ?? "#0d6efd",
    itemCount:
      raw?.itemCount ??
      (Array.isArray(raw?.items) ? raw.items.length : raw?.count ?? 0),
    raw,
  });

  // Normalize item for frontend
  const normalizeItem = (raw) => {
    let imgUrl = raw?.imgUrl ?? raw?.imageUrl ?? raw?.image ?? null;
    if (imgUrl && !imgUrl.startsWith("http://") && !imgUrl.startsWith("https://")) {
      // Respect backend context path for static uploads
      imgUrl = `http://localhost:8080/api/v1/pos/uploads/${imgUrl}`;
    }
    return {
      id: raw?.id ?? raw?.itemId ?? raw?._id ?? null,
      name: raw?.name ?? raw?.title ?? "Untitled",
      imgUrl,
      price: raw?.price ?? 0,
      description: raw?.description ?? "",
      categoryId: raw?.categoryId ?? raw?.category?.id ?? raw?.category ?? null,
      raw,
    };
  };

  // Load categories
  useEffect(() => {
    let mounted = true;
    const loadCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchCategories();
        if (!mounted) return;
        setCategories((res.data || []).map(normalizeCategory));
      } catch (err) {
        if (!mounted) return;
        setError(err);
        toast.error("Failed to load categories");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadCategories();
    return () => {
      mounted = false;
    };
  }, []);

  const clearCart = () => {
    setCartItems([]);
  }

  // Load items
  useEffect(() => {
    let mounted = true;
    const loadItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchItems();
        if (!mounted) return;
        setItems((res.data || []).map(normalizeItem));
      } catch (err) {
        if (!mounted) return;
        setError(err);
        toast.error("Failed to load items");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadItems();
    return () => {
      mounted = false;
    };
  }, []);

  // Context value
  const value = {
    categories,
    setCategories,
    items,
    setItems,
    loading,
    error,
    token,
    role,
    addToCart,
    clearCart,
    cartItems,
    updateQuantity,
    removeFromCart,
    setAuthData: (newToken, newRole) => {
      setToken(newToken);
      setRole(newRole);
    },

    // Delete category
    deleteCategoryById: async (id) => {
      try {
        await deleteCategoryApi(id);
        setCategories((prev) => prev.filter((c) => String(c.id) !== String(id)));
        toast.success("Category deleted");
      } catch (err) {
        console.error("Delete category error:", err);
        if (err.response?.status === 403) {
          toast.error(
            `403 Forbidden! Your role: ${localStorage.getItem(
              "role"
            )}. Backend permissions needed.`
          );
        } else {
          toast.error(err?.response?.data?.message || "Failed to delete category");
        }
        throw err;
      }
    },

    // Add category
    addCategory: async ({ name, description, bgColor, file }) => {
      if (!name?.trim()) {
        toast.error("Category name is required");
        throw new Error("Category name required");
      }
      try {
        const res = await addCategoryApi({ name, description, bgColor, file });
        setCategories((prev) => [...prev, normalizeCategory(res.data)]);
        toast.success("Category added successfully");
      } catch (err) {
        console.error("Add category error:", err);
        if (err.response?.status === 403) {
          toast.error(
            `403 Forbidden! Your role: ${localStorage.getItem(
              "role"
            )}. Backend permissions needed.`
          );
        } else {
          toast.error(err?.response?.data?.message || "Failed to add category");
        }
        throw err;
      }
    },

    // Delete item
    deleteItemById: async (id) => {
      try {
        await deleteItemApi(id);
        setItems((prev) =>
          prev.filter((item) => String(item.id || item.itemId || item._id) !== String(id))
        );
        // Success toast is now handled in ItemsList component
      } catch (err) {
        console.error("Delete item error:", err);
        if (err.response?.status === 403) {
          toast.error(
            `403 Forbidden! Your role: ${localStorage.getItem(
              "role"
            )}. Backend Spring Security must accept ROLE_ADMIN.`
          );
        } else {
          toast.error(err?.response?.data?.message || "Failed to delete item");
        }
        throw err;
      }
    },

    // Add item
    addItem: async ({ name, price, description, category, file }) => {
      if (!name?.trim() || !category || !price) {
        toast.error("Name, category, and price are required");
        throw new Error("Invalid item data");
      }

      try {
        const formData = new FormData();
        const itemMetadata = { name, price: parseFloat(price), description, categoryId: category };
        formData.append("item", new Blob([JSON.stringify(itemMetadata)], { type: "application/json" }));
        if (file) formData.append("file", file);

        const res = await addItemApi(formData);
        const newItem = normalizeItem(res.data);
        setItems((prev) => [...prev, newItem]);
        
        // Update the item count for the category
        setCategories((prev) => prev.map((cat) => {
          if (String(cat.id) === String(category)) {
            return { ...cat, itemCount: cat.itemCount + 1 };
          }
          return cat;
        }));
        
        toast.success("Item added successfully");
      } catch (err) {
        console.error("Add item error:", err);
        console.error("Error response:", err.response?.data);
        console.error("Error status:", err.response?.status);
        console.error("Current token:", localStorage.getItem("token"));
        console.error("Current role:", localStorage.getItem("role"));
        
        if (err.response?.status === 403) {
          toast.error(
            `403 Forbidden! Your role: ${localStorage.getItem(
              "role"
            )}. Backend must allow ROLE_ADMIN.`
          );
        } else {
          toast.error(err?.response?.data?.message || "Failed to add item");
        }
        throw err;
      }
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
