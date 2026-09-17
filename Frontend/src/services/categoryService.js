const API_URL = 'http://localhost:5000/api/categories';

export const getCategories = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch categories');
  const categories = await res.json();
  // Map _id to id for frontend compatibility
  return categories.map((cat) => ({
    ...cat,
    id: cat._id,
    categoryId: `CAT-${cat._id.slice(-3).toUpperCase()}`,
    avatar: cat.name ? cat.name.substring(0, 2).toUpperCase() : 'CA',
    productsLinked: cat.productsLinked || 0,
    created: new Date(cat.createdAt).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
  }));
};

export const saveCategory = async (categoryData) => {
  let res;

  if (categoryData.id && categoryData.id.length === 24) {
    // Update existing category
    res = await fetch(`${API_URL}/${categoryData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: categoryData.name,
        description: categoryData.description,
        status: categoryData.status,
      }),
    });
  } else {
    // Create new category
    res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: categoryData.name,
        description: categoryData.description,
        status: categoryData.status,
      }),
    });
  }

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to save category');
  }

  // Return refreshed list
  return getCategories();
};

export const deleteCategory = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to delete category');
  }

  // Return refreshed list
  return getCategories();
};
