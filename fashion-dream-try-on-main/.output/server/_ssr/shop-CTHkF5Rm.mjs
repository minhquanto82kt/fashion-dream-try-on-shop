import { n as __toESM } from "../_runtime.mjs";
import { n as PRODUCTS, t as CATEGORIES } from "./products-jMfr2MY-.mjs";
import { i as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { t as require_jsx_dev_runtime } from "../_libs/react.mjs";
import { n as SiteNav, t as SiteFooter } from "./site-footer-C81mFqjI.mjs";
import { t as ProductCard } from "./product-card-CDX_VKkG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shop-CTHkF5Rm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_dev_runtime = require_jsx_dev_runtime();
var _jsxFileName = "/root/app/code/fashion-dream-try-on-main/src/routes/shop.tsx?tsr-split=component";
var SORTS = [
	{
		id: "featured",
		label: "Nổi bật"
	},
	{
		id: "price-asc",
		label: "Giá thấp → cao"
	},
	{
		id: "price-desc",
		label: "Giá cao → thấp"
	}
];
function ShopPage() {
	const [cat, setCat] = (0, import_react.useState)("all");
	const [sort, setSort] = (0, import_react.useState)("featured");
	const list = PRODUCTS.filter((p) => cat === "all" || p.category === cat).sort((a, b) => sort === "price-asc" ? a.price - b.price : sort === "price-desc" ? b.price - a.price : 0);
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(SiteNav, {}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 21,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("main", {
				className: "mx-auto max-w-7xl px-6 pb-24 pt-28 sm:px-12 lg:px-20",
				children: [
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
						className: "eyebrow",
						children: "Collection 2026"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 23,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h1", {
						className: "mt-3 text-4xl leading-none sm:text-5xl",
						children: ["Tất cả ", /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
							className: "text-primary",
							children: "sản phẩm"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 25,
							columnNumber: 18
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 24,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "mt-10 flex flex-wrap items-center justify-between gap-4 border-y border-border py-4",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "flex flex-wrap gap-2",
							children: [{
								slug: "all",
								name: "Tất cả"
							}, ...CATEGORIES].map((c) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
								onClick: () => setCat(c.slug),
								className: `border px-4 py-2 text-xs uppercase tracking-[0.15em] transition-colors ${cat === c.slug ? "border-primary bg-primary text-primary-foreground" : "border-border text-beige hover:border-primary"}`,
								children: c.name
							}, c.slug, false, {
								fileName: _jsxFileName,
								lineNumber: 33,
								columnNumber: 38
							}, this))
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 29,
							columnNumber: 11
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "flex gap-2",
							children: SORTS.map((s) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
								onClick: () => setSort(s.id),
								className: `text-xs uppercase tracking-[0.15em] ${sort === s.id ? "text-primary" : "text-silver hover:text-beige"}`,
								children: s.label
							}, s.id, false, {
								fileName: _jsxFileName,
								lineNumber: 38,
								columnNumber: 29
							}, this))
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 37,
							columnNumber: 11
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 28,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
						children: list.map((p) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ProductCard, { product: p }, p.id, false, {
							fileName: _jsxFileName,
							lineNumber: 45,
							columnNumber: 26
						}, this))
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 44,
						columnNumber: 9
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 22,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(SiteFooter, {}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 48,
				columnNumber: 7
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 20,
		columnNumber: 10
	}, this);
}
//#endregion
export { ShopPage as component };
