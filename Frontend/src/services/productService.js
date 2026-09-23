import { client } from './api';

const BASE = '/products';

/**
 * Fetch all products from MongoDB.
 * @returns {Promise<Array>} normalized product array
 */
export async function getProducts() {
  const { data } = await client.get(BASE);
  // Backend may return bare array or { data: [...] }
  const raw = Array.isArray(data) ? data : (data.data ?? []);
  return raw.map(normalizeProduct);
}

/**
 * Create a new product in MongoDB.
 * @param {Object} productData
 * @returns {Promise<Object>} saved product
 */
export async function createProduct(productData) {
  const payload = buildPayload(productData);
  const { data } = await client.post(BASE, payload);
  const saved = data.data ?? data;
  return normalizeProduct(saved);
}

/**
 * Update an existing product in MongoDB by ObjectId.
 * @param {string} id – MongoDB ObjectId
 * @param {Object} productData
 * @returns {Promise<Object>} updated product
 */
export async function updateProductById(id, productData) {
  const payload = buildPayload(productData);
  const { data } = await client.put(`${BASE}/${id}`, payload);
  const saved = data.data ?? data;
  return normalizeProduct(saved);
}

/**
 * Delete a product in MongoDB by ObjectId.
 * @param {string} id – MongoDB ObjectId
 */
export async function deleteProductById(id) {
  await client.delete(`${BASE}/${id}`);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildPayload(d) {
  return {
    name: d.name,
    barcode: d.barcode || '',
    sku: d.sku || d.skuCode || '',
    skuCode: d.sku || d.skuCode || '',
    category: d.category,
    costPrice: Number(d.costPrice) || 0,
    price: Number(d.price) || 0,
    stock: Number(d.stock) || 0,
    minStock: Number(d.minStock) || 5,
    minThreshold: Number(d.minStock) || 5,
    unit: d.unit || 'pcs',
    image: d.image || '',
    status: d.status || 'Active',
    supplier: d.supplier || 'General Supplier',
  };
}

function normalizeProduct(p) {
  if (!p) return p;
  return {
    ...p,
    // Always expose a stable `id` that works for cart lookups and API calls
    id: p._id?.toString() || p.id,
    _id: p._id?.toString() || p.id,
    sku: p.sku || p.skuCode || '',
    skuCode: p.skuCode || p.sku || '',
    barcode: p.barcode || '',
    costPrice: Number(p.costPrice) || 0,
    price: Number(p.price) || 0,
    stock: Number(p.stock) || 0,
    minStock: Number(p.minStock ?? p.minThreshold ?? p.lowStockThreshold) || 5,
    minThreshold: Number(p.minThreshold ?? p.minStock ?? p.lowStockThreshold) || 5,
    image: p.image || '',
    unit: p.unit || 'pcs',
    status: p.status || 'Active',
    supplier: p.supplier || 'General Supplier',
  };
}
