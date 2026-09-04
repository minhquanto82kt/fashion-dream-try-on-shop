//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-BP__v-i7.js
var manifest = {
	"0eaf9bcc91ee4040d27ca3e9199e256352fc937feb3668113ad33b5af2e61e68": {
		functionName: "generateConcept_createServerFn_handler",
		importer: () => import("./_ssr/ai.functions-BEXOtz1E.mjs")
	},
	"24b4c48c1a4e0a10b7239b9091e439d6119eba3bf189e489428450b7051177ae": {
		functionName: "generateTryOn_createServerFn_handler",
		importer: () => import("./_ssr/ai.functions-BEXOtz1E.mjs")
	}
};
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { getServerFnById as t };
