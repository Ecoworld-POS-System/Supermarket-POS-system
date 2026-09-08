import React, { createContext, useContext, useState, useEffect } from "react";
import {
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_BILLS,
  INITIAL_SUPPLIERS,
  genInvoiceNumber,
} from "../data/mockData";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // 1. Current user session
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("egotech_current_user");
      return saved ? JSON.parse(saved) : INITIAL_USERS[0]; // Default logged in as Administrator for seamless review
    } catch {
      return INITIAL_USERS[0];
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
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  // 4. Products list
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem("egotech_products");
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

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
      localStorage.setItem("egotech_current_user", JSON.stringify(currentUser));
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
    const user = users.find(
      (u) =>
        u.id.toLowerCase() === trimmed ||
        u.email.toLowerCase() === trimmed ||
        (trimmed === "admin" && u.role === "Admin")
    );

    if (!user) {
      // Allow demo login with any ID if password is correct
      if (password === "admin123" || password.length >= 4) {
        const dummyUser = {
          id: identifier.toUpperCase().startsWith("EMP") ? identifier.toUpperCase() : "EMP-001",
          name: identifier === "admin" ? "Administrator" : identifier,
          email: `${trimmed}@egotechworld.com`,
          phone: "+94 77 000 0000",
          role: identifier === "admin" ? "Admin" : "Cashier",
          branch: activeBranch,
          status: "Active",
          lastLogin: "Just now",
        };
        setCurrentUser(dummyUser);
        return { success: true, user: dummyUser };
      }
      return { success: false, message: "Invalid Employee ID or password" };
    }

    if (user.status !== "Active") {
      return { success: false, message: "This account has been deactivated. Contact an administrator." };
    }

    const updatedUser = {
      ...user,
      lastLogin: "Just now",
    };
    setCurrentUser(updatedUser);
    setActiveBranch(updatedUser.branch);
    setUsers((prev) => prev.map((u) => (u.id === user.id ? updatedUser : u)));
    return { success: true, user: updatedUser };
  };

  const logout = () => {
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
  const addUser = (userData) => {
    setUsers((prev) => [
      {
        ...userData,
        lastLogin: "Never logged in",
      },
      ...prev,
    ]);
  };

  const updateUser = (userData) => {
    setUsers((prev) => prev.map((u) => (u.id === userData.id ? { ...u, ...userData } : u)));
    if (currentUser?.id === userData.id) {
      setCurrentUser((prev) => ({ ...prev, ...userData }));
    }
  };

  const deleteUser = (userId) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const toggleUserStatus = (userId) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus = u.status === "Active" ? "Inactive" : "Active";
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
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

  const adjustStock = (prodId, quantity, reason = "Adjustment") => {
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
    setCurrentUser(INITIAL_USERS[0]);
    setActiveBranch(INITIAL_USERS[0].branch);
    setCart([]);
  };

  // Computed metrics
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);
  const lowStockCount = lowStockProducts.length;

  const value = {
    currentUser,
    activeBranch,
    setActiveBranch,
    login,
    logout,
    switchUser,
    users,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    products,
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
