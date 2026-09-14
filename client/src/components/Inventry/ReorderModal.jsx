import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function ReorderModal({ item, onClose, onConfirmReorder }) {
  if (!item) return null;

  // Extract unit (e.g., 'Bags', 'Units', 'Packs', 'Cans', 'Bottles')
  const unitMatch = (item.stock || item.orderQty || '').match(/[A-Za-z]+/g);
  const unit = unitMatch ? unitMatch[unitMatch.length - 1] : 'Units';

  // Extract initial numeric quantity
  const initialQtyNum = parseInt((item.orderQty || '50').replace(/\D/g, ''), 10) || 50;
  const [quantity, setQuantity] = useState(initialQtyNum);

  // Extract or calculate unit price for real-time recalculation
  const initialTotalCost = parseInt((item.estimatedCost || 'LKR 117,500').replace(/\D/g, ''), 10) || 117500;
  const unitPrice = initialTotalCost > 0 && initialQtyNum > 0 ? initialTotalCost / initialQtyNum : 2350;

  // Real-time calculated total
  const calculatedCost = Math.round((Number(quantity) || 0) * unitPrice);
  const formattedCost = `LKR ${calculatedCost.toLocaleString('en-US')}`;

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (quantity <= 0) return;
    onConfirmReorder({
      ...item,
      orderQty: `${quantity} ${unit}`,
      estimatedCost: formattedCost,
    });
  };

  return (
    <div className="reorder-modal-backdrop" onClick={onClose}>
      <div
        className="reorder-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="reorder-modal-header">
          <div>
            <h2 className="reorder-modal-title">Reorder Stock</h2>
            <div className="reorder-modal-subtitle">{item.name}</div>
          </div>
          <button
            type="button"
            className="reorder-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="reorder-modal-body">
          {/* Two-box summary: Current Stock & Supplier */}
          <div className="reorder-summary-boxes">
            <div className="reorder-summary-box">
              <span className="summary-box-label">Current Stock</span>
              <span
                className={`summary-box-value ${
                  item.stock === '0 Bags' || item.stock === '0 Units' || item.currentStock === 0
                    ? 'danger'
                    : 'warning'
                }`}
              >
                {item.stock || (item.currentStock === 0 ? `0 ${unit}` : `${item.currentStock} ${unit}`)}
              </span>
            </div>

            <div className="reorder-summary-box">
              <span className="summary-box-label">Supplier</span>
              <span className="summary-box-value neutral">
                {item.supplier || 'Araliya Foods Ltd'}
              </span>
            </div>
          </div>

          {/* Quantity to Order Input */}
          <div className="reorder-input-group">
            <label className="reorder-input-label" htmlFor="order-qty-input">
              QUANTITY TO ORDER ({unit.toUpperCase()})
            </label>
            <input
              id="order-qty-input"
              type="number"
              min="1"
              max="10000"
              className="reorder-number-input"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value, 10) || 1))}
              required
              autoFocus
            />
          </div>

          {/* Estimated Cost banner */}
          <div className="reorder-cost-banner">
            <span className="cost-banner-label">Estimated Cost</span>
            <span className="cost-banner-amount">{formattedCost}</span>
          </div>

          {/* Action Buttons Footer */}
          <div className="reorder-modal-footer">
            <button
              type="button"
              className="btn-modal-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-modal-submit"
            >
              Place Reorder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
