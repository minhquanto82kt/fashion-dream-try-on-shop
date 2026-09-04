import { f as lazyRouteComponent, p as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai-CcOVbSYM.js
var $$splitComponentImporter = () => import("./ai-dDPt2saj.mjs");
var Route = createFileRoute("/ai")({
	validateSearch: (search) => typeof search["product"] === "string" ? { product: search["product"] } : {},
	head: () => ({ meta: [
		{ title: "AI Lab — Concept & Virtual Try-On | UpThink" },
		{
			name: "description",
			content: "Tạo concept outfit bằng AI và thử đồ ảo trên ảnh của chính bạn trước khi mua tại UpThink."
		},
		{
			property: "og:title",
			content: "UpThink AI Lab"
		},
		{
			property: "og:description",
			content: "Concept AI và Virtual Try-On cho thời trang cá nhân hóa."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
