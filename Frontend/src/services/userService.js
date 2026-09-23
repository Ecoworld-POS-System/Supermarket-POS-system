import { client } from './api';

const BASE = '/users';

/**
 * Fetch all users from MongoDB.
 * @returns {Promise<Array>} list of users
 */
export async function getUsers() {
  const { data } = await client.get(BASE);
  const raw = Array.isArray(data) ? data : (data.data ?? []);
  return raw.map(normalizeUser);
}

/**
 * Create a new user document in MongoDB.
 * @param {Object} userData
 * @returns {Promise<Object>} saved user document
 */
export async function createUser(userData) {
  const payload = buildUserPayload(userData);
  const { data } = await client.post(BASE, payload);
  const saved = data.data ?? data;
  return normalizeUser(saved);
}

/**
 * Update an existing user in MongoDB by id / empId.
 * @param {string} id
 * @param {Object} userData
 * @returns {Promise<Object>} updated user
 */
export async function updateUser(id, userData) {
  const payload = buildUserPayload(userData);
  const { data } = await client.put(`${BASE}/${id}`, payload);
  const saved = data.data ?? data;
  return normalizeUser(saved);
}

/**
 * Toggle user active/inactive status in MongoDB.
 * @param {string} id
 * @returns {Promise<Object>} updated user
 */
export async function toggleUserStatus(id) {
  const { data } = await client.patch(`${BASE}/${id}/status`);
  const saved = data.data ?? data;
  return normalizeUser(saved);
}

/**
 * Delete a user from MongoDB.
 * @param {string} id
 */
export async function deleteUser(id) {
  await client.delete(`${BASE}/${id}`);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildUserPayload(d) {
  return {
    id: d.id || d.empId,
    empId: d.empId || d.id,
    name: d.name,
    email: d.email,
    phone: d.phone || '',
    role: d.role || 'Cashier',
    branch: d.branch || 'Colombo – Head Office',
    status: d.status || 'Active',
    password: d.password || 'admin123',
    lastLogin: d.lastLogin || 'Never logged in',
  };
}

function normalizeUser(u) {
  if (!u) return u;
  const userObj = typeof u.toObject === 'function' ? u.toObject() : u;
  const targetId = userObj.id || userObj.empId || (userObj._id ? userObj._id.toString() : '');
  return {
    ...userObj,
    id: targetId,
    empId: userObj.empId || targetId,
    name: userObj.name || '',
    email: userObj.email || '',
    phone: userObj.phone || '',
    role: userObj.role || 'Cashier',
    branch: userObj.branch || 'Colombo – Head Office',
    status: userObj.status || 'Active',
    lastLogin: userObj.lastLogin || 'Never logged in',
  };
}
