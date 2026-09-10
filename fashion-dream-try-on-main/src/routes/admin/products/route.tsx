import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/products")({
  component: ProductsLayout,
  head: () => ({
    meta: [{ title: "Sản phẩm — Admin" }],
  }),
});

function ProductsLayout() {
  return <Outlet />;
}
