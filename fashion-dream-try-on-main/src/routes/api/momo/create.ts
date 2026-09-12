import { createFileRoute } from "@tanstack/react-router";
import { createMomoPayment } from "@/lib/momo.server";

type CreateMomoBody = {
  orderCode?: unknown;
};

export const Route = createFileRoute("/api/momo/create")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const contentType = request.headers.get("content-type") ?? "";

          if (!contentType.toLowerCase().includes("application/json")) {
            return Response.json(
              { success: false, error: "Unsupported Media Type" },
              { status: 415 },
            );
          }

          const body = (await request.json()) as CreateMomoBody;
          const orderCode =
            typeof body.orderCode === "string" ? body.orderCode.trim() : "";

          if (!orderCode) {
            return Response.json(
              { success: false, error: "ORDER_CODE_REQUIRED" },
              { status: 400 },
            );
          }

          const result = await createMomoPayment(orderCode);

          return Response.json({
            success: true,
            payment: result,
          });
        } catch (error) {
          console.error("MoMo create payment error:", error);

          return Response.json(
            {
              success: false,
              error:
                error instanceof Error
                  ? error.message
                  : "Không thể tạo thanh toán MoMo.",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
