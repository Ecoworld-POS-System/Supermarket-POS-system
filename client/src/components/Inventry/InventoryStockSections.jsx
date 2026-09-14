import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function InventoryStockSections({
  urgentItems = [],
  lowStockItems = [],
  inStockItems = [],
  onOrderItem,
}) {
  const [urgentOpen, setUrgentOpen] = useState(true);
  const [lowStockOpen, setLowStockOpen] = useState(true);
  const [inStockOpen, setInStockOpen] = useState(true);

  return (
    <div className="inventory-stock-sections" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. URGENT — OUT OF STOCK SECTION */}
      {urgentItems.length === 0 ? (
        <div className="inventory-section urgent collapsed-empty">
          <div className="section-header" style={{ cursor: 'default' }}>
            <div className="section-title-wrap">
              <span className="status-bullet red" />
              <span>Urgent — Out of Stock (0)</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>No urgent shortages</span>
          </div>
        </div>
      ) : (
        <div className="inventory-section urgent">
          <div className="section-header" onClick={() => setUrgentOpen(!urgentOpen)}>
            <div className="section-title-wrap">
              <span className="status-bullet red" />
              <span>Urgent — Out of Stock ({urgentItems.length})</span>
            </div>
            <div className="section-header-right">
              <ChevronDown size={18} className={`chevron-icon ${urgentOpen ? 'open' : ''}`} />
            </div>
          </div>

          {urgentOpen && (
            <div className="section-body">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>PRODUCT NAME</th>
                    <th>CATEGORY</th>
                    <th>SUPPLIER</th>
                    <th>STOCK</th>
                    <th>REORDER AT</th>
                    <th style={{ textAlign: 'right' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {urgentItems.map((item) => (
                    <tr key={item.sku}>
                      <td className="sku-code">{item.sku}</td>
                      <td className="product-name-cell">{item.name}</td>
                      <td className="category-pill">{item.category}</td>
                      <td className="supplier-cell">{item.supplier}</td>
                      <td className="stock-value-zero">{item.stock}</td>
                      <td style={{ color: '#64748B', fontWeight: 600 }}>{item.reorderAt}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn-table-order"
                          onClick={() => onOrderItem && onOrderItem(item)}
                        >
                          Order {item.orderQty}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 2. LOW STOCK — NEAR REORDER LEVEL SECTION */}
      {lowStockItems.length === 0 ? (
        <div className="inventory-section low-stock collapsed-empty">
          <div className="section-header" style={{ cursor: 'default' }}>
            <div className="section-title-wrap">
              <span className="status-bullet yellow" />
              <span>Low Stock — Near Reorder Level (0)</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>All items above minimum threshold</span>
          </div>
        </div>
      ) : (
        <div className="inventory-section low-stock">
          <div className="section-header" onClick={() => setLowStockOpen(!lowStockOpen)}>
            <div className="section-title-wrap">
              <span className="status-bullet yellow" />
              <span>Low Stock — Near Reorder Level ({lowStockItems.length})</span>
            </div>
            <div className="section-header-right">
              <ChevronDown size={18} className={`chevron-icon ${lowStockOpen ? 'open' : ''}`} />
            </div>
          </div>

          {lowStockOpen && (
            <div className="section-body">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>PRODUCT NAME</th>
                    <th>CATEGORY</th>
                    <th>SUPPLIER</th>
                    <th>STOCK</th>
                    <th>REORDER AT</th>
                    <th style={{ textAlign: 'right' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map((item) => (
                    <tr key={item.sku}>
                      <td className="sku-code">{item.sku}</td>
                      <td className="product-name-cell">{item.name}</td>
                      <td className="category-pill">{item.category}</td>
                      <td className="supplier-cell">{item.supplier}</td>
                      <td className="stock-value-warning">{item.stock}</td>
                      <td style={{ color: '#64748B', fontWeight: 600 }}>{item.reorderAt}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn-table-order"
                          style={{ backgroundColor: '#F59E0B' }}
                          onClick={() => onOrderItem && onOrderItem(item)}
                        >
                          Order {item.orderQty}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 3. IN STOCK SECTION */}
      <div className="inventory-section in-stock">
        <div className="section-header" onClick={() => setInStockOpen(!inStockOpen)}>
          <div className="section-title-wrap">
            <span className="status-bullet green" />
            <span>In Stock ({inStockItems.length})</span>
          </div>
          <div className="section-header-right">
            <ChevronDown size={18} className={`chevron-icon ${inStockOpen ? 'open' : ''}`} />
          </div>
        </div>

        {inStockOpen && (
          <div className="section-body">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>PRODUCT NAME</th>
                  <th>CATEGORY</th>
                  <th>STOCK</th>
                  <th>MAX STOCK</th>
                  <th>FILL LEVEL</th>
                </tr>
              </thead>
              <tbody>
                {inStockItems.map((item) => (
                  <tr key={item.sku}>
                    <td className="sku-code">{item.sku}</td>
                    <td className="product-name-cell">{item.name}</td>
                    <td className="category-pill">{item.category}</td>
                    <td className="stock-value-highlight">{item.stock}</td>
                    <td style={{ color: '#64748B', fontWeight: 500 }}>{item.maxStock}</td>
                    <td>
                      <div className="fill-level-cell">
                        <div className="fill-bar-track">
                          <div
                            className="fill-bar-progress"
                            style={{ width: `${Math.min(item.fillPercentage || 0, 100)}%` }}
                          />
                        </div>
                        <span className="fill-percent-label">{item.fillPercentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
