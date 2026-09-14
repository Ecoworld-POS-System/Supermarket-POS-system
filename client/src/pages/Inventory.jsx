import React, { useState } from 'react';
import AppLayout from '../components/Layout/AppLayout';
import InventoryMetrics from '../components/Inventry/InventoryMetrics';
import InventoryStockSections from '../components/Inventry/InventoryStockSections';
import ReorderRecommendations from '../components/Inventry/ReorderRecommendations';
import InventoryToolbar from '../components/Inventry/InventoryToolbar';
import ReorderModal from '../components/Inventry/ReorderModal';
import '../components/Inventry/Inventory.css';

// Initial Mock Datasets representing the two UI mockup states
const PENDING_STATE = {
  outOfStockCount: 3,
  lowStockCount: 7,
  inStockCount: 6,
  urgentItems: [
    {
      id: 'urg-1',
      sku: 'RG-001',
      name: 'Basmati Rice 5kg',
      category: 'Rice & Grains',
      supplier: 'Araliya Foods Ltd',
      stock: '0 Bags',
      reorderAt: '15 Bags',
      orderQty: '50 Bags',
      estimatedCost: 'LKR 117,500',
    },
    {
      id: 'urg-2',
      sku: 'DA-003',
      name: 'Anchor Butter 250g',
      category: 'Dairy',
      supplier: 'Fonterra Lanka (Pvt) Ltd',
      stock: '0 Units',
      reorderAt: '10 Units',
      orderQty: '40 Units',
      estimatedCost: 'LKR 27,200',
    },
    {
      id: 'urg-3',
      sku: 'BV-004',
      name: 'Milo Powder 400g',
      category: 'Beverages',
      supplier: 'Nestlé Lanka PLC',
      stock: '0 Units',
      reorderAt: '12 Units',
      orderQty: '60 Units',
      estimatedCost: 'LKR 75,000',
    },
  ],
  lowStockItems: [
    {
      id: 'low-1',
      sku: 'CN-002',
      name: 'Tuna Canned 185g',
      category: 'Canned Goods',
      supplier: 'Ocean Fresh Ltd',
      stock: '4 Cans',
      reorderAt: '15 Cans',
      orderQty: '30 Cans',
    },
    {
      id: 'low-2',
      sku: 'SN-014',
      name: 'Munchee Super Cream Cracker',
      category: 'Biscuits & Snacks',
      supplier: 'Ceylon Biscuits Ltd',
      stock: '6 Packs',
      reorderAt: '20 Packs',
      orderQty: '40 Packs',
    },
    {
      id: 'low-3',
      sku: 'BV-009',
      name: 'Dilmah Premium Ceylon Tea 200g',
      category: 'Beverages',
      supplier: 'Dilmah Ceylon Tea',
      stock: '5 Packs',
      reorderAt: '15 Packs',
      orderQty: '30 Packs',
    },
    {
      id: 'low-4',
      sku: 'SP-005',
      name: 'Kist Chilli Sauce 375g',
      category: 'Condiments',
      supplier: 'Cargills Ceylon PLC',
      stock: '3 Bottles',
      reorderAt: '12 Bottles',
      orderQty: '25 Bottles',
    },
    {
      id: 'low-5',
      sku: 'OIL-002',
      name: 'Fortune White Coconut Oil 1L',
      category: 'Cooking Essentials',
      supplier: 'Pyramid Wilmar',
      stock: '5 Bottles',
      reorderAt: '18 Bottles',
      orderQty: '30 Bottles',
    },
    {
      id: 'low-6',
      sku: 'ND-003',
      name: 'Maggi 2-Minute Noodles Chicken',
      category: 'Instant Food',
      supplier: 'Nestlé Lanka PLC',
      stock: '8 Packs',
      reorderAt: '25 Packs',
      orderQty: '50 Packs',
    },
    {
      id: 'low-7',
      sku: 'DR-008',
      name: 'Kotmale Fresh Milk 1L',
      category: 'Dairy',
      supplier: 'Cargills Ceylon PLC',
      stock: '4 Bottles',
      reorderAt: '20 Bottles',
      orderQty: '40 Bottles',
    },
  ],
  inStockItems: [
    {
      sku: 'WH-001',
      name: 'Prima All Purpose Wheat Flour 1kg',
      category: 'Baking',
      stock: '45 Packs',
      maxStock: '60 Packs',
      fillPercentage: 75,
    },
    {
      sku: 'SG-002',
      name: 'Brown Sugar 1kg',
      category: 'Sweeteners',
      stock: '55 Bags',
      maxStock: '70 Bags',
      fillPercentage: 78,
    },
    {
      sku: 'SP-001',
      name: 'MD Tomato Sauce 400g',
      category: 'Condiments',
      stock: '35 Bottles',
      maxStock: '50 Bottles',
      fillPercentage: 70,
    },
    {
      sku: 'DA-001',
      name: 'Highland Fresh Milk 1L',
      category: 'Dairy',
      stock: '30 Packs',
      maxStock: '40 Packs',
      fillPercentage: 75,
    },
    {
      sku: 'SN-005',
      name: 'Maliban Lemon Puff 200g',
      category: 'Biscuits & Snacks',
      stock: '48 Packs',
      maxStock: '60 Packs',
      fillPercentage: 80,
    },
    {
      sku: 'BV-002',
      name: 'Nescafe Classic 100g',
      category: 'Beverages',
      stock: '25 Jars',
      maxStock: '30 Jars',
      fillPercentage: 83,
    },
  ],
  recommendations: [
    {
      id: 'rec-1',
      sku: 'RG-001',
      name: 'Basmati Rice 5kg',
      supplier: 'Araliya Foods Ltd',
      currentStock: 0,
      fillPercentage: 0,
      orderQty: '50 Bags',
      estimatedCost: 'LKR 117,500',
    },
    {
      id: 'rec-2',
      sku: 'DA-003',
      name: 'Anchor Butter 250g',
      supplier: 'Fonterra Lanka (Pvt) Ltd',
      currentStock: 0,
      fillPercentage: 0,
      orderQty: '40 Units',
      estimatedCost: 'LKR 27,200',
    },
    {
      id: 'rec-3',
      sku: 'BV-004',
      name: 'Milo Powder 400g',
      supplier: 'Nestlé Lanka PLC',
      currentStock: 0,
      fillPercentage: 0,
      orderQty: '60 Units',
      estimatedCost: null,
    },
  ],
};

const COMPLETED_STATE = {
  outOfStockCount: 0,
  lowStockCount: 0,
  inStockCount: 16,
  urgentItems: [],
  lowStockItems: [],
  inStockItems: [
    {
      sku: 'RG-001',
      name: 'Basmati Rice 5kg',
      category: 'Rice & Grains',
      stock: '50 Bags',
      maxStock: '80 Bags',
      fillPercentage: 63,
    },
    {
      sku: 'DA-003',
      name: 'Anchor Butter 250g',
      category: 'Dairy',
      stock: '40 Units',
      maxStock: '60 Units',
      fillPercentage: 67,
    },
    {
      sku: 'BV-004',
      name: 'Milo Powder 400g',
      category: 'Beverages',
      stock: '60 Units',
      maxStock: '80 Units',
      fillPercentage: 75,
    },
    {
      sku: 'CN-002',
      name: 'Tuna Canned 185g',
      category: 'Canned Goods',
      stock: '30 Cans',
      maxStock: '40 Cans',
      fillPercentage: 75,
    },
    {
      sku: 'SN-014',
      name: 'Munchee Super Cream Cracker',
      category: 'Biscuits & Snacks',
      stock: '45 Packs',
      maxStock: '60 Packs',
      fillPercentage: 75,
    },
    {
      sku: 'BV-009',
      name: 'Dilmah Premium Ceylon Tea 200g',
      category: 'Beverages',
      stock: '35 Packs',
      maxStock: '50 Packs',
      fillPercentage: 70,
    },
    {
      sku: 'SP-005',
      name: 'Kist Chilli Sauce 375g',
      category: 'Condiments',
      stock: '28 Bottles',
      maxStock: '40 Bottles',
      fillPercentage: 70,
    },
    {
      sku: 'OIL-002',
      name: 'Fortune White Coconut Oil 1L',
      category: 'Cooking Essentials',
      stock: '32 Bottles',
      maxStock: '45 Bottles',
      fillPercentage: 71,
    },
    {
      sku: 'ND-003',
      name: 'Maggi 2-Minute Noodles Chicken',
      category: 'Instant Food',
      stock: '50 Packs',
      maxStock: '75 Packs',
      fillPercentage: 66,
    },
    {
      sku: 'DR-008',
      name: 'Kotmale Fresh Milk 1L',
      category: 'Dairy',
      stock: '40 Bottles',
      maxStock: '60 Bottles',
      fillPercentage: 66,
    },
    {
      sku: 'WH-001',
      name: 'Prima All Purpose Wheat Flour 1kg',
      category: 'Baking',
      stock: '55 Packs',
      maxStock: '70 Packs',
      fillPercentage: 78,
    },
    {
      sku: 'SG-002',
      name: 'Brown Sugar 1kg',
      category: 'Sweeteners',
      stock: '60 Bags',
      maxStock: '80 Bags',
      fillPercentage: 75,
    },
    {
      sku: 'SP-001',
      name: 'MD Tomato Sauce 400g',
      category: 'Condiments',
      stock: '35 Bottles',
      maxStock: '50 Bottles',
      fillPercentage: 70,
    },
    {
      sku: 'DA-001',
      name: 'Highland Fresh Milk 1L',
      category: 'Dairy',
      stock: '38 Packs',
      maxStock: '50 Packs',
      fillPercentage: 76,
    },
    {
      sku: 'SN-005',
      name: 'Maliban Lemon Puff 200g',
      category: 'Biscuits & Snacks',
      stock: '48 Packs',
      maxStock: '60 Packs',
      fillPercentage: 80,
    },
    {
      sku: 'BV-002',
      name: 'Nescafe Classic 100g',
      category: 'Beverages',
      stock: '25 Jars',
      maxStock: '30 Jars',
      fillPercentage: 83,
    },
  ],
  recommendations: [],
};

export default function InventoryPage() {
  const [viewMode, setViewMode] = useState('pending'); // 'pending' (Image 2) or 'completed' (Image 1)
  const [inventoryData, setInventoryData] = useState(PENDING_STATE);
  const [toastMessage, setToastMessage] = useState(null);
  const [reorderModalItem, setReorderModalItem] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Switch views when toggle button is clicked
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (mode === 'completed') {
      setInventoryData(COMPLETED_STATE);
    } else {
      setInventoryData(PENDING_STATE);
    }
  };

  // Open modal when Order button is clicked
  const handleOpenOrderModal = (itemOrId) => {
    if (itemOrId && typeof itemOrId === 'object') {
      setReorderModalItem(itemOrId);
      return;
    }
    const found =
      inventoryData.recommendations.find((r) => r.id === itemOrId || r.sku === itemOrId) ||
      inventoryData.urgentItems.find((u) => u.id === itemOrId || u.sku === itemOrId) ||
      inventoryData.lowStockItems.find((l) => l.id === itemOrId || l.sku === itemOrId);

    if (found) {
      setReorderModalItem(found);
    }
  };

  // Confirm reorder from modal
  const handleConfirmReorder = (orderData) => {
    setInventoryData((prev) => {
      const updatedRecs = prev.recommendations.map((rec) =>
        rec.id === orderData.id || rec.sku === orderData.sku ? { ...rec, ordered: true } : rec
      );
      return {
        ...prev,
        recommendations: updatedRecs,
      };
    });
    setReorderModalItem(null);
    showToast(`✓ Reorder placed for ${orderData.orderQty} of ${orderData.name}! (${orderData.estimatedCost})`);
  };

  // Handle approve all suggested
  const handleApproveAll = () => {
    showToast('✓ All suggested reorders approved & placed successfully! (LKR 602,320)');
    setViewMode('completed');
    setInventoryData(COMPLETED_STATE);
  };

  // Reset demo
  const handleResetDemo = () => {
    setViewMode('pending');
    setInventoryData(PENDING_STATE);
    showToast('Inventory reset to initial reorder alert state.');
  };

  return (
    <AppLayout
      activeMenu="Inventory"
      breadcrumb={['EGOTECH WORLD', 'Inventory']}
    >
      <div className="inventory-container">
        {/* View Switcher / Demo Controls */}
        <InventoryToolbar
          viewMode={viewMode}
          setViewMode={handleViewModeChange}
          outOfStockCount={inventoryData.outOfStockCount}
          lowStockCount={inventoryData.lowStockCount}
          onResetDemo={handleResetDemo}
        />

        {/* Two-column layout matching mockups */}
        <div className="inventory-grid">
          {/* Main Left Column */}
          <div className="inventory-main-col">
            {/* Top 3 Metric Summary Cards */}
            <InventoryMetrics
              outOfStockCount={inventoryData.outOfStockCount}
              lowStockCount={inventoryData.lowStockCount}
              inStockCount={inventoryData.inStockCount}
            />

            {/* Tables & Accordion Sections */}
            <InventoryStockSections
              urgentItems={inventoryData.urgentItems}
              lowStockItems={inventoryData.lowStockItems}
              inStockItems={inventoryData.inStockItems}
              onOrderItem={handleOpenOrderModal}
            />
          </div>

          {/* Right Column: Reorder Recommendations Panel */}
          <div className="inventory-side-col">
            <ReorderRecommendations
              recommendations={inventoryData.recommendations}
              totalCost="LKR 602,320"
              onOrderSingle={handleOpenOrderModal}
              onApproveAll={handleApproveAll}
            />
          </div>
        </div>
      </div>

      {/* Reorder Stock Modal (Matching user popup screenshot) */}
      {reorderModalItem && (
        <ReorderModal
          item={reorderModalItem}
          onClose={() => setReorderModalItem(null)}
          onConfirmReorder={handleConfirmReorder}
        />
      )}

      {/* Floating help button '?' matching wireframe bottom right */}
      <button
        type="button"
        className="floating-help-btn"
        title="Inventory Help & Shortcuts"
        onClick={() => showToast('EgoTech POS Help Desk: Contact +94 74 312 6123')}
      >
        ?
      </button>

      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="inventory-toast">
          <span>{toastMessage}</span>
        </div>
      )}
    </AppLayout>
  );
}
