import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { User, Product, Category, Bill } from "./models.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const MONGODB_URI = "mongodb://posAdmin:PosAdmin2026@ac-chkag1m-shard-00-00.kozfnhi.mongodb.net:27017,ac-chkag1m-shard-00-01.kozfnhi.mongodb.net:27017,ac-chkag1m-shard-00-02.kozfnhi.mongodb.net:27017/supermarket_pos?ssl=true&replicaSet=atlas-14hzku-shard-0&authSource=admin&appName=Cluster0";

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Initial seed data
const DEFAULT_DATA = {
  users: [
    { id: "EMP-001", name: "Administrator", email: "admin@egotechworld.com", phone: "+94 77 123 4567", role: "Admin", branch: "Colombo – Head Office", status: "Active", lastLogin: "13 Aug 2026, 08:14 AM" },
    { id: "EMP-002", name: "Sachini Madushani", email: "sachini@egotechworld.com", phone: "+94 71 234 5678", role: "Cashier", branch: "Colombo – Head Office", status: "Active", lastLogin: "13 Aug 2026, 09:03 AM" },
  ],
  products: [
    { id: "PROD-001", name: "Highland Fresh Full Cream Milk 1L", barcode: "4792012001015", sku: "SKU-MLK-01", category: "Dairy & Chilled", costPrice: 380, price: 460, stock: 48, minStock: 20, unit: "pcs", image: "🥛" },
    { id: "PROD-002", name: "Keells Roast Bread Loaf 450g", barcode: "4792012001022", sku: "SKU-BRD-01", category: "Bakery & Deli", costPrice: 160, price: 210, stock: 15, minStock: 10, unit: "pcs", image: "🍞" },
  ],
  categories: [
    { id: "CAT-01", name: "Groceries & Staples", code: "GROC", color: "from-amber-500 to-orange-600", count: 2 },
    { id: "CAT-02", name: "Dairy & Chilled", code: "DAIR", color: "from-blue-500 to-cyan-600", count: 3 },
  ]
};

async function seedData() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.insertMany(DEFAULT_DATA.users);
      await Product.insertMany(DEFAULT_DATA.products);
      await Category.insertMany(DEFAULT_DATA.categories);
      console.log('Database seeded with initial data');
    }
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

mongoose.connection.once('open', seedData);

// ---------------------------------------------------------------------------
// REST API Endpoints
// ---------------------------------------------------------------------------

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "EgoTech World POS & ERP API", time: new Date().toISOString() });
});

// Authentication
app.post("/api/auth/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: "Employee ID and password are required" });
    }

    const trimmed = identifier.trim().toLowerCase();
    
    // Find user by ID or email
    let user = await User.findOne({
      $or: [
        { id: new RegExp('^' + trimmed + '$', 'i') },
        { email: new RegExp('^' + trimmed + '$', 'i') }
      ]
    });
    
    // Special admin case
    if (!user && trimmed === 'admin') {
       user = await User.findOne({ role: 'Admin' });
    }

    if (!user) {
      // Demo login fallback
      if (password === "admin123" || password.length >= 4) {
        const demoUser = {
          id: identifier.toUpperCase().startsWith("EMP") ? identifier.toUpperCase() : "EMP-001",
          name: identifier === "admin" ? "Administrator" : identifier,
          email: `${trimmed}@egotechworld.com`,
          phone: "+94 77 000 0000",
          role: identifier === "admin" ? "Admin" : "Cashier",
          branch: "Colombo – Head Office",
          status: "Active",
          lastLogin: "Just now",
        };
        return res.json({ success: true, user: demoUser, token: "demo-token-" + Date.now() });
      }
      return res.status(401).json({ success: false, message: "Invalid Employee ID or password" });
    }

    if (user.status !== "Active") {
      return res.status(403).json({ success: false, message: "This account has been deactivated. Contact an administrator." });
    }

    user.lastLogin = "Just now";
    await user.save();

    res.json({
      success: true,
      user,
      token: `auth-token-${user.id}-${Date.now()}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Users CRUD
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const userData = req.body;
    if (!userData.name || !userData.email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    let newId = userData.id;
    if (!newId) {
      const lastUser = await User.findOne().sort({ createdAt: -1 });
      let nextNum = 1;
      if (lastUser && lastUser.id && lastUser.id.startsWith('EMP-')) {
         const p = parseInt(lastUser.id.split("-")[1], 10);
         if (!isNaN(p)) nextNum = p + 1;
      }
      newId = `EMP-${String(nextNum).padStart(3, "0")}`;
    }

    const newUser = new User({
      ...userData,
      id: newId,
      status: userData.status || "Active",
      lastLogin: "Never logged in",
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { id: req.params.id }, 
      { $set: req.body },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/users/:id/status", async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.id });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.status = user.status === "Active" ? "Inactive" : "Active";
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    await User.findOneAndDelete({ id: req.params.id });
    res.json({ success: true, message: `User ${req.params.id} deleted` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Products CRUD
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    let newId = req.body.id;
    if (!newId) {
      const count = await Product.countDocuments();
      newId = `PROD-${String(count + 1).padStart(3, "0")}`;
    }
    const newProd = new Product({
      ...req.body,
      id: newId,
    });
    await newProd.save();
    res.status(201).json(newProd);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    await Product.findOneAndDelete({ id: req.params.id });
    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/products/:id/adjust-stock", async (req, res) => {
  try {
    const { qty, reason } = req.body;
    const prod = await Product.findOne({ id: req.params.id });
    if (!prod) return res.status(404).json({ error: "Product not found" });

    prod.stock = Math.max(0, prod.stock + Number(qty));
    await prod.save();
    res.json({ success: true, product: prod, reason });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Categories
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/categories", async (req, res) => {
  try {
    const count = await Category.countDocuments();
    const newCat = new Category({
      ...req.body,
      id: `CAT-${String(count + 1).padStart(2, "0")}`,
    });
    await newCat.save();
    res.status(201).json(newCat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bills & Transactions
app.get("/api/bills", async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/bills", async (req, res) => {
  try {
    const billData = req.body;
    const invoiceNum = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBill = new Bill({
      ...billData,
      id: invoiceNum,
      date: billData.date || new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }),
      status: "Completed",
    });

    // Decrement inventory stock
    if (Array.isArray(billData.items)) {
      for (const cartItem of billData.items) {
        await Product.findOneAndUpdate(
          { id: cartItem.id },
          { $inc: { stock: -cartItem.qty } }
        );
      }
    }

    await newBill.save();
    res.status(201).json(newBill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/bills/:id/refund", async (req, res) => {
  try {
    const bill = await Bill.findOne({ id: req.params.id });
    if (!bill) return res.status(404).json({ error: "Bill not found" });

    if (bill.status === "Refunded") {
      return res.status(400).json({ error: "Bill is already refunded" });
    }

    bill.status = "Refunded";

    // Replenish stock
    if (Array.isArray(bill.items)) {
      for (const item of bill.items) {
        await Product.findOneAndUpdate(
          { id: item.id },
          { $inc: { stock: item.qty } }
        );
      }
    }

    await bill.save();
    res.json({ success: true, bill });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Executive dashboard stats
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const completedBills = await Bill.find({ status: "Completed" });
    const totalRevenue = completedBills.reduce((acc, b) => acc + (b.total || 0), 0);
    const products = await Product.find();
    const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;
    const activeStaffCount = await User.countDocuments({ status: "Active" });

    res.json({
      totalRevenue,
      totalBills: completedBills.length,
      averageTicket: completedBills.length ? totalRevenue / completedBills.length : 0,
      totalProducts: products.length,
      lowStockCount,
      activeStaffCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`EgoTech World POS & ERP API Server running on port ${PORT}`);
});
