import React, { useState, useEffect } from 'react';
import { Plus, Edit2 } from 'lucide-react';

const CategoryModal = ({ isOpen, onClose, onSave, categoryToEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Active'
  });

  useEffect(() => {
    if (categoryToEdit) {
      setFormData({
        id: categoryToEdit.id,
        name: categoryToEdit.name || '',
        description: categoryToEdit.description || '',
        status: categoryToEdit.status || 'Active'
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'Active'
      });
    }
  }, [categoryToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'description' && value.length > 200) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleStatus = (e) => {
    setFormData((prev) => ({
      ...prev,
      status: e.target.checked ? 'Active' : 'Inactive'
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Category Name is required.');
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog-new" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-new">
          <div className="modal-title-box">
            <div className="modal-icon-badge">
              {categoryToEdit ? <Edit2 size={18} /> : <Plus size={18} />}
            </div>
            <div>
              <div className="modal-title-text">
                {categoryToEdit ? 'Edit Category' : 'Add New Category'}
              </div>
              <div className="modal-subtitle-text">
                {categoryToEdit ? `Editing: ${categoryToEdit.categoryId}` : 'Create a new product category'}
              </div>
            </div>
          </div>
          <button className="modal-close-btn-new" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body-new">
            <div className="form-group-new">
              <label className="form-label-new">CATEGORY NAME *</label>
              <input
                type="text"
                className="form-control-new"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Frozen Foods"
                required
              />
            </div>

            <div className="form-group-new">
              <label className="form-label-new">DESCRIPTION</label>
              <textarea
                className="form-control-new"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Briefly describe what products belong in this category..."
                rows={3}
                maxLength={200}
                style={{ resize: 'none' }}
              ></textarea>
              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#94A3B8', marginTop: 4 }}>
                {formData.description.length} / 200
              </div>
            </div>

            <div className="form-group-new">
              <div className="status-toggle-card">
                <div>
                  <div className="toggle-info-title">Category Status</div>
                  <div className="toggle-info-desc">
                    Category is visible in the system and can be assigned to products.
                  </div>
                </div>
                <label className="switch-label">
                  <input
                    type="checkbox"
                    checked={formData.status === 'Active'}
                    onChange={handleToggleStatus}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div style={{ marginTop: 8 }}>
                <span className={`badge-dot ${formData.status === 'Active' ? 'active' : 'inactive'}`}>
                  <span className="dot"></span> {formData.status}
                </span>
              </div>
            </div>
          </div>

          <div className="modal-footer-new">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              ✓ Save Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
