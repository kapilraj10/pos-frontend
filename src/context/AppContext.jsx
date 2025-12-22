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
  updateItem as updateItemApi,
  purchaseItem as purchaseItemApi,
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

  // Business rule: when quantity reaches this limit, auto-purchase occurs
  const PURCHASE_LIMIT = 10;

  const addToCart = (item) => {
    // Find current stock from master items list if available
    const storeItem = items.find(i => String(i.id) === String(item.id));
    const available = storeItem?.stock ?? item.stock ?? Infinity;

    // Only block adding when no stock available. Low-stock (<=5) items are allowed
    // but subject to a per-item cap of 1 unit (enforced below and on backend).
    if (available <= 0) {
      toast.error(`${item.name} cannot be added - out of stock`);
      return;
    }

    const existingItem = cartItems.find(ci => String(ci.id) === String(item.id));
    if (existingItem) {
      const newQty = existingItem.quantity + 1;
      if (newQty > available) {
        toast.error(`Only ${available} left in stock for ${existingItem.name}`);
        return;
      }

      // If the store item is low stock (<=5), only allow one unit in the cart
      if (available <= 5) {
        toast.info(`${existingItem.name} is low in stock — only 1 unit allowed`);
        return;
      }

      // If we hit or exceed the purchase limit, process chunked auto-purchase
      if (newQty >= PURCHASE_LIMIT) {
        const times = Math.floor(newQty / PURCHASE_LIMIT);
        let totalToPurchase = times * PURCHASE_LIMIT;
        // Cap totalToPurchase by available stock rounded down to nearest PURCHASE_LIMIT
        const maxChunks = Math.floor(available / PURCHASE_LIMIT);
        if (maxChunks <= 0) {
          toast.error(`Not enough stock to auto-purchase for ${existingItem.name}`);
          return;
        }
        if (times > maxChunks) {
          totalToPurchase = maxChunks * PURCHASE_LIMIT;
        }

        (async () => {
          try {
            await purchaseItemApi(item.id, totalToPurchase);
            const res = await fetchItems();
            setItems((res.data || []).map(normalizeItem));
            // Calculate remaining quantity after chunk purchase
            const remaining = newQty - totalToPurchase;
            if (remaining > 0) {
              setCartItems(cartItems.map(cartItem => cartItem.id === item.id ? { ...cartItem, quantity: remaining } : cartItem));
            } else {
              setCartItems(cartItems.filter(ci => ci.id !== item.id));
            }
            toast.success(`Auto-purchased ${totalToPurchase} x ${existingItem.name}`);
          } catch (err) {
            console.error('Auto-purchase failed:', err);
            toast.error(err?.response?.data?.message || 'Auto-purchase failed');
          }
        })();
      } else {
        // Normal single-unit reservation
        (async () => {
          try {
            await purchaseItemApi(item.id, 1);
            const res = await fetchItems();
            setItems((res.data || []).map(normalizeItem));
            setCartItems(cartItems.map(cartItem =>
              cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
            ));
          } catch (err) {
            console.error('Failed to decrement stock on add:', err);
            toast.error(err?.response?.data?.message || 'Failed to reserve item');
          }
        })();
      }
    } else {
      // New cart entry: attempt to reserve one unit on backend first
      (async () => {
        try {
          await purchaseItemApi(item.id, 1);
          const res = await fetchItems();
          setItems((res.data || []).map(normalizeItem));
          setCartItems([...cartItems, { ...item, quantity: 1 }]);
        } catch (err) {
          console.error('Failed to decrement stock on add:', err);
          toast.error(err?.response?.data?.message || 'Failed to reserve item');
        }
      })();
    }
  }

  const removeFromCart = (itemId) => {
    setCartItems(cartItems.filter(cartItem => cartItem.id !== itemId));
  }

  const updateQuantity = (itemId, newQuantity) => {
    const item = cartItems.find(ci => ci.id === itemId);
    if (!item) return;

    // Clamp to available stock (check master items list for latest stock)
    const storeItem = items.find(i => String(i.id) === String(itemId));
    const available = storeItem?.stock ?? item.stock ?? Infinity;

    if (newQuantity > available) {
      toast.error(`Cannot add more than ${available} units for ${item.name}`);
      setCartItems(cartItems.map(cartItem => cartItem.id === itemId ? { ...cartItem, quantity: available } : cartItem));
      return;
    }

    // If item is low-stock (<=5) only a single unit is allowed in the cart
    if (available <= 5 && newQuantity > 1) {
      toast.info(`${item.name} is low in stock — only 1 unit allowed`);
      setCartItems(cartItems.map(cartItem => cartItem.id === itemId ? { ...cartItem, quantity: 1 } : cartItem));
      return;
    }

    // If increasing quantity, handle either delta reservation or chunked auto-purchase
    if (newQuantity > item.quantity) {
      // If newQuantity meets purchase limit(s), perform chunked auto-purchase
      if (newQuantity >= PURCHASE_LIMIT) {
        const times = Math.floor(newQuantity / PURCHASE_LIMIT);
        let totalToPurchase = times * PURCHASE_LIMIT;
        const maxChunks = Math.floor(available / PURCHASE_LIMIT);
        if (maxChunks <= 0) {
          toast.error(`Not enough stock to auto-purchase for ${item.name}`);
          return;
        }
        if (times > maxChunks) {
          totalToPurchase = maxChunks * PURCHASE_LIMIT;
        }

        (async () => {
          try {
            await purchaseItemApi(itemId, totalToPurchase);
            const res = await fetchItems();
            setItems((res.data || []).map(normalizeItem));
            toast.success(`Auto-purchased ${totalToPurchase} x ${item.name}`);
            const remaining = newQuantity - totalToPurchase;
            if (remaining > 0) {
              setCartItems(cartItems.map(cartItem => cartItem.id === itemId ? { ...cartItem, quantity: remaining } : cartItem));
            } else {
              setCartItems(cartItems.filter(ci => ci.id !== itemId));
            }
          } catch (err) {
            console.error('Auto-purchase failed:', err);
            toast.error(err?.response?.data?.message || 'Auto-purchase failed');
          }
        })();
      } else {
        // Simple delta reservation
        const delta = newQuantity - item.quantity;
        (async () => {
          try {
            // If the item is low-stock, only request one unit (backend will validate)
            const qtyToRequest = available <= 5 ? 1 : delta;
            await purchaseItemApi(itemId, qtyToRequest);
            const res = await fetchItems();
            setItems((res.data || []).map(normalizeItem));
            setCartItems(cartItems.map(cartItem => cartItem.id === itemId ? { ...cartItem, quantity: newQuantity } : cartItem));
          } catch (err) {
            console.error('Failed to decrement stock on quantity increase:', err);
            toast.error(err?.response?.data?.message || 'Failed to reserve additional quantity');
          }
        })();
      }
      return;
    }

    // If decreasing or unchanged, just update quantity locally
    setCartItems(cartItems.map(cartItem => cartItem.id === itemId ? { ...cartItem, quantity: newQuantity } : cartItem));
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
      stock: raw?.stock ?? 0,
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
    refreshItems: async () => {
      try {
        const res = await fetchItems();
        setItems((res.data || []).map(normalizeItem));
      } catch (err) {
        console.error('Failed to refresh items', err);
      }
    },
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
    addItem: async ({ name, price, description, category, file, stock }) => {
      if (!name?.trim() || !category || !price) {
        toast.error("Name, category, and price are required");
        throw new Error("Invalid item data");
      }

      try {
        const formData = new FormData();
        const itemMetadata = { name, price: parseFloat(price), description, categoryId: category, stock: stock == null ? 0 : parseInt(stock, 10) };
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
    // Update item
    updateItem: async ({ id, name, price, description, category, file, stock }) => {
      if (!id || !name?.trim() || !category || !price) {
        toast.error("Name, category, and price are required");
        throw new Error("Invalid item data");
      }
      // Ensure admin token present before attempting update
      const currentToken = localStorage.getItem("token");
      const currentRole = localStorage.getItem("role");
      const isAdmin = currentRole && (currentRole === "ROLE_ADMIN" || currentRole === "ADMIN" || String(currentRole).toUpperCase().includes("ADMIN"));
      if (!currentToken || !isAdmin) {
        toast.error("Admin authentication required to update items. Please login as an admin.");
        throw new Error("Unauthorized - admin token missing");
      }

      try {
        console.log("Updating item, token:", currentToken, "role:", currentRole);
        const formData = new FormData();
        const itemMetadata = { name, price: parseFloat(price), description, categoryId: category, stock: stock == null ? undefined : parseInt(stock, 10) };
        formData.append("item", new Blob([JSON.stringify(itemMetadata)], { type: "application/json" }));
        if (file) formData.append("file", file);

        // Log headers prepared by service for debug (updateItemApi will include Authorization header)
        console.log("Calling updateItemApi for id", id, "with metadata", itemMetadata);
        const res = await updateItemApi(id, formData);
        const updatedItem = normalizeItem(res.data);
        setItems((prev) => prev.map((it) => (String(it.id) === String(id) ? updatedItem : it)));

        toast.success("Item updated successfully");
      } catch (err) {
        console.error("Update item error:", err);
        if (err.response?.status === 403) {
          toast.error(
            `403 Forbidden! Your role: ${localStorage.getItem(
              "role"
            )}. Backend must allow ROLE_ADMIN.`
          );
        } else {
          toast.error(err?.response?.data?.message || "Failed to update item");
        }
        throw err;
      }
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
