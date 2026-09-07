import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CategoryModal from '../components/CategoryModal';
import DeleteCategoryModal from '../components/DeleteCategoryModal';
import { getCategories, saveCategory, deleteCategory } from '../services/categoryService';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState(null);

  useEffect(() => {
    setCategories(getCategories());
  }, []);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSaveCategory = (categoryData) => {
    const updated = saveCategory(categoryData);
    setCategories(updated);
  };

  const handleOpenDeleteModal = (category) => {
    setDeleteCategoryTarget(category);
  };

  const handleConfirmDelete = (id) => {
    const updated = deleteCategory(id);
    setCategories(updated);
    setDeleteCategoryTarget(null);
  };

  // Filter categories by search
  const filteredCategories = categories.filter((item) => {
    return (
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.categoryId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const totalCount = categories.length;
  const activeCount = categories.filter((c) => c.status === 'Active').length;
  const inactiveCount = categories.filter((c) => c.status === 'Inactive').length;

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-wrapper">
        <Header currentModule="Categories" />

        <div className="content-view">
          <div className="view-header">
            <div>
              <h1 className="page-title-main">Categories</h1>
              <div className="header-summary-subtitle">
                {totalCount} total · {activeCount} active
              </div>
            </div>
            <button className="btn-primary" onClick={handleOpenAddModal}>
              <Plus size={18} /> Add New Category
            </button>
          </div>

          <div className="controls-bar">
            <div className="search-field">
              <Search className="search-icon" size={16} />
              <input
                type="text"
                placeholder="Search by name, ID, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filters-right">
              <span className="counter-label">{filteredCategories.length} categories</span>
            </div>
          </div>

          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>CATEGORY ID</th>
                  <th>CATEGORY NAME</th>
                  <th>DESCRIPTION</th>
                  <th>PRODUCTS LINKED</th>
                  <th>CREATED</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((item) => {
                    const progressPercent = Math.min((item.productsLinked / 5) * 100, 100);

                    return (
                      <tr key={item.id}>
                        <td className="sku-code">{item.categoryId}</td>
                        <td>
                          <div className="cat-avatar-box">
                            <div className="cat-avatar">{item.avatar || 'CA'}</div>
                            <span style={{ fontWeight: '600', color: '#0F172A' }}>{item.name}</span>
                          </div>
                        </td>
                        <td style={{ color: '#475569', maxWidth: '300px' }}>
                          {item.description || '-'}
                        </td>
                        <td>
                          <div className="progress-bar-container">
                            <span style={{ fontWeight: '600', color: '#334155', minWidth: '12px' }}>
                              {item.productsLinked}
                            </span>
                            {item.productsLinked > 0 && (
                              <div className="progress-track">
                                <div
                                  className="progress-fill"
                                  style={{ width: `${progressPercent}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ color: '#64748B', fontSize: '0.8125rem' }}>
                          {item.created}
                        </td>
                        <td>
                          <span className={`badge-dot ${item.status === 'Active' ? 'active' : 'inactive'}`}>
                            <span className="dot"></span> {item.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button
                              className="btn-icon-square"
                              onClick={() => handleOpenEditModal(item)}
                              title="Edit Category"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              className="btn-icon-square danger"
                              onClick={() => handleOpenDeleteModal(item)}
                              title="Delete Category"
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

            <div className="table-summary-footer">
              <div>{filteredCategories.length} of {totalCount} categories</div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <span className="badge-dot active"><span className="dot"></span> {activeCount} Active</span>
                <span className="badge-dot inactive"><span className="dot"></span> {inactiveCount} Inactive</span>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveCategory}
        categoryToEdit={editingCategory}
      />

      <DeleteCategoryModal
        isOpen={Boolean(deleteCategoryTarget)}
        onClose={() => setDeleteCategoryTarget(null)}
        onConfirm={handleConfirmDelete}
        category={deleteCategoryTarget}
      />
    </div>
  );
};

export default CategoryManagement;
