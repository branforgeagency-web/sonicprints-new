/* Demo data for the dashboard UI — replace with API calls once a backend exists. */

export type OrderStatus = "Pending" | "Processing" | "Delivered";

export interface Order {
  id: string;
  customer: string;
  product: string;
  qty: number;
  amount: number;
  status: OrderStatus;
  date: string;
}

export interface Customer {
  id: string;
  name: string;
  type: "B2B" | "B2C";
  contact: string;
  phone: string;
  email: string;
  address: string;
  area: string;
  city: string;
  pincode: string;
  state: string;
  country: string;
  /** SonicPrints branch that handles this customer. */
  branch: string;
  since: string;
  orders: number;
  spent: number;
}

export const STATS = [
  { label: "Today Orders", value: 18450, icon: "layers", tone: "bg-[#bd5501]" },
  { label: "Yesterday Orders", value: 26300, icon: "layers", tone: "bg-[#d9731a]" },
  { label: "This Month", value: 312800, icon: "cart", tone: "bg-[#0f6b3e]" },
  { label: "Last Month", value: 287450, icon: "card", tone: "bg-[#1d4a33]" },
  { label: "All-Time Sales", value: 5854623.34, icon: "card", tone: "bg-[#001408] ring-1 ring-[#bd5501]/60" },
] as const;

export const ORDER_COUNTS = {
  total: 122,
  pending: 53,
  pendingAmount: 247565.67,
  processing: 19,
  delivered: 50,
};

export const WEEK = [
  { day: "Mon", sales: 32400, orders: 14 },
  { day: "Tue", sales: 41800, orders: 19 },
  { day: "Wed", sales: 28600, orders: 11 },
  { day: "Thu", sales: 52300, orders: 23 },
  { day: "Fri", sales: 47100, orders: 21 },
  { day: "Sat", sales: 61900, orders: 27 },
  { day: "Sun", sales: 18450, orders: 8 },
];

export const BEST_SELLERS = [
  { name: "Business Cards", units: 4200, color: "#bd5501" },
  { name: "Custom Mugs", units: 1850, color: "#0f6b3e" },
  { name: "Printed T-Shirts", units: 1420, color: "#e9a23b" },
  { name: "Packaging Boxes", units: 960, color: "#3f8f6b" },
  { name: "Roll-up Banners", units: 540, color: "#8a3d00" },
  { name: "Tote Bags", units: 410, color: "#9fb8a8" },
];

const BASE_ORDERS: Order[] = [
  { id: "SP-24118", customer: "Kovai Bakes", product: "Packaging Boxes", qty: 500, amount: 21500, status: "Processing", date: "21 Oct 2026" },
  { id: "SP-24117", customer: "Priya R", product: "Custom Mugs", qty: 12, amount: 3480, status: "Pending", date: "21 Oct 2026" },
  { id: "SP-24116", customer: "Nila Textiles", product: "Printed T-Shirts", qty: 150, amount: 44850, status: "Pending", date: "20 Oct 2026" },
  { id: "SP-24115", customer: "Arvind S", product: "Business Cards", qty: 1000, amount: 1450, status: "Delivered", date: "20 Oct 2026" },
  { id: "SP-24114", customer: "GreenLeaf Cafe", product: "Tote Bags", qty: 200, amount: 27800, status: "Processing", date: "19 Oct 2026" },
  { id: "SP-24113", customer: "TechNova Pvt Ltd", product: "Roll-up Banners", qty: 6, amount: 10200, status: "Delivered", date: "19 Oct 2026" },
  { id: "SP-24112", customer: "Meena K", product: "Notebooks", qty: 40, amount: 6200, status: "Delivered", date: "18 Oct 2026" },
  { id: "SP-24111", customer: "Royal Weddings", product: "Stickers", qty: 2000, amount: 5400, status: "Pending", date: "18 Oct 2026" },
];

// Older demo orders so the table has a few pages to browse.
const NAMES = ["Kovai Bakes", "Nila Textiles", "TechNova Pvt Ltd", "GreenLeaf Cafe", "Priya R", "Arvind S", "Meena K", "Royal Weddings", "Sri Lakshmi Silks", "Brew & Co"];
const ITEMS: [string, number][] = [["Business Cards", 1.45], ["Custom Mugs", 290], ["Printed T-Shirts", 299], ["Packaging Boxes", 43], ["Roll-up Banners", 1700], ["Tote Bags", 139], ["Notebooks", 155], ["Stickers", 2.7]];
const STATUSES: OrderStatus[] = ["Delivered", "Delivered", "Processing", "Pending", "Delivered"];

export const ORDERS: Order[] = [
  ...BASE_ORDERS,
  ...Array.from({ length: 34 }, (_, i): Order => {
    const [product, price] = ITEMS[(i * 3) % ITEMS.length]!;
    const qty = [25, 50, 100, 250, 500, 1000][(i * 5) % 6]!;
    return {
      id: `SP-${24110 - i}`,
      customer: NAMES[(i * 7) % NAMES.length]!,
      product,
      qty,
      amount: Math.round(qty * price),
      status: STATUSES[i % STATUSES.length]!,
      date: `${17 - Math.floor(i / 3)} Oct 2026`,
    };
  }),
];

export const CUSTOMERS: Customer[] = [
  { id: "C01", name: "Kovai Bakes", type: "B2B", contact: "Ramesh Kumar", phone: "+91 98430 11223", email: "orders@kovaibakes.in", address: "42, Sathy Road", area: "Ganapathy", city: "Coimbatore", pincode: "641006", state: "Tamil Nadu", country: "India", branch: "Gandhipuram HQ", since: "Mar 2024", orders: 14, spent: 186400 },
  { id: "C02", name: "Nila Textiles", type: "B2B", contact: "Nila Sundaram", phone: "+91 90034 55678", email: "purchase@nilatextiles.com", address: "7, Near Town Hall", area: "Kumaran Road", city: "Tiruppur", pincode: "641601", state: "Tamil Nadu", country: "India", branch: "Tiruppur", since: "Jan 2024", orders: 9, spent: 241900 },
  { id: "C03", name: "TechNova Pvt Ltd", type: "B2B", contact: "Vivek Anand", phone: "+91 99448 77120", email: "admin@technova.io", address: "3rd Floor, Tidel Park, Elcot SEZ", area: "Peelamedu", city: "Coimbatore", pincode: "641004", state: "Tamil Nadu", country: "India", branch: "Peelamedu", since: "Aug 2024", orders: 6, spent: 98750 },
  { id: "C04", name: "GreenLeaf Cafe", type: "B2B", contact: "Fathima Rasheed", phone: "+91 97900 33441", email: "hello@greenleafcafe.in", address: "18, Race Course Road", area: "Race Course", city: "Coimbatore", pincode: "641018", state: "Tamil Nadu", country: "India", branch: "RS Puram", since: "Nov 2024", orders: 5, spent: 64300 },
  { id: "C05", name: "Sri Lakshmi Silks", type: "B2B", contact: "Lakshmi Narayanan", phone: "+91 94430 66120", email: "store@srilakshmisilks.com", address: "55, Brough Road", area: "Brough Road", city: "Erode", pincode: "638001", state: "Tamil Nadu", country: "India", branch: "Erode", since: "Jun 2025", orders: 4, spent: 152600 },
  { id: "C06", name: "Brew & Co", type: "B2B", contact: "Aditya Rao", phone: "+91 98946 70032", email: "team@brewandco.in", address: "9, Edappally Bypass", area: "Edappally", city: "Kochi", pincode: "682024", state: "Kerala", country: "India", branch: "Kochi", since: "Feb 2026", orders: 3, spent: 41200 },
  { id: "C07", name: "Royal Weddings", type: "B2B", contact: "Saranya Mohan", phone: "+91 90955 21890", email: "events@royalweddings.in", address: "11, DB Road", area: "RS Puram", city: "Coimbatore", pincode: "641002", state: "Tamil Nadu", country: "India", branch: "RS Puram", since: "Sep 2025", orders: 6, spent: 38900 },
  { id: "C08", name: "Priya R", type: "B2C", contact: "Priya R", phone: "+91 94421 88990", email: "priya.r@gmail.com", address: "21, Bharathi Park Road", area: "Gandhipuram", city: "Coimbatore", pincode: "641012", state: "Tamil Nadu", country: "India", branch: "Gandhipuram HQ", since: "Jul 2025", orders: 3, spent: 7420 },
  { id: "C09", name: "Arvind S", type: "B2C", contact: "Arvind S", phone: "+91 98945 22110", email: "arvind.s@outlook.com", address: "4, Avinashi Road", area: "Peelamedu", city: "Coimbatore", pincode: "641004", state: "Tamil Nadu", country: "India", branch: "Peelamedu", since: "Oct 2025", orders: 2, spent: 2900 },
  { id: "C10", name: "Meena K", type: "B2C", contact: "Meena K", phone: "+91 96550 44781", email: "meena.k@yahoo.com", address: "16, NSR Road", area: "Saibaba Colony", city: "Coimbatore", pincode: "641011", state: "Tamil Nadu", country: "India", branch: "RS Puram", since: "Apr 2026", orders: 2, spent: 9100 },
];

export interface Employee {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  department: string;
  branch: string;
  area: string;
  location: string;
  address: string;
  state: string;
  country: string;
  active: boolean;
}

export const EMPLOYEES: Employee[] = [
  { id: "E01", name: "Arun Kumar", username: "arun.k", email: "arun.k@sonicprints.in", phone: "+91 98430 12001", department: "Printing", branch: "Gandhipuram HQ", area: "Gandhipuram", location: "Coimbatore", address: "14, Cross Cut Road", state: "Tamil Nadu", country: "India", active: true },
  { id: "E02", name: "Divya Ramesh", username: "divya.r", email: "divya.r@sonicprints.in", phone: "+91 98430 12002", department: "Design", branch: "Gandhipuram HQ", area: "Gandhipuram", location: "Coimbatore", address: "22, 100 Feet Road", state: "Tamil Nadu", country: "India", active: true },
  { id: "E03", name: "Karthik S", username: "karthik.s", email: "karthik.s@sonicprints.in", phone: "+91 98430 12003", department: "Sales", branch: "RS Puram", area: "RS Puram", location: "Coimbatore", address: "5, DB Road", state: "Tamil Nadu", country: "India", active: true },
  { id: "E04", name: "Priya Natarajan", username: "priya.n", email: "priya.n@sonicprints.in", phone: "+91 98430 12004", department: "Accounts", branch: "Gandhipuram HQ", area: "Gandhipuram", location: "Coimbatore", address: "8, Sathy Road", state: "Tamil Nadu", country: "India", active: true },
  { id: "E05", name: "Manoj V", username: "manoj.v", email: "manoj.v@sonicprints.in", phone: "+91 98430 12005", department: "Delivery", branch: "Peelamedu", area: "Peelamedu", location: "Coimbatore", address: "31, Avinashi Road", state: "Tamil Nadu", country: "India", active: false },
  { id: "E06", name: "Sowmya L", username: "sowmya.l", email: "sowmya.l@sonicprints.in", phone: "+91 98430 12006", department: "Finishing", branch: "Tiruppur", area: "Kumaran Road", location: "Tiruppur", address: "12, Kumaran Road", state: "Tamil Nadu", country: "India", active: true },
  { id: "E07", name: "Vignesh P", username: "vignesh.p", email: "vignesh.p@sonicprints.in", phone: "+91 98430 12007", department: "Printing", branch: "Tiruppur", area: "Avinashi", location: "Tiruppur", address: "3, PN Road", state: "Tamil Nadu", country: "India", active: true },
  { id: "E08", name: "Anitha M", username: "anitha.m", email: "anitha.m@sonicprints.in", phone: "+91 98430 12008", department: "Design", branch: "Erode", area: "Perundurai Road", location: "Erode", address: "47, Perundurai Road", state: "Tamil Nadu", country: "India", active: false },
  { id: "E09", name: "Rahul Menon", username: "rahul.m", email: "rahul.m@sonicprints.in", phone: "+91 98470 12009", department: "Sales", branch: "Kochi", area: "Edappally", location: "Kochi", address: "9, NH 66 Bypass", state: "Kerala", country: "India", active: true },
  { id: "E10", name: "Lakshmi Iyer", username: "lakshmi.i", email: "lakshmi.i@sonicprints.in", phone: "+91 98430 12010", department: "Customer Care", branch: "Gandhipuram HQ", area: "Gandhipuram", location: "Coimbatore", address: "14, Cross Cut Road", state: "Tamil Nadu", country: "India", active: true },
  { id: "E11", name: "Suresh B", username: "suresh.b", email: "suresh.b@sonicprints.in", phone: "+91 98430 12011", department: "Finishing", branch: "Peelamedu", area: "Hope College", location: "Coimbatore", address: "18, Avinashi Road", state: "Tamil Nadu", country: "India", active: true },
  { id: "E12", name: "Nisha George", username: "nisha.g", email: "nisha.g@sonicprints.in", phone: "+91 98470 12012", department: "Design", branch: "Kochi", area: "Kakkanad", location: "Kochi", address: "2, Infopark Road", state: "Kerala", country: "India", active: false },
  { id: "E13", name: "Gokul R", username: "gokul.r", email: "gokul.r@sonicprints.in", phone: "+91 98430 12013", department: "Delivery", branch: "RS Puram", area: "Saibaba Colony", location: "Coimbatore", address: "6, NSR Road", state: "Tamil Nadu", country: "India", active: true },
  { id: "E14", name: "Harini T", username: "harini.t", email: "harini.t@sonicprints.in", phone: "+91 98430 12014", department: "Accounts", branch: "Erode", area: "Brough Road", location: "Erode", address: "21, Brough Road", state: "Tamil Nadu", country: "India", active: true },
];

export const inr = (n: number, frac = 2) =>
  `₹${n.toLocaleString("en-IN", { minimumFractionDigits: frac, maximumFractionDigits: frac })}`;
