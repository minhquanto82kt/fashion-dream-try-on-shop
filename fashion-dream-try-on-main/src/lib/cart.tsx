import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createServerFn } from "@tanstack/react-start";
import { type Product } from "@/data/products";

export type CartLine = {
  productId: string;
  size: string;
  color: string;
  qty: number;
};

type CartVariant = {
  id: string;
  product_id: string;
  size: string;
  color: string;
  stock: number;
};

type CartProduct = Product & {
  variants: CartVariant[];
};

type DbProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Product["category"];
  image: string | null;
  active: boolean;
  status: string;
  featured: boolean;
};

type DbImage = {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
  is_primary: boolean;
};

const getCartProducts = createServerFn({ method: "GET" })
  .validator((productIds: string[]) => productIds)
  .handler(async ({ data: productIds }) => {
    if (productIds.length === 0) {
      return [] as CartProduct[];
    }

    const { supabaseRequest } = await import("@/lib/supabase.server");

    const encodedIds = productIds
      .map((id) => `"${id.replace(/"/g, '\\"')}"`)
      .join(",");

    const [products, images, variants] = await Promise.all([
      supabaseRequest<DbProduct[]>(
        `products?id=in.(${encodedIds})&active=eq.true&status=eq.published&select=id,name,description,price,category,image,active,status,featured`,
      ),
      supabaseRequest<DbImage[]>(
        `product_images?product_id=in.(${encodedIds})&select=id,product_id,image_url,sort_order,is_primary&order=sort_order.asc`,
      ),
      supabaseRequest<CartVariant[]>(
        `product_variants?product_id=in.(${encodedIds})&select=id,product_id,size,color,stock`,
      ),
    ]);

    return products.map((product): CartProduct => {
      const productImages = images
        .filter((image) => image.product_id === product.id)
        .sort((a, b) => a.sort_order - b.sort_order);

      const gallery = productImages.map(
        (image) => image.image_url,
      );

      const primaryImage =
        productImages.find((image) => image.is_primary)
          ?.image_url ??
        gallery[0] ??
        product.image ??
        "";

      return {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        category: product.category,
        image: primaryImage,
        gallery: gallery.length > 0 ? gallery : [primaryImage],
        sizes: [],
        colors: [],
        badge: product.featured ? "Featured" : undefined,
        description: product.description,
        variants: variants.filter(
          (variant) => variant.product_id === product.id,
        ),
      };
    });
  });

type CartItem = CartLine & {
  product: CartProduct;
  variant: CartVariant | null;
  stock: number;
};

type CartContextValue = {
  lines: CartLine[];
  items: CartItem[];
  count: number;
  subtotal: number;
  loading: boolean;
  hasStockIssues: boolean;
  add: (line: CartLine) => void;
  setQty: (index: number, qty: number) => void;
  remove: (index: number) => void;
  clear: () => void;
};

const STORAGE_KEY = "upthink-cart";

const CartContext = createContext<CartContextValue | null>(
  null,
);

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [products, setProducts] = useState<CartProduct[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (raw) {
        const parsed = JSON.parse(raw);

        if (Array.isArray(parsed)) {
          setLines(parsed);
        }
      }
    } catch {
      setLines([]);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(lines),
    );
  }, [lines, hydrated]);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      const productIds = Array.from(
        new Set(lines.map((line) => line.productId)),
      );

      if (productIds.length === 0) {
        setProducts([]);
        return;
      }

      setLoading(true);

      try {
        const result = await getCartProducts({
          data: productIds,
        });

        if (!cancelled) {
          setProducts(result);
        }
      } catch (error) {
        console.error(
          "Không thể tải sản phẩm trong giỏ hàng:",
          error,
        );

        if (!cancelled) {
          setProducts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [lines]);

  const items = useMemo<CartItem[]>(() => {
    return lines
      .map((line) => {
        const product = products.find(
          (item) => item.id === line.productId,
        );

        if (!product) {
          return null;
        }

        const variant =
          product.variants.find(
            (item) =>
              item.size === line.size &&
              item.color === line.color,
          ) ?? null;

        return {
          ...line,
          product,
          variant,
          stock: variant?.stock ?? 0,
        };
      })
      .filter((item): item is CartItem => item !== null);
  }, [lines, products]);

  const hasStockIssues = useMemo(
    () =>
      items.some(
        (item) =>
          !item.variant ||
          item.stock <= 0 ||
          item.qty > item.stock,
      ),
    [items],
  );

  const count = useMemo(
    () => lines.reduce((sum, line) => sum + line.qty, 0),
    [lines],
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.product.price * item.qty,
        0,
      ),
    [items],
  );

  function add(line: CartLine) {
    const product = products.find(
      (item) => item.id === line.productId,
    );
    const variant = product?.variants.find(
      (item) =>
        item.size === line.size && item.color === line.color,
    );
    const stock = variant?.stock ?? 0;

    if (stock <= 0) return;

    setLines((current) => {
      const index = current.findIndex(
        (item) =>
          item.productId === line.productId &&
          item.size === line.size &&
          item.color === line.color,
      );

      if (index === -1) {
        return [
          ...current,
          {
            ...line,
            qty: Math.max(1, Math.min(99, stock, line.qty)),
          },
        ];
      }

      return current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              qty: Math.min(99, stock, item.qty + line.qty),
            }
          : item,
      );
    });
  }

  function setQty(index: number, qty: number) {
    const stock = items[index]?.stock ?? 0;

    setLines((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              qty:
                stock > 0
                  ? Math.max(1, Math.min(99, stock, qty))
                  : 0,
            }
          : item,
      ),
    );
  }

  function remove(index: number) {
    setLines((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  function clear() {
    setLines([]);
    setProducts([]);
  }

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      items,
      count,
      subtotal,
      loading,
      hasStockIssues,
      add,
      setQty,
      remove,
      clear,
    }),
    [
      lines,
      items,
      count,
      subtotal,
      loading,
      hasStockIssues,
    ],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart phải được sử dụng bên trong CartProvider.",
    );
  }

  return context;
}
