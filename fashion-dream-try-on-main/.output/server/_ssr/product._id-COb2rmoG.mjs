import { i as getProduct, r as formatVnd } from "./products--eiF-4or.mjs";
import { M as notFound, f as lazyRouteComponent, p as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/product._id-COb2rmoG.js
var $$splitComponentImporter = () => import("./product._id-CQvzoqep.mjs");
var Route = createFileRoute("/product/$id")({
	loader: ({ params }) => {
		const product = getProduct(params.id);
		if (!product) throw notFound();
		return { product };
	},
	head: ({ loaderData }) => {
		if (!loaderData) return { meta: [{ title: "Không tìm thấy sản phẩm | UpThink" }, {
			name: "robots",
			content: "noindex"
		}] };
		const p = loaderData.product;
		return { meta: [
			{ title: `${p.name} — ${formatVnd(p.price)} | UpThink` },
			{
				name: "description",
				content: p.description.slice(0, 155)
			},
			{
				property: "og:title",
				content: `${p.name} | UpThink`
			},
			{
				property: "og:description",
				content: p.description.slice(0, 155)
			},
			{
				property: "og:image",
				content: p.image
			},
			{
				name: "twitter:image",
				content: p.image
			}
		] };
	},
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
