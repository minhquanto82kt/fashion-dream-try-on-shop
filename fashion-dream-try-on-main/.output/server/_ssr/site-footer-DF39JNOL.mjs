import { n as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { t as require_jsx_dev_runtime } from "../_libs/react.mjs";
import { n as useCart } from "./cart-BJWoGGHj.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Sparkles, c as Moon, i as Sun, o as ShoppingBag, t as X, u as Menu } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/site-footer-DF39JNOL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_dev_runtime = require_jsx_dev_runtime();
var _jsxFileName$1 = "/root/app/code/fashion-dream-try-on-main/src/components/site-nav.tsx";
var LINKS = [
	{
		to: "/shop",
		label: "Collections"
	},
	{
		to: "/ai",
		label: "AI Studio"
	},
	{
		to: "/about",
		label: "About"
	}
];
function SiteNav() {
	const { count } = useCart();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [dark, setDark] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		const saved = localStorage.getItem("fashiontry-theme");
		if (saved) setDark(saved === "dark");
	}, []);
	(0, import_react.useEffect)(() => {
		document.documentElement.dataset.theme = dark ? "dark" : "cream";
		localStorage.setItem("fashiontry-theme", dark ? "dark" : "cream");
	}, [dark]);
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("nav", {
		className: "fashion-nav",
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "fashion-nav__inner",
			children: [
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, {
					to: "/",
					className: "fashion-brand",
					"aria-label": "UpThink home",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
						className: "fashion-brand__mark",
						children: "U"
					}, void 0, false, {
						fileName: _jsxFileName$1,
						lineNumber: 31,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
						className: "fashion-brand__copy",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
							className: "fashion-brand__name",
							children: ["UPTHINK", /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "." }, void 0, false, {
								fileName: _jsxFileName$1,
								lineNumber: 34,
								columnNumber: 22
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$1,
							lineNumber: 33,
							columnNumber: 13
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
							className: "fashion-brand__meta",
							children: "AI FASHION / 2026"
						}, void 0, false, {
							fileName: _jsxFileName$1,
							lineNumber: 36,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$1,
						lineNumber: 32,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$1,
					lineNumber: 30,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "fashion-nav__links",
					children: LINKS.map((link) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, {
						to: link.to,
						activeProps: { className: "is-active" },
						children: link.label
					}, link.to, false, {
						fileName: _jsxFileName$1,
						lineNumber: 42,
						columnNumber: 13
					}, this))
				}, void 0, false, {
					fileName: _jsxFileName$1,
					lineNumber: 40,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "fashion-nav__actions",
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
							className: "fashion-icon-btn",
							"aria-label": "Đổi giao diện",
							onClick: () => setDark((v) => !v),
							children: dark ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Sun, { size: 16 }, void 0, false, {
								fileName: _jsxFileName$1,
								lineNumber: 54,
								columnNumber: 21
							}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Moon, { size: 16 }, void 0, false, {
								fileName: _jsxFileName$1,
								lineNumber: 54,
								columnNumber: 41
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName$1,
							lineNumber: 53,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, {
							to: "/ai",
							className: "fashion-ai-btn",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Sparkles, { size: 14 }, void 0, false, {
								fileName: _jsxFileName$1,
								lineNumber: 57,
								columnNumber: 13
							}, this), " Try-on"]
						}, void 0, true, {
							fileName: _jsxFileName$1,
							lineNumber: 56,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, {
							to: "/cart",
							className: "fashion-cart-btn",
							"aria-label": "Giỏ hàng",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ShoppingBag, { size: 17 }, void 0, false, {
								fileName: _jsxFileName$1,
								lineNumber: 60,
								columnNumber: 13
							}, this), count > 0 && /* @__PURE__ */ (void 0)("span", { children: count }, void 0, false, {
								fileName: _jsxFileName$1,
								lineNumber: 61,
								columnNumber: 27
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$1,
							lineNumber: 59,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
							className: "fashion-mobile-btn",
							"aria-label": "Mở menu",
							onClick: () => setOpen((v) => !v),
							children: open ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(X, { size: 20 }, void 0, false, {
								fileName: _jsxFileName$1,
								lineNumber: 64,
								columnNumber: 21
							}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Menu, { size: 20 }, void 0, false, {
								fileName: _jsxFileName$1,
								lineNumber: 64,
								columnNumber: 39
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName$1,
							lineNumber: 63,
							columnNumber: 11
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName$1,
					lineNumber: 52,
					columnNumber: 9
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName$1,
			lineNumber: 29,
			columnNumber: 7
		}, this), open && /* @__PURE__ */ (void 0)("div", {
			className: "fashion-mobile-menu",
			children: [
				LINKS.map((link) => /* @__PURE__ */ (void 0)(Link, {
					to: link.to,
					onClick: () => setOpen(false),
					children: link.label
				}, link.to, false, {
					fileName: _jsxFileName$1,
					lineNumber: 72,
					columnNumber: 13
				}, this)),
				/* @__PURE__ */ (void 0)(Link, {
					to: "/ai",
					onClick: () => setOpen(false),
					children: "AI Try-On ↗"
				}, void 0, false, {
					fileName: _jsxFileName$1,
					lineNumber: 76,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ (void 0)(Link, {
					to: "/cart",
					onClick: () => setOpen(false),
					children: ["Cart / ", String(count).padStart(2, "0")]
				}, void 0, true, {
					fileName: _jsxFileName$1,
					lineNumber: 77,
					columnNumber: 11
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName$1,
			lineNumber: 70,
			columnNumber: 9
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName$1,
		lineNumber: 28,
		columnNumber: 5
	}, this);
}
var _jsxFileName = "/root/app/code/fashion-dream-try-on-main/src/components/site-footer.tsx";
function SiteFooter() {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("footer", {
		className: "border-t border-border bg-background px-6 py-14 sm:px-12 lg:px-20",
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.7fr_1fr_1fr]",
			children: [
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "mb-3 flex items-center gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
						className: "grid size-8 place-items-center bg-primary font-display text-lg font-bold text-primary-foreground",
						children: "U"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 9,
						columnNumber: 13
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
						className: "font-display text-lg tracking-[0.12em]",
						children: "UpThink"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 12,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 8,
					columnNumber: 11
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
					className: "max-w-sm text-sm text-silver",
					children: "Một ý tưởng khởi nghiệp của sinh viên IUH: thời trang cá nhân hóa với AI concept và virtual try-on."
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 14,
					columnNumber: 11
				}, this)] }, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 7,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
					className: "mb-4 text-[0.68rem] uppercase tracking-[0.18em] text-primary",
					children: "Khám phá"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 20,
					columnNumber: 11
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "flex flex-col gap-2 text-sm text-beige",
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, {
							to: "/shop",
							children: "Sản phẩm"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 22,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, {
							to: "/ai",
							children: "AI Lab"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 23,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, {
							to: "/about",
							children: "Về chúng tôi"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 24,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 21,
					columnNumber: 11
				}, this)] }, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 19,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
					className: "mb-4 text-[0.68rem] uppercase tracking-[0.18em] text-primary",
					children: "Kết nối"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 28,
					columnNumber: 11
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "flex flex-col gap-2 text-sm text-beige",
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "hello@upthink.vn" }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 30,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "Instagram / TikTok @upthink.iuh" }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 31,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "Đại học Công nghiệp TP.HCM" }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 32,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 29,
					columnNumber: 11
				}, this)] }, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 27,
					columnNumber: 9
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 6,
			columnNumber: 7
		}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
			className: "mx-auto mt-10 max-w-7xl text-xs text-silver",
			children: "© 2026 UpThink — Đại học Công nghiệp TP.HCM / IUH"
		}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 36,
			columnNumber: 7
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 5,
		columnNumber: 5
	}, this);
}
//#endregion
export { SiteNav as n, SiteFooter as t };
