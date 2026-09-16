# EgoTech World: Supermarket POS & ERP System

Welcome to the **EgoTech World POS & ERP System**, a modern, responsive, and robust point-of-sale and enterprise resource planning application built specifically for retail and supermarket management.

## 🌟 Overview

Designed with usability and performance in mind, this system streamlines daily supermarket operations. From secure authentication and employee management to real-time inventory tracking and billing, it provides a seamless experience across all devices—whether your staff is using a desktop at the main checkout counter or a tablet on the shop floor.

## ✨ Key Features

- **Secure Authentication & User Management:** Comprehensive employee onboarding, role-based access control (Admin, Manager, Cashier, Supervisor), and secure session management.
- **Responsive & Intuitive UI:** A beautifully crafted, mobile-first interface powered by Tailwind CSS that adapts perfectly to desktops, tablets, and mobile devices.
- **Real-Time Inventory & Billing:** Track products, categories, and stock levels effortlessly. Process bills with dynamic inventory decrementing and refund handling.
- **Executive Dashboard:** Instant insights into total revenue, bill counts, active staff, and low-stock alerts.
- **Scalable Database Architecture:** Fully integrated with MongoDB to ensure your data is secure, centralized, and highly available.

## 🛠️ Technology Stack

Our system leverages a modern, full-stack JavaScript environment:

- **Frontend:** React (Vite), Tailwind CSS, Lucide React (Icons)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose ODM
- **Deployment & Tooling:** Environment configured for rapid development with hot module replacement (HMR).

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v16.0 or higher recommended)
- A [MongoDB](https://www.mongodb.com/) cluster or local instance.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ecoworld-POS-System/Supermarket-POS-system.git
   cd Supermarket-POS-system
   ```

2. **Setup the Backend**
   ```bash
   cd backend
   npm install
   ```
   *Note: Ensure your `MONGODB_URI` is correctly configured in your environment or `server.js` before starting the server.*

3. **Setup the Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

To run the application locally, you will need to start both the backend server and the frontend development server.

**Start the Backend (API Server):**
```bash
cd backend
npm start
# The backend will run on http://localhost:5170 (or 5000 based on configuration)
```

**Start the Frontend (UI):**
```bash
cd frontend
npm run dev
# The frontend will run on http://localhost:5173
```

## 📱 Mobile Responsiveness

The user interface has been meticulously designed to be fully responsive. Navigational elements smoothly collapse into a hamburger menu on smaller screens, and data grids intelligently stack to provide an optimal viewing experience on smartphones and tablets without sacrificing functionality.

## 🤝 Contributing

We welcome contributions to make this POS system even better. If you have a suggestion or a bug fix, please feel free to fork the repository, create a feature branch, and submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

© 2026 EgoTechWorld (Pvt) Ltd. All rights reserved.