import { n as __toESM } from "../_runtime.mjs";
import { n as PRODUCTS } from "./products-jMfr2MY-.mjs";
import { i as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { t as require_jsx_dev_runtime } from "../_libs/react.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as SiteNav, t as SiteFooter } from "./site-footer-C81mFqjI.mjs";
import { t as ProductCard } from "./product-card-CDX_VKkG.mjs";
import { t as HERO_SLIDES } from "./routes-Bj3hJEGc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-E860OpOZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_dev_runtime = require_jsx_dev_runtime();
var _jsxFileName = "/root/app/code/fashion-dream-try-on-main/src/routes/index.tsx?tsr-split=component";
var COLLECTION_CATEGORIES = [
	{
		slug: "all",
		label: "All"
	},
	{
		slug: "hoodies",
		label: "Hoodies"
	},
	{
		slug: "tees",
		label: "Tees"
	},
	{
		slug: "outerwear",
		label: "Outerwear"
	},
	{
		slug: "cap",
		label: "Caps"
	},
	{
		slug: "sunglass",
		label: "Sunglasses"
	}
];
function Index() {
	const [activeCategory, setActiveCategory] = (0, import_react.useState)("all");
	const [slide, setSlide] = (0, import_react.useState)(0);
	const [isPaused, setIsPaused] = (0, import_react.useState)(false);
	const active = HERO_SLIDES[slide];
	const featured = PRODUCTS.filter((product) => activeCategory === "all" || product.category === activeCategory);
	(0, import_react.useEffect)(() => {
		if (isPaused) return;
		const timer = window.setInterval(() => {
			setSlide((current) => (current + 1) % HERO_SLIDES.length);
		}, 5200);
		return () => window.clearInterval(timer);
	}, [isPaused]);
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "min-h-screen fashion-site",
		children: [
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(SiteNav, {}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 41,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("header", {
				className: "fashion-hero",
				onMouseEnter: () => setIsPaused(true),
				onMouseLeave: () => setIsPaused(false),
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "fashion-hero__copy",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "fashion-hero__primary",
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
								className: "fashion-eyebrow",
								children: "01 / AI FASHION SYSTEM"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 45,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h1", {
								className: "fashion-display",
								children: [
									"Dress the",
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("br", {}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 47,
										columnNumber: 24
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
										className: "fashion-accent",
										children: "future."
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 47,
										columnNumber: 30
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 46,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
								className: "fashion-hero__lede",
								children: "Một wardrobe được chọn theo gu của bạn — kết hợp commerce, AI styling và virtual try-on trong cùng một trải nghiệm."
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 49,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "fashion-hero__actions",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, {
									to: "/shop",
									className: "fashion-btn",
									style: {
										fontFamily: "__Inter_d65c78, sans-serif",
										fontWeight: 700
									},
									children: "Explore collection ↗"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 53,
									columnNumber: 15
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, {
									to: "/ai",
									className: "fashion-btn fashion-btn--ghost",
									style: {
										fontFamily: "__Inter_d65c78, sans-serif",
										fontWeight: 700
									},
									children: "Start AI try-on"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 59,
									columnNumber: 15
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 52,
								columnNumber: 13
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 44,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "fashion-hero__meta",
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "UPTHINK / IUH" }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 68,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "SAIGON — 2026" }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 68,
								columnNumber: 39
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "SYS_02 // ONLINE" }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 68,
								columnNumber: 65
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 67,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 43,
					columnNumber: 9
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "fashion-hero__art",
					children: [
						HERO_SLIDES.map((item, index) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("img", {
							src: item.image,
							alt: "Streetwear fashion editorial",
							fetchPriority: index === 0 ? "high" : void 0,
							className: index === slide ? "is-active" : ""
						}, item.image, false, {
							fileName: _jsxFileName,
							lineNumber: 72,
							columnNumber: 45
						}, this)),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "fashion-hero__overlay" }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 73,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "fashion-hero__scan" }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 74,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "fashion-hero__hud",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
								className: "fashion-hero__status",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("b", {}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 76,
									columnNumber: 52
								}, this), " AI VISION / LIVE"]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 76,
								columnNumber: 13
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: active.title }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 77,
								columnNumber: 13
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 75,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
							className: "fashion-hero__label",
							children: active.label
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 79,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
							className: "fashion-hero__vertical",
							children: "VIRTUAL FIT / PERSONAL EDIT"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 80,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "fashion-hero__dots",
							"aria-label": "Hero slides",
							children: HERO_SLIDES.map((item, index) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
								type: "button",
								"aria-label": `Xem ${item.label}`,
								className: index === slide ? "is-active" : "",
								onClick: () => setSlide(index)
							}, item.label, false, {
								fileName: _jsxFileName,
								lineNumber: 82,
								columnNumber: 47
							}, this))
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 81,
							columnNumber: 11
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 71,
					columnNumber: 9
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 42,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("main", { children: [
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
					className: "fashion-intro-section",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "fashion-section-number",
						style: { fontSize: "15px" },
						children: "02"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 88,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "fashion-intro-content",
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
								className: "fashion-eyebrow",
								style: { fontSize: "12px" },
								children: "From browsing to fitting"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 92,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", {
								className: "fashion-section-title fashion-section-title--statement",
								children: [
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
										className: "statement-line statement-line--solid",
										style: {
											letterSpacing: "-1.5px",
											lineHeight: "50px"
										},
										children: "KHÔNG CHỈ"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 96,
										columnNumber: 15
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
										className: "statement-line statement-line--solid statement-line--offset",
										style: {
											letterSpacing: "-1.5px",
											lineHeight: "90px"
										},
										children: "CHỌN ĐỒ."
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 102,
										columnNumber: 15
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
										className: "statement-line statement-line--accent-small",
										style: {
											margin: "20px 0 15px 443.1px",
											fontFamily: "Oswald, sans-serif",
											fontWeight: 400,
											fontSize: "12px"
										},
										children: "CHỌN CÁCH BẠN"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 108,
										columnNumber: 15
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
										className: "statement-line statement-line--accent-display",
										style: {
											margin: "0 0 0 444.15px",
											letterSpacing: "-1px"
										},
										children: "XUẤT HIỆN."
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 116,
										columnNumber: 15
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 95,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
								className: "fashion-intro-copy",
								children: "Fashion Dream giữ AI try-on làm core. Commerce được thiết kế lại để sản phẩm, outfit và AI stylist nối liền thành một hành trình mua sắm tự nhiên."
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 123,
								columnNumber: 13
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 91,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 87,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
					className: "fashion-ai-feature",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "fashion-ai-feature__visual",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("img", {
							src: "https://images.pexels.com/photos/17037339/pexels-photo-17037339.jpeg?auto=compress&cs=tinysrgb&w=1100",
							alt: "AI outfit concept",
							loading: "lazy"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 131,
							columnNumber: 13
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "AI STUDIO / 01" }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 132,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 130,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "fashion-ai-feature__copy",
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
								className: "fashion-eyebrow",
								style: { fontSize: "15px" },
								children: "Personal styling system"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 135,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", {
								className: "fashion-section-title",
								style: { lineHeight: "50.323px" },
								children: [
									"Your look,",
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("br", {}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 140,
										columnNumber: 24
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
										className: "fashion-accent",
										children: "your logic."
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 140,
										columnNumber: 30
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 138,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
								style: { fontSize: "16px" },
								children: "Chọn một món đồ, đưa ảnh của bạn vào, rồi để AI giúp hình dung outfit trước khi quyết định mua."
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 141,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "fashion-feature-list",
								children: [
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("b", {
										style: { fontSize: "20px" },
										children: "01"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 145,
										columnNumber: 20
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
										style: { fontSize: "20px" },
										children: "Concept theo mood"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 147,
										columnNumber: 24
									}, this)] }, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 145,
										columnNumber: 15
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("b", {
										style: { fontSize: "20px" },
										children: "02"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 150,
										columnNumber: 20
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
										style: { fontSize: "20px" },
										children: "Virtual try-on"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 152,
										columnNumber: 24
									}, this)] }, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 150,
										columnNumber: 15
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("b", {
										style: { fontSize: "20px" },
										children: "03"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 155,
										columnNumber: 20
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
										style: { fontSize: "20px" },
										children: "AI styling recommendations"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 157,
										columnNumber: 24
									}, this)] }, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 155,
										columnNumber: 15
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 144,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, {
								to: "/ai",
								className: "fashion-text-link",
								children: "Open AI Studio ↗"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 161,
								columnNumber: 13
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 134,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 129,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
					className: "fashion-products-section",
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "fashion-section-head",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
								className: "fashion-eyebrow",
								style: { fontSize: "15px" },
								children: "03 / THE COLLECTION"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 167,
								columnNumber: 18
							}, this) }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 167,
								columnNumber: 13
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, {
								to: "/shop",
								className: "fashion-text-link",
								children: "View all products ↗"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 170,
								columnNumber: 13
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 166,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "fashion-category-filters",
							"aria-label": "Danh mục sản phẩm",
							children: COLLECTION_CATEGORIES.map((category) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
								type: "button",
								className: `fashion-category-filter${activeCategory === category.slug ? " is-active" : ""}`,
								"aria-pressed": activeCategory === category.slug,
								onClick: () => setActiveCategory(category.slug),
								children: category.label
							}, category.slug, false, {
								fileName: _jsxFileName,
								lineNumber: 173,
								columnNumber: 52
							}, this))
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 172,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "fashion-product-grid",
							children: featured.map((p) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ProductCard, { product: p }, p.id, false, {
								fileName: _jsxFileName,
								lineNumber: 178,
								columnNumber: 32
							}, this))
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 177,
							columnNumber: 11
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 165,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
					className: "fashion-flow",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
						className: "fashion-eyebrow",
						style: { fontSize: "15px" },
						children: "04 / THE EXPERIENCE"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 183,
						columnNumber: 16
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", {
						className: "fashion-section-title",
						style: { lineHeight: "50.323px" },
						children: [
							"See it.",
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("br", {}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 187,
								columnNumber: 21
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
								className: "fashion-accent",
								children: "Try it."
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 187,
								columnNumber: 27
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("br", {}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 187,
								columnNumber: 74
							}, this),
							"Wear it."
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 185,
						columnNumber: 37
					}, this)] }, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 183,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "fashion-flow__steps",
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "01" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 189,
									columnNumber: 18
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", { children: "Discover" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 189,
									columnNumber: 33
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { children: "Browse curated products and collections." }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 189,
									columnNumber: 50
								}, this)
							] }, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 189,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "02" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 190,
									columnNumber: 18
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", { children: "Try" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 190,
									columnNumber: 33
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { children: "Upload your photo and visualize the fit with AI." }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 190,
									columnNumber: 45
								}, this)
							] }, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 190,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "03" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 191,
									columnNumber: 18
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", { children: "Style" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 191,
									columnNumber: 33
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { children: "Build a complete look with AI recommendations." }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 191,
									columnNumber: 47
								}, this)
							] }, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 191,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "04" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 192,
									columnNumber: 18
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", { children: "Shop" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 192,
									columnNumber: 33
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { children: "Add the pieces you love and check out." }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 192,
									columnNumber: 46
								}, this)
							] }, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 192,
								columnNumber: 13
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 188,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 182,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
					className: "fashion-editorial",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("img", {
						src: "https://images.pexels.com/photos/18698406/pexels-photo-18698406.jpeg?auto=compress&cs=tinysrgb&w=1600",
						alt: "UpThink streetwear editorial",
						loading: "lazy"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 197,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
							className: "fashion-eyebrow",
							children: "EDITORIAL / SAIGON"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 198,
							columnNumber: 16
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", { children: [
							"Street is",
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("br", {}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 198,
								columnNumber: 82
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
								className: "fashion-accent",
								children: "the studio."
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 198,
								columnNumber: 88
							}, this)
						] }, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 198,
							columnNumber: 69
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, {
							to: "/about",
							className: "fashion-btn fashion-btn--light",
							children: "Our story ↗"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 198,
							columnNumber: 144
						}, this)
					] }, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 198,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 196,
					columnNumber: 9
				}, this)
			] }, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 86,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(SiteFooter, {}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 201,
				columnNumber: 7
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 40,
		columnNumber: 10
	}, this);
}
//#endregion
export { Index as component };
