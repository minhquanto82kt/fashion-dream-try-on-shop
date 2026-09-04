import { n as __toESM } from "../_runtime.mjs";
import { i as getProduct, n as PRODUCTS, r as formatVnd } from "./products--eiF-4or.mjs";
import { i as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { t as require_jsx_dev_runtime } from "../_libs/react.mjs";
import { n as useCart } from "./cart-BJWoGGHj.mjs";
import { D as isRedirect, _ as useRouter, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as LoaderCircle, n as Upload } from "../_libs/lucide-react.mjs";
import { n as SiteNav, t as SiteFooter } from "./site-footer-nwee6DhI.mjs";
import { t as getServerFnById } from "../__23tanstack-start-server-fn-resolver-BP__v-i7.mjs";
import { c as createServerFn, i as TSS_SERVER_FUNCTION } from "./createServerFn-CIHAFgYl.mjs";
import { t as Route } from "./ai-pVdSKno7.mjs";
import { n as objectType, r as stringType, t as arrayType } from "../_libs/zod.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai-Dk7o6hmp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_dev_runtime = require_jsx_dev_runtime();
function useServerFn(serverFn) {
	const router = useRouter();
	return import_react.useCallback(async (...args) => {
		try {
			const res = await serverFn(...args);
			if (isRedirect(res)) throw res;
			return res;
		} catch (err) {
			if (isRedirect(err)) {
				err.options._fromLocation = router.stores.location.get();
				return router.navigate(router.resolveRedirect(err).options);
			}
			throw err;
		}
	}, [router, serverFn]);
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var ConceptInput = objectType({
	style: stringType().min(1),
	occasion: stringType().min(1),
	prompt: stringType().max(600).optional(),
	mentions: arrayType(stringType()).max(8).optional()
});
var generateConcept = createServerFn({ method: "POST" }).validator((input) => ConceptInput.parse(input)).handler(createSsrRpc("0eaf9bcc91ee4040d27ca3e9199e256352fc937feb3668113ad33b5af2e61e68"));
var TryOnInput = objectType({
	personImage: stringType().min(20),
	garmentImage: stringType().min(5),
	garmentName: stringType().min(1),
	note: stringType().max(400).optional()
});
var generateTryOn = createServerFn({ method: "POST" }).validator((input) => TryOnInput.parse(input)).handler(createSsrRpc("24b4c48c1a4e0a10b7239b9091e439d6119eba3bf189e489428450b7051177ae"));
var _jsxFileName = "/root/app/code/fashion-dream-try-on-main/src/routes/ai.tsx?tsr-split=component";
var STYLES = [
	"Street",
	"Minimal",
	"Smart casual",
	"Y2K"
];
var OCCASIONS = [
	"Đi học",
	"Đi làm",
	"Hẹn hò",
	"Đi chơi"
];
function AiPage() {
	const search = Route.useSearch();
	const [mode, setMode] = (0, import_react.useState)(search.product ? "tryon" : "concept");
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(SiteNav, {}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 19,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("main", {
				className: "mx-auto max-w-6xl px-6 pb-24 pt-28 sm:px-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
						className: "eyebrow",
						children: "AI Experience · Beta"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 21,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h1", {
						className: "mt-3 text-4xl leading-none sm:text-5xl",
						children: ["Concept + ", /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
							className: "text-primary",
							children: "Virtual Try-On"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 23,
							columnNumber: 21
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 22,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
						className: "mt-4 max-w-2xl text-beige",
						children: "Hai luồng trong một workspace: tạo concept outfit theo mood, hoặc thử sản phẩm UpThink ngay trên ảnh của bạn."
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 25,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "mt-8 flex gap-2",
						children: ["concept", "tryon"].map((m) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
							onClick: () => setMode(m),
							className: `border px-5 py-2 text-xs uppercase tracking-[0.15em] ${mode === m ? "border-primary bg-primary text-primary-foreground" : "border-border text-beige hover:border-primary"}`,
							children: m === "concept" ? "Concept AI" : "Virtual Try-On"
						}, m, false, {
							fileName: _jsxFileName,
							lineNumber: 31,
							columnNumber: 53
						}, this))
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 30,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "mt-8",
						children: mode === "concept" ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ConceptPanel, {}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 37,
							columnNumber: 33
						}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TryOnPanel, { initialProduct: search.product }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 37,
							columnNumber: 52
						}, this)
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 36,
						columnNumber: 9
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 20,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(SiteFooter, {}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 40,
				columnNumber: 7
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 18,
		columnNumber: 10
	}, this);
}
function ResultPanel({ image, pending, emptyLabel }) {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "flex aspect-[3/4] items-center justify-center border border-border bg-card",
		children: pending ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "flex flex-col items-center gap-3 text-silver",
			children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(LoaderCircle, { className: "size-6 animate-spin text-primary" }, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 54,
				columnNumber: 11
			}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
				className: "text-xs uppercase tracking-[0.2em]",
				children: "AI đang dựng ảnh…"
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 55,
				columnNumber: 11
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 53,
			columnNumber: 18
		}, this) : image ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("img", {
			src: image,
			alt: "Kết quả AI",
			className: "size-full object-cover"
		}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 56,
			columnNumber: 26
		}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
			className: "max-w-xs px-6 text-center text-sm text-silver",
			children: emptyLabel
		}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 56,
			columnNumber: 100
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 52,
		columnNumber: 10
	}, this);
}
function ConceptPanel() {
	const run = useServerFn(generateConcept);
	const { items } = useCart();
	const [style, setStyle] = (0, import_react.useState)(STYLES[0]);
	const [occasion, setOccasion] = (0, import_react.useState)(OCCASIONS[0]);
	const [prompt, setPrompt] = (0, import_react.useState)("");
	const [query, setQuery] = (0, import_react.useState)(null);
	const textRef = (0, import_react.useRef)(null);
	const cartProducts = (0, import_react.useMemo)(() => {
		const seen = /* @__PURE__ */ new Set();
		return items.map((i) => i.product).filter((p) => seen.has(p.id) ? false : (seen.add(p.id), true));
	}, [items]);
	const suggestions = (0, import_react.useMemo)(() => {
		const pool = [...cartProducts, ...PRODUCTS.filter((p) => !cartProducts.some((c) => c.id === p.id))];
		const q = (query ?? "").toLowerCase();
		return pool.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 6);
	}, [cartProducts, query]);
	const mentions = (0, import_react.useMemo)(() => PRODUCTS.filter((p) => prompt.includes(`@${p.name}`)).map((p) => p.id), [prompt]);
	const onPromptChange = (value) => {
		setPrompt(value);
		const caret = textRef.current?.selectionStart ?? value.length;
		const match = /@([^@\n]{0,30})$/.exec(value.slice(0, caret));
		setQuery(match ? match[1] : null);
	};
	const insertMention = (name) => {
		const el = textRef.current;
		const caret = el?.selectionStart ?? prompt.length;
		const before = prompt.slice(0, caret).replace(/@([^@\n]{0,30})$/, "");
		const next = `${before}@${name} ${prompt.slice(caret)}`;
		setPrompt(next);
		setQuery(null);
		requestAnimationFrame(() => {
			el?.focus();
			const pos = before.length + name.length + 2;
			el?.setSelectionRange(pos, pos);
		});
	};
	const mutation = useMutation({
		mutationFn: () => run({ data: {
			style,
			occasion,
			prompt: prompt || void 0,
			mentions: mentions.length ? mentions : void 0
		} }),
		onError: (e) => toast.error(e.message)
	});
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "grid gap-8 lg:grid-cols-[1fr_0.8fr]",
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "space-y-6 border border-border bg-card p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Choices, {
					label: "1. Phong cách",
					options: STYLES,
					value: style,
					onChange: setStyle
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 111,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Choices, {
					label: "2. Dịp sử dụng",
					options: OCCASIONS,
					value: occasion,
					onChange: setOccasion
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 112,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
							className: "text-xs uppercase tracking-[0.2em] text-silver",
							children: "3. Mô tả outfit"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 116,
							columnNumber: 13
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
							className: "text-[0.65rem] text-silver",
							children: [
								"Gõ ",
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
									className: "text-primary",
									children: "@"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 118,
									columnNumber: 18
								}, this),
								" để nhắc sản phẩm trong giỏ"
							]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 117,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 115,
						columnNumber: 11
					}, this),
					cartProducts.length > 0 && /* @__PURE__ */ (void 0)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: cartProducts.map((p) => /* @__PURE__ */ (void 0)("button", {
							onClick: () => insertMention(p.name),
							className: "flex items-center gap-2 border border-border px-3 py-1.5 text-xs text-beige hover:border-primary",
							children: [
								/* @__PURE__ */ (void 0)("img", {
									src: p.image,
									alt: "",
									className: "size-5 object-cover"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 124,
									columnNumber: 19
								}, this),
								/* @__PURE__ */ (void 0)("span", {
									className: "text-primary",
									children: "@"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 125,
									columnNumber: 19
								}, this),
								p.name
							]
						}, p.id, true, {
							fileName: _jsxFileName,
							lineNumber: 123,
							columnNumber: 38
						}, this))
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 122,
						columnNumber: 39
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("textarea", {
							ref: textRef,
							rows: 4,
							value: prompt,
							onChange: (e) => onPromptChange(e.target.value),
							onBlur: () => window.setTimeout(() => setQuery(null), 120),
							placeholder: "Ví dụ: phối @Shadow Hoodie với quần cargo rộng, sneaker trắng…",
							className: "mt-2 w-full resize-none border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 131,
							columnNumber: 13
						}, this), query !== null && suggestions.length > 0 && /* @__PURE__ */ (void 0)("ul", {
							className: "absolute inset-x-0 top-full z-20 max-h-56 overflow-auto border border-border bg-card",
							children: suggestions.map((p) => /* @__PURE__ */ (void 0)("li", { children: /* @__PURE__ */ (void 0)("button", {
								onMouseDown: (e) => e.preventDefault(),
								onClick: () => insertMention(p.name),
								className: "flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-beige hover:bg-background",
								children: [
									/* @__PURE__ */ (void 0)("img", {
										src: p.image,
										alt: "",
										className: "size-8 object-cover"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 135,
										columnNumber: 23
									}, this),
									/* @__PURE__ */ (void 0)("span", {
										className: "flex-1",
										children: p.name
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 136,
										columnNumber: 23
									}, this),
									cartProducts.some((c) => c.id === p.id) && /* @__PURE__ */ (void 0)("span", {
										className: "text-[0.6rem] uppercase tracking-[0.15em] text-primary",
										children: "Trong giỏ"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 137,
										columnNumber: 65
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 134,
								columnNumber: 21
							}, this) }, p.id, false, {
								fileName: _jsxFileName,
								lineNumber: 133,
								columnNumber: 39
							}, this))
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 132,
							columnNumber: 58
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 130,
						columnNumber: 11
					}, this),
					mentions.length > 0 && /* @__PURE__ */ (void 0)("p", {
						className: "mt-2 text-xs text-silver",
						children: [
							"AI sẽ dùng ",
							mentions.length,
							" sản phẩm được nhắc để dựng outfit."
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 145,
						columnNumber: 35
					}, this)
				] }, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 114,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
					onClick: () => mutation.mutate(),
					disabled: mutation.isPending,
					className: "w-full bg-primary px-6 py-3 text-xs uppercase tracking-[0.15em] text-primary-foreground disabled:opacity-60",
					children: mutation.isPending ? "Đang tạo concept…" : "Tạo concept outfit"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 150,
					columnNumber: 9
				}, this),
				mutation.data?.text && /* @__PURE__ */ (void 0)("p", {
					className: "text-sm text-beige",
					children: mutation.data.text
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 153,
					columnNumber: 33
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 110,
			columnNumber: 7
		}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ResultPanel, {
			image: mutation.data?.image,
			pending: mutation.isPending,
			emptyLabel: "Concept outfit của bạn sẽ hiện ở đây."
		}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 156,
			columnNumber: 7
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 109,
		columnNumber: 10
	}, this);
}
function TryOnPanel({ initialProduct }) {
	const run = useServerFn(generateTryOn);
	const { add } = useCart();
	const fileRef = (0, import_react.useRef)(null);
	const [person, setPerson] = (0, import_react.useState)(null);
	const [productId, setProductId] = (0, import_react.useState)(initialProduct && getProduct(initialProduct)?.id || PRODUCTS[0].id);
	const [note, setNote] = (0, import_react.useState)("");
	const product = getProduct(productId);
	const mutation = useMutation({
		mutationFn: () => run({ data: {
			personImage: person,
			garmentImage: product.image,
			garmentName: product.name,
			note: note || void 0
		} }),
		onError: (e) => toast.error(e.message)
	});
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "grid gap-8 lg:grid-cols-[1fr_0.8fr]",
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "space-y-6 border border-border bg-card p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
						className: "text-xs uppercase tracking-[0.2em] text-silver",
						children: "1. Ảnh của bạn"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 187,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
						onClick: () => fileRef.current?.click(),
						className: "mt-3 flex w-full items-center justify-center gap-2 border border-dashed border-border py-8 text-sm text-beige hover:border-primary",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Upload, { className: "size-4" }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 189,
							columnNumber: 13
						}, this), person ? "Đổi ảnh khác" : "Tải ảnh toàn thân (JPG/PNG)"]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 188,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
						ref: fileRef,
						type: "file",
						accept: "image/*",
						className: "hidden",
						onChange: (e) => {
							const file = e.target.files?.[0];
							if (!file) return;
							if (file.size > 6e6) {
								toast.error("Ảnh tối đa 6MB.");
								return;
							}
							const reader = new FileReader();
							reader.onload = () => setPerson(reader.result);
							reader.readAsDataURL(file);
						}
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 192,
						columnNumber: 11
					}, this),
					person && /* @__PURE__ */ (void 0)("img", {
						src: person,
						alt: "Ảnh của bạn",
						className: "mt-3 h-40 object-cover"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 203,
						columnNumber: 22
					}, this)
				] }, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 186,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
					className: "text-xs uppercase tracking-[0.2em] text-silver",
					children: "2. Chọn sản phẩm"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 207,
					columnNumber: 11
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: PRODUCTS.map((p) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
						onClick: () => setProductId(p.id),
						className: `border px-3 py-2 text-xs ${p.id === productId ? "border-primary text-primary" : "border-border text-beige hover:border-primary"}`,
						children: p.name
					}, p.id, false, {
						fileName: _jsxFileName,
						lineNumber: 209,
						columnNumber: 32
					}, this))
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 208,
					columnNumber: 11
				}, this)] }, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 206,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("label", {
					className: "block",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
						className: "text-xs uppercase tracking-[0.2em] text-silver",
						children: "3. Ghi chú thêm"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 216,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("textarea", {
						rows: 3,
						value: note,
						onChange: (e) => setNote(e.target.value),
						placeholder: "Ví dụ: mặc form rộng hơn, phối cùng quần đen…",
						className: "mt-2 w-full resize-none border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 217,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 215,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
					onClick: () => person ? mutation.mutate() : toast.error("Hãy tải ảnh của bạn trước."),
					disabled: mutation.isPending,
					className: "w-full bg-primary px-6 py-3 text-xs uppercase tracking-[0.15em] text-primary-foreground disabled:opacity-60",
					children: mutation.isPending ? "Đang thử đồ…" : "Thử đồ ngay"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 220,
					columnNumber: 9
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 185,
			columnNumber: 7
		}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ResultPanel, {
				image: mutation.data?.image,
				pending: mutation.isPending,
				emptyLabel: "Tải ảnh và chọn sản phẩm để xem bạn trong bộ đồ này."
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 226,
				columnNumber: 9
			}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "flex items-center justify-between gap-3 border border-border bg-card p-4",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
					className: "text-sm font-medium",
					children: product.name
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 229,
					columnNumber: 13
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
					className: "text-xs text-primary",
					children: formatVnd(product.price)
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 230,
					columnNumber: 13
				}, this)] }, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 228,
					columnNumber: 11
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, {
						to: "/product/$id",
						params: { id: product.id },
						className: "border border-border px-3 py-2 text-xs uppercase tracking-[0.15em] text-beige hover:border-primary",
						children: "Chi tiết"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 233,
						columnNumber: 13
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
						onClick: () => {
							add({
								productId: product.id,
								size: product.sizes[0],
								color: product.colors[0],
								qty: 1
							});
							toast.success("Đã thêm vào giỏ");
						},
						className: "bg-primary px-3 py-2 text-xs uppercase tracking-[0.15em] text-primary-foreground",
						children: "Thêm giỏ"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 238,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 232,
					columnNumber: 11
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 227,
				columnNumber: 9
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 225,
			columnNumber: 7
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 184,
		columnNumber: 10
	}, this);
}
function Choices({ label, options, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
		className: "text-xs uppercase tracking-[0.2em] text-silver",
		children: label
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 266,
		columnNumber: 7
	}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "mt-3 flex flex-wrap gap-2",
		children: options.map((o) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
			onClick: () => onChange(o),
			className: `border px-4 py-2 text-xs ${o === value ? "border-primary bg-primary text-primary-foreground" : "border-border text-beige hover:border-primary"}`,
			children: o
		}, o, false, {
			fileName: _jsxFileName,
			lineNumber: 268,
			columnNumber: 27
		}, this))
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 267,
		columnNumber: 7
	}, this)] }, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 265,
		columnNumber: 10
	}, this);
}
//#endregion
export { AiPage as component };
