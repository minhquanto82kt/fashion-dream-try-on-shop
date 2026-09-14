import { createFileRoute } from "@tanstack/react-router";
import {
  getCustomerOrderByToken,
  listCustomerOrdersByToken,
} from "@/lib/order.functions";

function getBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match?.[1]?.trim() || null;
}

export const Route = createFileRoute("/api/orders/history")({
  server: {
    handlers: {
      /**
       * GET /api/orders/history
       * Authorization: Bearer <customer access_token>
       * Query: ?limit=50&offset=0&orderId= optional detail by id or order_code
       */
      GET: async ({ request }) => {
        try {
          const token = getBearerToken(request);

          if (!token) {
            return Response.json(
              { success: false, error: "UNAUTHORIZED", message: "Missing Bearer token." },
              { status: 401 },
            );
          }

          const url = new URL(request.url);
          const orderId = url.searchParams.get("orderId")?.trim() || "";
          const limitRaw = Number(url.searchParams.get("limit") ?? "50");
          const offsetRaw = Number(url.searchParams.get("offset") ?? "0");
          const limit = Number.isFinite(limitRaw) ? limitRaw : 50;
          const offset = Number.isFinite(offsetRaw) ? offsetRaw : 0;

          if (orderId) {
            const order = await getCustomerOrderByToken(token, orderId);
            if (!order) {
              return Response.json(
                { success: false, error: "NOT_FOUND", message: "Không tìm thấy đơn hàng." },
                { status: 404 },
              );
            }
            return Response.json({ success: true, order });
          }

          const orders = await listCustomerOrdersByToken(token, { limit, offset });

          return Response.json({
            success: true,
            orders,
            meta: { limit, offset, count: orders.length },
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Không thể tải lịch sử đơn hàng.";

          if (message === "UNAUTHORIZED") {
            return Response.json(
              { success: false, error: "UNAUTHORIZED", message: "Phiên đăng nhập không hợp lệ." },
              { status: 401 },
            );
          }

          console.error("GET /api/orders/history error:", error);

          return Response.json(
            { success: false, error: "INTERNAL", message },
            { status: 500 },
          );
        }
      },
    },
  },
});
