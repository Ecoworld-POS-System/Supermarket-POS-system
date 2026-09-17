const API_URL = 'http://localhost:5000/api/products';

export const getProducts = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch products');
  const products = await res.json();
  // Map _id to id for frontend compatibility
  return products.map((p) => ({
    ...p,
    id: p._id,
  }));
};

export const saveProduct = async (productData) => {
  let res;

  if (productData.id && productData.id.length === 24) {
    // Update existing product
    res = await fetch(`${API_URL}/${productData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: productData.name,
        barcode: productData.barcode,
        category: productData.category,
        price: Number(productData.price) || 0,
        stock: Number(productData.stock) || 0,
        lowStockThreshold: Number(productData.lowStockThreshold) || 10,
        status: productData.status || 'Active',
        image: productData.image || '',
      }),
    });
  } else {
    // Create new product
    res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: productData.name,
        barcode: productData.barcode,
        category: productData.category,
        price: Number(productData.price) || 0,
        stock: Number(productData.stock) || 0,
        lowStockThreshold: Number(productData.lowStockThreshold) || 10,
        status: productData.status || 'Active',
        image: productData.image || '',
      }),
    });
  }

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to save product');
  }

  // Return refreshed list
  return getProducts();
};

export const deleteProduct = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to delete product');
  }

  // Return refreshed list
  return getProducts();
};
