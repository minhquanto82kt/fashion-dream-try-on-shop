import { n as PRODUCTS } from "./products-jMfr2MY-.mjs";
import { c as createServerFn, i as TSS_SERVER_FUNCTION } from "./createServerFn-CIHAFgYl.mjs";
import { n as objectType, r as stringType, t as arrayType } from "../_libs/zod.mjs";
import { t as generateImage } from "../_libs/ai.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai.functions-8M1fvI2u.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var IMAGE_MODEL = "openai/gpt-image-2";
async function generateFashionImage(prompt, images = []) {
	try {
		const image = (await generateImage({
			model: IMAGE_MODEL,
			prompt,
			images: images.length > 0 ? images : void 0,
			n: 1
		})).image;
		if (!image) throw new Error("AI không trả về hình ảnh.");
		return {
			image: `data:${image.mediaType};base64,${image.base64}`,
			text: ""
		};
	} catch (error) {
		console.error("AI Gateway image generation error:", error);
		if (error instanceof Error) throw new Error(`AI tạo ảnh thất bại: ${error.message}`);
		throw new Error("AI tạo ảnh thất bại. Vui lòng thử lại.");
	}
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
	const items = (data.mentions ?? []).map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean).map((p) => `${p.name} (${p.category}, màu ${p.colors.join("/")})`).join(" | ");
	return generateFashionImage([
		"Create a full-body fashion editorial photograph of a young Vietnamese university student model.",
		`Style: ${data.style}.`,
		`Occasion: ${data.occasion}.`,
		items ? `The outfit MUST feature these UpThink clothing pieces: ${items}.` : "",
		data.prompt ? `Additional direction: ${data.prompt}.` : "",
		"Streetwear brand aesthetic.",
		"Charcoal and ivory palette with a lime-green accent.",
		"Urban concrete backdrop.",
		"Natural daylight.",
		"35mm photography.",
		"Sharp realistic detail.",
		"Photorealistic.",
		"No text.",
		"No watermark."
	].filter(Boolean).join(" "));
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
	return generateFashionImage([
		"Perform a realistic virtual try-on edit.",
		`Dress the person in the first reference image with the garment "${data.garmentName}" shown in the second reference image.`,
		"Preserve the person's identity and facial features.",
		"Preserve body proportions, skin tone, pose and hairstyle.",
		"Keep the original background and camera composition.",
		"Replace only the clothing.",
		"Make the garment fit naturally according to the person's body shape.",
		"Preserve the garment's design, color, material, pattern, seams and important details.",
		"Add realistic fabric folds, shadows and lighting consistent with the original photograph.",
		"Do not change the person's face or body.",
		data.note ? `Additional request: ${data.note}.` : "",
		"Photorealistic result.",
		"No text.",
		"No watermark."
	].filter(Boolean).join(" "), [data.personImage, data.garmentImage]);
});
//#endregion
export { generateConcept_createServerFn_handler, generateTryOn_createServerFn_handler };
