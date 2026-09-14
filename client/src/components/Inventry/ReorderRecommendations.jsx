import React from 'react';
import { Check, CheckCircle2 } from 'lucide-react';

export default function ReorderRecommendations({
  recommendations = [],
  totalCost = 'LKR 602,320',
  onOrderSingle,
  onApproveAll,
}) {
  const allPlaced = recommendations.length === 0;

  return (
    <div className="reorder-panel">
      {/* Panel Header */}
      <div className="reorder-header">
        <h2 className="reorder-title">Reorder Recommendations</h2>
        <p className="reorder-subtitle">
          System-suggested quantities based on reorder levels
        </p>
      </div>

      {/* STATE 1: All Reorders Placed (Image 1) */}
      {allPlaced ? (
        <div className="reorder-empty-state">
          <div className="empty-check-circle">
            <CheckCircle2 size={32} strokeWidth={2.2} />
          </div>
          <div className="empty-check-title">All reorders placed</div>
          <div className="empty-check-desc">No pending recommendations.</div>
        </div>
      ) : (
        /* STATE 2: Pending Recommendations List (Image 2) */
        <>
          <div className="reorder-items-list">
            {recommendations.map((rec) => (
              <div key={rec.id || rec.sku} className="reorder-item-card">
                <div className="reorder-card-header">
                  <div className="reorder-product-name">{rec.name}</div>
                  <span className={`badge-left-tag ${rec.currentStock > 0 ? 'low' : ''}`}>
                    {rec.currentStock === 0 ? '0 left' : `${rec.currentStock} left`}
                  </span>
                </div>

                <div className="reorder-supplier">{rec.supplier}</div>

                {/* Progress Indicator */}
                <div className="reorder-card-bar">
                  <div
                    className="reorder-card-bar-fill"
                    style={{
                      width: `${rec.fillPercentage || 0}%`,
                      backgroundColor: rec.fillPercentage > 15 ? '#F59E0B' : '#EF4444',
                    }}
                  />
                </div>

                <div className="reorder-card-footer">
                  <div className="reorder-qty-info">
                    <span className="reorder-order-label">Order {rec.orderQty}</span>
                    {rec.estimatedCost && (
                      <span className="reorder-cost-estimate">~ {rec.estimatedCost}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className={`btn-pill-order ${rec.ordered ? 'ordered' : ''}`}
                    disabled={rec.ordered}
                    onClick={() => onOrderSingle && onOrderSingle(rec)}
                  >
                    {rec.ordered ? 'Ordered' : 'Order'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Panel Total Cost & Approve Button */}
          <div className="reorder-panel-footer">
            <div className="reorder-total-row">
              <span className="reorder-total-label">Total estimated cost</span>
              <span className="reorder-total-amount">{totalCost}</span>
            </div>

            <button
              type="button"
              className="btn-approve-all"
              onClick={onApproveAll}
            >
              <Check size={18} strokeWidth={2.5} />
              <span>Approve All Suggested</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
