import React, { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import LoginPage from "./components/auth/LoginPage";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import DashboardPage from "./components/dashboard/DashboardPage";
import ProductsPage from "./components/products/ProductsPage";
import CategoriesPage from "./components/categories/CategoriesPage";
import InventoryPage from "./components/inventory/InventoryPage";
import POSPage from "./components/pos/POSPage";
import BillHistoryPage from "./components/bills/BillHistoryPage";
import UserManagementPage from "./components/users/UserManagementPage";
import ReportsPage from "./components/reports/ReportsPage";
import ProfilePage from "./components/profile/ProfilePage";

function AuthenticatedApp() {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [profileUser, setProfileUser] = useState(null);

  const openProfile = (user) => {
    setProfileUser(user);
    setActiveTab("profile");
  };

  const handleTabChange = (tab) => {
    setProfileUser(null);
    setActiveTab(tab);
  };

  const renderContent = () => {
    if (activeTab === "profile") {
      return (
        <ProfilePage
          user={profileUser || currentUser}
          onBack={() => handleTabChange("users")}
        />
      );
    }

    switch (activeTab) {
      case "dashboard":
        return <DashboardPage />;
      case "products":
        return <ProductsPage />;
      case "categories":
        return <CategoriesPage />;
      case "inventory":
        return <InventoryPage />;
      case "pos":
        return <POSPage />;
      case "bills":
        return <BillHistoryPage />;
      case "users":
        return <UserManagementPage onOpenProfile={openProfile} />;
      case "reports":
        return <ReportsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-50 flex overflow-hidden font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Topbar activeTab={activeTab} />
        <main className="flex-1 overflow-y-auto">{renderContent()}</main>
      </div>
    </div>
  );
}

function AppContent() {
  const { currentUser } = useApp();
  return currentUser ? <AuthenticatedApp /> : <LoginPage />;
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
