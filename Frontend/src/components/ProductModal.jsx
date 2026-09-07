import React, { useState, useEffect } from 'react';
import { Plus, Edit2, RotateCw, AlertTriangle, Image as ImageIcon, Upload, X, Check } from 'lucide-react';

const ProductModal = ({ isOpen, onClose, onSave, productToEdit, categories }) => {
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    category: '',
    status: 'Active',
    price: '',
    stock: '',
    lowStockThreshold: 10,
    image: ''
  });

  const [imageTab, setImageTab] = useState('url');

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        id: productToEdit.id,
        name: productToEdit.name || '',
        barcode: productToEdit.barcode || '',
        category: productToEdit.category || (categories.length > 0 ? categories[0].name : 'Rice & Grains'),
        status: productToEdit.status || 'Active',
        price: productToEdit.price !== undefined ? productToEdit.price : '',
        stock: productToEdit.stock !== undefined ? productToEdit.stock : '',
        lowStockThreshold: productToEdit.lowStockThreshold !== undefined ? productToEdit.lowStockThreshold : 10,
        image: productToEdit.image || ''
      });
    } else {
      setFormData({
        name: '',
        barcode: '',
        category: categories.length > 0 ? categories[0].name : 'Rice & Grains',
        status: 'Active',
        price: '',
        stock: '',
        lowStockThreshold: 10,
        image: ''
      });
    }
  }, [productToEdit, categories, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateBarcode = () => {
    const randomSuffix = Math.floor(100000000 + Math.random() * 900000000);
    setFormData((prev) => ({ ...prev, barcode: `489${randomSuffix}` }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    setFormData((prev) => ({ ...prev, image: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.barcode) {
      alert('Please fill in Product Name and Barcode.');
      return;
    }
    onSave(formData);
    onClose();
  };

  const isLowStockWarning =
    productToEdit && Number(formData.stock) <= Number(formData.lowStockThreshold);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog-new" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-new">
          <div className="modal-title-box">
            <div className="modal-icon-badge">
              {productToEdit ? <Edit2 size={18} /> : <Plus size={18} />}
            </div>
            <div>
              <div className="modal-title-text">
                {productToEdit ? 'Edit Product' : 'Add New Product'}
              </div>
              <div className="modal-subtitle-text">
                {productToEdit ? `Editing: ${productToEdit.skuCode}` : 'Fill in all required fields'}
              </div>
            </div>
          </div>
          <button className="modal-close-btn-new" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="modal-body-new">
            {/* Product Image Input & Live Preview */}
            <div className="form-group-new">
              <label className="form-label-new">PRODUCT IMAGE</label>
              <div className="image-input-container">
                <div className="image-preview-box">
                  {formData.image ? (
                    <div className="preview-image-wrapper">
                      <img src={formData.image} alt="Product Preview" className="preview-img" />
                      <button
                        type="button"
                        className="btn-clear-image"
                        onClick={handleClearImage}
                        title="Remove Image"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="image-placeholder-box">
                      <ImageIcon size={22} color="#94A3B8" />
                      <span>No image</span>
                    </div>
                  )}
                </div>

                <div className="image-input-controls">
                  <div className="image-tab-toggle">
                    <button
                      type="button"
                      className={`tab-btn ${imageTab === 'url' ? 'active' : ''}`}
                      onClick={() => setImageTab('url')}
                    >
                      Image URL
                    </button>
                    <button
                      type="button"
                      className={`tab-btn ${imageTab === 'file' ? 'active' : ''}`}
                      onClick={() => setImageTab('file')}
                    >
                      Upload File
                    </button>
                  </div>

                  {imageTab === 'url' ? (
                    <input
                      type="url"
                      className="form-control-new"
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      placeholder="https://example.com/product-image.jpg"
                    />
                  ) : (
                    <div className="file-upload-wrapper">
                      <label className="file-upload-label">
                        <Upload size={14} /> Choose Image File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-group-new">
              <label className="form-label-new">PRODUCT NAME *</label>
              <input
                type="text"
                className="form-control-new"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Basmati Rice 5kg"
                required
              />
            </div>

            <div className="form-group-new">
              <label className="form-label-new">BARCODE *</label>
              <div className="input-with-button">
                <input
                  type="text"
                  className="form-control-new"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                  placeholder="Scan or enter 13-digit barcode"
                  required
                />
                <button
                  type="button"
                  className="btn-generate"
                  onClick={handleGenerateBarcode}
                >
                  <RotateCw size={14} style={{ marginRight: 4 }} /> Generate
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group-new">
                <label className="form-label-new">CATEGORY</label>
                <select
                  className="form-control-new"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {categories.map((cat) => (
                    <option key={cat.id || cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group-new">
                <label className="form-label-new">STATUS</label>
                <select
                  className="form-control-new"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group-new">
                <label className="form-label-new">UNIT PRICE (LKR) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control-new"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="LKR 0.00"
                  required
                />
              </div>

              <div className="form-group-new">
                <label className="form-label-new">
                  {productToEdit ? 'STOCK QUANTITY *' : 'INITIAL STOCK *'}
                </label>
                <input
                  type="number"
                  className="form-control-new"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="form-group-new" style={{ marginBottom: 0 }}>
              <label className="form-label-new">LOW STOCK ALERT THRESHOLD *</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="number"
                  className="form-control-new"
                  name="lowStockThreshold"
                  value={formData.lowStockThreshold}
                  onChange={handleChange}
                  placeholder="10"
                  style={{ width: '140px' }}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  Alert when stock ≤ this value
                </span>
              </div>
            </div>

            {isLowStockWarning && (
              <div className="warning-banner">
                <AlertTriangle size={18} color="#D97706" style={{ flexShrink: 0 }} />
                <div>
                  Current stock is at or below the alert threshold — this product will show as Low Stock.
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer-new">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Check size={16} /> Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
