const INITIAL_PRODUCTS = [
  {
    id: 1,
    skuCode: "mp001",
    barcode: "4890008100039",
    name: "Basmati Rice 5kg",
    category: "Rice & Grains",
    price: 2850.00,
    stock: 6,
    lowStockThreshold: 10,
    status: "Active",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: 2,
    skuCode: "mp002",
    barcode: "4890008100046",
    name: "Samba Rice 5kg",
    category: "Rice & Grains",
    price: 2350.00,
    stock: 24,
    lowStockThreshold: 10,
    status: "Active",
    image: "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: 3,
    skuCode: "mp003",
    barcode: "9300675000019",
    name: "Anchor Butter 250g",
    category: "Dairy",
    price: 760.00,
    stock: 4,
    lowStockThreshold: 10,
    status: "Active",
    image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: 4,
    skuCode: "mp004",
    barcode: "4880361107200",
    name: "Nestlé Milk Powder 400g",
    category: "Dairy",
    price: 1490.00,
    stock: 31,
    lowStockThreshold: 10,
    status: "Active",
    image: ""
  }
];

const STORAGE_KEY = "pos_products_redesigned_data_v2";

export const getProducts = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
  return JSON.parse(data);
};

export const saveProduct = (productData) => {
  const products = getProducts();
  let updatedProducts;

  if (productData.id) {
    updatedProducts = products.map((p) =>
      p.id === Number(productData.id) ? { ...p, ...productData, id: Number(productData.id) } : p
    );
  } else {
    const nextIndex = products.length + 1;
    const newProduct = {
      ...productData,
      id: Date.now(),
      skuCode: `mp${String(nextIndex).padStart(3, '0')}`,
      price: Number(productData.price) || 0,
      stock: Number(productData.stock) || 0,
      lowStockThreshold: Number(productData.lowStockThreshold) || 10,
      status: productData.status || "Active",
      image: productData.image || ""
    };
    updatedProducts = [newProduct, ...products];
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProducts));
  return updatedProducts;
};

export const deleteProduct = (id) => {
  const products = getProducts();
  const updatedProducts = products.filter((p) => p.id !== Number(id));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProducts));
  return updatedProducts;
};
