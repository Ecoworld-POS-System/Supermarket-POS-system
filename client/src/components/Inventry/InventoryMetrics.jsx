import React from 'react';
import { Ban, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function InventoryMetrics({ outOfStockCount = 0, lowStockCount = 0, inStockCount = 16 }) {
  return (
    <div className="inventory-metrics-row">
      {/* 1. Out of Stock Card */}
      <div className="metric-card out-of-stock">
        <div className="metric-icon-wrapper">
          <Ban size={24} strokeWidth={2.2} />
        </div>
        <div className="metric-details">
          <div className="metric-number">{outOfStockCount}</div>
          <div className="metric-title">Out of Stock</div>
          <div className="metric-subtitle">Immediate action required</div>
        </div>
      </div>

      {/* 2. Below Reorder Level Card */}
      <div className="metric-card low-stock">
        <div className="metric-icon-wrapper">
          <AlertTriangle size={24} strokeWidth={2.2} />
        </div>
        <div className="metric-details">
          <div className="metric-number">{lowStockCount}</div>
          <div className="metric-title">Below Reorder Level</div>
          <div className="metric-subtitle">Reorder soon</div>
        </div>
      </div>

      {/* 3. In Stock Card */}
      <div className="metric-card in-stock">
        <div className="metric-icon-wrapper">
          <CheckCircle2 size={24} strokeWidth={2.2} />
        </div>
        <div className="metric-details">
          <div className="metric-number">{inStockCount}</div>
          <div className="metric-title">In Stock</div>
          <div className="metric-subtitle">Adequately stocked</div>
        </div>
      </div>
    </div>
  );
}
