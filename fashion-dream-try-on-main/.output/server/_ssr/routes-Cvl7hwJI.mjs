import { n as __toESM } from "../_runtime.mjs";
import { n as PRODUCTS } from "./products--eiF-4or.mjs";
import { i as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { t as require_jsx_dev_runtime } from "../_libs/react.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as SiteNav, t as SiteFooter } from "./site-footer-nwee6DhI.mjs";
import { t as ProductCard } from "./product-card-uAaCiHnz.mjs";
import { t as HERO_SLIDES } from "./routes-Bj3hJEGc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Cvl7hwJI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_dev_runtime = require_jsx_dev_runtime();
var _jsxFileName = "/root/app/code/fashion-dream-try-on-main/src/routes/index.tsx?tsr-split=component";
function Index() {
	const featured = PRODUCTS.slice(0, 6);
	const [slide, setSlide] = (0, import_react.useState)(0);
	const [isPaused, setIsPaused] = (0, import_react.useState)(false);
	const active = HERO_SLIDES[slide];
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
				lineNumber: 21,
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
								lineNumber: 25,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h1", {
								className: "fashion-display",
								children: [
									"Dress the",
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("br", {}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 27,
										columnNumber: 24
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
										className: "fashion-accent",
										children: "future."
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 27,
										columnNumber: 30
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 26,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
								className: "fashion-hero__lede",
								children: "Một wardrobe được chọn theo gu của bạn — kết hợp commerce, AI styling và virtual try-on trong cùng một trải nghiệm."
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 29,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "fashion-hero__actions",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, {
									to: "/shop",
									className: "fashion-btn",
									children: "Explore collection ↗"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 33,
									columnNumber: 15
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, {
									to: "/ai",
									className: "fashion-btn fashion-btn--ghost",
									children: "Start AI try-on"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 34,
									columnNumber: 15
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 32,
								columnNumber: 13
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 24,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "fashion-hero__meta",
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "UPTHINK / IUH" }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 38,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "SAIGON — 2026" }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 38,
								columnNumber: 39
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "SYS_02 // ONLINE" }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 38,
								columnNumber: 65
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 37,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 23,
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
							lineNumber: 42,
							columnNumber: 45
						}, this)),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "fashion-hero__overlay" }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 43,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "fashion-hero__scan" }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 44,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "fashion-hero__hud",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
								className: "fashion-hero__status",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("b", {}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 46,
									columnNumber: 52
								}, this), " AI VISION / LIVE"]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 46,
								columnNumber: 13
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: active.title }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 47,
								columnNumber: 13
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 45,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
							className: "fashion-hero__label",
							children: active.label
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 49,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
							className: "fashion-hero__vertical",
							children: "VIRTUAL FIT / PERSONAL EDIT"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 50,
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
								lineNumber: 52,
								columnNumber: 47
							}, this))
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 51,
							columnNumber: 11
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 41,
					columnNumber: 9
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 22,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("main", { children: [
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
					className: "fashion-intro-section",
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "fashion-section-number",
							children: "02"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 58,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
							className: "fashion-eyebrow",
							children: "From browsing to fitting"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 60,
							columnNumber: 13
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", {
							className: "fashion-section-title fashion-section-title--statement",
							children: [
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
									className: "statement-line statement-line--solid",
									children: "KHÔNG CHỈ"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 62,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
									className: "statement-line statement-line--solid statement-line--offset",
									children: "CHỌN ĐỒ."
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 63,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
									className: "statement-line statement-line--accent-small",
									children: "CHỌN CÁCH BẠN"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 64,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
									className: "statement-line statement-line--accent-display",
									children: "XUẤT HIỆN."
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 65,
									columnNumber: 15
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 61,
							columnNumber: 13
						}, this)] }, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 59,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
							className: "fashion-intro-copy",
							children: "Fashion Dream giữ AI try-on làm core. Commerce được thiết kế lại để sản phẩm, outfit và AI stylist nối liền thành một hành trình mua sắm tự nhiên."
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 68,
							columnNumber: 11
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 57,
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
							lineNumber: 75,
							columnNumber: 13
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "AI STUDIO / 01" }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 76,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 74,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "fashion-ai-feature__copy",
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
								className: "fashion-eyebrow",
								children: "Personal styling system"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 79,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", {
								className: "fashion-section-title",
								children: [
									"Your look,",
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("br", {}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 80,
										columnNumber: 61
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
										className: "fashion-accent",
										children: "your logic."
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 80,
										columnNumber: 67
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 80,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { children: "Chọn một món đồ, đưa ảnh của bạn vào, rồi để AI giúp hình dung outfit trước khi quyết định mua." }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 81,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "fashion-feature-list",
								children: [
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("b", { children: "01" }, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 83,
										columnNumber: 20
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "Concept theo mood" }, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 83,
										columnNumber: 29
									}, this)] }, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 83,
										columnNumber: 15
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("b", { children: "02" }, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 84,
										columnNumber: 20
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "Virtual try-on" }, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 84,
										columnNumber: 29
									}, this)] }, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 84,
										columnNumber: 15
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("b", { children: "03" }, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 85,
										columnNumber: 20
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "AI styling recommendations" }, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 85,
										columnNumber: 29
									}, this)] }, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 85,
										columnNumber: 15
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 82,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, {
								to: "/ai",
								className: "fashion-text-link",
								children: "Open AI Studio ↗"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 87,
								columnNumber: 13
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 78,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 73,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
					className: "fashion-products-section",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "fashion-section-head",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
							className: "fashion-eyebrow",
							children: "03 / THE COLLECTION"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 93,
							columnNumber: 18
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", {
							className: "fashion-section-title",
							children: [
								"New",
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("br", {}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 93,
									columnNumber: 113
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
									className: "fashion-accent",
									children: "drop."
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 93,
									columnNumber: 119
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 93,
							columnNumber: 72
						}, this)] }, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 93,
							columnNumber: 13
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, {
							to: "/shop",
							className: "fashion-text-link",
							children: "View all products ↗"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 94,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 92,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "fashion-product-grid",
						children: featured.map((p) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ProductCard, { product: p }, p.id, false, {
							fileName: _jsxFileName,
							lineNumber: 97,
							columnNumber: 32
						}, this))
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 96,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 91,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
					className: "fashion-flow",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
						className: "fashion-eyebrow",
						children: "04 / THE EXPERIENCE"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 102,
						columnNumber: 16
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", {
						className: "fashion-section-title",
						children: [
							"See it.",
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("br", {}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 102,
								columnNumber: 115
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
								className: "fashion-accent",
								children: "Try it."
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 102,
								columnNumber: 121
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("br", {}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 102,
								columnNumber: 168
							}, this),
							"Wear it."
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 102,
						columnNumber: 70
					}, this)] }, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 102,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "fashion-flow__steps",
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "01" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 104,
									columnNumber: 18
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", { children: "Discover" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 104,
									columnNumber: 33
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { children: "Browse curated products and collections." }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 104,
									columnNumber: 50
								}, this)
							] }, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 104,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "02" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 105,
									columnNumber: 18
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", { children: "Try" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 105,
									columnNumber: 33
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { children: "Upload your photo and visualize the fit with AI." }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 105,
									columnNumber: 45
								}, this)
							] }, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 105,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "03" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 106,
									columnNumber: 18
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", { children: "Style" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 106,
									columnNumber: 33
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { children: "Build a complete look with AI recommendations." }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 106,
									columnNumber: 47
								}, this)
							] }, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 106,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "04" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 107,
									columnNumber: 18
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", { children: "Shop" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 107,
									columnNumber: 33
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { children: "Add the pieces you love and check out." }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 107,
									columnNumber: 46
								}, this)
							] }, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 107,
								columnNumber: 13
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 103,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 101,
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
						lineNumber: 112,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
							className: "fashion-eyebrow",
							children: "EDITORIAL / SAIGON"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 113,
							columnNumber: 16
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", { children: [
							"Street is",
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("br", {}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 113,
								columnNumber: 82
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
								className: "fashion-accent",
								children: "the studio."
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 113,
								columnNumber: 88
							}, this)
						] }, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 113,
							columnNumber: 69
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, {
							to: "/about",
							className: "fashion-btn fashion-btn--light",
							children: "Our story ↗"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 113,
							columnNumber: 144
						}, this)
					] }, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 113,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 111,
					columnNumber: 9
				}, this)
			] }, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 56,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(SiteFooter, {}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 116,
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
export { Index as component };
