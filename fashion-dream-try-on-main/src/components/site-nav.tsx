import { Link } from "@tanstack/react-router";
import { Bell, ChevronDown, ChevronRight, CircleHelp, Globe2, LogOut, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { CATEGORIES } from "@/data/products";
import { useCart } from "@/lib/cart";
import { getCustomerUser, signOutCustomer } from "@/lib/auth";
import { useI18n, type Language } from "@/lib/i18n";
import "@/styles/header-enhancements.css";
import "@/styles/wearo-header-ux.css";
import "@/styles/wearo-language-modal.css";

const DISCOVERY_LINKS = [
  { label: "New Arrivals", vi: "Hàng mới về", to: "/shop" },
  { label: "Collections", vi: "Bộ sưu tập", to: "/shop" },
  { label: "Best Sellers", vi: "Bán chạy", to: "/shop" },
] as const;

export function SiteNav() {
  const { count } = useCart();
  const { language, setLanguage, t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language);
  const [notificationTab, setNotificationTab] = useState<"notifications" | "history">("notifications");
  const [query, setQuery] = useState("");
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const sync = async () => {
      const user = await getCustomerUser();
      if (mounted) setCustomerEmail(user?.email ?? null);
    };
    void sync();
    const onLogin = () => void sync();
    const onLogout = () => {
      setCustomerEmail(null);
      setNotificationOpen(false);
    };
    window.addEventListener("upthink:auth:login", onLogin);
    window.addEventListener("upthink:auth:logout", onLogout);
    return () => {
      mounted = false;
      window.removeEventListener("upthink:auth:login", onLogin);
      window.removeEventListener("upthink:auth:logout", onLogout);
    };
  }, []);

  useEffect(() => {
    if (!searchOpen && !mobileOpen && !languageModalOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setSearchOpen(false);
      setMobileOpen(false);
      setShopOpen(false);
      setNotificationOpen(false);
      setLanguageModalOpen(false);
      setQuery("");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [searchOpen, mobileOpen, languageModalOpen]);

  useEffect(() => {
    if (!languageModalOpen) return;
    setSelectedLanguage(language);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [languageModalOpen, language]);

  const closeMenus = () => {
    setMobileOpen(false);
    setSearchOpen(false);
    setShopOpen(false);
    setNotificationOpen(false);
    setLanguageModalOpen(false);
  };

  const openLanguageModal = () => {
    setSelectedLanguage(language);
    setMobileOpen(false);
    setSearchOpen(false);
    setShopOpen(false);
    setNotificationOpen(false);
    setLanguageModalOpen(true);
  };

  const confirmLanguage = () => {
    setLanguage(selectedLanguage);
    setLanguageModalOpen(false);
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    window.location.href = `/shop?search=${encodeURIComponent(value)}`;
    closeMenus();
  };

  const handleLogout = async () => {
    await signOutCustomer();
    closeMenus();
  };

  const toggleSearch = () => {
    setSearchOpen((value) => !value);
    setMobileOpen(false);
    setShopOpen(false);
    setNotificationOpen(false);
    setLanguageModalOpen(false);
  };

  const languageFlag = language === "vi" ? "/flags/vietnam.svg" : "/flags/united-kingdom.svg";

  return (
    <nav className="fashion-nav" aria-label={t("Điều hướng chính", "Main navigation")}>
      <div className="fashion-nav__announcement" role="status">
        <span>WEARO / 2026</span>
        <span>{t("MIỄN PHÍ VẬN CHUYỂN — ĐƠN TỪ 700K", "FREE SHIPPING — ORDERS FROM 700K")}</span>
        <span>AI VIRTUAL TRY-ON / BETA</span>
      </div>

      <div className="fashion-nav__inner">
        <Link to="/" className="fashion-brand" aria-label="WEARO home" onClick={closeMenus}>
          <img className="fashion-brand__logo" src="/brand/wearo-logo-header.svg" alt="WEARO" />
        </Link>

        <div className="fashion-nav__links" aria-label={t("Điều hướng trang chính", "Primary navigation")}>
          <div className={`fashion-shop-nav ${shopOpen ? "is-open" : ""}`} onMouseEnter={() => setShopOpen(true)} onMouseLeave={() => setShopOpen(false)}>
            <Link to="/shop" className="fashion-nav-link fashion-shop-trigger" activeProps={{ className: "fashion-nav-link fashion-shop-trigger is-active" }} aria-expanded={shopOpen} aria-haspopup="true" onClick={() => { setSearchOpen(false); setMobileOpen(false); setNotificationOpen(false); }}>
              <span>{t("Cửa hàng", "Shop")}</span><ChevronDown size={15} strokeWidth={2} aria-hidden="true" />
            </Link>
            {shopOpen && (
              <div className="fashion-shop-mega" role="dialog" aria-label={t("Danh mục sản phẩm", "Shop categories")}>
                <div className="fashion-shop-mega__intro"><span className="fashion-menu-kicker">WEARO / COLLECTIONS</span><h2>{t("Mua theo phong cách", "Shop your style")}</h2><Link to="/shop" onClick={closeMenus} className="fashion-shop-all">{t("Xem tất cả sản phẩm", "View all products")} <ChevronRight size={15} /></Link></div>
                <div className="fashion-shop-discovery-grid">{DISCOVERY_LINKS.map((link) => <Link key={link.label} to={link.to} onClick={closeMenus} className="fashion-shop-all"><span>{t(link.vi, link.label)}</span><ChevronRight size={15} /></Link>)}</div>
                <div className="fashion-shop-category-grid">{CATEGORIES.map((category) => <Link key={category.slug} to="/shop" search={{ category: category.slug }} onClick={closeMenus} className="fashion-shop-category"><span className="fashion-shop-category__image"><img src={category.image} alt="" loading="lazy" /></span><span className="fashion-shop-category__meta"><strong>{category.name}</strong><span>{t("Khám phá danh mục", "Explore category")}</span></span><ChevronRight size={15} aria-hidden="true" /></Link>)}</div>
              </div>
            )}
          </div>

          <Link to="/ai" className="fashion-ai-nav" activeProps={{ className: "fashion-ai-nav is-active" }} aria-label="AI Studio — Beta">
            <span className="fashion-ai-nav__label">AI Studio</span><span className="fashion-ai-nav__beta" aria-hidden="true"><span>BETA</span></span>
          </Link>

          <Link to="/about" className="fashion-nav-link" activeProps={{ className: "fashion-nav-link is-active" }}>{t("Giới thiệu", "About")}</Link>
        </div>

        <div className="fashion-nav__actions">
          <button type="button" className={`fashion-icon-btn fashion-search-toggle ${searchOpen ? "is-active" : ""}`} aria-label={searchOpen ? t("Đóng tìm kiếm", "Close search") : t("Tìm kiếm sản phẩm", "Search products")} aria-expanded={searchOpen} onClick={toggleSearch}>{searchOpen ? <X size={20} /> : <Search size={20} />}</button>
          <button type="button" className={`fashion-icon-btn ${notificationOpen ? "is-active" : ""}`} aria-label={t("Thông báo", "Notifications")} aria-expanded={notificationOpen} onClick={() => { setNotificationOpen((value) => !value); setSearchOpen(false); setShopOpen(false); setMobileOpen(false); setLanguageModalOpen(false); }}><Bell size={20} /></button>
          <Link to="/account" className="fashion-icon-btn fashion-account-btn" aria-label={customerEmail ? `${t("Tài khoản", "Account")} ${customerEmail}` : t("Tài khoản", "Account")}><UserRound size={20} /></Link>
          <Link to="/cart" className="fashion-cart-btn" aria-label={t("Giỏ hàng", "Cart")}><ShoppingBag size={20} />{count > 0 && <span>{count}</span>}</Link>
          {customerEmail && <button type="button" className="fashion-icon-btn fashion-logout-btn" aria-label={t("Đăng xuất", "Log out")} onClick={() => void handleLogout()}><LogOut size={19} /></button>}
          <button type="button" className={`fashion-language-switcher ${languageModalOpen ? "is-active" : ""}`} aria-label={t("Lựa chọn ngôn ngữ và vị trí", "Language and location selection")} aria-expanded={languageModalOpen} aria-haspopup="dialog" onClick={openLanguageModal}>
            <img className="fashion-language-flag" src={languageFlag} alt="" width={24} height={24} aria-hidden="true" />
            <span className="fashion-language-code">{language === "vi" ? "VIE" : "ENG"}</span>
          </button>
          <button type="button" className={`fashion-mobile-btn ${mobileOpen ? "is-active" : ""}`} aria-label={mobileOpen ? t("Đóng menu", "Close menu") : t("Mở menu", "Open menu")} aria-expanded={mobileOpen} onClick={() => { setMobileOpen((value) => !value); setSearchOpen(false); setShopOpen(false); setNotificationOpen(false); setLanguageModalOpen(false); }}>{mobileOpen ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
      </div>

      {notificationOpen && <div className="wearo-nav-popover" role="dialog" aria-label={t("Trung tâm thông báo", "Notification center")}>{!customerEmail ? <div className="wearo-nav-popover__empty"><span className="fashion-menu-kicker">WEARO / MEMBER</span><h2>{t("Không gian cá nhân của bạn", "Your personal space")}</h2><p>{t("Đăng nhập để xem thông báo, đơn hàng và các hoạt động tài khoản.", "Sign in to view notifications, orders and account activity.")}</p><Link to="/account" onClick={closeMenus} className="fashion-btn">{t("Đăng nhập / Đăng ký", "Sign in / Register")}</Link></div> : <div className="wearo-nav-popover__member"><div className="wearo-nav-popover__header"><div><span className="fashion-menu-kicker">WEARO / MEMBER CENTER</span><h2>{t("Trung tâm cá nhân", "Member center")}</h2></div><Bell size={20} /></div><div className="wearo-nav-tabs"><button type="button" className={notificationTab === "notifications" ? "is-active" : ""} onClick={() => setNotificationTab("notifications")}>{t("Thông báo", "Notifications")}</button><button type="button" className={notificationTab === "history" ? "is-active" : ""} onClick={() => setNotificationTab("history")}>{t("Đơn hàng", "Orders")}</button></div><div className="wearo-nav-popover__card">{notificationTab === "notifications" ? <><strong>{t("Chào mừng bạn trở lại", "Welcome back")}</strong><p>{t("Cập nhật đơn hàng và hoạt động tài khoản sẽ xuất hiện tại đây.", "Order updates and account activity will appear here.")}</p></> : <><strong>{t("Lịch sử đơn hàng", "Order history")}</strong><p>{t("Xem và quản lý đơn hàng trong tài khoản WEARO.", "View and manage your orders in your WEARO account.")}</p></>}</div><Link to="/account" onClick={closeMenus} className="wearo-nav-popover__link">{t("Mở tài khoản", "Open account")} <ChevronRight size={15} /></Link></div>}</div>}

      {searchOpen && <div className="fashion-search-panel" role="dialog" aria-label={t("Tìm kiếm nhanh", "Quick search")}><div className="fashion-search-panel__header"><div><span className="fashion-menu-kicker">WEARO / SEARCH</span><h2>{t("Tìm sản phẩm", "Find your style")}</h2></div><button type="button" className="fashion-icon-btn" onClick={() => { setSearchOpen(false); setQuery(""); }} aria-label={t("Đóng tìm kiếm", "Close search")}><X size={18} /></button></div><form onSubmit={submitSearch} className="fashion-search-form"><label htmlFor="site-search" className="sr-only">{t("Tìm kiếm sản phẩm", "Search products")}</label><Search size={18} aria-hidden="true" /><input id="site-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("Tìm sản phẩm, phong cách...", "Search products, styles...")} autoFocus /><button type="submit" disabled={!query.trim()}>{t("Tìm", "Search")}</button></form><div className="fashion-search-panel__body"><div><span className="fashion-menu-label">01 / QUICK ACCESS</span><div className="fashion-search-links"><Link to="/shop" onClick={closeMenus}><span>{t("Tất cả sản phẩm", "All products")}</span><ChevronRight size={15} /></Link><Link to="/ai" onClick={closeMenus}><span>AI Studio</span><ChevronRight size={15} /></Link><Link to="/account" onClick={closeMenus}><span>{t("Tài khoản", "My Account")}</span><ChevronRight size={15} /></Link></div></div><div><span className="fashion-menu-label">02 / CATEGORIES</span><div className="fashion-search-tags">{CATEGORIES.map((category) => <Link key={category.slug} to="/shop" search={{ category: category.slug }} onClick={closeMenus}>{category.name}</Link>)}</div></div></div><div className="fashion-search-hint"><span>{t("Enter để tìm · Esc để đóng", "Enter to search · Esc to close")}</span><span>WEARO / SEARCH</span></div></div>}

      {mobileOpen && <div className="fashion-mobile-menu" role="dialog" aria-label="WEARO menu"><div className="fashion-menu-header"><div><span className="fashion-menu-kicker">WEARO / NAVIGATION</span><h2>{t("Khám phá", "Discover")}</h2></div><span className="fashion-menu-status">MODERN EVERYDAY</span></div><div className="fashion-menu-grid"><section className="fashion-menu-section"><span className="fashion-menu-label">01 / SHOP</span><Link to="/shop" onClick={closeMenus}><span><strong>{t("Cửa hàng", "Shop")}</strong><small>{t("Khám phá bộ sưu tập", "Browse the collection")}</small></span><ChevronRight size={17} /></Link><Link to="/ai" onClick={closeMenus}><span><strong>AI Studio</strong><small>{t("Thử đồ ảo và khám phá phong cách", "Virtual try-on and style discovery")}</small></span><ChevronRight size={17} /></Link></section><section className="fashion-menu-section"><span className="fashion-menu-label">02 / YOUR SPACE</span><Link to="/account" onClick={closeMenus}><span><strong>{t("Tài khoản", "My Account")}</strong><small>{t("Hồ sơ, wishlist và đơn hàng", "Profile, wishlist and orders")}</small></span><ChevronRight size={17} /></Link><Link to="/cart" onClick={closeMenus}><span><strong>{t("Giỏ hàng", "Cart")}</strong><small>{t("Kiểm tra sản phẩm đã chọn", "Review selected items")}</small></span><ChevronRight size={17} /></Link></section><section className="fashion-menu-section fashion-menu-section--info"><span className="fashion-menu-label">03 / INFORMATION</span><Link to="/about" onClick={closeMenus}><span><strong>{t("Về WEARO", "About WEARO")}</strong></span><ChevronRight size={17} /></Link><button type="button" onClick={() => { setMobileOpen(false); setSearchOpen(true); }}><span><Search size={15} /><strong>{t("Tìm kiếm", "Search")}</strong></span><ChevronRight size={17} /></button><Link to="/about" onClick={closeMenus}><span><CircleHelp size={15} /><strong>FAQ / Support</strong></span><ChevronRight size={17} /></Link></section></div><div className="fashion-menu-footer"><span>WEARO / 2026</span><span>{t("Mặc theo cách của riêng bạn", "Wear it your way")}</span></div></div>}

      {languageModalOpen && (
        <div className="wearo-language-modal" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setLanguageModalOpen(false); }}>
          <section className="wearo-language-dialog" role="dialog" aria-modal="true" aria-labelledby="wearo-language-title">
            <button type="button" className="wearo-language-dialog__close" aria-label={t("Đóng", "Close")} onClick={() => setLanguageModalOpen(false)}>
              <X size={22} strokeWidth={1.9} />
            </button>

            <header className="wearo-language-dialog__header">
              <h2 id="wearo-language-title">{t("Lựa Chọn Ngôn Ngữ Và Vị Trí", "Language and Location Selection")}</h2>
              <p>Language and Location Selection</p>
            </header>

            <div className="wearo-language-dialog__body">
              <button type="button" className="wearo-language-field" aria-label={t("Vị trí Việt Nam", "Vietnam location")}>
                <span className="wearo-language-field__leading">
                  <img className="wearo-language-flag wearo-language-flag--large" src="/flags/vietnam.svg" alt="" width={28} height={28} aria-hidden="true" />
                  <span>{t("Việt Nam", "Vietnam")}</span>
                </span>
                <ChevronDown size={20} strokeWidth={1.8} aria-hidden="true" />
              </button>

              <div className="wearo-language-divider" aria-hidden="true" />

              <button type="button" className="wearo-language-field" aria-label={t("Ngôn ngữ hiện tại", "Current language")} onClick={() => setSelectedLanguage((value) => value === "vi" ? "en" : "vi")}>
                <span className="wearo-language-field__leading">
                  <Globe2 size={20} strokeWidth={1.7} aria-hidden="true" />
                  <span>{selectedLanguage === "vi" ? "Tiếng Việt" : "English"}</span>
                </span>
                <span className="wearo-language-field__value">{selectedLanguage === "vi" ? "VIE" : "ENG"}</span>
              </button>

              <button type="button" className="wearo-language-confirm" onClick={confirmLanguage}>
                {t("Xác nhận", "Confirm")}
              </button>
            </div>
          </section>
        </div>
      )}
    </nav>
  );
}
