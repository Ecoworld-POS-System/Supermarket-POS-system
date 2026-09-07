const INITIAL_CATEGORIES = [
  {
    id: 1,
    categoryId: "CAT-003",
    avatar: "BE",
    name: "Beverages",
    description: "Soft drinks, juices, malt beverages, energy drinks, and powdered drink mixes for all age groups.",
    productsLinked: 3,
    created: "01 Jan 2024",
    status: "Active"
  },
  {
    id: 2,
    categoryId: "CAT-006",
    avatar: "PE",
    name: "Personal Care",
    description: "Soaps, toothpaste, shampoo, deodorants, and hygiene products for daily personal grooming.",
    productsLinked: 2,
    created: "01 Mar 2024",
    status: "Active"
  },
  {
    id: 3,
    categoryId: "CAT-008",
    avatar: "FR",
    name: "Frozen Foods",
    description: "Frozen ready meals, ice cream, frozen vegetables, and other temperature-controlled food products.",
    productsLinked: 0,
    created: "10 Apr 2024",
    status: "Inactive"
  }
];

const STORAGE_KEY = "pos_categories_redesigned_data";

export const getCategories = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CATEGORIES));
    return INITIAL_CATEGORIES;
  }
  return JSON.parse(data);
};

export const saveCategory = (categoryData) => {
  const categories = getCategories();
  let updatedCategories;

  if (categoryData.id) {
    updatedCategories = categories.map((c) =>
      c.id === Number(categoryData.id) ? { ...c, ...categoryData, id: Number(categoryData.id) } : c
    );
  } else {
    const avatar = categoryData.name ? categoryData.name.substring(0, 2).toUpperCase() : "CA";
    const newCategory = {
      ...categoryData,
      id: Date.now(),
      categoryId: `CAT-${String(categories.length + 10).padStart(3, '0')}`,
      avatar: avatar,
      productsLinked: 0,
      created: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: categoryData.status || "Active"
    };
    updatedCategories = [...categories, newCategory];
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCategories));
  return updatedCategories;
};

export const deleteCategory = (id) => {
  const categories = getCategories();
  const updatedCategories = categories.filter((c) => c.id !== Number(id));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCategories));
  return updatedCategories;
};
