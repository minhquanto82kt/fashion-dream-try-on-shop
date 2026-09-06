import { A as discriminatedUnion, B as unknown, C as zodSchema, D as array, E as _null, F as number, H as APICallError, I as object, K as isJSONObject, L as record, M as literal, N as looseObject, O as boolean, P as never, R as string, S as withUserAgentSuffix, T as _instanceof, V as AISDKError, W as TypeValidationError, b as safeParseJSON, d as createIdGenerator, f as detectMediaType, g as lazySchema, h as isBuffer, j as lazy, k as custom, l as convertBase64ToUint8Array, n as gateway, s as asSchema, t as GatewayError, u as convertUint8ArrayToBase64, v as resolve, w as _enum, x as safeValidateTypes, y as retryWithExponentialBackoff, z as union } from "./@ai-sdk/gateway+[...].mjs";
import processModule from "node:process";
//#region node_modules/ai/dist/index.js
var __defProp = Object.defineProperty;
var __export = (target, all) => {
	for (var name25 in all) __defProp(target, name25, {
		get: all[name25],
		enumerable: true
	});
};
var name = "AI_InvalidArgumentError";
var marker = `vercel.ai.error.${name}`;
var symbol = Symbol.for(marker);
var _a;
var _b;
var InvalidArgumentError = class extends (_b = AISDKError, _a = symbol, _b) {
	constructor({ parameter, value, message }) {
		super({
			name,
			message: `Invalid argument for parameter ${parameter}: ${message}`
		});
		this[_a] = true;
		this.parameter = parameter;
		this.value = value;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker);
	}
};
var name8 = "AI_NoImageGeneratedError";
var marker8 = `vercel.ai.error.${name8}`;
var symbol8 = Symbol.for(marker8);
var _a8;
var _b8;
var NoImageGeneratedError = class extends (_b8 = AISDKError, _a8 = symbol8, _b8) {
	constructor({ message = "No image generated.", cause, calls, responses }) {
		super({
			name: name8,
			message,
			cause
		});
		this[_a8] = true;
		this.calls = calls;
		this.responses = responses;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker8);
	}
};
var name9 = "AI_NoObjectGeneratedError";
var marker9 = `vercel.ai.error.${name9}`;
var symbol9 = Symbol.for(marker9);
var _a9;
var _b9;
var NoObjectGeneratedError = class extends (_b9 = AISDKError, _a9 = symbol9, _b9) {
	constructor({ message = "No object generated.", cause, text: text2, response, usage, finishReason }) {
		super({
			name: name9,
			message,
			cause
		});
		this[_a9] = true;
		this.text = text2;
		this.response = response;
		this.usage = usage;
		this.finishReason = finishReason;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker9);
	}
};
var UnsupportedModelVersionError = class extends AISDKError {
	constructor(options) {
		super({
			name: "AI_UnsupportedModelVersionError",
			message: `Unsupported model version ${options.version} for provider "${options.provider}" and model "${options.modelId}". AI SDK 5 only supports models that implement specification version "v2".`
		});
		this.version = options.version;
		this.provider = options.provider;
		this.modelId = options.modelId;
	}
};
var name20 = "AI_InvalidDataContentError";
var marker20 = `vercel.ai.error.${name20}`;
var symbol20 = Symbol.for(marker20);
var _a20;
var _b20;
var InvalidDataContentError = class extends (_b20 = AISDKError, _a20 = symbol20, _b20) {
	constructor({ content, cause, message = `Invalid data content. Expected a base64 string, Uint8Array, ArrayBuffer, or Buffer, but got ${typeof content}.` }) {
		super({
			name: name20,
			message,
			cause
		});
		this[_a20] = true;
		this.content = content;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker20);
	}
};
var name23 = "AI_RetryError";
var marker23 = `vercel.ai.error.${name23}`;
var symbol23 = Symbol.for(marker23);
var _a23;
var _b23;
var RetryError = class extends (_b23 = AISDKError, _a23 = symbol23, _b23) {
	constructor({ message, reason, errors }) {
		super({
			name: name23,
			message
		});
		this[_a23] = true;
		this.reason = reason;
		this.errors = errors;
		this.lastError = errors[errors.length - 1];
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker23);
	}
};
function formatWarning({ warning, provider, model }) {
	const prefix = `AI SDK Warning${provider != null && model != null ? ` (${provider} / ${model})` : ""}:`;
	switch (warning.type) {
		case "unsupported": {
			let message = `${prefix} The feature "${warning.feature}" is not supported.`;
			if (warning.details) message += ` ${warning.details}`;
			return message;
		}
		case "compatibility": {
			let message = `${prefix} The feature "${warning.feature}" is used in a compatibility mode.`;
			if (warning.details) message += ` ${warning.details}`;
			return message;
		}
		case "deprecated": return `${prefix} Deprecated: "${warning.setting}". ${warning.message}`;
		case "other": return `${prefix} ${warning.message}`;
		default: return `${prefix} ${JSON.stringify(warning, null, 2)}`;
	}
}
var FIRST_WARNING_INFO_MESSAGE = "AI SDK Warning System: To turn off warning logging, set the AI_SDK_LOG_WARNINGS global to false.";
var hasLoggedBefore = false;
function emitWarning({ message, type }) {
	if (typeof processModule !== "undefined" && typeof processModule.emitWarning === "function") processModule.emitWarning(message, { type });
	else console.warn(message);
}
var logWarnings = (options) => {
	if (options.warnings.length === 0) return;
	const logger = globalThis.AI_SDK_LOG_WARNINGS;
	if (logger === false) return;
	if (typeof logger === "function") {
		logger(options);
		return;
	}
	if (!hasLoggedBefore) {
		hasLoggedBefore = true;
		emitWarning({
			message: FIRST_WARNING_INFO_MESSAGE,
			type: "Warning"
		});
	}
	for (const warning of options.warnings) emitWarning({
		message: formatWarning({
			warning,
			provider: options.provider,
			model: options.model
		}),
		type: warning.type === "deprecated" ? "DeprecationWarning" : "Warning"
	});
};
function logV2CompatibilityWarning({ provider, modelId }) {
	logWarnings({
		warnings: [{
			type: "compatibility",
			feature: "specificationVersion",
			details: `Using v2 specification compatibility mode. Some features may not be available.`
		}],
		provider,
		model: modelId
	});
}
function asEmbeddingModelV3(model) {
	if (model.specificationVersion === "v3") return model;
	logV2CompatibilityWarning({
		provider: model.provider,
		modelId: model.modelId
	});
	return new Proxy(model, { get(target, prop) {
		if (prop === "specificationVersion") return "v3";
		return target[prop];
	} });
}
function asEmbeddingModelV4(model) {
	if (model.specificationVersion === "v4") return model;
	const v3Model = model.specificationVersion === "v2" ? asEmbeddingModelV3(model) : model;
	return new Proxy(v3Model, { get(target, prop) {
		if (prop === "specificationVersion") return "v4";
		return target[prop];
	} });
}
function asImageModelV3(model) {
	if (model.specificationVersion === "v3") return model;
	logV2CompatibilityWarning({
		provider: model.provider,
		modelId: model.modelId
	});
	return new Proxy(model, { get(target, prop) {
		if (prop === "specificationVersion") return "v3";
		return target[prop];
	} });
}
function asImageModelV4(model) {
	if (model.specificationVersion === "v4") return model;
	const v3Model = model.specificationVersion === "v2" ? asImageModelV3(model) : model;
	return new Proxy(v3Model, { get(target, prop) {
		if (prop === "specificationVersion") return "v4";
		return target[prop];
	} });
}
function asLanguageModelV3(model) {
	if (model.specificationVersion === "v3") return model;
	logV2CompatibilityWarning({
		provider: model.provider,
		modelId: model.modelId
	});
	return new Proxy(model, { get(target, prop) {
		switch (prop) {
			case "specificationVersion": return "v3";
			case "doGenerate": return async (...args) => {
				const result = await target.doGenerate(...args);
				return {
					...result,
					finishReason: convertV2FinishReasonToV3(result.finishReason),
					usage: convertV2UsageToV3(result.usage)
				};
			};
			case "doStream": return async (...args) => {
				const result = await target.doStream(...args);
				return {
					...result,
					stream: convertV2StreamToV3(result.stream)
				};
			};
			default: return target[prop];
		}
	} });
}
function convertV2StreamToV3(stream) {
	return stream.pipeThrough(new TransformStream({ transform(chunk, controller) {
		switch (chunk.type) {
			case "finish":
				controller.enqueue({
					...chunk,
					finishReason: convertV2FinishReasonToV3(chunk.finishReason),
					usage: convertV2UsageToV3(chunk.usage)
				});
				break;
			default: controller.enqueue(chunk);
		}
	} }));
}
function convertV2FinishReasonToV3(finishReason) {
	return {
		unified: finishReason === "unknown" ? "other" : finishReason,
		raw: void 0
	};
}
function convertV2UsageToV3(usage) {
	return {
		inputTokens: {
			total: usage.inputTokens,
			noCache: void 0,
			cacheRead: usage.cachedInputTokens,
			cacheWrite: void 0
		},
		outputTokens: {
			total: usage.outputTokens,
			text: void 0,
			reasoning: usage.reasoningTokens
		}
	};
}
function asLanguageModelV4(model) {
	if (model.specificationVersion === "v4") return model;
	const v3Model = model.specificationVersion === "v2" ? asLanguageModelV3(model) : model;
	return new Proxy(v3Model, { get(target, prop) {
		if (prop === "specificationVersion") return "v4";
		return target[prop];
	} });
}
function asRerankingModelV4(model) {
	if (model.specificationVersion === "v4") return model;
	return new Proxy(model, { get(target, prop) {
		if (prop === "specificationVersion") return "v4";
		return target[prop];
	} });
}
function asSpeechModelV3(model) {
	if (model.specificationVersion === "v3") return model;
	logV2CompatibilityWarning({
		provider: model.provider,
		modelId: model.modelId
	});
	return new Proxy(model, { get(target, prop) {
		if (prop === "specificationVersion") return "v3";
		return target[prop];
	} });
}
function asSpeechModelV4(model) {
	if (model.specificationVersion === "v4") return model;
	const v3Model = model.specificationVersion === "v2" ? asSpeechModelV3(model) : model;
	return new Proxy(v3Model, { get(target, prop) {
		if (prop === "specificationVersion") return "v4";
		return target[prop];
	} });
}
function asTranscriptionModelV3(model) {
	if (model.specificationVersion === "v3") return model;
	logV2CompatibilityWarning({
		provider: model.provider,
		modelId: model.modelId
	});
	return new Proxy(model, { get(target, prop) {
		if (prop === "specificationVersion") return "v3";
		return target[prop];
	} });
}
function asTranscriptionModelV4(model) {
	if (model.specificationVersion === "v4") return model;
	const v3Model = model.specificationVersion === "v2" ? asTranscriptionModelV3(model) : model;
	return new Proxy(v3Model, { get(target, prop) {
		if (prop === "specificationVersion") return "v4";
		return target[prop];
	} });
}
function asProviderV3(provider) {
	if ("specificationVersion" in provider && provider.specificationVersion === "v3") return provider;
	const v2Provider = provider;
	return {
		specificationVersion: "v3",
		languageModel: (modelId) => asLanguageModelV3(v2Provider.languageModel(modelId)),
		embeddingModel: (modelId) => asEmbeddingModelV3(v2Provider.textEmbeddingModel(modelId)),
		imageModel: (modelId) => asImageModelV3(v2Provider.imageModel(modelId)),
		transcriptionModel: v2Provider.transcriptionModel ? (modelId) => asTranscriptionModelV3(v2Provider.transcriptionModel(modelId)) : void 0,
		speechModel: v2Provider.speechModel ? (modelId) => asSpeechModelV3(v2Provider.speechModel(modelId)) : void 0,
		rerankingModel: void 0
	};
}
function asProviderV4(provider) {
	if ("specificationVersion" in provider && provider.specificationVersion === "v4") return provider;
	const v3Provider = !("specificationVersion" in provider) || provider.specificationVersion !== "v3" ? asProviderV3(provider) : provider;
	return {
		specificationVersion: "v4",
		languageModel: (modelId) => asLanguageModelV4(v3Provider.languageModel(modelId)),
		embeddingModel: (modelId) => asEmbeddingModelV4(v3Provider.embeddingModel(modelId)),
		imageModel: (modelId) => asImageModelV4(v3Provider.imageModel(modelId)),
		transcriptionModel: v3Provider.transcriptionModel ? (modelId) => asTranscriptionModelV4(v3Provider.transcriptionModel(modelId)) : void 0,
		speechModel: v3Provider.speechModel ? (modelId) => asSpeechModelV4(v3Provider.speechModel(modelId)) : void 0,
		rerankingModel: v3Provider.rerankingModel ? (modelId) => asRerankingModelV4(v3Provider.rerankingModel(modelId)) : void 0
	};
}
function resolveImageModel(model) {
	if (typeof model === "string") return getGlobalProvider().imageModel(model);
	if (![
		"v4",
		"v3",
		"v2"
	].includes(model.specificationVersion)) {
		const unsupportedModel = model;
		throw new UnsupportedModelVersionError({
			version: unsupportedModel.specificationVersion,
			provider: unsupportedModel.provider,
			modelId: unsupportedModel.modelId
		});
	}
	return asImageModelV4(model);
}
function getGlobalProvider() {
	var _a25;
	return asProviderV4((_a25 = globalThis.AI_SDK_DEFAULT_PROVIDER) != null ? _a25 : gateway);
}
var VERSION = "7.0.93";
function splitDataUrl(dataUrl) {
	try {
		const [header, base64Content] = dataUrl.split(",");
		return {
			mediaType: header.split(";")[0].split(":")[1],
			base64Content
		};
	} catch (e) {
		return {
			mediaType: void 0,
			base64Content: void 0
		};
	}
}
var z = {
	array,
	boolean,
	custom,
	discriminatedUnion,
	enum: _enum,
	instanceof: _instanceof,
	lazy,
	literal,
	looseObject,
	never,
	null: _null,
	number,
	object,
	record,
	string,
	union,
	unknown
};
var jsonValueSchema = z.lazy(() => z.union([
	z.null(),
	z.string(),
	z.number(),
	z.boolean(),
	z.record(z.string(), jsonValueSchema.optional()),
	z.array(jsonValueSchema)
]));
var providerMetadataSchema = z.record(z.string(), z.record(z.string(), jsonValueSchema.optional()));
var fileInlineDataSchema = z.union([
	z.string(),
	z.instanceof(Uint8Array),
	z.instanceof(ArrayBuffer),
	z.custom(isBuffer, { message: "Must be a Buffer" })
]);
var providerReferenceSchema = z.record(z.string(), z.string());
var textPartSchema = z.object({
	type: z.literal("text"),
	text: z.string(),
	providerOptions: providerMetadataSchema.optional()
});
var imagePartSchema = z.object({
	type: z.literal("image"),
	image: z.union([
		fileInlineDataSchema,
		z.instanceof(URL),
		providerReferenceSchema
	]),
	mediaType: z.string().optional(),
	providerOptions: providerMetadataSchema.optional()
});
var taggedFileDataSchema = z.discriminatedUnion("type", [
	z.object({
		type: z.literal("data"),
		data: fileInlineDataSchema
	}),
	z.object({
		type: z.literal("url"),
		url: z.instanceof(URL)
	}),
	z.object({
		type: z.literal("reference"),
		reference: providerReferenceSchema
	}),
	z.object({
		type: z.literal("text"),
		text: z.string()
	})
]);
var taggedReasoningFileDataSchema = z.discriminatedUnion("type", [z.object({
	type: z.literal("data"),
	data: fileInlineDataSchema
}), z.object({
	type: z.literal("url"),
	url: z.instanceof(URL)
})]);
var filePartSchema = z.object({
	type: z.literal("file"),
	data: z.union([
		taggedFileDataSchema,
		fileInlineDataSchema,
		z.instanceof(URL),
		providerReferenceSchema
	]),
	filename: z.string().optional(),
	mediaType: z.string(),
	providerOptions: providerMetadataSchema.optional()
});
var reasoningPartSchema = z.object({
	type: z.literal("reasoning"),
	text: z.string(),
	providerOptions: providerMetadataSchema.optional()
});
var customPartSchema = z.object({
	type: z.literal("custom"),
	kind: z.string().transform((value) => value),
	providerOptions: providerMetadataSchema.optional()
});
var reasoningFilePartSchema = z.object({
	type: z.literal("reasoning-file"),
	data: z.union([
		taggedReasoningFileDataSchema,
		fileInlineDataSchema,
		z.instanceof(URL)
	]),
	mediaType: z.string(),
	providerOptions: providerMetadataSchema.optional()
});
var toolCallPartSchema = z.object({
	type: z.literal("tool-call"),
	toolCallId: z.string(),
	toolName: z.string(),
	input: z.unknown(),
	providerOptions: providerMetadataSchema.optional(),
	providerExecuted: z.boolean().optional()
});
var outputSchema = z.discriminatedUnion("type", [
	z.object({
		type: z.literal("text"),
		value: z.string(),
		providerOptions: providerMetadataSchema.optional()
	}),
	z.object({
		type: z.literal("json"),
		value: jsonValueSchema,
		providerOptions: providerMetadataSchema.optional()
	}),
	z.object({
		type: z.literal("execution-denied"),
		reason: z.string().optional(),
		providerOptions: providerMetadataSchema.optional()
	}),
	z.object({
		type: z.literal("error-text"),
		value: z.string(),
		providerOptions: providerMetadataSchema.optional()
	}),
	z.object({
		type: z.literal("error-json"),
		value: jsonValueSchema,
		providerOptions: providerMetadataSchema.optional()
	}),
	z.object({
		type: z.literal("content"),
		value: z.array(z.union([
			z.object({
				type: z.literal("text"),
				text: z.string(),
				providerOptions: providerMetadataSchema.optional()
			}),
			z.object({
				type: z.literal("file"),
				data: taggedFileDataSchema,
				mediaType: z.string(),
				filename: z.string().optional(),
				providerOptions: providerMetadataSchema.optional()
			}),
			z.object({
				type: z.literal("file-data"),
				data: z.string(),
				mediaType: z.string(),
				filename: z.string().optional(),
				providerOptions: providerMetadataSchema.optional()
			}),
			z.object({
				type: z.literal("file-url"),
				url: z.string(),
				mediaType: z.string().optional(),
				providerOptions: providerMetadataSchema.optional()
			}),
			z.object({
				type: z.literal("file-id"),
				fileId: z.union([z.string(), z.record(z.string(), z.string())]),
				providerOptions: providerMetadataSchema.optional()
			}),
			z.object({
				type: z.literal("file-reference"),
				providerReference: z.record(z.string(), z.string()),
				providerOptions: providerMetadataSchema.optional()
			}),
			z.object({
				type: z.literal("image-data"),
				data: z.string(),
				mediaType: z.string(),
				providerOptions: providerMetadataSchema.optional()
			}),
			z.object({
				type: z.literal("image-url"),
				url: z.string(),
				providerOptions: providerMetadataSchema.optional()
			}),
			z.object({
				type: z.literal("image-file-id"),
				fileId: z.union([z.string(), z.record(z.string(), z.string())]),
				providerOptions: providerMetadataSchema.optional()
			}),
			z.object({
				type: z.literal("image-file-reference"),
				providerReference: z.record(z.string(), z.string()),
				providerOptions: providerMetadataSchema.optional()
			}),
			z.object({
				type: z.literal("custom"),
				providerOptions: providerMetadataSchema.optional()
			})
		]))
	})
]);
var toolResultPartSchema = z.object({
	type: z.literal("tool-result"),
	toolCallId: z.string(),
	toolName: z.string(),
	output: outputSchema,
	providerOptions: providerMetadataSchema.optional()
});
var toolApprovalRequestSchema = z.object({
	type: z.literal("tool-approval-request"),
	approvalId: z.string(),
	toolCallId: z.string(),
	reason: z.string().optional()
});
var toolApprovalResponseSchema = z.object({
	type: z.literal("tool-approval-response"),
	approvalId: z.string(),
	approved: z.boolean(),
	reason: z.string().optional()
});
var systemModelMessageSchema = z.object({
	role: z.literal("system"),
	content: z.string(),
	providerOptions: providerMetadataSchema.optional()
});
var userModelMessageSchema = z.object({
	role: z.literal("user"),
	content: z.union([z.string(), z.array(z.union([
		textPartSchema,
		imagePartSchema,
		filePartSchema
	]))]),
	providerOptions: providerMetadataSchema.optional()
});
var assistantModelMessageSchema = z.object({
	role: z.literal("assistant"),
	content: z.union([z.string(), z.array(z.union([
		textPartSchema,
		customPartSchema,
		filePartSchema,
		reasoningPartSchema,
		reasoningFilePartSchema,
		toolCallPartSchema,
		toolResultPartSchema,
		toolApprovalRequestSchema
	]))]),
	providerOptions: providerMetadataSchema.optional()
});
var toolModelMessageSchema = z.object({
	role: z.literal("tool"),
	content: z.array(z.union([toolResultPartSchema, toolApprovalResponseSchema])),
	providerOptions: providerMetadataSchema.optional()
});
z.union([
	systemModelMessageSchema,
	userModelMessageSchema,
	assistantModelMessageSchema,
	toolModelMessageSchema
]);
function addTokenCounts(tokenCount1, tokenCount2) {
	return tokenCount1 == null && tokenCount2 == null ? void 0 : (tokenCount1 != null ? tokenCount1 : 0) + (tokenCount2 != null ? tokenCount2 : 0);
}
function addImageModelUsage(usage1, usage2) {
	return {
		inputTokens: addTokenCounts(usage1.inputTokens, usage2.inputTokens),
		outputTokens: addTokenCounts(usage1.outputTokens, usage2.outputTokens),
		totalTokens: addTokenCounts(usage1.totalTokens, usage2.totalTokens)
	};
}
function getRetryDelayInMs({ error, exponentialBackoffDelay }) {
	const headers = APICallError.isInstance(error) ? error.responseHeaders : APICallError.isInstance(error.cause) ? error.cause.responseHeaders : void 0;
	if (!headers) return exponentialBackoffDelay;
	let ms;
	const retryAfterMs = headers["retry-after-ms"];
	if (retryAfterMs) {
		const timeoutMs = parseFloat(retryAfterMs);
		if (!Number.isNaN(timeoutMs)) ms = timeoutMs;
	}
	const retryAfter = headers["retry-after"];
	if (retryAfter && ms === void 0) {
		const timeoutSeconds = parseFloat(retryAfter);
		if (!Number.isNaN(timeoutSeconds)) ms = timeoutSeconds * 1e3;
		else ms = Date.parse(retryAfter) - Date.now();
	}
	if (ms != null && !Number.isNaN(ms) && 0 <= ms && (ms < 6e4 || ms < exponentialBackoffDelay)) return ms;
	return exponentialBackoffDelay;
}
var retryWithExponentialBackoffRespectingRetryHeaders = ({ maxRetries = 2, initialDelayInMs = 2e3, backoffFactor = 2, abortSignal } = {}) => retryWithExponentialBackoff({
	maxRetries,
	initialDelayInMs,
	backoffFactor,
	abortSignal,
	shouldRetry: (error) => error instanceof Error && (APICallError.isInstance(error) && error.isRetryable === true || GatewayError.isInstance(error) && error.isRetryable === true),
	getDelayInMs: ({ error, exponentialBackoffDelay }) => getRetryDelayInMs({
		error,
		exponentialBackoffDelay
	}),
	createRetryError: ({ message, reason, errors }) => new RetryError({
		message,
		reason,
		errors
	})
});
function prepareRetries({ maxRetries, abortSignal, parameter = "maxRetries", defaultMaxRetries = 2 }) {
	if (maxRetries != null) {
		if (!Number.isInteger(maxRetries)) throw new InvalidArgumentError({
			parameter,
			value: maxRetries,
			message: `${parameter} must be an integer`
		});
		if (maxRetries < 0) throw new InvalidArgumentError({
			parameter,
			value: maxRetries,
			message: `${parameter} must be >= 0`
		});
	}
	const maxRetriesResult = maxRetries != null ? maxRetries : defaultMaxRetries;
	return {
		maxRetries: maxRetriesResult,
		retry: retryWithExponentialBackoffRespectingRetryHeaders({
			maxRetries: maxRetriesResult,
			abortSignal
		})
	};
}
var DefaultGeneratedFile = class {
	constructor({ data, mediaType, providerMetadata }) {
		const isUint8Array = data instanceof Uint8Array;
		this.base64Data = isUint8Array ? void 0 : data;
		this.uint8ArrayData = isUint8Array ? data : void 0;
		this.mediaType = mediaType;
		this.providerMetadata = providerMetadata;
	}
	get base64() {
		if (this.base64Data == null) this.base64Data = convertUint8ArrayToBase64(this.uint8ArrayData);
		return this.base64Data;
	}
	get uint8Array() {
		if (this.uint8ArrayData == null) this.uint8ArrayData = convertBase64ToUint8Array(this.base64Data);
		return this.uint8ArrayData;
	}
};
__export({}, {
	array: () => array2,
	choice: () => choice,
	json: () => json,
	object: () => object2,
	text: () => text
});
function fixJson(input) {
	const stack = ["ROOT"];
	let lastValidIndex = -1;
	let literalStart = null;
	let unicodeEscapeDigits = 0;
	function isHexDigit(char) {
		return char >= "0" && char <= "9" || char >= "A" && char <= "F" || char >= "a" && char <= "f";
	}
	function processValueStart(char, i, swapState) {
		switch (char) {
			case "\"":
				lastValidIndex = i;
				stack.pop();
				stack.push(swapState);
				stack.push("INSIDE_STRING");
				break;
			case "f":
			case "t":
			case "n":
				lastValidIndex = i;
				literalStart = i;
				stack.pop();
				stack.push(swapState);
				stack.push("INSIDE_LITERAL");
				break;
			case "-":
				stack.pop();
				stack.push(swapState);
				stack.push("INSIDE_NUMBER");
				break;
			case "0":
			case "1":
			case "2":
			case "3":
			case "4":
			case "5":
			case "6":
			case "7":
			case "8":
			case "9":
				lastValidIndex = i;
				stack.pop();
				stack.push(swapState);
				stack.push("INSIDE_NUMBER");
				break;
			case "{":
				lastValidIndex = i;
				stack.pop();
				stack.push(swapState);
				stack.push("INSIDE_OBJECT_START");
				break;
			case "[":
				lastValidIndex = i;
				stack.pop();
				stack.push(swapState);
				stack.push("INSIDE_ARRAY_START");
		}
	}
	function processAfterObjectValue(char, i) {
		switch (char) {
			case ",":
				stack.pop();
				stack.push("INSIDE_OBJECT_AFTER_COMMA");
				break;
			case "}":
				lastValidIndex = i;
				stack.pop();
		}
	}
	function processAfterArrayValue(char, i) {
		switch (char) {
			case ",":
				stack.pop();
				stack.push("INSIDE_ARRAY_AFTER_COMMA");
				break;
			case "]":
				lastValidIndex = i;
				stack.pop();
		}
	}
	for (let i = 0; i < input.length; i++) {
		const char = input[i];
		switch (stack[stack.length - 1]) {
			case "ROOT":
				processValueStart(char, i, "FINISH");
				break;
			case "INSIDE_OBJECT_START":
				switch (char) {
					case "\"":
						stack.pop();
						stack.push("INSIDE_OBJECT_KEY");
						break;
					case "}":
						lastValidIndex = i;
						stack.pop();
				}
				break;
			case "INSIDE_OBJECT_AFTER_COMMA":
				switch (char) {
					case "\"":
						stack.pop();
						stack.push("INSIDE_OBJECT_KEY");
				}
				break;
			case "INSIDE_OBJECT_KEY":
				switch (char) {
					case "\"":
						stack.pop();
						stack.push("INSIDE_OBJECT_AFTER_KEY");
				}
				break;
			case "INSIDE_OBJECT_AFTER_KEY":
				switch (char) {
					case ":":
						stack.pop();
						stack.push("INSIDE_OBJECT_BEFORE_VALUE");
				}
				break;
			case "INSIDE_OBJECT_BEFORE_VALUE":
				processValueStart(char, i, "INSIDE_OBJECT_AFTER_VALUE");
				break;
			case "INSIDE_OBJECT_AFTER_VALUE":
				processAfterObjectValue(char, i);
				break;
			case "INSIDE_STRING":
				switch (char) {
					case "\"":
						stack.pop();
						lastValidIndex = i;
						break;
					case "\\":
						stack.push("INSIDE_STRING_ESCAPE");
						break;
					default: lastValidIndex = i;
				}
				break;
			case "INSIDE_ARRAY_START":
				switch (char) {
					case "]":
						lastValidIndex = i;
						stack.pop();
						break;
					default:
						lastValidIndex = i;
						processValueStart(char, i, "INSIDE_ARRAY_AFTER_VALUE");
				}
				break;
			case "INSIDE_ARRAY_AFTER_VALUE":
				switch (char) {
					case ",":
						stack.pop();
						stack.push("INSIDE_ARRAY_AFTER_COMMA");
						break;
					case "]":
						lastValidIndex = i;
						stack.pop();
						break;
					default: lastValidIndex = i;
				}
				break;
			case "INSIDE_ARRAY_AFTER_COMMA":
				processValueStart(char, i, "INSIDE_ARRAY_AFTER_VALUE");
				break;
			case "INSIDE_STRING_ESCAPE":
				stack.pop();
				if (char === "u") {
					unicodeEscapeDigits = 0;
					stack.push("INSIDE_STRING_UNICODE_ESCAPE");
				} else lastValidIndex = i;
				break;
			case "INSIDE_STRING_UNICODE_ESCAPE":
				if (isHexDigit(char)) {
					unicodeEscapeDigits++;
					if (unicodeEscapeDigits === 4) {
						stack.pop();
						lastValidIndex = i;
					}
				}
				break;
			case "INSIDE_NUMBER":
				switch (char) {
					case "0":
					case "1":
					case "2":
					case "3":
					case "4":
					case "5":
					case "6":
					case "7":
					case "8":
					case "9":
						lastValidIndex = i;
						break;
					case "e":
					case "E":
					case "-":
					case ".": break;
					case ",":
						stack.pop();
						if (stack[stack.length - 1] === "INSIDE_ARRAY_AFTER_VALUE") processAfterArrayValue(char, i);
						if (stack[stack.length - 1] === "INSIDE_OBJECT_AFTER_VALUE") processAfterObjectValue(char, i);
						break;
					case "}":
						stack.pop();
						if (stack[stack.length - 1] === "INSIDE_OBJECT_AFTER_VALUE") processAfterObjectValue(char, i);
						break;
					case "]":
						stack.pop();
						if (stack[stack.length - 1] === "INSIDE_ARRAY_AFTER_VALUE") processAfterArrayValue(char, i);
						break;
					default: stack.pop();
				}
				break;
			case "INSIDE_LITERAL": {
				const partialLiteral = input.substring(literalStart, i + 1);
				if (!"false".startsWith(partialLiteral) && !"true".startsWith(partialLiteral) && !"null".startsWith(partialLiteral)) {
					stack.pop();
					if (stack[stack.length - 1] === "INSIDE_OBJECT_AFTER_VALUE") processAfterObjectValue(char, i);
					else if (stack[stack.length - 1] === "INSIDE_ARRAY_AFTER_VALUE") processAfterArrayValue(char, i);
				} else lastValidIndex = i;
				break;
			}
		}
	}
	let result = input.slice(0, lastValidIndex + 1);
	for (let i = stack.length - 1; i >= 0; i--) switch (stack[i]) {
		case "INSIDE_STRING":
			result += "\"";
			break;
		case "INSIDE_OBJECT_KEY":
		case "INSIDE_OBJECT_AFTER_KEY":
		case "INSIDE_OBJECT_AFTER_COMMA":
		case "INSIDE_OBJECT_START":
		case "INSIDE_OBJECT_BEFORE_VALUE":
		case "INSIDE_OBJECT_AFTER_VALUE":
			result += "}";
			break;
		case "INSIDE_ARRAY_START":
		case "INSIDE_ARRAY_AFTER_COMMA":
		case "INSIDE_ARRAY_AFTER_VALUE":
			result += "]";
			break;
		case "INSIDE_LITERAL": {
			const partialLiteral = input.substring(literalStart, input.length);
			if ("true".startsWith(partialLiteral)) result += "true".slice(partialLiteral.length);
			else if ("false".startsWith(partialLiteral)) result += "false".slice(partialLiteral.length);
			else if ("null".startsWith(partialLiteral)) result += "null".slice(partialLiteral.length);
		}
	}
	return result;
}
async function parsePartialJson(jsonText) {
	if (jsonText === void 0) return {
		value: void 0,
		state: "undefined-input"
	};
	let result = await safeParseJSON({ text: jsonText });
	if (result.success) return {
		value: result.value,
		state: "successful-parse"
	};
	result = await safeParseJSON({ text: fixJson(jsonText) });
	if (result.success) return {
		value: result.value,
		state: "repaired-parse"
	};
	return {
		value: void 0,
		state: "failed-parse"
	};
}
var text = () => ({
	name: "text",
	responseFormat: Promise.resolve({ type: "text" }),
	async parseCompleteOutput({ text: text2 }) {
		return text2;
	},
	async parsePartialOutput({ text: text2 }) {
		return { partial: text2 };
	},
	createElementStreamTransform() {}
});
var object2 = ({ schema: inputSchema, name: name25, description }) => {
	const schema = asSchema(inputSchema);
	return {
		name: "object",
		responseFormat: resolve(schema.jsonSchema).then((jsonSchema2) => ({
			type: "json",
			schema: jsonSchema2,
			...name25 != null && { name: name25 },
			...description != null && { description }
		})),
		async parseCompleteOutput({ text: text2 }, context) {
			const parseResult = await safeParseJSON({ text: text2 });
			if (!parseResult.success) throw new NoObjectGeneratedError({
				message: "No object generated: could not parse the response.",
				cause: parseResult.error,
				text: text2,
				response: context.response,
				usage: context.usage,
				finishReason: context.finishReason
			});
			const validationResult = await safeValidateTypes({
				value: parseResult.value,
				schema
			});
			if (!validationResult.success) throw new NoObjectGeneratedError({
				message: "No object generated: response did not match schema.",
				cause: validationResult.error,
				text: text2,
				response: context.response,
				usage: context.usage,
				finishReason: context.finishReason
			});
			return validationResult.value;
		},
		async parsePartialOutput({ text: text2 }) {
			const result = await parsePartialJson(text2);
			switch (result.state) {
				case "failed-parse":
				case "undefined-input": return;
				case "repaired-parse":
				case "successful-parse": return { partial: result.value };
			}
		},
		createElementStreamTransform() {}
	};
};
var array2 = ({ element: inputElementSchema, minItems, maxItems, name: name25, description }) => {
	validateArrayBound({
		name: "minItems",
		value: minItems
	});
	validateArrayBound({
		name: "maxItems",
		value: maxItems
	});
	if (minItems != null && maxItems != null && minItems > maxItems) throw new InvalidArgumentError({
		parameter: "minItems",
		value: minItems,
		message: "minItems must be less than or equal to maxItems"
	});
	const elementSchema = asSchema(inputElementSchema);
	return {
		name: "array",
		responseFormat: resolve(elementSchema.jsonSchema).then((jsonSchema2) => {
			const { $schema: _$schema, definitions, $defs, ...itemSchema } = jsonSchema2;
			return {
				type: "json",
				schema: {
					$schema: "http://json-schema.org/draft-07/schema#",
					...definitions != null && { definitions },
					...$defs != null && { $defs },
					type: "object",
					properties: { elements: {
						type: "array",
						items: itemSchema,
						...minItems != null && { minItems },
						...maxItems != null && { maxItems }
					} },
					required: ["elements"],
					additionalProperties: false
				},
				...name25 != null && { name: name25 },
				...description != null && { description }
			};
		}),
		async parseCompleteOutput({ text: text2 }, context) {
			const parseResult = await safeParseJSON({ text: text2 });
			if (!parseResult.success) throw new NoObjectGeneratedError({
				message: "No object generated: could not parse the response.",
				cause: parseResult.error,
				text: text2,
				response: context.response,
				usage: context.usage,
				finishReason: context.finishReason
			});
			const outerValue = parseResult.value;
			if (outerValue == null || typeof outerValue !== "object" || !("elements" in outerValue) || !Array.isArray(outerValue.elements)) throw new NoObjectGeneratedError({
				message: "No object generated: response did not match schema.",
				cause: new TypeValidationError({
					value: outerValue,
					cause: "response must be an object with an elements array"
				}),
				text: text2,
				response: context.response,
				usage: context.usage,
				finishReason: context.finishReason
			});
			const lengthValidationError = getArrayLengthValidationError({
				value: outerValue.elements,
				minItems,
				maxItems
			});
			if (lengthValidationError != null) throw new NoObjectGeneratedError({
				message: "No object generated: response did not match schema.",
				cause: lengthValidationError,
				text: text2,
				response: context.response,
				usage: context.usage,
				finishReason: context.finishReason
			});
			const validatedElements = [];
			for (const element of outerValue.elements) {
				const validationResult = await safeValidateTypes({
					value: element,
					schema: elementSchema
				});
				if (!validationResult.success) throw new NoObjectGeneratedError({
					message: "No object generated: response did not match schema.",
					cause: validationResult.error,
					text: text2,
					response: context.response,
					usage: context.usage,
					finishReason: context.finishReason
				});
				validatedElements.push(validationResult.value);
			}
			return validatedElements;
		},
		async parsePartialOutput({ text: text2 }) {
			const result = await parsePartialJson(text2);
			switch (result.state) {
				case "failed-parse":
				case "undefined-input": return;
				case "repaired-parse":
				case "successful-parse": {
					const outerValue = result.value;
					if (outerValue == null || typeof outerValue !== "object" || !("elements" in outerValue) || !Array.isArray(outerValue.elements)) return;
					const rawElements = result.state === "repaired-parse" && outerValue.elements.length > 0 ? outerValue.elements.slice(0, -1) : outerValue.elements;
					const parsedElements = [];
					for (const rawElement of rawElements) {
						const validationResult = await safeValidateTypes({
							value: rawElement,
							schema: elementSchema
						});
						if (validationResult.success) parsedElements.push(validationResult.value);
					}
					return { partial: parsedElements };
				}
			}
		},
		createElementStreamTransform() {
			let publishedElements = 0;
			return new TransformStream({ transform({ partialOutput }, controller) {
				if (partialOutput != null) for (; publishedElements < partialOutput.length; publishedElements++) {
					if (maxItems != null && publishedElements >= maxItems) {
						controller.error(getArrayLengthValidationError({
							value: partialOutput,
							maxItems
						}));
						return;
					}
					controller.enqueue(partialOutput[publishedElements]);
				}
			} });
		}
	};
};
function validateArrayBound({ name: name25, value }) {
	if (value == null) return;
	if (!Number.isInteger(value)) throw new InvalidArgumentError({
		parameter: name25,
		value,
		message: `${name25} must be an integer`
	});
	if (value < 0) throw new InvalidArgumentError({
		parameter: name25,
		value,
		message: `${name25} must be greater than or equal to 0`
	});
}
function getArrayLengthValidationError({ value, minItems, maxItems }) {
	if (minItems != null && value.length < minItems) return new TypeValidationError({
		value,
		cause: `elements array must contain at least ${minItems} items`
	});
	if (maxItems != null && value.length > maxItems) return new TypeValidationError({
		value,
		cause: `elements array must contain at most ${maxItems} items`
	});
}
var choice = ({ options: choiceOptions, name: name25, description }) => {
	return {
		name: "choice",
		responseFormat: Promise.resolve({
			type: "json",
			schema: {
				$schema: "http://json-schema.org/draft-07/schema#",
				type: "object",
				properties: { result: {
					type: "string",
					enum: choiceOptions
				} },
				required: ["result"],
				additionalProperties: false
			},
			...name25 != null && { name: name25 },
			...description != null && { description }
		}),
		async parseCompleteOutput({ text: text2 }, context) {
			const parseResult = await safeParseJSON({ text: text2 });
			if (!parseResult.success) throw new NoObjectGeneratedError({
				message: "No object generated: could not parse the response.",
				cause: parseResult.error,
				text: text2,
				response: context.response,
				usage: context.usage,
				finishReason: context.finishReason
			});
			const outerValue = parseResult.value;
			if (outerValue == null || typeof outerValue !== "object" || !("result" in outerValue) || typeof outerValue.result !== "string" || !choiceOptions.includes(outerValue.result)) throw new NoObjectGeneratedError({
				message: "No object generated: response did not match schema.",
				cause: new TypeValidationError({
					value: outerValue,
					cause: "response must be an object that contains a choice value."
				}),
				text: text2,
				response: context.response,
				usage: context.usage,
				finishReason: context.finishReason
			});
			return outerValue.result;
		},
		async parsePartialOutput({ text: text2 }) {
			const result = await parsePartialJson(text2);
			switch (result.state) {
				case "failed-parse":
				case "undefined-input": return;
				case "repaired-parse":
				case "successful-parse": {
					const outerValue = result.value;
					if (outerValue == null || typeof outerValue !== "object" || !("result" in outerValue) || typeof outerValue.result !== "string") return;
					const potentialMatches = choiceOptions.filter((choiceOption) => choiceOption.startsWith(outerValue.result));
					if (result.state === "successful-parse") return potentialMatches.includes(outerValue.result) ? { partial: outerValue.result } : void 0;
					else return potentialMatches.length === 1 ? { partial: potentialMatches[0] } : void 0;
				}
			}
		},
		createElementStreamTransform() {}
	};
};
var json = ({ name: name25, description } = {}) => {
	return {
		name: "json",
		responseFormat: Promise.resolve({
			type: "json",
			...name25 != null && { name: name25 },
			...description != null && { description }
		}),
		async parseCompleteOutput({ text: text2 }, context) {
			const parseResult = await safeParseJSON({ text: text2 });
			if (!parseResult.success) throw new NoObjectGeneratedError({
				message: "No object generated: could not parse the response.",
				cause: parseResult.error,
				text: text2,
				response: context.response,
				usage: context.usage,
				finishReason: context.finishReason
			});
			return parseResult.value;
		},
		async parsePartialOutput({ text: text2 }) {
			const result = await parsePartialJson(text2);
			switch (result.state) {
				case "failed-parse":
				case "undefined-input": return;
				case "repaired-parse":
				case "successful-parse": return result.value === void 0 ? void 0 : { partial: result.value };
			}
		},
		createElementStreamTransform() {}
	};
};
new TextEncoder();
new TextEncoder();
createIdGenerator({
	prefix: "aitxt",
	size: 24
});
createIdGenerator({
	prefix: "call",
	size: 24
});
TransformStream;
var toolMetadataSchema = z.record(z.string(), jsonValueSchema.optional());
lazySchema(() => zodSchema(z.union([
	z.looseObject({
		type: z.literal("text-start"),
		id: z.string(),
		providerMetadata: providerMetadataSchema.optional()
	}),
	z.looseObject({
		type: z.literal("text-delta"),
		id: z.string(),
		delta: z.string(),
		providerMetadata: providerMetadataSchema.optional()
	}),
	z.looseObject({
		type: z.literal("text-end"),
		id: z.string(),
		providerMetadata: providerMetadataSchema.optional()
	}),
	z.looseObject({
		type: z.literal("error"),
		errorText: z.string()
	}),
	z.looseObject({
		type: z.literal("tool-input-start"),
		toolCallId: z.string(),
		toolName: z.string(),
		providerExecuted: z.boolean().optional(),
		providerMetadata: providerMetadataSchema.optional(),
		toolMetadata: toolMetadataSchema.optional(),
		dynamic: z.boolean().optional(),
		title: z.string().optional()
	}),
	z.looseObject({
		type: z.literal("tool-input-delta"),
		toolCallId: z.string(),
		inputTextDelta: z.string()
	}),
	z.looseObject({
		type: z.literal("tool-input-available"),
		toolCallId: z.string(),
		toolName: z.string(),
		input: z.unknown(),
		providerExecuted: z.boolean().optional(),
		providerMetadata: providerMetadataSchema.optional(),
		toolMetadata: toolMetadataSchema.optional(),
		dynamic: z.boolean().optional(),
		title: z.string().optional()
	}),
	z.looseObject({
		type: z.literal("tool-input-error"),
		toolCallId: z.string(),
		toolName: z.string(),
		input: z.unknown(),
		providerExecuted: z.boolean().optional(),
		providerMetadata: providerMetadataSchema.optional(),
		toolMetadata: toolMetadataSchema.optional(),
		dynamic: z.boolean().optional(),
		errorText: z.string(),
		title: z.string().optional()
	}),
	z.looseObject({
		type: z.literal("tool-approval-request"),
		approvalId: z.string(),
		toolCallId: z.string(),
		approvalDescriptor: z.unknown().optional(),
		reason: z.string().optional(),
		isAutomatic: z.boolean().optional(),
		signature: z.string().optional()
	}),
	z.looseObject({
		type: z.literal("tool-approval-response"),
		approvalId: z.string(),
		approved: z.boolean(),
		reason: z.string().optional(),
		providerExecuted: z.boolean().optional(),
		providerMetadata: providerMetadataSchema.optional()
	}),
	z.looseObject({
		type: z.literal("tool-output-available"),
		toolCallId: z.string(),
		output: z.unknown(),
		providerExecuted: z.boolean().optional(),
		providerMetadata: providerMetadataSchema.optional(),
		toolMetadata: toolMetadataSchema.optional(),
		dynamic: z.boolean().optional(),
		preliminary: z.boolean().optional()
	}),
	z.looseObject({
		type: z.literal("tool-output-error"),
		toolCallId: z.string(),
		errorText: z.string(),
		providerExecuted: z.boolean().optional(),
		providerMetadata: providerMetadataSchema.optional(),
		toolMetadata: toolMetadataSchema.optional(),
		dynamic: z.boolean().optional()
	}),
	z.looseObject({
		type: z.literal("tool-output-denied"),
		toolCallId: z.string()
	}),
	z.looseObject({
		type: z.literal("reasoning-start"),
		id: z.string(),
		providerMetadata: providerMetadataSchema.optional()
	}),
	z.looseObject({
		type: z.literal("reasoning-delta"),
		id: z.string(),
		delta: z.string(),
		providerMetadata: providerMetadataSchema.optional()
	}),
	z.looseObject({
		type: z.literal("reasoning-end"),
		id: z.string(),
		providerMetadata: providerMetadataSchema.optional()
	}),
	z.looseObject({
		type: z.literal("custom"),
		kind: z.string().transform((value) => value),
		providerMetadata: providerMetadataSchema.optional()
	}),
	z.looseObject({
		type: z.literal("source-url"),
		sourceId: z.string(),
		url: z.string(),
		title: z.string().optional(),
		providerMetadata: providerMetadataSchema.optional()
	}),
	z.looseObject({
		type: z.literal("source-document"),
		sourceId: z.string(),
		mediaType: z.string(),
		title: z.string(),
		filename: z.string().optional(),
		providerMetadata: providerMetadataSchema.optional()
	}),
	z.looseObject({
		type: z.literal("file"),
		url: z.string(),
		mediaType: z.string(),
		providerMetadata: providerMetadataSchema.optional()
	}),
	z.looseObject({
		type: z.literal("reasoning-file"),
		url: z.string(),
		mediaType: z.string(),
		providerMetadata: providerMetadataSchema.optional()
	}),
	z.looseObject({
		type: z.custom((value) => typeof value === "string" && value.startsWith("data-"), { message: "Type must start with \"data-\"" }),
		id: z.string().optional(),
		data: z.unknown(),
		transient: z.boolean().optional()
	}),
	z.looseObject({ type: z.literal("start-step") }),
	z.looseObject({ type: z.literal("finish-step") }),
	z.looseObject({ type: z.literal("reset-step") }),
	z.looseObject({
		type: z.literal("start"),
		messageId: z.string().optional(),
		messageMetadata: z.unknown().optional()
	}),
	z.looseObject({
		type: z.literal("finish"),
		finishReason: z.enum([
			"stop",
			"length",
			"content-filter",
			"tool-calls",
			"error",
			"other"
		]).optional(),
		messageMetadata: z.unknown().optional()
	}),
	z.looseObject({
		type: z.literal("abort"),
		reason: z.string().optional()
	}),
	z.looseObject({
		type: z.literal("message-metadata"),
		messageMetadata: z.unknown()
	})
])));
createIdGenerator({
	prefix: "aitxt",
	size: 24
});
createIdGenerator({
	prefix: "call",
	size: 24
});
createIdGenerator({
	prefix: "aitxt",
	size: 24
});
createIdGenerator({
	prefix: "call",
	size: 24
});
var toolMetadataSchema2 = z.record(z.string(), jsonValueSchema.optional());
var providerReferenceSchema2 = z.record(z.string(), z.string());
lazySchema(() => zodSchema(z.array(z.object({
	id: z.string(),
	role: z.enum([
		"system",
		"user",
		"assistant"
	]),
	metadata: z.unknown().optional(),
	parts: z.array(z.union([
		z.object({
			type: z.literal("text"),
			text: z.string(),
			state: z.enum(["streaming", "done"]).optional(),
			providerMetadata: providerMetadataSchema.optional()
		}),
		z.object({
			type: z.literal("reasoning"),
			id: z.string().optional(),
			text: z.string(),
			state: z.enum(["streaming", "done"]).optional(),
			providerMetadata: providerMetadataSchema.optional()
		}),
		z.object({
			type: z.literal("custom"),
			kind: z.string(),
			providerMetadata: providerMetadataSchema.optional()
		}),
		z.object({
			type: z.literal("source-url"),
			sourceId: z.string(),
			url: z.string(),
			title: z.string().optional(),
			providerMetadata: providerMetadataSchema.optional()
		}),
		z.object({
			type: z.literal("source-document"),
			sourceId: z.string(),
			mediaType: z.string(),
			title: z.string(),
			filename: z.string().optional(),
			providerMetadata: providerMetadataSchema.optional()
		}),
		z.object({
			type: z.literal("file"),
			mediaType: z.string(),
			filename: z.string().optional(),
			url: z.string(),
			providerReference: providerReferenceSchema2.optional(),
			providerMetadata: providerMetadataSchema.optional()
		}),
		z.object({
			type: z.literal("reasoning-file"),
			mediaType: z.string(),
			url: z.string(),
			providerMetadata: providerMetadataSchema.optional()
		}),
		z.object({ type: z.literal("step-start") }),
		z.object({
			type: z.string().startsWith("data-"),
			id: z.string().optional(),
			data: z.unknown()
		}),
		z.object({
			type: z.literal("dynamic-tool"),
			toolName: z.string(),
			toolCallId: z.string(),
			title: z.string().optional(),
			toolMetadata: toolMetadataSchema2.optional(),
			state: z.literal("input-streaming"),
			input: z.unknown().optional(),
			providerExecuted: z.boolean().optional(),
			callProviderMetadata: providerMetadataSchema.optional(),
			output: z.never().optional(),
			errorText: z.never().optional(),
			approval: z.never().optional()
		}),
		z.object({
			type: z.literal("dynamic-tool"),
			toolName: z.string(),
			toolCallId: z.string(),
			title: z.string().optional(),
			toolMetadata: toolMetadataSchema2.optional(),
			state: z.literal("input-available"),
			input: z.unknown(),
			providerExecuted: z.boolean().optional(),
			output: z.never().optional(),
			errorText: z.never().optional(),
			callProviderMetadata: providerMetadataSchema.optional(),
			approval: z.never().optional()
		}),
		z.object({
			type: z.literal("dynamic-tool"),
			toolName: z.string(),
			toolCallId: z.string(),
			title: z.string().optional(),
			toolMetadata: toolMetadataSchema2.optional(),
			state: z.literal("approval-requested"),
			input: z.unknown(),
			providerExecuted: z.boolean().optional(),
			output: z.never().optional(),
			errorText: z.never().optional(),
			callProviderMetadata: providerMetadataSchema.optional(),
			approval: z.object({
				id: z.string(),
				approved: z.never().optional(),
				descriptor: z.unknown().optional(),
				requestReason: z.string().optional(),
				reason: z.never().optional(),
				isAutomatic: z.boolean().optional(),
				signature: z.string().optional()
			})
		}),
		z.object({
			type: z.literal("dynamic-tool"),
			toolName: z.string(),
			toolCallId: z.string(),
			title: z.string().optional(),
			toolMetadata: toolMetadataSchema2.optional(),
			state: z.literal("approval-responded"),
			input: z.unknown(),
			providerExecuted: z.boolean().optional(),
			output: z.never().optional(),
			errorText: z.never().optional(),
			callProviderMetadata: providerMetadataSchema.optional(),
			approval: z.object({
				id: z.string(),
				approved: z.boolean(),
				descriptor: z.unknown().optional(),
				requestReason: z.string().optional(),
				reason: z.string().optional(),
				isAutomatic: z.boolean().optional(),
				signature: z.string().optional()
			})
		}),
		z.object({
			type: z.literal("dynamic-tool"),
			toolName: z.string(),
			toolCallId: z.string(),
			title: z.string().optional(),
			toolMetadata: toolMetadataSchema2.optional(),
			state: z.literal("output-available"),
			input: z.unknown(),
			providerExecuted: z.boolean().optional(),
			output: z.unknown(),
			errorText: z.never().optional(),
			callProviderMetadata: providerMetadataSchema.optional(),
			resultProviderMetadata: providerMetadataSchema.optional(),
			preliminary: z.boolean().optional(),
			approval: z.object({
				id: z.string(),
				approved: z.literal(true),
				descriptor: z.unknown().optional(),
				requestReason: z.string().optional(),
				reason: z.string().optional(),
				isAutomatic: z.boolean().optional(),
				signature: z.string().optional()
			}).optional()
		}),
		z.object({
			type: z.literal("dynamic-tool"),
			toolName: z.string(),
			toolCallId: z.string(),
			title: z.string().optional(),
			toolMetadata: toolMetadataSchema2.optional(),
			state: z.literal("output-error"),
			input: z.unknown().optional(),
			rawInput: z.unknown().optional(),
			providerExecuted: z.boolean().optional(),
			output: z.never().optional(),
			errorText: z.string(),
			callProviderMetadata: providerMetadataSchema.optional(),
			resultProviderMetadata: providerMetadataSchema.optional(),
			approval: z.object({
				id: z.string(),
				approved: z.literal(true),
				descriptor: z.unknown().optional(),
				requestReason: z.string().optional(),
				reason: z.string().optional(),
				isAutomatic: z.boolean().optional(),
				signature: z.string().optional()
			}).optional()
		}),
		z.object({
			type: z.literal("dynamic-tool"),
			toolName: z.string(),
			toolCallId: z.string(),
			title: z.string().optional(),
			toolMetadata: toolMetadataSchema2.optional(),
			state: z.literal("output-denied"),
			input: z.unknown(),
			providerExecuted: z.boolean().optional(),
			output: z.never().optional(),
			errorText: z.never().optional(),
			callProviderMetadata: providerMetadataSchema.optional(),
			approval: z.object({
				id: z.string(),
				approved: z.literal(false),
				descriptor: z.unknown().optional(),
				requestReason: z.string().optional(),
				reason: z.string().optional(),
				isAutomatic: z.boolean().optional(),
				signature: z.string().optional()
			})
		}),
		z.object({
			type: z.string().startsWith("tool-"),
			toolCallId: z.string(),
			title: z.string().optional(),
			toolMetadata: toolMetadataSchema2.optional(),
			state: z.literal("input-streaming"),
			providerExecuted: z.boolean().optional(),
			callProviderMetadata: providerMetadataSchema.optional(),
			input: z.unknown().optional(),
			output: z.never().optional(),
			errorText: z.never().optional(),
			approval: z.never().optional()
		}),
		z.object({
			type: z.string().startsWith("tool-"),
			toolCallId: z.string(),
			title: z.string().optional(),
			toolMetadata: toolMetadataSchema2.optional(),
			state: z.literal("input-available"),
			providerExecuted: z.boolean().optional(),
			input: z.unknown(),
			output: z.never().optional(),
			errorText: z.never().optional(),
			callProviderMetadata: providerMetadataSchema.optional(),
			approval: z.never().optional()
		}),
		z.object({
			type: z.string().startsWith("tool-"),
			toolCallId: z.string(),
			title: z.string().optional(),
			toolMetadata: toolMetadataSchema2.optional(),
			state: z.literal("approval-requested"),
			input: z.unknown(),
			providerExecuted: z.boolean().optional(),
			output: z.never().optional(),
			errorText: z.never().optional(),
			callProviderMetadata: providerMetadataSchema.optional(),
			approval: z.object({
				id: z.string(),
				approved: z.never().optional(),
				descriptor: z.unknown().optional(),
				requestReason: z.string().optional(),
				reason: z.never().optional(),
				isAutomatic: z.boolean().optional(),
				signature: z.string().optional()
			})
		}),
		z.object({
			type: z.string().startsWith("tool-"),
			toolCallId: z.string(),
			title: z.string().optional(),
			toolMetadata: toolMetadataSchema2.optional(),
			state: z.literal("approval-responded"),
			input: z.unknown(),
			providerExecuted: z.boolean().optional(),
			output: z.never().optional(),
			errorText: z.never().optional(),
			callProviderMetadata: providerMetadataSchema.optional(),
			approval: z.object({
				id: z.string(),
				approved: z.boolean(),
				descriptor: z.unknown().optional(),
				requestReason: z.string().optional(),
				reason: z.string().optional(),
				isAutomatic: z.boolean().optional(),
				signature: z.string().optional()
			})
		}),
		z.object({
			type: z.string().startsWith("tool-"),
			toolCallId: z.string(),
			title: z.string().optional(),
			toolMetadata: toolMetadataSchema2.optional(),
			state: z.literal("output-available"),
			providerExecuted: z.boolean().optional(),
			input: z.unknown(),
			output: z.unknown(),
			errorText: z.never().optional(),
			callProviderMetadata: providerMetadataSchema.optional(),
			resultProviderMetadata: providerMetadataSchema.optional(),
			preliminary: z.boolean().optional(),
			approval: z.object({
				id: z.string(),
				approved: z.literal(true),
				descriptor: z.unknown().optional(),
				requestReason: z.string().optional(),
				reason: z.string().optional(),
				isAutomatic: z.boolean().optional(),
				signature: z.string().optional()
			}).optional()
		}),
		z.object({
			type: z.string().startsWith("tool-"),
			toolCallId: z.string(),
			title: z.string().optional(),
			toolMetadata: toolMetadataSchema2.optional(),
			state: z.literal("output-error"),
			providerExecuted: z.boolean().optional(),
			input: z.unknown().optional(),
			rawInput: z.unknown().optional(),
			output: z.never().optional(),
			errorText: z.string(),
			callProviderMetadata: providerMetadataSchema.optional(),
			resultProviderMetadata: providerMetadataSchema.optional(),
			approval: z.object({
				id: z.string(),
				approved: z.literal(true),
				descriptor: z.unknown().optional(),
				requestReason: z.string().optional(),
				reason: z.string().optional(),
				isAutomatic: z.boolean().optional(),
				signature: z.string().optional()
			}).optional()
		}),
		z.object({
			type: z.string().startsWith("tool-"),
			toolCallId: z.string(),
			title: z.string().optional(),
			toolMetadata: toolMetadataSchema2.optional(),
			state: z.literal("output-denied"),
			providerExecuted: z.boolean().optional(),
			input: z.unknown(),
			output: z.never().optional(),
			errorText: z.never().optional(),
			callProviderMetadata: providerMetadataSchema.optional(),
			approval: z.object({
				id: z.string(),
				approved: z.literal(false),
				descriptor: z.unknown().optional(),
				requestReason: z.string().optional(),
				reason: z.string().optional(),
				isAutomatic: z.boolean().optional(),
				signature: z.string().optional()
			})
		})
	]))
}).superRefine((message, context) => {
	if (message.role !== "assistant" && message.parts.length === 0) context.addIssue({
		origin: "array",
		code: "too_small",
		minimum: 1,
		inclusive: true,
		input: message.parts,
		path: ["parts"],
		message: "Message must contain at least one part"
	});
})).nonempty("Messages array must not be empty")));
createIdGenerator({
	prefix: "call",
	size: 24
});
createIdGenerator({
	prefix: "call",
	size: 24
});
new TextEncoder();
function convertDataContentToUint8Array(content) {
	if (content instanceof Uint8Array) return content;
	if (typeof content === "string") try {
		return convertBase64ToUint8Array(content);
	} catch (error) {
		throw new InvalidDataContentError({
			message: "Invalid data content. Content string is not a base64-encoded media.",
			content,
			cause: error
		});
	}
	if (content instanceof ArrayBuffer) return new Uint8Array(content);
	throw new InvalidDataContentError({ content });
}
var gatewayCostMetadataKeys = [
	"cost",
	"gatewayCost",
	"inferenceCost",
	"inputInferenceCost",
	"marketCost",
	"outputInferenceCost",
	"surchargeCost"
];
async function generateImage({ model: modelArg, prompt: promptArg, n = 1, maxImagesPerCall, size, aspectRatio, seed, providerOptions, maxRetries: maxRetriesArg, abortSignal, headers }) {
	var _a25;
	const model = resolveImageModel(modelArg);
	const headersWithUserAgent = withUserAgentSuffix(headers != null ? headers : {}, `ai/${VERSION}`);
	const { retry } = prepareRetries({
		maxRetries: maxRetriesArg,
		abortSignal
	});
	const maxImagesPerCallWithDefault = (_a25 = maxImagesPerCall != null ? maxImagesPerCall : await invokeModelMaxImagesPerCall(model)) != null ? _a25 : 1;
	const callCount = Math.ceil(n / maxImagesPerCallWithDefault);
	const callImageCounts = Array.from({ length: callCount }, (_, i) => {
		if (i < callCount - 1) return maxImagesPerCallWithDefault;
		const remainder = n % maxImagesPerCallWithDefault;
		return remainder === 0 ? maxImagesPerCallWithDefault : remainder;
	});
	const results = await Promise.all(callImageCounts.map(async (callImageCount) => await retry(() => {
		const { prompt, files, mask } = normalizePrompt(promptArg);
		return model.doGenerate({
			prompt,
			files,
			mask,
			n: callImageCount,
			abortSignal,
			headers: headersWithUserAgent,
			size,
			aspectRatio,
			seed,
			providerOptions: providerOptions != null ? providerOptions : {}
		});
	})));
	const images = [];
	const calls = [];
	const warnings = [];
	const responses = [];
	const providerMetadata = {};
	let totalUsage = {
		inputTokens: void 0,
		outputTokens: void 0,
		totalTokens: void 0
	};
	for (const result of results) {
		const callImages = result.images.map((image, index) => {
			var _a26;
			return new DefaultGeneratedFile({
				data: image,
				mediaType: (_a26 = detectMediaType({
					data: image,
					topLevelType: "image"
				})) != null ? _a26 : "image/png",
				providerMetadata: getImageProviderMetadata(result.providerMetadata, index)
			});
		});
		images.push(...callImages);
		calls.push({
			images: callImages,
			providerMetadata: result.providerMetadata,
			response: result.response,
			warnings: result.warnings,
			usage: result.usage
		});
		warnings.push(...result.warnings);
		if (result.usage != null) totalUsage = addImageModelUsage(totalUsage, result.usage);
		if (result.providerMetadata) for (const [providerName, metadata] of Object.entries(result.providerMetadata)) if (providerName === "gateway") {
			const currentEntry = providerMetadata[providerName];
			if (currentEntry != null && typeof currentEntry === "object") {
				const currentGatewayMetadata = currentEntry;
				const newGatewayMetadata = metadata;
				providerMetadata[providerName] = {
					...currentEntry,
					...metadata,
					...Object.fromEntries(gatewayCostMetadataKeys.flatMap((key) => {
						const total = addDecimalStrings(currentGatewayMetadata[key], newGatewayMetadata[key]);
						return total == null ? [] : [[key, total]];
					}))
				};
			} else providerMetadata[providerName] = { ...metadata };
			const imagesValue = providerMetadata[providerName].images;
			if (Array.isArray(imagesValue) && imagesValue.length === 0) delete providerMetadata[providerName].images;
		} else {
			providerMetadata[providerName] ?? (providerMetadata[providerName] = { images: [] });
			providerMetadata[providerName].images.push(...metadata.images);
		}
		responses.push(result.response);
	}
	logWarnings({
		warnings,
		provider: model.provider,
		model: model.modelId
	});
	if (!images.length) throw new NoImageGeneratedError({
		calls,
		responses
	});
	return new DefaultGenerateImageResult({
		images,
		calls,
		warnings,
		responses,
		providerMetadata,
		usage: totalUsage
	});
}
var DefaultGenerateImageResult = class {
	constructor(options) {
		this.images = options.images;
		this.calls = options.calls;
		this.warnings = options.warnings;
		this.responses = options.responses;
		this.providerMetadata = options.providerMetadata;
		this.usage = options.usage;
	}
	get image() {
		return this.images[0];
	}
};
function getImageProviderMetadata(providerMetadata, imageIndex) {
	var _a25;
	if (providerMetadata == null) return;
	let imageMetadata;
	for (const [providerName, metadata] of Object.entries(providerMetadata)) {
		const value = (_a25 = metadata.images) == null ? void 0 : _a25[imageIndex];
		if (isJSONObject(value) && !Array.isArray(value)) (imageMetadata != null ? imageMetadata : imageMetadata = {})[providerName] = value;
	}
	return imageMetadata;
}
async function invokeModelMaxImagesPerCall(model) {
	if (!(model.maxImagesPerCall instanceof Function)) return model.maxImagesPerCall;
	return model.maxImagesPerCall({ modelId: model.modelId });
}
function addDecimalStrings(value1, value2) {
	if (typeof value1 !== "string" || typeof value2 !== "string" || !/^\d+(?:\.\d+)?$/.test(value1) || !/^\d+(?:\.\d+)?$/.test(value2)) return;
	const [integer1, fraction1 = ""] = value1.split(".");
	const [integer2, fraction2 = ""] = value2.split(".");
	const precision = Math.max(fraction1.length, fraction2.length);
	const sumString = (BigInt(integer1 + fraction1.padEnd(precision, "0")) + BigInt(integer2 + fraction2.padEnd(precision, "0"))).toString().padStart(precision + 1, "0");
	return precision === 0 ? sumString : `${sumString.slice(0, -precision)}.${sumString.slice(-precision)}`.replace(/\.?0+$/, "");
}
function normalizePrompt(prompt) {
	if (typeof prompt === "string") return {
		prompt,
		files: void 0,
		mask: void 0
	};
	return {
		prompt: prompt.text,
		files: prompt.images.map(toImageModelV4File),
		mask: prompt.mask ? toImageModelV4File(prompt.mask) : void 0
	};
}
function toImageModelV4File(dataContent) {
	if (typeof dataContent === "string" && dataContent.startsWith("http")) return {
		type: "url",
		url: dataContent
	};
	if (typeof dataContent === "string" && dataContent.startsWith("data:")) {
		const { mediaType: dataUrlMediaType, base64Content } = splitDataUrl(dataContent);
		if (base64Content != null) {
			const uint8Data2 = convertBase64ToUint8Array(base64Content);
			return {
				type: "file",
				data: uint8Data2,
				mediaType: dataUrlMediaType || detectMediaType({
					data: uint8Data2,
					topLevelType: "image"
				}) || "image/png"
			};
		}
	}
	const uint8Data = convertDataContentToUint8Array(dataContent);
	return {
		type: "file",
		data: uint8Data,
		mediaType: detectMediaType({
			data: uint8Data,
			topLevelType: "image"
		}) || "image/png"
	};
}
createIdGenerator({
	prefix: "aiobj",
	size: 24
});
createIdGenerator({
	prefix: "aiobj",
	size: 24
});
createIdGenerator({
	prefix: "call",
	size: 24
});
//#endregion
export { generateImage as t };
