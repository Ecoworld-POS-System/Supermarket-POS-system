import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';

const DeleteCategoryModal = ({ isOpen, onClose, onConfirm, category }) => {
  if (!isOpen || !category) return null;

  const linkedCount = category.productsLinked || 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog-new" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-new">
          <div className="modal-title-box">
            <div className="modal-icon-badge red">
              <Trash2 size={18} />
            </div>
            <div>
              <div className="modal-title-text" style={{ color: '#0F172A' }}>Delete Category</div>
              <div className="modal-subtitle-text">This action cannot be undone.</div>
            </div>
          </div>
          <button className="modal-close-btn-new" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body-new">
          <div className="delete-highlight-box">
            <div className="delete-title">{category.name}</div>
            <div className="delete-subtitle">{category.categoryId}</div>
          </div>

          {linkedCount > 0 && (
            <div className="warning-banner" style={{ marginTop: 0, marginBottom: 16 }}>
              <AlertTriangle size={18} color="#D97706" style={{ flexShrink: 0 }} />
              <div>
                <strong>{linkedCount} products</strong> are linked to this category. Deleting it will unlink those products.
              </div>
            </div>
          )}

          <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>
            Are you sure you want to permanently delete this category?
          </p>
        </div>

        <div className="modal-footer-new">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-danger" onClick={() => onConfirm(category.id)}>
            Delete Category
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCategoryModal;
