import React from 'react';
import { Layers, AlertCircle, CheckCircle } from 'lucide-react';

export default function InventoryToolbar({
  viewMode,
  setViewMode,
  outOfStockCount,
  lowStockCount,
  onResetDemo,
}) {
  return (
    <div className="inventory-toolbar">
      <div className="toolbar-title-group">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} color="#2563eb" />
          <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#1E293B' }}>
            Inventory Management
          </span>
        </div>

        {outOfStockCount > 0 || lowStockCount > 0 ? (
          <span className="toolbar-status-badge alert">
            <AlertCircle size={14} />
            {outOfStockCount} Out of Stock • {lowStockCount} Low Stock
          </span>
        ) : (
          <span className="toolbar-status-badge clean">
            <CheckCircle size={14} />
            All stock levels healthy
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="view-toggle-pills">
          <button
            type="button"
            className={`view-toggle-btn ${viewMode === 'pending' ? 'active' : ''}`}
            onClick={() => setViewMode('pending')}
            title="Preview State with Out of Stock & Low Stock items (Image 2)"
          >
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: '#EF4444' }} />
            Reorders Needed (State 2)
          </button>
          <button
            type="button"
            className={`view-toggle-btn ${viewMode === 'completed' ? 'active' : ''}`}
            onClick={() => setViewMode('completed')}
            title="Preview State with All Reorders Placed (Image 1)"
          >
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10B981' }} />
            All Reorders Placed (State 1)
          </button>
        </div>

        <button
          type="button"
          onClick={onResetDemo}
          style={{
            background: 'none',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#64748B',
            cursor: 'pointer',
          }}
          title="Reset sample inventory to initial state"
        >
          Reset Demo
        </button>
      </div>
    </div>
  );
}
