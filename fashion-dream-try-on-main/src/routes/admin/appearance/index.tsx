import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/admin/appearance/")({
  component: AppearancePage,
  head: () => ({ meta: [{ title: "Appearance — UpThink" }] }),
});

type AppearanceTab = "Brand" | "Colors" | "Typography" | "Components";

const tabs: AppearanceTab[] = ["Brand", "Colors", "Typography", "Components"];

function AppearancePage() {
  const [activeTab, setActiveTab] = useState<AppearanceTab>("Brand");
  const [preview, setPreview] = useState<"Desktop" | "Tablet" | "Mobile">("Desktop");

  return (
    <>
      <style>{`
        .fd-appearance { display: grid; gap: 22px; }
        .fd-appearance-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; }
        .fd-appearance-header h1 { margin: 7px 0 5px; font-size: 34px; letter-spacing: -.04em; }
        .fd-appearance-header p { margin: 0; color: #777; font-size: 13px; }
        .fd-appearance-status { padding: 8px 11px; border: 1px solid #e3e2dc; background: #fff; color: #777; font-size: 9px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; white-space: nowrap; }
        .fd-appearance-grid { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(360px, .85fr); gap: 18px; align-items: start; }
        .fd-appearance-panel { background: #fff; border: 1px solid #e3e2dc; }
        .fd-appearance-controls { padding: 22px; }
        .fd-appearance-tabs { display: flex; gap: 4px; border-bottom: 1px solid #e7e6e0; overflow-x: auto; }
        .fd-appearance-tab { border: 0; border-bottom: 2px solid transparent; background: transparent; padding: 12px 14px; color: #888; cursor: pointer; font-size: 10px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; white-space: nowrap; }
        .fd-appearance-tab.active { border-bottom-color: #f2a900; color: #171717; }
        .fd-appearance-section { padding-top: 24px; }
        .fd-appearance-section h2 { margin: 0 0 6px; font-size: 18px; }
        .fd-appearance-section > p { margin: 0 0 18px; color: #858681; font-size: 12px; line-height: 1.6; }
        .fd-appearance-fields { display: grid; gap: 14px; }
        .fd-appearance-field { display: grid; gap: 7px; }
        .fd-appearance-field > span { color: #666762; font-size: 9px; font-weight: 800; letter-spacing: .13em; text-transform: uppercase; }
        .fd-appearance-field input, .fd-appearance-field select { width: 100%; background: #fff; border: 1px solid #dddcd5; padding: 12px 13px; outline: none; }
        .fd-appearance-field input:focus, .fd-appearance-field select:focus { border-color: #b7b6ae; }
        .fd-appearance-assets { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
        .fd-appearance-asset { min-height: 92px; display: grid; place-items: center; border: 1px dashed #cbc9c1; background: #fafaf7; color: #777; text-align: center; font-size: 9px; letter-spacing: .1em; text-transform: uppercase; }
        .fd-appearance-asset strong { display: block; margin-bottom: 5px; color: #171717; font-size: 15px; letter-spacing: .02em; text-transform: none; }
        .fd-appearance-palette { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 9px; }
        .fd-appearance-swatch { min-height: 76px; display: flex; flex-direction: column; justify-content: flex-end; padding: 9px; border: 1px solid rgba(0,0,0,.08); }
        .fd-appearance-swatch span { font-size: 9px; font-weight: 800; }
        .fd-appearance-swatch small { margin-top: 3px; font-size: 8px; opacity: .7; }
        .fd-appearance-preview-wrap { position: sticky; top: 24px; }
        .fd-appearance-preview-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 15px 17px; border-bottom: 1px solid #e3e2dc; }
        .fd-appearance-preview-head strong { font-size: 11px; letter-spacing: .1em; text-transform: uppercase; }
        .fd-appearance-devices { display: flex; gap: 4px; }
        .fd-appearance-device { border: 1px solid #dddcd5; background: #fff; padding: 6px 8px; color: #777; font-size: 8px; font-weight: 800; cursor: pointer; }
        .fd-appearance-device.active { background: #171717; color: #fff; border-color: #171717; }
        .fd-appearance-preview { padding: 20px; background: #eeece6; }
        .fd-appearance-browser { margin: 0 auto; width: 100%; max-width: 560px; overflow: hidden; border: 1px solid #d8d5cc; background: #f8f6f0; box-shadow: 0 14px 35px rgba(0,0,0,.08); }
        .fd-appearance-browser.tablet { max-width: 410px; }
        .fd-appearance-browser.mobile { max-width: 280px; }
        .fd-appearance-browser-bar { height: 25px; display: flex; align-items: center; gap: 4px; padding: 0 9px; background: #171717; }
        .fd-appearance-browser-bar i { width: 5px; height: 5px; border-radius: 50%; background: #777; }
        .fd-appearance-site { min-height: 420px; padding: 17px; color: #171717; }
        .fd-appearance-site-nav { display: flex; align-items: center; justify-content: space-between; font-size: 8px; font-weight: 900; letter-spacing: .13em; }
        .fd-appearance-site-nav span:last-child { color: #777; font-weight: 700; }
        .fd-appearance-hero { margin-top: 42px; padding: 24px 17px; background: #1b1a17; color: #f4eee3; }
        .fd-appearance-hero small { color: #f0a500; font-size: 7px; font-weight: 800; letter-spacing: .18em; }
        .fd-appearance-hero h3 { max-width: 300px; margin: 13px 0; font-size: clamp(30px, 5vw, 48px); line-height: .9; letter-spacing: -.06em; }
        .fd-appearance-hero p { max-width: 280px; margin: 0 0 18px; color: rgba(244,238,227,.62); font-size: 9px; line-height: 1.6; }
        .fd-appearance-cta { display: inline-block; padding: 9px 11px; background: #f0a500; color: #171717; font-size: 8px; font-weight: 900; letter-spacing: .08em; }
        .fd-appearance-preview-foot { padding: 11px 15px; border-top: 1px solid #e3e2dc; color: #999; font-size: 9px; }
        @media (max-width: 900px) { .fd-appearance-grid { grid-template-columns: 1fr; } .fd-appearance-preview-wrap { position: static; } }
        @media (max-width: 640px) { .fd-appearance-header { align-items: flex-start; flex-direction: column; } .fd-appearance-controls { padding: 16px; } .fd-appearance-assets { grid-template-columns: 1fr; } .fd-appearance-palette { grid-template-columns: 1fr 1fr; } }
      `}</style>

      <div className="fd-appearance">
        <header className="fd-appearance-header">
          <div>
            <div className="up-admin-kicker">SYSTEM / VISUAL CONTROL</div>
            <h1>Appearance</h1>
            <p>Điều chỉnh visual system của storefront từ một control center duy nhất.</p>
          </div>
          <div className="fd-appearance-status">Draft · UI Shell</div>
        </header>

        <div className="fd-appearance-grid">
          <section className="fd-appearance-panel fd-appearance-controls">
            <nav className="fd-appearance-tabs" aria-label="Appearance sections">
              {tabs.map((tab) => (
                <button key={tab} type="button" className={`fd-appearance-tab${activeTab === tab ? " active" : ""}`} onClick={() => setActiveTab(tab)}>
                  {tab}
                </button>
              ))}
            </nav>

            {activeTab === "Brand" && (
              <div className="fd-appearance-section">
                <h2>Brand Assets</h2>
                <p>Chuẩn bị khu vực quản lý tài sản thương hiệu; upload/persistence sẽ được nối ở slice sau.</p>
                <div className="fd-appearance-assets">
                  <div className="fd-appearance-asset"><div><strong>LOGO</strong>Primary mark</div></div>
                  <div className="fd-appearance-asset"><div><strong>MONOGRAM</strong>Compact mark</div></div>
                  <div className="fd-appearance-asset"><div><strong>FAVICON</strong>Browser icon</div></div>
                </div>
              </div>
            )}

            {activeTab === "Colors" && (
              <div className="fd-appearance-section">
                <h2>Palette</h2>
                <p>Semantic palette preview dựa trên visual direction hiện tại của storefront.</p>
                <div className="fd-appearance-palette">
                  <div className="fd-appearance-swatch" style={{ background: "#1b1a17", color: "#fff" }}><span>Ink</span><small>#1B1A17</small></div>
                  <div className="fd-appearance-swatch" style={{ background: "#f0a500", color: "#171717" }}><span>Accent</span><small>#F0A500</small></div>
                  <div className="fd-appearance-swatch" style={{ background: "#e45826", color: "#fff" }}><span>Signal</span><small>#E45826</small></div>
                  <div className="fd-appearance-swatch" style={{ background: "#e6d5b8", color: "#171717" }}><span>Paper</span><small>#E6D5B8</small></div>
                </div>
              </div>
            )}

            {activeTab === "Typography" && (
              <div className="fd-appearance-section">
                <h2>Typography</h2>
                <p>Khu vực cấu hình type roles; chưa thay đổi font system hiện tại.</p>
                <div className="fd-appearance-fields">
                  <label className="fd-appearance-field"><span>Display role</span><select defaultValue="Current display"><option>Current display</option></select></label>
                  <label className="fd-appearance-field"><span>Body role</span><select defaultValue="Current body"><option>Current body</option></select></label>
                  <label className="fd-appearance-field"><span>Meta role</span><select defaultValue="Current meta"><option>Current meta</option></select></label>
                </div>
              </div>
            )}

            {activeTab === "Components" && (
              <div className="fd-appearance-section">
                <h2>Components</h2>
                <p>Component tokens sẽ được kết nối sau khi semantic design tokens được chuẩn hóa.</p>
                <div className="fd-appearance-fields">
                  <label className="fd-appearance-field"><span>Button radius</span><input defaultValue="0px" /></label>
                  <label className="fd-appearance-field"><span>Card radius</span><input defaultValue="16px" /></label>
                </div>
              </div>
            )}
          </section>

          <aside className="fd-appearance-panel fd-appearance-preview-wrap">
            <div className="fd-appearance-preview-head">
              <strong>Live Preview</strong>
              <div className="fd-appearance-devices" aria-label="Preview size">
                {(["Desktop", "Tablet", "Mobile"] as const).map((device) => (
                  <button key={device} type="button" className={`fd-appearance-device${preview === device ? " active" : ""}`} onClick={() => setPreview(device)}>
                    {device}
                  </button>
                ))}
              </div>
            </div>
            <div className="fd-appearance-preview">
              <div className={`fd-appearance-browser ${preview.toLowerCase()}`}>
                <div className="fd-appearance-browser-bar"><i /><i /><i /></div>
                <div className="fd-appearance-site">
                  <div className="fd-appearance-site-nav"><span>FASHION DREAM</span><span>SHOP · AI TRY-ON · CART</span></div>
                  <div className="fd-appearance-hero">
                    <small>AI TRY-ON (BETA)</small>
                    <h3>Wear the look. Make it yours.</h3>
                    <p>Preview the visual direction of the storefront before it reaches the live experience.</p>
                    <span className="fd-appearance-cta">START AI TRY-ON</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="fd-appearance-preview-foot">Preview only · No theme persistence in this slice.</div>
          </aside>
        </div>
      </div>
    </>
  );
}
