import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { PRODUCTS } from "@/data/products";
import { readPublishedSiteContent, type SiteContentFields } from "@/lib/site-content";
import { canonicalLink } from "@/lib/seo";
import "@/styles/home-editorial.css";

const INTRO_IMAGE = "/images/fashion-5-people-bg.png";
const HERO_SLIDES = [
  { image: "https://images.pexels.com/photos/7271149/pexels-photo-7271149.jpeg?auto=compress&cs=tinysrgb&w=1920", label: "LOOK / 001", title: "WEARO / PERSONAL" },
  { image: "https://images.pexels.com/photos/17037339/pexels-photo-17037339.jpeg?auto=compress&cs=tinysrgb&w=1920", label: "LOOK / 002", title: "AI / VIRTUAL FIT" },
  { image: "https://images.pexels.com/photos/18698406/pexels-photo-18698406.jpeg?auto=compress&cs=tinysrgb&w=1920", label: "LOOK / 003", title: "SAIGON / YOUR WAY" },
];
const HERO = HERO_SLIDES[0].image;
const DEFAULT_CONTENT: SiteContentFields = {
  announcement_enabled: false,
  announcement_text: "",
  hero_eyebrow: "WEARO / IUH / SAIGON — 2026",
  hero_title: "WEAR IT YOUR WAY.",
  hero_description: "WEARO kết hợp thời trang, AI Virtual Try-On và AI Personal Stylist để bạn hình dung đúng outfit trên chính mình, chọn trọn bộ và mặc theo cách riêng.",
  hero_cta_label: "Explore collection ↗",
  hero_cta_url: "/shop",
  social_title: "WEARO — Mặc theo cách của riêng bạn",
  social_description: "Thử đồ ảo AI trên ảnh thật và nhận gợi ý outfit trọn bộ theo vóc dáng, bối cảnh và gu cá nhân.",
  favicon_url: null,
  social_image_url: HERO,
};
const COLLECTION_CATEGORIES = [
  { slug: "all", label: "All" }, { slug: "hoodies", label: "Hoodies" }, { slug: "tees", label: "Tees" },
  { slug: "outerwear", label: "Outerwear" }, { slug: "cap", label: "Caps" }, { slug: "sunglass", label: "Sunglasses" },
] as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WEARO — Mặc theo cách của riêng bạn" },
      { name: "description", content: DEFAULT_CONTENT.social_description },
      { property: "og:title", content: DEFAULT_CONTENT.social_title },
      { property: "og:description", content: DEFAULT_CONTENT.social_description },
      { property: "og:image", content: DEFAULT_CONTENT.social_image_url ?? HERO },
      { name: "twitter:image", content: DEFAULT_CONTENT.social_image_url ?? HERO },
    ],
    links: [canonicalLink("/")],
  }),
  component: Index,
});

function applyContentMeta(content: SiteContentFields) {
  if (typeof document === "undefined") return;
  if (content.social_title) document.title = content.social_title;
  const setMeta = (selector: string, attribute: string, value: string) => {
    let node = document.head.querySelector(selector) as HTMLMetaElement | null;
    if (!node) { node = document.createElement("meta"); node.setAttribute(attribute, selector.includes("property=") ? selector.match(/property="([^"]+)/)?.[1] ?? "" : selector.match(/name="([^"]+)/)?.[1] ?? ""); document.head.appendChild(node); }
    node.content = value;
  };
  if (content.social_description) setMeta('meta[name="description"]', "name", content.social_description);
  if (content.social_title) setMeta('meta[property="og:title"]', "property", content.social_title);
  if (content.social_description) setMeta('meta[property="og:description"]', "property", content.social_description);
  if (content.social_image_url) setMeta('meta[property="og:image"]', "property", content.social_image_url);
  if (content.social_image_url) setMeta('meta[name="twitter:image"]', "name", content.social_image_url);
  if (content.favicon_url) {
    let icon = document.head.querySelector('link[rel="icon"]') as HTMLLinkElement | null;