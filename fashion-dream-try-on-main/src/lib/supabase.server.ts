import { PRODUCTS, type Product } from "@/data/products";
import {
  createRequestId,
  fetchWithTimeoutAndRetry,
  logServerEvent,
  safeLogError,
} from "@/lib/server-reliability";

type SupabaseConfig = {
  url: string;
  secretKey: string;
};

const CI_SMOKE_KEY = "ci-smoke-test-placeholder";

function isCiSmokeTest() {
  return process.env.VITE_SUPABASE_PUBLISHABLE_KEY === CI_SMOKE_KEY;
}

function getConfig(): SupabaseConfig {
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error("Thiếu cấu hình Supabase trên server.");
  }

  return { url, secretKey };
}

function toDbProduct(product: Product) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    image: product.image,
    active: true,
    status: "published",
    featured: Boolean(product.badge),
  };
}

function toSmokeCatalogProduct(product: Product) {
  return {
    ...toDbProduct(product),
    sizes: product.sizes,
    colors: product.colors,
    gallery: product.gallery,
    total_stock: product.sizes.length * product.colors.length * 12,
  };
}

function smokeVariants(product: Product) {
  return product.sizes.flatMap((size) =>
    product.colors.map((color) => ({
      id: `${product.id}-${size}-${color}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      product_id: product.id,
      size,
      color,
      stock: 12,
    })),
  );
}

function smokeImages(product: Product) {
  return product.gallery.map((image, index) => ({
    id: `${product.id}-image-${index + 1}`,
    product_id: product.id,
    image_url: image,
    sort_order: index,
    is_primary: index === 0,
  }));
}

function smokeCatalogResponse<T>(path: string): T {
  const [resource, query = ""] = path.split("?");
  const params = new URLSearchParams(query);

  if (resource === "rpc/get_published_catalog") {
    return PRODUCTS.map(toSmokeCatalogProduct) as T;
  }

  if (resource === "products") {
    let products = PRODUCTS.map(toDbProduct);
    const idFilter = params.get("id");

    if (idFilter?.startsWith("eq.")) {
      products = products.filter((product) => product.id === idFilter.slice(3));
    }

    if (idFilter?.startsWith("neq.")) {
      products = products.filter((product) => product.id !== idFilter.slice(4));
    }

    const limit = Number(params.get("limit"));
    if (Number.isFinite(limit) && limit > 0) {
      products = products.slice(0, limit);
    }

    return products as T;
  }

  if (resource === "product_variants") {
    const productFilter = params.get("product_id");
    const products = productFilter?.startsWith("eq.")
      ? PRODUCTS.filter((product) => product.id === productFilter.slice(3))
      : PRODUCTS;

    return products.flatMap(smokeVariants) as T;
  }

  if (resource === "product_images") {
    const productFilter = params.get("product_id");
    const products = productFilter?.startsWith("eq.")
      ? PRODUCTS.filter((product) => product.id === productFilter.slice(3))
      : PRODUCTS;

    return products.flatMap(smokeImages) as T;
  }

  throw new Error(`CI smoke catalog does not support Supabase resource: ${resource}`);
}

function resourceName(path: string): string {
  return path.split("?", 1)[0]?.split("/", 1)[0] ?? "unknown";
}

export class SupabaseRequestError extends Error {
  readonly status: number;
  readonly requestId: string;

  constructor(message: string, status: number, requestId: string) {
    super(message);
    this.name = "SupabaseRequestError";
    this.status = status;
    this.requestId = requestId;
  }
}

export async function supabaseRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  if (isCiSmokeTest()) {
    return smokeCatalogResponse<T>(path);
  }

  const { url, secretKey } = getConfig();
  const requestId = createRequestId();
  const method = (options.method ?? "GET").toUpperCase();
  const resource = resourceName(path);
  const startedAt = Date.now();

  try {
    const response = await fetchWithTimeoutAndRetry(
      `${url}/rest/v1/${path}`,
      {
        ...options,
        headers: {
          apikey: secretKey,
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
          ...(options.headers ?? {}),
        },
      },
      { requestId },
    );

    const durationMs = Date.now() - startedAt;
    if (!response.ok) {
      const detail = (await response.text()).slice(0, 1_000);
      logServerEvent("error", "supabase.request.failed", {
        requestId,
        resource,
        method,
        status: response.status,
        durationMs,
        detail,
      });
      throw new SupabaseRequestError("SUPABASE_REQUEST_FAILED", response.status, requestId);
    }

    logServerEvent("info", "supabase.request.completed", {
      requestId,
      resource,
      method,
      status: response.status,
      durationMs,
    });

    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof SupabaseRequestError) throw error;

    logServerEvent("error", "supabase.request.error", {
      requestId,
      resource,
      method,
      durationMs: Date.now() - startedAt,
      error: safeLogError(error),
    });
    throw new SupabaseRequestError("SUPABASE_UNAVAILABLE", 503, requestId);
  }
}
