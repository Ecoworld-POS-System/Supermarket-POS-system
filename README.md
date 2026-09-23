# 🛒 EgoTech World — Supermarket POS & ERP System

A modern, fast, and responsive Point of Sale (POS) and retail management web application built for supermarket operations. The system features role-based access, real-time inventory tracking, high-speed cashier checkout with barcode scanning, automated receipt printing, and sales reporting.

---

## 🌟 Key Features & Modules

### 1. ⚡ Point of Sale (POS) Terminal & Live Billing
- **High-Speed Checkout:** Real-time calculation of subtotal, VAT/taxes, discounts, and change return.
- **Continuous Barcode Scanner:** Hardware barcode scanner integration with auto-focus and instant cart addition on scan.
- **Instant Search:** Real-time product filtering by Item Name, SKU, and Barcode.
- **View Toggle:** Seamlessly switch between **Card Grid View** (with product thumbnails) and a fast **Compact List View** (dense table for rapid cashier checkout).
- **Payment Processing:** Support for Cash (with quick tender shortcut buttons), Card, and LankaQR.
- **Built-in POS Calculator:** Fast terminal calculator (`F3`) to quickly compute tender amounts and discounts.
- **Receipt Modal:** Instant thermal receipt generation after every completed transaction.

### 2. 🏷️ Product & Category Management
- Full CRUD operations for supermarket products and department categories.
- Real-time price updates and categorization.
- Dynamic search and filter tools for catalog administration.

### 3. 📦 Inventory Management & Stock Tracking
- Real-time stock level monitoring across all branches.
- Low-stock and out-of-stock automatic alerts and badges.
- Min-threshold controls to prevent overselling.

### 4. 🧾 Bill History & Sales Reports
- Comprehensive transaction history log with bill filtering by date, bill number, and cashier.
- Reprint previous customer receipts on demand.
- Export sales reports directly to Excel (`.xlsx`) for accounting and auditing.

### 5. 👥 Authentication & Role-Based Access Control (RBAC)
- Secure staff login via Employee ID, username, or email.
- Multi-role permission architecture:
  - **Admin:** Full system control, branch management, employee accounts, and financial reports.
  - **Manager:** Store management, inventory adjustments, and billing logs.
  - **Cashier:** Dedicated access to POS Billing Terminal and live sales.
  - **Inventory Staff:** Product catalog, stock replenishment, and category controls.

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Tailwind CSS, Lucide React (Icons), Vite
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Exporting & Utilities:** SheetJS / XLSX

---

## 🚀 Getting Started

Follow these steps to set up and run the project locally.

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [Git](https://git-scm.com/)
- Active [MongoDB Atlas](https://cloud.mongodb.com/) cluster or local MongoDB instance.

### 2. Clone the Repository
```bash
git clone [https://github.com/Ecoworld-POS-System/Supermarket-POS-system.git](https://github.com/Ecoworld-POS-System/Supermarket-POS-system.git)
cd Supermarket-POS-system