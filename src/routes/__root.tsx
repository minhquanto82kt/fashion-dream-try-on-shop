import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "UPTHINK. — AI Fashion",
      },
      {
        name: "description",
        content:
          "AI-powered fashion e-commerce platform with virtual try-on and concept try-on.",
      },
    ],
  }),

  component: RootLayout,
});

function RootLayout() {
  return (
    <>
      <HeadContent />

      <div className="min-h-screen bg-background text-foreground">
        <Outlet />
      </div>

      <Scripts />
    </>
  );
}
