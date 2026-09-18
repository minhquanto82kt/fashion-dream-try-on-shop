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

async function smokeCatalogResponse<T>(path: string): Promise<T> {
  const { SMOKE_PRODUCTS, SMOKE_VARIANTS, SMOKE_IMAGES } = await import(
    "../../tests/fixtures/supabase-catalog"
  );
  const [resource, query = ""] = path.split("?");
  const params = new URLSearchParams(query);

  if (resource === "products") {
    let products = [...SMOKE_PRODUCTS];
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
    const variants = productFilter?.startsWith("eq.")
      ? SMOKE_VARIANTS.filter((variant) => variant.product_id === productFilter.slice(3))
      : SMOKE_VARIANTS;
    return variants as T;
  }

  if (resource === "product_images") {
    const productFilter = params.get("product_id");
    const images = productFilter?.startsWith("eq.")
      ? SMOKE_IMAGES.filter((image) => image.product_id === productFilter.slice(3))
      : SMOKE_IMAGES;
    return images as T;
  }

  throw new Error(`CI smoke catalog does not support Supabase resource: ${resource}`);
}

export async function supabaseRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  if (isCiSmokeTest()) {
    return smokeCatalogResponse<T>(path);
  }

  const { url, secretKey } = getConfig();

  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: secretKey,
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase error ${response.status}: ${message}`);
  }

  return response.json() as Promise<T>;
}
