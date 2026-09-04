import { r as formatVnd } from "./products--eiF-4or.mjs";
import { t as require_jsx_dev_runtime } from "../_libs/react.mjs";
import { n as useCart } from "./cart-BJWoGGHj.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as Minus, r as Trash2, s as Plus } from "../_libs/lucide-react.mjs";
import { n as SiteNav, t as SiteFooter } from "./site-footer-DF39JNOL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cart-C84C3qCX.js
var import_jsx_dev_runtime = require_jsx_dev_runtime();
var _jsxFileName = "/root/app/code/fashion-dream-try-on-main/src/routes/cart.tsx?tsr-split=component";
function CartPage() {
	const { items, subtotal, setQty, remove } = useCart();
	const shipping = subtotal === 0 || subtotal >= 1e6 ? 0 : 3e4;
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(SiteNav, {}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 16,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("main", {
				className: "mx-auto max-w-5xl px-6 pb-24 pt-28 sm:px-12",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h1", {
					className: "text-4xl leading-none",
					children: "Giỏ hàng"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 18,
					columnNumber: 9
				}, this), items.length === 0 ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "mt-10 border border-border bg-card p-10 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
						className: "text-beige",
						children: "Giỏ hàng đang trống."
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 21,
						columnNumber: 13
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, {
						to: "/shop",
						className: "mt-6 inline-block bg-primary px-7 py-3 text-xs uppercase tracking-[0.15em] text-primary-foreground",
						children: "Mua sắm ngay"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 22,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 20,
					columnNumber: 31
				}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "mt-10 grid gap-10 lg:grid-cols-[1.4fr_0.6fr]",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "divide-y divide-border border border-border",
						children: items.map((item, i) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "flex gap-4 p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("img", {
									src: item.product.image,
									alt: item.product.name,
									className: "size-24 object-cover"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 28,
									columnNumber: 19
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: "flex-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
											className: "font-medium",
											children: item.product.name
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 30,
											columnNumber: 21
										}, this),
										/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
											className: "mt-1 text-xs uppercase tracking-[0.15em] text-silver",
											children: [
												item.size,
												" · ",
												item.color
											]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 31,
											columnNumber: 21
										}, this),
										/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
											className: "mt-3 flex items-center gap-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
													onClick: () => setQty(i, item.qty - 1),
													className: "border border-border p-1",
													children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Minus, { className: "size-3" }, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 36,
														columnNumber: 25
													}, this)
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 35,
													columnNumber: 23
												}, this),
												/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
													className: "text-sm",
													children: item.qty
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 38,
													columnNumber: 23
												}, this),
												/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
													onClick: () => setQty(i, item.qty + 1),
													className: "border border-border p-1",
													children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Plus, { className: "size-3" }, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 40,
														columnNumber: 25
													}, this)
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 39,
													columnNumber: 23
												}, this),
												/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
													onClick: () => remove(i),
													className: "ml-2 text-silver hover:text-destructive",
													children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Trash2, { className: "size-4" }, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 43,
														columnNumber: 25
													}, this)
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 42,
													columnNumber: 23
												}, this)
											]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 34,
											columnNumber: 21
										}, this)
									]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 29,
									columnNumber: 19
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
									className: "font-display text-primary",
									children: formatVnd(item.product.price * item.qty)
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 47,
									columnNumber: 19
								}, this)
							]
						}, `${item.productId}-${item.size}-${item.color}`, true, {
							fileName: _jsxFileName,
							lineNumber: 27,
							columnNumber: 39
						}, this))
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 26,
						columnNumber: 13
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("aside", {
						className: "h-fit border border-border bg-card p-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
								className: "eyebrow",
								children: "Tổng kết"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 52,
								columnNumber: 15
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "mt-4 space-y-2 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
										className: "text-silver",
										children: "Tạm tính"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 55,
										columnNumber: 19
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: formatVnd(subtotal) }, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 56,
										columnNumber: 19
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 54,
									columnNumber: 17
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
										className: "text-silver",
										children: "Vận chuyển"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 59,
										columnNumber: 19
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: shipping === 0 ? "Miễn phí" : formatVnd(shipping) }, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 60,
										columnNumber: 19
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 58,
									columnNumber: 17
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 53,
								columnNumber: 15
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "mt-4 flex justify-between border-t border-border pt-4 font-display text-lg",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "Tổng" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 64,
									columnNumber: 17
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
									className: "text-primary",
									children: formatVnd(subtotal + shipping)
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 65,
									columnNumber: 17
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 63,
								columnNumber: 15
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, {
								to: "/checkout",
								className: "mt-6 block bg-primary px-6 py-3 text-center text-xs uppercase tracking-[0.15em] text-primary-foreground",
								children: "Thanh toán"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 67,
								columnNumber: 15
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 51,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 25,
					columnNumber: 20
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 17,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(SiteFooter, {}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 73,
				columnNumber: 7
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 15,
		columnNumber: 10
	}, this);
}
//#endregion
export { CartPage as component };
