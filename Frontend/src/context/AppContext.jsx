import React, { createContext, useContext, useState, useEffect } from "react";
import {
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_BILLS,
  genInvoiceNumber,
} from "../data/mockData";
import {
  getUsers as apiGetUsers,
  createUser as apiCreateUser,
  updateUser as apiUpdateUser,
  toggleUserStatus as apiToggleUserStatus,
  deleteUser as apiDeleteUser,
} from "../services/userService";
import { getProducts as apiGetProducts } from "../services/productService";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // 1. Current user session (Default null to show Login Page first)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("egotech_current_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // 2. Active Branch
  const [activeBranch, setActiveBranch] = useState(() => {
    return currentUser?.branch || "Colombo – Head Office";
  });

  // 3. Users list
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem("egotech_users");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].password === undefined) {
          localStorage.removeItem("egotech_users");
          return INITIAL_USERS;
        }
        return parsed;
      }
      return INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const fetchUsers = async () => {
    try {
      const data = await apiGetUsers();
      if (Array.isArray(data) && data.length > 0) {
        setUsers(data);
      }
    } catch (err) {
      console.warn("Could not fetch users from MongoDB API, falling back to local:", err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 4. Products list
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem("egotech_products");
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const fetchProducts = async () => {
    try {
      const data = await apiGetProducts();
      if (Array.isArray(data) && data.length > 0) {
        setProducts(data);
      }
    } catch (err) {
      console.warn("Could not fetch products from MongoDB API:", err.message);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 5. Categories list
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem("egotech_categories");
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  // 6. Bills history
  const [bills, setBills] = useState(() => {
    try {
      const saved = localStorage.getItem("egotech_bills");
      return saved ? JSON.parse(saved) : INITIAL_BILLS;
    } catch {
      return INITIAL_BILLS;
    }
  });

  // 7. Active POS Cart
  const [cart, setCart] = useState([]);
  const [cartCustomer, setCartCustomer] = useState("Walk-in Customer");
  const [cartDiscount, setCartDiscount] = useState(0); // in Rupees

  // Sync to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem("egotech_current_user", JSON.stringify(currentUser));
      } else {
        localStorage.removeItem("egotech_current_user");
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem("egotech_users", JSON.stringify(users));
    } catch (e) {
      console.error(e);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem("egotech_products", JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem("egotech_bills", JSON.stringify(bills));
    } catch (e) {
      console.error(e);
    }
  }, [bills]);

  // Auth actions
  const login = (identifier, password) => {
    const trimmed = identifier.trim().toLowerCase();

    // Match by Employee ID, email, or the "admin" convenience shortcut
    const user = users.find(
      (u) =>
        u.id.toLowerCase() === trimmed ||
        u.email.toLowerCase() === trimmed ||
        (trimmed === "admin" && u.role === "Admin")
    );

    // Unknown identifier
    if (!user) {
      return { success: false, message: "Invalid Employee ID or password" };
    }

    // Password check — fall back to "admin123" for users without an explicit password stored
    const effectivePassword = user.password ?? "admin123";
    if (password !== effectivePassword) {
      return { success: false, message: "Invalid Employee ID or password" };
    }

    if (user.status !== "Active") {
      return { success: false, message: "This account has been deactivated. Contact an administrator." };
    }

    // Strip password before writing to session / localStorage
    const { password: _pw, ...safeUser } = user;
    const updatedUser = {
      ...safeUser,
      lastLogin: "Just now",
    };
    setCurrentUser(updatedUser);
    setActiveBranch(updatedUser.branch);
    // Persist session immediately (useEffect also syncs, but belt-and-suspenders)
    localStorage.setItem("egotech_current_user", JSON.stringify(updatedUser));
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, lastLogin: "Just now" } : u)));
    return { success: true, user: updatedUser };
  };

  const logout = () => {
    localStorage.removeItem("egotech_current_user");
    setCurrentUser(null);
  };

  const switchUser = (userId) => {
    const u = users.find((item) => item.id === userId);
    if (u) {
      setCurrentUser(u);
      setActiveBranch(u.branch);
    }
  };

  // User management actions
  const addUser = async (userData) => {
    try {
      const savedUser = await apiCreateUser(userData);
      await fetchUsers();
      return savedUser;
    } catch (err) {
      console.error("Error creating user in API:", err);
      throw err;
    }
  };

  const updateUser = async (userData) => {
    try {
      const targetId = userData.id || userData.empId;
      const updated = await apiUpdateUser(targetId, userData);
      await fetchUsers();
      if (currentUser?.id === targetId || currentUser?.empId === targetId) {
        setCurrentUser((prev) => ({ ...prev, ...updated }));
      }
      return updated;
    } catch (err) {
      console.error("Error updating user in API:", err);
      throw err;
    }
  };

  const deleteUser = async (userId) => {
    try {
      await apiDeleteUser(userId);
      await fetchUsers();
    } catch (err) {
      console.error("Error deleting user in API:", err);
      throw err;
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      await apiToggleUserStatus(userId);
      await fetchUsers();
    } catch (err) {
      console.error("Error toggling user status in API:", err);
      throw err;
    }
  };

  // Product management actions
  const addProduct = (prodData) => {
    const nextId = `PRD-${100 + products.length + 1}`;
    setProducts((prev) => [{ ...prodData, id: nextId }, ...prev]);
  };

  const updateProduct = (prodData) => {
    setProducts((prev) => prev.map((p) => (p.id === prodData.id ? { ...p, ...prodData } : p)));
  };

  const deleteProduct = (prodId) => {
    setProducts((prev) => prev.filter((p) => p.id !== prodId));
  };

  const adjustStock = (prodId, quantity, _reason = "Adjustment") => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === prodId) {
          const newStock = Math.max(0, p.stock + quantity);
          return { ...p, stock: newStock };
        }
        return p;
      })
    );
  };

  // Category actions
  const addCategory = (catData) => {
    const nextId = `CAT-0${categories.length + 1}`;
    setCategories((prev) => [...prev, { ...catData, id: nextId, itemCount: 0 }]);
  };

  // Cart actions
  const addToCart = (product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, qty: item.qty + qty }
            : item
        );
      }
      return [...prev, { product, qty, discount: 0 }];
    });
  };

  const updateCartQty = (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, qty } : item))
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setCartCustomer("Walk-in Customer");
    setCartDiscount(0);
  };

  // Process POS Sale
  const processSale = ({ paymentMethod, amountTendered, changeGiven }) => {
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
    const tax = Number((subtotal * 0.025).toFixed(2)); // 2.5% Supermarket VAT
    const discount = Number(cartDiscount) || 0;
    const total = Math.max(0, Number((subtotal - discount + tax).toFixed(2)));

    const now = new Date();
    const dateFormatted = now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) + ", " + now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const newBill = {
      id: genInvoiceNumber(bills),
      date: dateFormatted,
      branch: activeBranch,
      cashierId: currentUser?.id || "EMP-001",
      cashierName: currentUser?.name || "Administrator",
      customerName: cartCustomer || "Walk-in Customer",
      items: cart.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        qty: item.qty,
        total: item.product.price * item.qty,
      })),
      subtotal,
      discount,
      tax,
      total,
      amountTendered: Number(amountTendered) || total,
      changeGiven: Number(changeGiven) || 0,
      paymentMethod,
      status: "Completed",
    };

    // Deduct stock for sold items
    setProducts((prev) =>
      prev.map((prod) => {
        const cartItem = cart.find((item) => item.product.id === prod.id);
        if (cartItem) {
          return { ...prod, stock: Math.max(0, prod.stock - cartItem.qty) };
        }
        return prod;
      })
    );

    // Add to bills history
    setBills((prev) => [newBill, ...prev]);

    // Clear cart
    clearCart();

    return newBill;
  };

  // Refund / Void transaction
  const refundBill = (billId) => {
    const bill = bills.find((b) => b.id === billId);
    if (!bill || bill.status === "Refunded") return;

    // Replenish stock
    setProducts((prev) =>
      prev.map((prod) => {
        const item = bill.items.find((i) => i.id === prod.id);
        if (item) {
          return { ...prod, stock: prod.stock + item.qty };
        }
        return prod;
      })
    );

    // Update status
    setBills((prev) =>
      prev.map((b) => (b.id === billId ? { ...b, status: "Refunded" } : b))
    );
  };

  // Reset demo data
  const resetToDefaultData = () => {
    localStorage.removeItem("egotech_users");
    localStorage.removeItem("egotech_products");
    localStorage.removeItem("egotech_categories");
    localStorage.removeItem("egotech_bills");
    localStorage.removeItem("egotech_current_user");
    setUsers(INITIAL_USERS);
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    setBills(INITIAL_BILLS);
    setCurrentUser(null);
    setActiveBranch("Colombo – Head Office");
    setCart([]);
  };

  // Computed metrics
  const lowStockProducts = products.filter((p) => {
    const minThresh = Number(p.minThreshold ?? p.minStock ?? p.lowStockThreshold) || 5;
    return Number(p.stock ?? 0) <= minThresh;
  });
  const lowStockCount = lowStockProducts.length;

  const value = {
    currentUser,
    activeBranch,
    setActiveBranch,
    login,
    logout,
    switchUser,
    users,
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    products,
    fetchProducts,
    setProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    lowStockProducts,
    lowStockCount,
    categories,
    addCategory,
    bills,
    processSale,
    refundBill,
    cart,
    cartCustomer,
    setCartCustomer,
    cartDiscount,
    setCartDiscount,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    resetToDefaultData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}