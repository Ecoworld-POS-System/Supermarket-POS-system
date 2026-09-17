// ============================================================================
// EGOTECH WORLD - SUPERMART POS & RETAIL SYSTEM MOCK DATA
// ============================================================================

export const ROLES = ["Admin", "Manager", "Cashier", "Supervisor", "Inventory Staff"];

export const BRANCHES = [
  "Colombo – Head Office",
  "Kandy Branch",
  "Galle Branch",
  "Negombo Branch",
  "Matara Branch",
];

export const ROLE_STYLES = {
  Admin: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200",
  Manager: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200",
  Cashier: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  Supervisor: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  "Inventory Staff": "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200",
};

export const INITIAL_USERS = [
  {
    id: "EMP-001",
    name: "Administrator",
    email: "admin@egotechworld.com",
    phone: "+94 77 123 4567",
    role: "Admin",
    branch: "Colombo – Head Office",
    status: "Active",
    lastLogin: "13 Aug 2026, 08:14 AM",
  },
  {
    id: "EMP-002",
    name: "Sachini Madushani",
    email: "sachini@egotechworld.com",
    phone: "+94 71 892 3411",
    role: "Cashier",
    branch: "Colombo – Head Office",
    status: "Active",
    lastLogin: "13 Aug 2026, 09:03 AM",
  },
  {
    id: "EMP-003",
    name: "Raveendra Kumara",
    email: "raveendra@egotechworld.com",
    phone: "+94 76 543 2198",
    role: "Cashier",
    branch: "Colombo – Head Office",
    status: "Active",
    lastLogin: "13 Aug 2026, 09:15 AM",
  },
  {
    id: "EMP-004",
    name: "Malith Abeysekara",
    email: "malith@egotechworld.com",
    phone: "+94 77 334 5566",
    role: "Cashier",
    branch: "Colombo – Head Office",
    status: "Active",
    lastLogin: "12 Aug 2026, 08:45 AM",
  },
  {
    id: "EMP-005",
    name: "Priyanka Jayasinghe",
    email: "priyanka@egotechworld.com",
    phone: "+94 70 998 8776",
    role: "Manager",
    branch: "Kandy Branch",
    status: "Active",
    lastLogin: "13 Aug 2026, 10:30 AM",
  },
  {
    id: "EMP-006",
    name: "Nuwan Dissanayake",
    email: "nuwan@egotechworld.com",
    phone: "+94 72 445 6677",
    role: "Supervisor",
    branch: "Kandy Branch",
    status: "Active",
    lastLogin: "12 Aug 2026, 07:00 PM",
  },
  {
    id: "EMP-007",
    name: "Dilsha Fernando",
    email: "dilsha@egotechworld.com",
    phone: "+94 78 112 3344",
    role: "Cashier",
    branch: "Kandy Branch",
    status: "Inactive",
    lastLogin: "01 Jul 2026, 02:11 PM",
  },
  {
    id: "EMP-008",
    name: "Sithara Rodrigo",
    email: "sithara@egotechworld.com",
    phone: "+94 75 667 8899",
    role: "Inventory Staff",
    branch: "Galle Branch",
    status: "Active",
    lastLogin: "13 Aug 2026, 07:55 AM",
  },
  {
    id: "EMP-009",
    name: "Gayan Wickramasinghe",
    email: "gayan@egotechworld.com",
    phone: "+94 77 889 9001",
    role: "Cashier",
    branch: "Galle Branch",
    status: "Active",
    lastLogin: "13 Aug 2026, 08:40 AM",
  },
];

export const INITIAL_CATEGORIES = [
  { id: "CAT-01", name: "Groceries & Staples", code: "GROC", color: "from-amber-500 to-amber-600", itemCount: 12 },
  { id: "CAT-02", name: "Dairy & Eggs", code: "DAIR", color: "from-blue-500 to-blue-600", itemCount: 8 },
  { id: "CAT-03", name: "Beverages", code: "BEV", color: "from-emerald-500 to-emerald-600", itemCount: 10 },
  { id: "CAT-04", name: "Bakery & Confectionery", code: "BAKE", color: "from-orange-500 to-orange-600", itemCount: 9 },
  { id: "CAT-05", name: "Snacks & Munchies", code: "SNAK", color: "from-pink-500 to-pink-600", itemCount: 14 },
  { id: "CAT-06", name: "Household & Cleaning", code: "HOUS", color: "from-purple-500 to-purple-600", itemCount: 6 },
  { id: "CAT-07", name: "Personal Care", code: "PERS", color: "from-teal-500 to-teal-600", itemCount: 7 },
];

export const INITIAL_PRODUCTS = [
  {
    id: "PRD-101",
    barcode: "890123450001",
    sku: "GROC-001",
    name: "Keeri Samba Rice 5kg",
    category: "Groceries & Staples",
    costPrice: 1250.00,
    price: 1480.00,
    stock: 45,
    minStock: 15,
    unit: "pack",
    supplier: "Ceylon Agro Ltd",
    image: "🍚"
  },
  {
    id: "PRD-102",
    barcode: "890123450002",
    sku: "GROC-002",
    name: "Nadu Premium Rice 5kg",
    category: "Groceries & Staples",
    costPrice: 1100.00,
    price: 1290.00,
    stock: 32,
    minStock: 10,
    unit: "pack",
    supplier: "Ceylon Agro Ltd",
    image: "🌾"
  },
  {
    id: "PRD-103",
    barcode: "890123450003",
    sku: "GROC-003",
    name: "Refined White Sugar 1kg",
    category: "Groceries & Staples",
    costPrice: 240.00,
    price: 275.00,
    stock: 4, // LOW STOCK
    minStock: 15,
    unit: "kg",
    supplier: "Ceylon Sugar Corp",
    image: "🧂"
  },
  {
    id: "PRD-104",
    barcode: "890123450004",
    sku: "GROC-004",
    name: "Fortified Wheat Flour 1kg",
    category: "Groceries & Staples",
    costPrice: 190.00,
    price: 220.00,
    stock: 58,
    minStock: 20,
    unit: "kg",
    supplier: "Prima Lanka",
    image: "🥡"
  },
  {
    id: "PRD-105",
    barcode: "890123450005",
    sku: "DAIR-001",
    name: "Anchor Full Cream Milk Powder 400g",
    category: "Dairy & Eggs",
    costPrice: 940.00,
    price: 1080.00,
    stock: 3, // LOW STOCK
    minStock: 12,
    unit: "pack",
    supplier: "Fonterra Brands",
    image: "🥛"
  },
  {
    id: "PRD-106",
    barcode: "890123450006",
    sku: "DAIR-002",
    name: "Kotmale Fresh Milk Bottle 1L",
    category: "Dairy & Eggs",
    costPrice: 420.00,
    price: 490.00,
    stock: 24,
    minStock: 10,
    unit: "bottle",
    supplier: "Cargills Quality Dairies",
    image: "🍼"
  },
  {
    id: "PRD-107",
    barcode: "890123450007",
    sku: "DAIR-003",
    name: "Highland Salted Butter 200g",
    category: "Dairy & Eggs",
    costPrice: 650.00,
    price: 760.00,
    stock: 18,
    minStock: 8,
    unit: "pack",
    supplier: "Milco Sri Lanka",
    image: "🧈"
  },
  {
    id: "PRD-108",
    barcode: "890123450008",
    sku: "DAIR-004",
    name: "Fresh Farm Eggs (Pack of 10)",
    category: "Dairy & Eggs",
    costPrice: 380.00,
    price: 440.00,
    stock: 2, // LOW STOCK
    minStock: 10,
    unit: "pack",
    supplier: "Bairaha Farms",
    image: "🥚"
  },
  {
    id: "PRD-109",
    barcode: "890123450009",
    sku: "BEV-001",
    name: "Dilmah Premium Ceylon Tea 200g",
    category: "Beverages",
    costPrice: 520.00,
    price: 640.00,
    stock: 40,
    minStock: 15,
    unit: "box",
    supplier: "Dilmah Ceylon Tea",
    image: "🍵"
  },
  {
    id: "PRD-110",
    barcode: "890123450010",
    sku: "BEV-002",
    name: "Nescafe Classic Instant Coffee 100g",
    category: "Beverages",
    costPrice: 890.00,
    price: 1050.00,
    stock: 22,
    minStock: 10,
    unit: "jar",
    supplier: "Nestlé Lanka",
    image: "☕"
  },
  {
    id: "PRD-111",
    barcode: "890123450011",
    sku: "BEV-003",
    name: "Elephant House Cream Soda 1.5L",
    category: "Beverages",
    costPrice: 310.00,
    price: 380.00,
    stock: 35,
    minStock: 12,
    unit: "bottle",
    supplier: "Ceylon Cold Stores",
    image: "🥤"
  },
  {
    id: "PRD-112",
    barcode: "890123450012",
    sku: "BAKE-001",
    name: "Prima Sandwich Crust Bread 450g",
    category: "Bakery & Confectionery",
    costPrice: 170.00,
    price: 210.00,
    stock: 28,
    minStock: 10,
    unit: "loaf",
    supplier: "Prima Bakery",
    image: "🍞"
  },
  {
    id: "PRD-113",
    barcode: "890123450013",
    sku: "BAKE-002",
    name: "Maliban Cream Cracker 500g",
    category: "Bakery & Confectionery",
    costPrice: 420.00,
    price: 490.00,
    stock: 50,
    minStock: 15,
    unit: "pack",
    supplier: "Maliban Biscuit Manufactories",
    image: "🍪"
  },
  {
    id: "PRD-114",
    barcode: "890123450014",
    sku: "BAKE-003",
    name: "Munchee Chocolate Puff 200g",
    category: "Bakery & Confectionery",
    costPrice: 190.00,
    price: 230.00,
    stock: 42,
    minStock: 15,
    unit: "pack",
    supplier: "Ceylon Biscuits Ltd",
    image: "🍫"
  },
  {
    id: "PRD-115",
    barcode: "890123450015",
    sku: "SNAK-001",
    name: "Mister Potato Crisps Original 130g",
    category: "Snacks & Munchies",
    costPrice: 480.00,
    price: 580.00,
    stock: 20,
    minStock: 8,
    unit: "can",
    supplier: "Mamee Lanka",
    image: "🥔"
  },
  {
    id: "PRD-116",
    barcode: "890123450016",
    sku: "HOUS-001",
    name: "Sunlight Washing Powder 1kg",
    category: "Household & Cleaning",
    costPrice: 410.00,
    price: 490.00,
    stock: 1, // LOW STOCK (Total low stock = 4: Sugar, Anchor, Eggs, Sunlight)
    minStock: 12,
    unit: "pack",
    supplier: "Unilever Sri Lanka",
    image: "🧼"
  },
  {
    id: "PRD-117",
    barcode: "890123450017",
    sku: "HOUS-002",
    name: "Vim Dishwash Liquid Lemon 500ml",
    category: "Household & Cleaning",
    costPrice: 320.00,
    price: 390.00,
    stock: 19,
    minStock: 8,
    unit: "bottle",
    supplier: "Unilever Sri Lanka",
    image: "🧴"
  },
  {
    id: "PRD-118",
    barcode: "890123450018",
    sku: "PERS-001",
    name: "Dettol Original Anti-Bacterial Soap 100g",
    category: "Personal Care",
    costPrice: 160.00,
    price: 195.00,
    stock: 64,
    minStock: 20,
    unit: "bar",
    supplier: "Reckitt Benckiser",
    image: "🫧"
  },
  {
    id: "PRD-119",
    barcode: "890123450019",
    sku: "PERS-002",
    name: "Signal Strong Teeth Toothpaste 160g",
    category: "Personal Care",
    costPrice: 260.00,
    price: 310.00,
    stock: 38,
    minStock: 15,
    unit: "tube",
    supplier: "Unilever Sri Lanka",
    image: "🪥"
  },
  {
    id: "PRD-120",
    barcode: "890123450020",
    sku: "BEV-004",
    name: "Milo Malt Chocolate Energy Drink 180ml",
    category: "Beverages",
    costPrice: 140.00,
    price: 170.00,
    stock: 48,
    minStock: 15,
    unit: "pack",
    supplier: "Nestlé Lanka",
    image: "🧃"
  }
];

export const INITIAL_BILLS = [
  {
    id: "INV-2026-08101",
    date: "13 Aug 2026, 09:12 AM",
    branch: "Colombo – Head Office",
    cashierId: "EMP-002",
    cashierName: "Sachini Madushani",
    customerName: "Walk-in Customer",
    items: [
      { id: "PRD-101", name: "Keeri Samba Rice 5kg", price: 1480.00, qty: 1, total: 1480.00 },
      { id: "PRD-106", name: "Kotmale Fresh Milk Bottle 1L", price: 490.00, qty: 2, total: 980.00 },
      { id: "PRD-113", name: "Maliban Cream Cracker 500g", price: 490.00, qty: 1, total: 490.00 },
    ],
    subtotal: 2950.00,
    discount: 100.00,
    tax: 71.25,
    total: 2921.25,
    amountTendered: 3000.00,
    changeGiven: 78.75,
    paymentMethod: "Cash",
    status: "Completed",
  },
  {
    id: "INV-2026-08102",
    date: "13 Aug 2026, 09:28 AM",
    branch: "Colombo – Head Office",
    cashierId: "EMP-003",
    cashierName: "Raveendra Kumara",
    customerName: "Kasun Jayawardena",
    items: [
      { id: "PRD-109", name: "Dilmah Premium Ceylon Tea 200g", price: 640.00, qty: 2, total: 1280.00 },
      { id: "PRD-114", name: "Munchee Chocolate Puff 200g", price: 230.00, qty: 3, total: 690.00 },
      { id: "PRD-118", name: "Dettol Original Soap 100g", price: 195.00, qty: 4, total: 780.00 },
    ],
    subtotal: 2750.00,
    discount: 0.00,
    tax: 68.75,
    total: 2818.75,
    amountTendered: 2818.75,
    changeGiven: 0.00,
    paymentMethod: "Card",
    status: "Completed",
  },
  {
    id: "INV-2026-08103",
    date: "13 Aug 2026, 10:04 AM",
    branch: "Colombo – Head Office",
    cashierId: "EMP-002",
    cashierName: "Sachini Madushani",
    customerName: "Nimal Perera",
    items: [
      { id: "PRD-107", name: "Highland Salted Butter 200g", price: 760.00, qty: 1, total: 760.00 },
      { id: "PRD-112", name: "Prima Sandwich Crust Bread 450g", price: 210.00, qty: 2, total: 420.00 },
      { id: "PRD-120", name: "Milo Malt Chocolate Energy Drink 180ml", price: 170.00, qty: 4, total: 680.00 },
    ],
    subtotal: 1860.00,
    discount: 50.00,
    tax: 45.25,
    total: 1855.25,
    amountTendered: 2000.00,
    changeGiven: 144.75,
    paymentMethod: "Cash",
    status: "Completed",
  },
  {
    id: "INV-2026-08098",
    date: "12 Aug 2026, 05:40 PM",
    branch: "Kandy Branch",
    cashierId: "EMP-006",
    cashierName: "Nuwan Dissanayake",
    customerName: "Walk-in Customer",
    items: [
      { id: "PRD-115", name: "Mister Potato Crisps Original 130g", price: 580.00, qty: 2, total: 1160.00 },
      { id: "PRD-111", name: "Elephant House Cream Soda 1.5L", price: 380.00, qty: 2, total: 760.00 },
    ],
    subtotal: 1920.00,
    discount: 0.00,
    tax: 48.00,
    total: 1968.00,
    amountTendered: 1968.00,
    changeGiven: 0.00,
    paymentMethod: "LankaQR",
    status: "Completed",
  },
  {
    id: "INV-2026-08095",
    date: "12 Aug 2026, 03:15 PM",
    branch: "Galle Branch",
    cashierId: "EMP-009",
    cashierName: "Gayan Wickramasinghe",
    customerName: "Ruwan Senanayake",
    items: [
      { id: "PRD-102", name: "Nadu Premium Rice 5kg", price: 1290.00, qty: 2, total: 2580.00 },
      { id: "PRD-104", name: "Fortified Wheat Flour 1kg", price: 220.00, qty: 3, total: 660.00 },
      { id: "PRD-119", name: "Signal Strong Teeth Toothpaste 160g", price: 310.00, qty: 2, total: 620.00 },
    ],
    subtotal: 3860.00,
    discount: 150.00,
    tax: 92.75,
    total: 3802.75,
    amountTendered: 4000.00,
    changeGiven: 197.25,
    paymentMethod: "Cash",
    status: "Completed",
  }
];

export const INITIAL_SUPPLIERS = [
  { id: "SUP-01", name: "Ceylon Agro Ltd", contact: "+94 11 234 5678", email: "orders@ceylonagro.lk", categories: "Grains & Staples" },
  { id: "SUP-02", name: "Fonterra Brands Lanka", contact: "+94 11 456 7890", email: "sales@fonterra.com", categories: "Dairy Products" },
  { id: "SUP-03", name: "Ceylon Cold Stores PLC", contact: "+94 11 789 0123", email: "distribution@elephanthouse.lk", categories: "Beverages & Ice Creams" },
  { id: "SUP-04", name: "Unilever Sri Lanka", contact: "+94 11 987 6543", email: "retail@unilever.com", categories: "Home & Personal Care" },
  { id: "SUP-05", name: "Maliban Biscuit Manufactories", contact: "+94 11 345 6789", email: "info@malibanbiscuit.com", categories: "Biscuits & Bakery" },
];

export function genEmpId(existing) {
  const nums = existing.map((u) => {
    const parts = u.id.split("-");
    return parts.length > 1 ? parseInt(parts[1], 10) || 0 : 0;
  });
  const next = Math.max(0, ...nums) + 1;
  return `EMP-${String(next).padStart(3, "0")}`;
}

export function genPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 10; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function genInvoiceNumber(bills) {
  const nums = bills.map((b) => {
    const match = b.id.match(/\d+$/);
    return match ? parseInt(match[0], 10) : 8000;
  });
  const next = Math.max(8100, ...nums) + 1;
  return `INV-2026-${String(next).padStart(5, "0")}`;
}
