export type Product = {
  id: string;
  name: string;
  price: number; // VND
  category: "hoodies" | "tees" | "outerwear" | "accessories";
  image: string;
  gallery: string[];
  sizes: string[];
  colors: string[];
  badge?: string;
  description: string;
};

const px = (id: string, w = 900) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

export const CATEGORIES = [
  { slug: "hoodies", name: "Hoodies", image: px("18956666", 800) },
  { slug: "tees", name: "Tees", image: px("1311588", 800) },
  { slug: "outerwear", name: "Outerwear", image: px("19273260", 800) },
  { slug: "accessories", name: "Accessories", image: px("30989278", 800) },
] as const;

export const PRODUCTS: Product[] = [
  {
    id: "shadow-hoodie",
    name: "Shadow Hoodie",
    price: 1290000,
    category: "hoodies",
    image: px("18956666"),
    gallery: [px("18956666"), px("774909"), px("15213195")],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Charcoal", "Ivory"],
    badge: "New drop",
    description:
      "Hoodie oversize vải nỉ bông 480gsm, form rộng vai xuôi, mũ 2 lớp. Chuẩn street cho những ngày Sài Gòn trở gió.",
  },
  {
    id: "statement-tee",
    name: "Statement Tee",
    price: 690000,
    category: "tees",
    image: px("1311588"),
    gallery: [px("1311588"), px("30186074"), px("14216454")],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Ivory"],
    description:
      "Cotton 100% dệt compact, in lụa thủ công. Câu chuyện của bạn nằm ngay trên ngực áo.",
  },
  {
    id: "night-shift-set",
    name: "Night Shift Set",
    price: 1490000,
    category: "outerwear",
    image: px("17037339"),
    gallery: [px("17037339"), px("12104691"), px("28484979")],
    sizes: ["M", "L", "XL"],
    colors: ["Black"],
    badge: "Best seller",
    description: "Set áo khoác + quần ống suông tối giản, phối cùng nhau hoặc tách rời đều chất.",
  },
  {
    id: "oversized-shell-jacket",
    name: "Oversized Shell Jacket",
    price: 1890000,
    category: "outerwear",
    image: px("19273260"),
    gallery: [px("19273260"), px("18698406"), px("5840443")],
    sizes: ["M", "L", "XL"],
    colors: ["Moss", "Charcoal"],
    description: "Áo khoác shell chống gió nhẹ, seam dán, túi hộp lớn — layer cuối cùng bạn cần.",
  },
  {
    id: "beanie-mono",
    name: "Beanie Mono",
    price: 390000,
    category: "accessories",
    image: px("6612173"),
    gallery: [px("6612173"), px("30989278")],
    sizes: ["Freesize"],
    colors: ["Black", "Electric"],
    description: "Beanie len tăm, thêu logo chìm. Món phụ kiện làm gọn mọi outfit.",
  },
  {
    id: "crossbody-utility",
    name: "Crossbody Utility",
    price: 590000,
    category: "accessories",
    image: px("30989278"),
    gallery: [px("30989278"), px("28484979")],
    sizes: ["Freesize"],
    colors: ["Black"],
    description: "Túi đeo chéo vải cordura, 3 ngăn, dây bản to điều chỉnh nhanh.",
  },
  {
    id: "cargo-wide-pant",
    name: "Cargo Wide Pant",
    price: 990000,
    category: "outerwear",
    image: px("12104691"),
    gallery: [px("12104691"), px("18698406")],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Cement", "Moss"],
    description: "Quần cargo ống rộng, túi hộp gập, lai bo dây rút — thoải mái từ giảng đường ra phố.",
  },
  {
    id: "campus-crewneck",
    name: "Campus Crewneck",
    price: 890000,
    category: "hoodies",
    image: px("15213195"),
    gallery: [px("15213195"), px("774909")],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Beige", "Charcoal"],
    badge: "IUH edition",
    description: "Sweater cổ tròn thêu chữ UpThink, form vừa, mặc quanh năm.",
  },
];

export function getProduct(id: string) {
  return PRODUCTS.find((p) => p.id === id);
}

export function formatVnd(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}
