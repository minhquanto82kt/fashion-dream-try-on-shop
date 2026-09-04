import { n as PRODUCTS } from "./products-jMfr2MY-.mjs";
import { c as createServerFn, i as TSS_SERVER_FUNCTION } from "./createServerFn-CIHAFgYl.mjs";
import { n as objectType, r as stringType, t as arrayType } from "../_libs/zod.mjs";
import processModule from "node:process";
//#region node_modules/.nitro/vite/services/ssr/assets/ai.functions-DhEUrRLD.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
var IMAGE_MODEL = "google/gemini-2.5-flash-image";
async function generateImage(content) {
	const key = processModule.env["LOVABLE_API_KEY"];
	if (!key) throw new Error("Thiếu cấu hình AI (LOVABLE_API_KEY).");
	const res = await fetch(GATEWAY, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${key}`
		},
		body: JSON.stringify({
			model: IMAGE_MODEL,
			modalities: ["image", "text"],
			messages: [{
				role: "user",
				content
			}]
		})
	});
	if (!res.ok) {
		if (res.status === 429) throw new Error("AI đang quá tải, vui lòng thử lại sau ít phút.");
		if (res.status === 402) throw new Error("Đã hết credit AI. Vui lòng nạp thêm trong Lovable.");
		const detail = await res.text();
		throw new Error(`AI lỗi (${res.status}): ${detail.slice(0, 200)}`);
	}
	const message = (await res.json()).choices?.[0]?.message;
	const image = message?.images?.[0]?.image_url?.url;
	if (!image) throw new Error("AI không trả về hình ảnh. Hãy thử mô tả khác.");
	return {
		image,
		text: message?.content ?? ""
	};
}
var ConceptInput = objectType({
	style: stringType().min(1),
	occasion: stringType().min(1),
	prompt: stringType().max(600).optional(),
	mentions: arrayType(stringType()).max(8).optional()
});
var generateConcept_createServerFn_handler = createServerRpc({
	id: "0eaf9bcc91ee4040d27ca3e9199e256352fc937feb3668113ad33b5af2e61e68",
	name: "generateConcept",
	filename: "src/lib/ai.functions.ts"
}, (opts) => generateConcept.__executeServer(opts));
var generateConcept = createServerFn({ method: "POST" }).validator((input) => ConceptInput.parse(input)).handler(generateConcept_createServerFn_handler, async ({ data }) => {
	const items = (data.mentions ?? []).map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean).map((p) => `${p.name} (${p.category}, màu ${p.colors.join("/")}): ${p.description}`).join(" | ");
	return generateImage([{
		type: "text",
		text: [
			"Full-body fashion editorial photograph of a young Vietnamese university student model,",
			`styled in a ${data.style} outfit for the occasion: ${data.occasion}.`,
			items ? `The outfit MUST feature these UpThink pieces: ${items}.` : "",
			data.prompt ? `Additional direction: ${data.prompt}.` : "",
			"Streetwear brand aesthetic: charcoal and ivory palette with a lime-green accent, urban concrete backdrop,",
			"natural daylight, 35mm lens, sharp detail, no text or watermark."
		].filter(Boolean).join(" ")
	}]);
});
var TryOnInput = objectType({
	personImage: stringType().min(20),
	garmentImage: stringType().min(5),
	garmentName: stringType().min(1),
	note: stringType().max(400).optional()
});
var generateTryOn_createServerFn_handler = createServerRpc({
	id: "24b4c48c1a4e0a10b7239b9091e439d6119eba3bf189e489428450b7051177ae",
	name: "generateTryOn",
	filename: "src/lib/ai.functions.ts"
}, (opts) => generateTryOn.__executeServer(opts));
var generateTryOn = createServerFn({ method: "POST" }).validator((input) => TryOnInput.parse(input)).handler(generateTryOn_createServerFn_handler, async ({ data }) => {
	return generateImage([
		{
			type: "text",
			text: [
				`Virtual try-on: dress the person in the first image with the garment "${data.garmentName}" shown in the second image.`,
				"Keep the person's face, body proportions, pose, skin tone and background exactly the same.",
				"Fit the garment naturally with realistic folds, shadows and lighting.",
				data.note ? `Extra request: ${data.note}.` : "",
				"Photorealistic result, no text or watermark."
			].filter(Boolean).join(" ")
		},
		{
			type: "image_url",
			image_url: { url: data.personImage }
		},
		{
			type: "image_url",
			image_url: { url: data.garmentImage }
		}
	]);
});
//#endregion
export { generateConcept_createServerFn_handler, generateTryOn_createServerFn_handler };
