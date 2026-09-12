import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import appCss from "../styles.css?url";
import uiStabilizationCss from "../ui-stabilization.css?url";
import topbarCss from "../topbar.css?url";
import adminUiCss from "../admin-ui.css?url";
import adminComfortCss from "../admin-comfort.css?url";
import paletteCss from "../palette.css?url";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/lib/cart";
import { getCustomerUser, getSafeReturnPath, startCustomerSessionWatcher } from "@/lib/auth";
import { applyTheme, getStoredTheme } from "@/lib/theme";
import { reportLovableError } from "../lib/lovable-error-reporting";

const CUSTOMER_PROTECTED_PREFIXES = ["/checkout", "/account/profile", "/account/orders", "/account/wishlist"];
function isCustomerProtectedPath(pathname: string) { return CUSTOMER_PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)); }
function rememberReturnPath() {
  if (typeof window === "undefined") return;
  const path = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  window.sessionStorage.setItem("upthink_auth_return_to", getSafeReturnPath(path));
}
function consumeReturnPath() {
  if (typeof window === "undefined") return "/";
  const path = getSafeReturnPath(window.sessionStorage.getItem("upthink_auth_return_to"));
  window.sessionStorage.removeItem("upthink_auth_return_to");
  return path;
}

function ThemeRuntime() {
  useEffect(() => {
    applyTheme(getStoredTheme());
    const onThemeChange = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      applyTheme(detail);
    };
    window.addEventListener("upthink:theme:changed", onThemeChange);
    return () => window.removeEventListener("upthink:theme:changed", onThemeChange);
  }, []);
  return null;
}

function CustomerAuthGuard() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const pathname = router.state.location.pathname;

  useEffect(() => {
    let cancelled = false;
    const verify = async () => {
      if (!isCustomerProtectedPath(window.location.pathname)) { setChecking(false); return; }
      setChecking(true);
      const user = await getCustomerUser();
      if (cancelled) return;
      if (!user) { rememberReturnPath(); await router.navigate({ to: "/account" }); }
      setChecking(false);
    };
    void verify();
    return () => { cancelled = true; };
  }, [router, router.state.location.pathname, router.state.location.search]);

  useEffect(() => {
    const onLogin = () => {
      const returnTo = consumeReturnPath();
      if (returnTo !== "/" && isCustomerProtectedPath(new URL(returnTo, window.location.origin).pathname)) {
        window.location.assign(returnTo);
      }
    };
    const onLogout = () => {
      if (isCustomerProtectedPath(window.location.pathname)) void router.navigate({ to: "/account" });
    };
    window.addEventListener("upthink:auth:login", onLogin);
    window.addEventListener("upthink:auth:logout", onLogout);
    return () => { window.removeEventListener("upthink:auth:login", onLogin); window.removeEventListener("upthink:auth:logout", onLogout); };
  }, [router]);

  useEffect(() => startCustomerSessionWatcher(() => {
    if (isCustomerProtectedPath(window.location.pathname)) {
      void getCustomerUser().then((user) => {
        if (!user) { rememberReturnPath(); void router.navigate({ to: "/account" }); }
      });
    }
  }), [router]);

  if (checking && isCustomerProtectedPath(pathname)) {
    return <div className="min-h-screen bg-background text-foreground flex items-center justify-center"><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Đang xác thực tài khoản…</p></div>;
  }
  return null;
}

function NotFoundComponent() {
  return <div className="flex min-h-screen items-center justify-center bg-background px-4"><div className="max-w-md text-center"><h1 className="text-7xl font-bold text-foreground">404</h1><h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2><p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p><div className="mt-6"><Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">Go home</Link></div></div></div>;
}
function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return <div className="flex min-h-screen items-center justify-center bg-background px-4"><div className="max-w-md text-center"><h1 className="text-xl font-semibold tracking-tight text-foreground">This page didn't load</h1><p className="mt-2 text-sm text-muted-foreground">Something went wrong on our end. You can try refreshing or head back home.</p><div className="mt-6 flex flex-wrap justify-center gap-2"><button onClick={() => { router.invalidate(); reset(); }} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">Try again</button><a href="/" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent">Go home</a></div></div></div>;
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({ meta: [
    { charSet: "utf-8" }, { name: "viewport", content: "width=device-width, initial-scale=1" }, { title: "UpThink — Thời trang streetwear với AI try-on" },
    { name: "description", content: "Nền tảng thời trang của sinh viên IUH: streetwear, AI concept styling và virtual try-on." }, { name: "author", content: "UpThink" }, { property: "og:title", content: "UpThink" }, { property: "og:description", content: "Streetwear cá nhân hóa với AI concept styling và virtual try-on." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { name: "twitter:site", content: "@Lovable" }
  ], links: [
    { rel: "stylesheet", href: appCss }, { rel: "stylesheet", href: uiStabilizationCss }, { rel: "stylesheet", href: topbarCss }, { rel: "stylesheet", href: adminUiCss }, { rel: "stylesheet", href: adminComfortCss }, { rel: "stylesheet", href: paletteCss }, { rel: "icon", href: "/favicon.ico", type: "image/x-icon" }, { rel: "preconnect", href: "https://fonts.googleapis.com" }, { rel: "preconnect", href: "https://fonts.gstatic.com" }, { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Anton&family=Bodoni+Moda:opsz,wght@6..96,400..700&family=Oswald:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600&display=swap" }
  ] }),
  shellComponent: RootShell, component: RootComponent, notFoundComponent: NotFoundComponent, errorComponent: ErrorComponent,
});
function RootShell({ children }: { children: ReactNode }) { return <html lang="vi"><head><HeadContent /></head><body>{children}<Scripts /></body></html>; }
function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return <QueryClientProvider client={queryClient}><CartProvider><ThemeRuntime /><CustomerAuthGuard /><Outlet /><Toaster /></CartProvider></QueryClientProvider>;
}
