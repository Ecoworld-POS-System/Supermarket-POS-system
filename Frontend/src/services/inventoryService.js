import { client } from './api';

/**
 * Fetch all inventory items with stock counts, min reorder thresholds, categories, and suppliers.
 * @returns {Promise<Array>} array of inventory items
 */
export async function fetchInventory() {
  const { data } = await client.get('/inventory');
  return data.data ?? data;
}

/**
 * Fetch low stock alerts (items where stock <= minThreshold).
 * @returns {Promise<Array>} array of low stock items
 */
export async function fetchLowStockAlerts() {
  const { data } = await client.get('/inventory/alerts');
  return data.data ?? data;
}

/**
 * Restock an inventory product by adding a specified stock quantity.
 * @param {string} id - Product ObjectId or custom ID
 * @param {number} addedStock - Quantity to add
 * @returns {Promise<Object>} updated product document
 */
export async function restockProduct(id, addedStock) {
  const { data } = await client.put(`/inventory/${id}/restock`, {
    addedStock: Number(addedStock),
  });
  return data.data ?? data;
}
