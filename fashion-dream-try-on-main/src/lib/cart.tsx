import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { PRODUCTS, type Product } from "@/data/products";

export type CartLine = {
  productId: string;
  size: string;
  color: string;
  qty: number;
};

type CartContextValue = {
  lines: CartLine[];
  items: (CartLine & { product: Product })[];
  count: number;
  subtotal: number;
  add: (line: CartLine) => void;
  setQty: (index: number, qty: number) => void;
  remove: (index: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "upthink-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const items = lines
      .map((line) => {
        const product = PRODUCTS.find((p) => p.id === line.productId);
        return product ? { ...line, product } : null;
      })
      .filter(Boolean) as (CartLine & { product: Product })[];

    return {
      lines,
      items,
      count: items.reduce((n, i) => n + i.qty, 0),
      subtotal: items.reduce((n, i) => n + i.qty * i.product.price, 0),
      add: (line) =>
        setLines((prev) => {
          const idx = prev.findIndex(
            (l) => l.productId === line.productId && l.size === line.size && l.color === line.color,
          );
          const existing = prev[idx];
          if (existing) {
            const next = [...prev];
            next[idx] = { ...existing, qty: existing.qty + line.qty };
            return next;
          }
          return [...prev, line];
        }),
      setQty: (index, qty) =>
        setLines((prev) =>
          prev.map((l, i) => (i === index ? { ...l, qty: Math.max(1, Math.min(99, qty)) } : l)),
        ),
      remove: (index) => setLines((prev) => prev.filter((_, i) => i !== index)),
      clear: () => setLines([]),
    };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
