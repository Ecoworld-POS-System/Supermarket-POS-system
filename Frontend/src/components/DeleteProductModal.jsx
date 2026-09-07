import React from 'react';
import { Trash2 } from 'lucide-react';

const DeleteProductModal = ({ isOpen, onClose, onConfirm, product }) => {
  if (!isOpen || !product) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog-new" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-new">
          <div className="modal-title-box">
            <div className="modal-icon-badge red">
              <Trash2 size={18} />
            </div>
            <div>
              <div className="modal-title-text" style={{ color: '#0F172A' }}>Delete Product</div>
              <div className="modal-subtitle-text">This action cannot be undone.</div>
            </div>
          </div>
          <button className="modal-close-btn-new" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body-new">
          <div className="delete-highlight-box">
            <div className="delete-title">{product.name}</div>
            <div className="delete-subtitle">
              {product.barcode} · {product.category}
            </div>
          </div>

          <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>
            Are you sure you want to permanently delete this product? It will be removed from all categories and billing screens.
          </p>
        </div>

        <div className="modal-footer-new">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-danger" onClick={() => onConfirm(product.id)}>
            Delete Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProductModal;
