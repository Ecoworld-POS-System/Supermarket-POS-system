import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductModal from '../components/ProductModal';
import DeleteProductModal from '../components/DeleteProductModal';
import { getProducts, saveProduct, deleteProduct } from '../services/productService';
import { getCategories } from '../services/categoryService';
import { Search, Plus, Edit2, Trash2, Package } from 'lucide-react';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteProductTarget, setDeleteProductTarget] = useState(null);

  useEffect(() => {
    setProducts(getProducts());
    setCategories(getCategories());
  }, []);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = (productData) => {
    const updated = saveProduct(productData);
    setProducts(updated);
  };

  const handleOpenDeleteModal = (product) => {
    setDeleteProductTarget(product);
  };

  const handleConfirmDelete = (id) => {
    const updated = deleteProduct(id);
    setProducts(updated);
    setDeleteProductTarget(null);
  };

  // Filter products by search, category, and status
  const filteredProducts = products.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.skuCode.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All Categories' || item.category === selectedCategory;

    const matchesStatus =
      selectedStatus === 'All Status' || item.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate dynamic header metrics
  const totalCount = products.length;
  const activeCount = products.filter((p) => p.status === 'Active').length;
  const lowStockCount = products.filter((p) => Number(p.stock) <= Number(p.lowStockThreshold)).length;

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-wrapper">
        <Header currentModule="Products" />

        <div className="content-view">
          <div className="view-header">
            <div>
              <h1 className="page-title-main">Products</h1>
              <div className="header-summary-subtitle">
                {totalCount} total · {activeCount} active · {lowStockCount} low stock
              </div>
            </div>
            <button className="btn-primary" onClick={handleOpenAddModal}>
              <Plus size={18} /> Add New Product
            </button>
          </div>

          <div className="controls-bar">
            <div className="search-field">
              <Search className="search-icon" size={16} />
              <input
                type="text"
                placeholder="Search by name or barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filters-right">
              <select
                className="select-box"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All Categories">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id || cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <select
                className="select-box"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="All Status">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <span className="counter-label">{filteredProducts.length} products</span>
            </div>
          </div>

          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>BARCODE</th>
                  <th>PRODUCT NAME</th>
                  <th>CATEGORY</th>
                  <th>UNIT PRICE (LKR)</th>
                  <th>STOCK COUNT</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
                      No products found matching filters.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((item) => {
                    const isLowStock = Number(item.stock) <= Number(item.lowStockThreshold);
                    const formattedPrice = Number(item.price).toLocaleString('en-US', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2
                    });

                    return (
                      <tr key={item.id}>
                        <td className="barcode-text">{item.barcode}</td>
                        <td>
                          <div className="product-name-cell">
                            <div className="product-thumb-container">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="product-thumb-img"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div
                                className="product-thumb-placeholder"
                                style={{ display: item.image ? 'none' : 'flex' }}
                              >
                                <Package size={16} color="#94A3B8" />
                              </div>
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', color: '#0F172A' }}>{item.name}</div>
                              <div className="sku-code">{item.skuCode}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ color: '#475569' }}>{item.category}</td>
                        <td className="price-text">LKR {formattedPrice}</td>
                        <td>
                          {isLowStock ? (
                            <span className="badge-dot low-stock">
                              <span className="dot"></span> {item.stock} (Low)
                            </span>
                          ) : (
                            <span style={{ fontWeight: '500', color: '#334155' }}>{item.stock}</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge-dot ${item.status === 'Active' ? 'active' : 'inactive'}`}>
                            <span className="dot"></span> {item.status || 'Active'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button
                              className="btn-icon-square"
                              onClick={() => handleOpenEditModal(item)}
                              title="Edit Product"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              className="btn-icon-square danger"
                              onClick={() => handleOpenDeleteModal(item)}
                              title="Delete Product"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Footer />
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveProduct}
        productToEdit={editingProduct}
        categories={categories}
      />

      <DeleteProductModal
        isOpen={Boolean(deleteProductTarget)}
        onClose={() => setDeleteProductTarget(null)}
        onConfirm={handleConfirmDelete}
        product={deleteProductTarget}
      />
    </div>
  );
};

export default ProductManagement;
