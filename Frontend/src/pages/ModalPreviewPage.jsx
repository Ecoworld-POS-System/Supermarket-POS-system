import React, { useState } from 'react';
import TopBar from '../components/TopBar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductModal from '../components/ProductModal';
import { getProducts, saveProduct } from '../services/productService';
import { getCategories } from '../services/categoryService';

const ModalPreviewPage = () => {
  const [products, setProducts] = useState(getProducts());
  const [categories] = useState(getCategories());
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleSaveProduct = (productData) => {
    const updated = saveProduct(productData);
    setProducts(updated);
    setIsModalOpen(false);
  };

  return (
    <>
      <TopBar urlPath="/products/add" moduleTitle="Product Management" />
      <Navbar />

      <main className="main-content-wrapper">
        <div className="pos-card" style={{ opacity: 0.5, filter: 'blur(0.5px)' }}>
          <div className="page-header-container">
            <h1 className="page-title">Product Management</h1>
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
              + Add New Product
            </button>
          </div>

          <div className="filter-bar">
            <input
              type="text"
              className="search-input"
              placeholder="Search by product name or barcode (SKU)..."
              disabled
            />
            <select className="select-filter" disabled>
              <option>Category Filter [ ▾ ]</option>
            </select>
          </div>

          <div className="table-responsive">
            <table className="pos-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product Name</th>
                  <th>Barcode / SKU</th>
                  <th>Brand</th>
                  <th>Price (Rs.)</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td style={{ fontWeight: '500' }}>{item.name}</td>
                    <td>{item.sku}</td>
                    <td>{item.brand || '-'}</td>
                    <td>{Number(item.price).toFixed(2)}</td>
                    <td>
                      {Number(item.stock) <= 5 ? (
                        <span className="badge badge-warning">{item.stock} (Low)</span>
                      ) : (
                        <span className="badge badge-success">{item.stock} pcs</span>
                      )}
                    </td>
                    <td>
                      <span className="btn-action-edit">[Edit]</span>
                      <span className="btn-action-del">[Del]</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        productToEdit={null}
        categories={categories}
      />

      <Footer />
    </>
  );
};

export default ModalPreviewPage;
