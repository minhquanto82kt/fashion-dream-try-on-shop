import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createServerFn } from "@tanstack/react-start";
import { type Product } from "@/data/products";
import { getCustomerSession } from "@/lib/auth";
import { isMockUserMode } from "@/lib/mock-user";
import { addServerCartItem, clearServerCart, getServerCart, removeServerCartItem, updateServerCartItem } from "@/lib/cart.server.functions";

export type CartLine = { productId: string; size: string; color: string; qty: number; variantId?: string; cartItemId?: string };
type CartVariant = { id: string; product_id: string; size: string; color: string; stock: number };
type CartProduct = Product & { variants: CartVariant[] };
type DbProduct = { id: string; name: string; description: string; price: number; category: Product["category"]; image: string | null; active: boolean; status: string; featured: boolean };
type DbImage = { id: string; product_id: string; image_url: string; sort_order: number; is_primary: boolean };
type ServerCart = Awaited<ReturnType<typeof getServerCart>>;

const getCartProducts = createServerFn({ method: "GET" }).validator((productIds: string[]) => productIds).handler(async ({ data: productIds }) => {
  if (productIds.length === 0) return [] as CartProduct[];
  const { supabaseRequest } = await import("@/lib/supabase.server");
  const encodedIds = productIds.map((id) => `"${id.replace(/"/g, '\\"')}"`).join(",");
  const [products, images, variants] = await Promise.all([
    supabaseRequest<DbProduct[]>(`products?id=in.(${encodedIds})&active=eq.true&status=eq.published&select=id,name,description,price,category,image,active,status,featured`),
    supabaseRequest<DbImage[]>(`product_images?product_id=in.(${encodedIds})&select=id,product_id,image_url,sort_order,is_primary&order=sort_order.asc`),
    supabaseRequest<CartVariant[]>(`product_variants?product_id=in.(${encodedIds})&select=id,product_id,size,color,stock`),
  ]);
  return products.map((product): CartProduct => {
    const productImages = images.filter((image) => image.product_id === product.id).sort((a, b) => a.sort_order - b.sort_order);
    const gallery = productImages.map((image) => image.image_url);
    const primaryImage = productImages.find((image) => image.is_primary)?.image_url ?? gallery[0] ?? product.image ?? "";
    return { id: product.id, name: product.name, short_description: null, long_description: null, image: primaryImage, gallery: gallery.length > 0 ? gallery : [primaryImage], sizes: [], colors: [], badge: product.featured ? "Featured" : undefined, description: product.description, price: Number(product.price), category: product.category, variants: variants.filter((variant) => variant.product_id === product.id), active: product.active, status: product.status as "draft" | "published" | "archived", featured: product.featured };
  });
});

type CartItem = CartLine & { product: CartProduct; variant: CartVariant | null; stock: number };
type CartContextValue = { lines: CartLine[]; items: CartItem[]; count: number; subtotal: number; loading: boolean; hasStockIssues: boolean; add: (line: CartLine) => void; setQty: (index: number, qty: number) => void; remove: (index: number) => void; clear: () => void };

const GUEST_STORAGE_KEY = "wearo-cart";
const LEGACY_GUEST_STORAGE_KEY = "upthink-cart";
const MOCK_STORAGE_KEY = "wearo-mock-cart";
const REAL_EVENT = "wearo:cart:changed";
const MOCK_EVENT = "wearo:mock-cart:changed";
const CartContext = createContext<CartContextValue | null>(null);
function clampQty(qty: number) { return Math.max(1, Math.min(99, Number(qty) || 1)); }
function readLocalCart(key: string): CartLine[] { if (typeof window === "undefined") return []; try { const parsed = JSON.parse(window.localStorage.getItem(key) || "[]"); return Array.isArray(parsed) ? parsed.filter((line) => line && typeof line.productId === "string").map((line) => ({ ...line, qty: clampQty(line.qty) })) : []; } catch { return []; } }
function mergeLines(primary: CartLine[], secondary: CartLine[]) { const merged = primary.map((line) => ({ ...line, qty: clampQty(line.qty) })); for (const incoming of secondary) { const index = merged.findIndex((line) => line.productId === incoming.productId && line.size === incoming.size && line.color === incoming.color); if (index === -1) merged.push({ ...incoming, qty: clampQty(incoming.qty) }); else merged[index] = { ...merged[index], qty: clampQty(merged[index].qty + incoming.qty) }; } return merged; }
function readGuestCart() { return mergeLines(readLocalCart(GUEST_STORAGE_KEY), readLocalCart(LEGACY_GUEST_STORAGE_KEY)); }
function serverCartToLines(cart: ServerCart): CartLine[] { return cart.items.flatMap((item) => item.variant ? [{ productId: item.variant.product_id, size: item.variant.size, color: item.variant.color, qty: item.quantity, variantId: item.variant.id, cartItemId: item.id }] : []); }

export function CartProvider({ children }: { children: ReactNode }) {
  const [mockMode, setMockMode] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [products, setProducts] = useState<CartProduct[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => { const sync = () => { setMockMode(isMockUserMode()); setAuthenticated(Boolean(getCustomerSession()?.access_token)); }; sync(); const onAuth = () => sync(); window.addEventListener("wearo:mock-user:changed", sync); window.addEventListener("upthink:auth:login", onAuth); window.addEventListener("upthink:auth:logout", onAuth); window.addEventListener("upthink:auth:recovery", onAuth); return () => { window.removeEventListener("wearo:mock-user:changed", sync); window.removeEventListener("upthink:auth:login", onAuth); window.removeEventListener("upthink:auth:logout", onAuth); window.removeEventListener("upthink:auth:recovery", onAuth); }; }, []);
  useEffect(() => { let cancelled = false; async function load() { setHydrated(false); if (mockMode || !authenticated) { setLines(mockMode ? readLocalCart(MOCK_STORAGE_KEY) : readGuestCart()); setHydrated(true); return; } const session = getCustomerSession(); if (!session?.access_token) { setAuthenticated(false); setLines([]); setHydrated(true); return; } setLoading(true); try { const guestLines = readGuestCart(); let serverCart = await getServerCart({ data: { accessToken: session.access_token } }); if (guestLines.length > 0) { const guestProducts = await getCartProducts({ data: Array.from(new Set(guestLines.map((line) => line.productId))) }); const variantByKey = new Map(guestProducts.flatMap((product) => product.variants.map((variant) => [`${variant.product_id}|${variant.size}|${variant.color}`, variant] as const))); for (const line of guestLines) { const variant = variantByKey.get(`${line.productId}|${line.size}|${line.color}`); if (!variant) continue; try { serverCart = await addServerCartItem({ data: { accessToken: session.access_token, variantId: variant.id, quantity: line.qty } }); } catch (error) { console.warn("Không thể nhập một dòng guest cart vào tài khoản:", error); } } localStorage.removeItem(GUEST_STORAGE_KEY); localStorage.removeItem(LEGACY_GUEST_STORAGE_KEY); } if (!cancelled) setLines(serverCartToLines(serverCart)); } catch (error) { console.error("Không thể tải giỏ hàng tài khoản:", error); if (!cancelled) setLines([]); } finally { if (!cancelled) { setLoading(false); setHydrated(true); } } } void load(); return () => { cancelled = true; }; }, [mockMode, authenticated]);
  useEffect(() => { if (!hydrated || authenticated) return; const key = mockMode ? MOCK_STORAGE_KEY : GUEST_STORAGE_KEY; localStorage.setItem(key, JSON.stringify(lines)); if (!mockMode) localStorage.removeItem(LEGACY_GUEST_STORAGE_KEY); window.dispatchEvent(new Event(mockMode ? MOCK_EVENT : REAL_EVENT)); }, [lines, hydrated, authenticated, mockMode]);
  useEffect(() => { if (authenticated) return; const key = mockMode ? MOCK_STORAGE_KEY : GUEST_STORAGE_KEY; const eventName = mockMode ? MOCK_EVENT : REAL_EVENT; const sync = () => setLines(mockMode ? readLocalCart(MOCK_STORAGE_KEY) : readGuestCart()); const onStorage = (event: StorageEvent) => { if (event.key === key || (!mockMode && event.key === LEGACY_GUEST_STORAGE_KEY)) sync(); }; window.addEventListener("storage", onStorage); window.addEventListener(eventName, sync); return () => { window.removeEventListener("storage", onStorage); window.removeEventListener(eventName, sync); }; }, [authenticated, mockMode]);
  useEffect(() => { let cancelled = false; async function loadProducts() { const productIds = Array.from(new Set(lines.map((line) => line.productId))); if (productIds.length === 0) { setProducts([]); return; } setLoading(true); try { const result = await getCartProducts({ data: productIds }); if (!cancelled) setProducts(result); } catch (error) { console.error("Không thể tải sản phẩm trong giỏ hàng:", error); if (!cancelled) setProducts([]); } finally { if (!cancelled) setLoading(false); } } void loadProducts(); return () => { cancelled = true; }; }, [lines]);
  const items = useMemo<CartItem[]>(() => lines.map((line) => { const product = products.find((item) => item.id === line.productId); if (!product) return null; const variant = product.variants.find((item) => item.id === line.variantId || (item.size === line.size && item.color === line.color)) ?? null; return { ...line, product, variant, stock: variant?.stock ?? 0 }; }).filter((item): item is CartItem => item !== null), [lines, products]);
  const hasStockIssues = useMemo(() => items.some((item) => !item.variant || item.stock <= 0 || item.qty > item.stock), [items]);
  const count = useMemo(() => lines.reduce((sum, line) => sum + line.qty, 0), [lines]);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.product.price * item.qty, 0), [items]);
  function add(line: CartLine) { if (mockMode || !authenticated) { setLines((current) => { const index = current.findIndex((item) => item.productId === line.productId && item.size === line.size && item.color === line.color); if (index === -1) return [...current, { ...line, qty: clampQty(line.qty) }]; return current.map((item, itemIndex) => itemIndex === index ? { ...item, qty: clampQty(item.qty + line.qty) } : item); }); return; } const session = getCustomerSession(); const product = products.find((item) => item.id === line.productId); const variant = product?.variants.find((item) => item.size === line.size && item.color === line.color); if (!session?.access_token || !variant) return; setLoading(true); void addServerCartItem({ data: { accessToken: session.access_token, variantId: variant.id, quantity: clampQty(line.qty) } }).then((cart) => setLines(serverCartToLines(cart))).catch((error) => alert(error instanceof Error ? error.message : "Không thể thêm sản phẩm vào giỏ hàng.")).finally(() => setLoading(false)); }
  function setQty(index: number, qty: number) { const nextQty = clampQty(qty); if (mockMode || !authenticated) { setLines((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, qty: nextQty } : item)); return; } const session = getCustomerSession(); const item = lines[index]; if (!session?.access_token || !item?.cartItemId) return; setLoading(true); void updateServerCartItem({ data: { accessToken: session.access_token, itemId: item.cartItemId, quantity: nextQty } }).then((cart) => setLines(serverCartToLines(cart))).catch((error) => alert(error instanceof Error ? error.message : "Không thể cập nhật số lượng.")).finally(() => setLoading(false)); }
  function remove(index: number) { if (mockMode || !authenticated) { setLines((current) => current.filter((_, itemIndex) => itemIndex !== index)); return; } const session = getCustomerSession(); const item = lines[index]; if (!session?.access_token || !item?.cartItemId) return; setLoading(true); void removeServerCartItem({ data: { accessToken: session.access_token, itemId: item.cartItemId } }).then((cart) => setLines(serverCartToLines(cart))).catch((error) => alert(error instanceof Error ? error.message : "Không thể xóa sản phẩm.")).finally(() => setLoading(false)); }
  function clear() { if (mockMode || !authenticated) { setLines([]); setProducts([]); return; } const session = getCustomerSession(); if (!session?.access_token) return; setLoading(true); void clearServerCart({ data: { accessToken: session.access_token } }).then((cart) => { setLines(serverCartToLines(cart)); setProducts([]); }).catch((error) => alert(error instanceof Error ? error.message : "Không thể xóa giỏ hàng.")).finally(() => setLoading(false)); }
  const value = useMemo<CartContextValue>(() => ({ lines, items, count, subtotal, loading, hasStockIssues, add, setQty, remove, clear }), [lines, items, count, subtotal, loading, hasStockIssues]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() { const context = useContext(CartContext); if (!context) throw new Error("useCart phải được sử dụng bên trong CartProvider."); return context; }
