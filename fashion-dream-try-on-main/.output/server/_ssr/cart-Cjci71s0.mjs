import { n as __toESM } from "../_runtime.mjs";
import { n as PRODUCTS } from "./products-jMfr2MY-.mjs";
import { i as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { t as require_jsx_dev_runtime } from "../_libs/react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cart-Cjci71s0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_dev_runtime = require_jsx_dev_runtime();
var _jsxFileName = "/root/app/code/fashion-dream-try-on-main/src/lib/cart.tsx";
var CartContext = (0, import_react.createContext)(null);
var STORAGE_KEY = "upthink-cart";
function CartProvider({ children }) {
	const [lines, setLines] = (0, import_react.useState)([]);
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) setLines(JSON.parse(raw));
		} catch {}
		setHydrated(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!hydrated) return;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
	}, [lines, hydrated]);
	const value = (0, import_react.useMemo)(() => {
		const items = lines.map((line) => {
			const product = PRODUCTS.find((p) => p.id === line.productId);
			return product ? {
				...line,
				product
			} : null;
		}).filter(Boolean);
		return {
			lines,
			items,
			count: items.reduce((n, i) => n + i.qty, 0),
			subtotal: items.reduce((n, i) => n + i.qty * i.product.price, 0),
			add: (line) => setLines((prev) => {
				const idx = prev.findIndex((l) => l.productId === line.productId && l.size === line.size && l.color === line.color);
				const existing = prev[idx];
				if (existing) {
					const next = [...prev];
					next[idx] = {
						...existing,
						qty: existing.qty + line.qty
					};
					return next;
				}
				return [...prev, line];
			}),
			setQty: (index, qty) => setLines((prev) => prev.map((l, i) => i === index ? {
				...l,
				qty: Math.max(1, Math.min(99, qty))
			} : l)),
			remove: (index) => setLines((prev) => prev.filter((_, i) => i !== index)),
			clear: () => setLines([])
		};
	}, [lines]);
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CartContext.Provider, {
		value,
		children
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 79,
		columnNumber: 10
	}, this);
}
function useCart() {
	const ctx = (0, import_react.useContext)(CartContext);
	if (!ctx) throw new Error("useCart must be used inside CartProvider");
	return ctx;
}
//#endregion
export { useCart as n, CartProvider as t };
