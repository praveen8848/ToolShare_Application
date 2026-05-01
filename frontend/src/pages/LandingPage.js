import React, { useState } from "react";
import { Container, Row, Col, Button, Navbar, Nav } from "react-bootstrap";
import {
  FaWrench,
  FaSearch,
  FaCalendarAlt,
  FaHandshake,
  FaMapMarkerAlt,
  FaStar,
  FaCheck,
  FaArrowRight,
  FaPalette,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

// ──────────────────────────────────────────────
// THEME DEFINITIONS
// ──────────────────────────────────────────────
const themes = {
  "deep-forest": {
    id: "deep-forest",
    name: "Deep Forest + Lime",
    bg: "#0C1410",
    surface: "#14241C",
    surfaceHover: "#1A3024",
    accent: "#84CC16",
    accentBright: "#A3E635",
    accent50: "rgba(132, 204, 22, 0.08)",
    accent100: "rgba(132, 204, 22, 0.15)",
    accent200: "rgba(132, 204, 22, 0.25)",
    text: "#E2E8E0",
    textMuted: "#9CA3A0",
    textDim: "#6B7280",
    border: "#1E3326",
    borderHover: "rgba(132, 204, 22, 0.4)",
    darkBg: "#0A100C",
    darkCard: "#14241C",
    glowHero: "radial-gradient(ellipse 600px 400px at 30% 20%, rgba(132, 204, 22, 0.06) 0%, transparent 70%)",
    glowCta: "radial-gradient(ellipse 500px 300px at center, rgba(132, 204, 22, 0.08) 0%, transparent 70%)",
    starColor: "#FBBF24",
  },
  "midnight-sky": {
    id: "midnight-sky",
    name: "Midnight Blue + Sky",
    bg: "#0B1220",
    surface: "#111827",
    surfaceHover: "#1A2740",
    accent: "#3B82F6",
    accentBright: "#60A5FA",
    accent50: "rgba(59, 130, 246, 0.08)",
    accent100: "rgba(59, 130, 246, 0.15)",
    accent200: "rgba(59, 130, 246, 0.25)",
    text: "#E2E8F0",
    textMuted: "#94A3B8",
    textDim: "#64748B",
    border: "#1E293B",
    borderHover: "rgba(59, 130, 246, 0.4)",
    darkBg: "#060D18",
    darkCard: "#111827",
    glowHero: "radial-gradient(ellipse 600px 400px at 30% 20%, rgba(59, 130, 246, 0.06) 0%, transparent 70%)",
    glowCta: "radial-gradient(ellipse 500px 300px at center, rgba(59, 130, 246, 0.08) 0%, transparent 70%)",
    starColor: "#FBBF24",
  },
  "slate-cyan": {
    id: "slate-cyan",
    name: "Slate + Electric Cyan",
    bg: "#0F172A",
    surface: "#1E293B",
    surfaceHover: "#273548",
    accent: "#22D3EE",
    accentBright: "#06B6D4",
    accent50: "rgba(34, 211, 238, 0.08)",
    accent100: "rgba(34, 211, 238, 0.15)",
    accent200: "rgba(34, 211, 238, 0.25)",
    text: "#E2E8F0",
    textMuted: "#94A3B8",
    textDim: "#64748B",
    border: "#334155",
    borderHover: "rgba(34, 211, 238, 0.4)",
    darkBg: "#0A1020",
    darkCard: "#1E293B",
    glowHero: "radial-gradient(ellipse 600px 400px at 30% 20%, rgba(34, 211, 238, 0.07) 0%, transparent 70%)",
    glowCta: "radial-gradient(ellipse 500px 300px at center, rgba(34, 211, 238, 0.09) 0%, transparent 70%)",
    starColor: "#22D3EE",
  },
  "charcoal-amber": {
    id: "charcoal-amber",
    name: "Charcoal + Amber",
    bg: "#0A0A0A",
    surface: "#171717",
    surfaceHover: "#242424",
    accent: "#F59E0B",
    accentBright: "#FBBF24",
    accent50: "rgba(245, 158, 11, 0.08)",
    accent100: "rgba(245, 158, 11, 0.15)",
    accent200: "rgba(245, 158, 11, 0.25)",
    text: "#E5E5E5",
    textMuted: "#A3A3A3",
    textDim: "#737373",
    border: "#262626",
    borderHover: "rgba(245, 158, 11, 0.4)",
    darkBg: "#050505",
    darkCard: "#171717",
    glowHero: "radial-gradient(ellipse 600px 400px at 30% 20%, rgba(245, 158, 11, 0.05) 0%, transparent 70%)",
    glowCta: "radial-gradient(ellipse 500px 300px at center, rgba(245, 158, 11, 0.07) 0%, transparent 70%)",
    starColor: "#F59E0B",
  },
  "obsidian-terra": {
    id: "obsidian-terra",
    name: "Obsidian + Terracotta",
    bg: "#1A1410",
    surface: "#251A14",
    surfaceHover: "#302218",
    accent: "#E07856",
    accentBright: "#F0936B",
    accent50: "rgba(224, 120, 86, 0.08)",
    accent100: "rgba(224, 120, 86, 0.15)",
    accent200: "rgba(224, 120, 86, 0.25)",
    text: "#E8DDD4",
    textMuted: "#A8998A",
    textDim: "#7A6E64",
    border: "#302218",
    borderHover: "rgba(224, 120, 86, 0.4)",
    darkBg: "#120D0A",
    darkCard: "#251A14",
    glowHero: "radial-gradient(ellipse 600px 400px at 30% 20%, rgba(224, 120, 86, 0.06) 0%, transparent 70%)",
    glowCta: "radial-gradient(ellipse 500px 300px at center, rgba(224, 120, 86, 0.08) 0%, transparent 70%)",
    starColor: "#F59E0B",
  },
  "black-neon": {
    id: "black-neon",
    name: "Black + Neon Green",
    bg: "#000000",
    surface: "#0A0A0A",
    surfaceHover: "#141414",
    accent: "#00FF88",
    accentBright: "#39FF14",
    accent50: "rgba(0, 255, 136, 0.08)",
    accent100: "rgba(0, 255, 136, 0.15)",
    accent200: "rgba(0, 255, 136, 0.25)",
    text: "#F0F0F0",
    textMuted: "#888888",
    textDim: "#666666",
    border: "#1A1A1A",
    borderHover: "rgba(0, 255, 136, 0.5)",
    darkBg: "#000000",
    darkCard: "#0A0A0A",
    glowHero: "radial-gradient(ellipse 600px 400px at 30% 20%, rgba(0, 255, 136, 0.08) 0%, transparent 70%)",
    glowCta: "radial-gradient(ellipse 500px 300px at center, rgba(0, 255, 136, 0.10) 0%, transparent 70%)",
    starColor: "#00FF88",
  },
  "deep-plum-gold": {
    id: "deep-plum-gold",
    name: "Deep Plum + Gold",
    bg: "#1A0F1F",
    surface: "#2A1A2F",
    surfaceHover: "#35223D",
    accent: "#FFD700",
    accentBright: "#FFC107",
    accent50: "rgba(255, 215, 0, 0.08)",
    accent100: "rgba(255, 215, 0, 0.15)",
    accent200: "rgba(255, 215, 0, 0.25)",
    text: "#EDE4F0",
    textMuted: "#A894AE",
    textDim: "#7A6A80",
    border: "#3D2A45",
    borderHover: "rgba(255, 215, 0, 0.4)",
    darkBg: "#12081A",
    darkCard: "#2A1A2F",
    glowHero: "radial-gradient(ellipse 600px 400px at 30% 20%, rgba(255, 215, 0, 0.05) 0%, transparent 70%)",
    glowCta: "radial-gradient(ellipse 500px 300px at center, rgba(255, 215, 0, 0.07) 0%, transparent 70%)",
    starColor: "#FFD700",
  },
  "navy-coral": {
    id: "navy-coral",
    name: "Navy + Coral",
    bg: "#0A1628",
    surface: "#142340",
    surfaceHover: "#1C3058",
    accent: "#FF6B6B",
    accentBright: "#FF8787",
    accent50: "rgba(255, 107, 107, 0.08)",
    accent100: "rgba(255, 107, 107, 0.15)",
    accent200: "rgba(255, 107, 107, 0.25)",
    text: "#E2E8F0",
    textMuted: "#94A3B8",
    textDim: "#64748B",
    border: "#1C3058",
    borderHover: "rgba(255, 107, 107, 0.4)",
    darkBg: "#060E1C",
    darkCard: "#142340",
    glowHero: "radial-gradient(ellipse 600px 400px at 30% 20%, rgba(255, 107, 107, 0.06) 0%, transparent 70%)",
    glowCta: "radial-gradient(ellipse 500px 300px at center, rgba(255, 107, 107, 0.08) 0%, transparent 70%)",
    starColor: "#FBBF24",
  },
  "graphite-mint": {
    id: "graphite-mint",
    name: "Graphite + Mint",
    bg: "#121212",
    surface: "#1E1E1E",
    surfaceHover: "#2A2A2A",
    accent: "#10B981",
    accentBright: "#34D399",
    accent50: "rgba(16, 185, 129, 0.08)",
    accent100: "rgba(16, 185, 129, 0.15)",
    accent200: "rgba(16, 185, 129, 0.25)",
    text: "#E5E5E5",
    textMuted: "#A3A3A3",
    textDim: "#737373",
    border: "#2A2A2A",
    borderHover: "rgba(16, 185, 129, 0.4)",
    darkBg: "#0A0A0A",
    darkCard: "#1E1E1E",
    glowHero: "radial-gradient(ellipse 600px 400px at 30% 20%, rgba(16, 185, 129, 0.06) 0%, transparent 70%)",
    glowCta: "radial-gradient(ellipse 500px 300px at center, rgba(16, 185, 129, 0.08) 0%, transparent 70%)",
    starColor: "#FBBF24",
  },
  "espresso-rust": {
    id: "espresso-rust",
    name: "Espresso + Rust",
    bg: "#1C1410",
    surface: "#2B1F18",
    surfaceHover: "#38281E",
    accent: "#D97706",
    accentBright: "#EA580C",
    accent50: "rgba(217, 119, 6, 0.08)",
    accent100: "rgba(217, 119, 6, 0.15)",
    accent200: "rgba(217, 119, 6, 0.25)",
    text: "#E8D5C8",
    textMuted: "#A8998A",
    textDim: "#7A6E64",
    border: "#38281E",
    borderHover: "rgba(217, 119, 6, 0.4)",
    darkBg: "#120C08",
    darkCard: "#2B1F18",
    glowHero: "radial-gradient(ellipse 600px 400px at 30% 20%, rgba(217, 119, 6, 0.06) 0%, transparent 70%)",
    glowCta: "radial-gradient(ellipse 500px 300px at center, rgba(217, 119, 6, 0.08) 0%, transparent 70%)",
    starColor: "#F59E0B",
  },
};

// ──────────────────────────────────────────────
// DATA
// ──────────────────────────────────────────────
const categories = [
  "Power drills", "Circular saws", "Pressure washers", "Ladders", "Sanders",
  "Hedge trimmers", "Tile cutters", "Air compressors", "Welders", "Carpet cleaners",
  "Wheelbarrows", "Nail guns", "Wood routers", "Lawn aerators", "Paint sprayers"
];

const featuredTools = [
  { emoji: "🪛", category: "Power Drill", rating: 4.9, name: "Bosch 12V Drill Kit", owner: "Praveen", distance: "1.2 km", price: 250 },
  { emoji: "🪚", category: "Circular Saw", rating: 4.8, name: "Makita 7¼\" Saw", owner: "Akash", distance: "2.5 km", price: 400 },
  { emoji: "💦", category: "Pressure Washer", rating: 5.0, name: "Karcher K3", owner: "Rohan", distance: "0.8 km", price: 350 },
  { emoji: "🪜", category: "Ladder", rating: 4.7, name: "6ft Aluminium Ladder", owner: "Neha", distance: "3.1 km", price: 100 },
  { emoji: "🌀", category: "Sander", rating: 4.9, name: "Orbital Sander", owner: "Vikram", distance: "1.9 km", price: 200 },
  { emoji: "🧱", category: "Tile Cutter", rating: 4.8, name: "Manual Tile Cutter", owner: "Aarti", distance: "4.0 km", price: 600 },
];

const testimonials = [
  { quote: "Rented a drill for a weekend DIY. Saved ₹3,000 and met my neighbour. Brilliant!", name: "Ananya", city: "Mumbai" },
  { quote: "I've lent my pressure washer 8 times now. Side income is real, and it's so easy.", name: "Rahul", city: "Delhi" },
  { quote: "Found a tile cutter on same-day notice. Community here is incredibly helpful.", name: "Deepika", city: "Bangalore" },
];

// ──────────────────────────────────────────────
// STYLES COMPONENT
// ──────────────────────────────────────────────
const Styles = ({ t }) => (
  <style>{`
    :root {
      --ts-bg: ${t.bg};
      --ts-surface: ${t.surface};
      --ts-surface-hover: ${t.surfaceHover};
      --ts-accent: ${t.accent};
      --ts-accent-bright: ${t.accentBright};
      --ts-accent-50: ${t.accent50};
      --ts-accent-100: ${t.accent100};
      --ts-accent-200: ${t.accent200};
      --ts-text: ${t.text};
      --ts-text-muted: ${t.textMuted};
      --ts-text-dim: ${t.textDim};
      --ts-border: ${t.border};
      --ts-border-hover: ${t.borderHover};
      --ts-dark-bg: ${t.darkBg};
      --ts-dark-card: ${t.darkCard};
      --ts-white: ${t.text};
      --ts-radius-sm: 20px;
      --ts-radius-md: 24px;
      --ts-radius-lg: 32px;
      --ts-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
      --ts-shadow-hover: 0 12px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px ${t.borderHover};
      --ts-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      --ts-star: ${t.starColor};
    }

    body {
      font-family: var(--ts-font);
      color: var(--ts-text);
      background: var(--ts-bg);
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }

    h1, h2, h3, h4, h5, h6 {
      color: var(--ts-white);
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .ts-btn {
      border-radius: 999px;
      font-weight: 600;
      padding: 10px 24px;
      transition: all 0.25s ease;
      font-size: 0.95rem;
    }
    .ts-btn-primary {
      background: var(--ts-accent);
      border-color: var(--ts-accent);
      color: ${t.id === "black-neon" ? "#000000" : t.id === "deep-forest" ? "#0C1410" : "#0F172A"};
      font-weight: 700;
    }
    .ts-btn-primary:hover {
      background: var(--ts-accent-bright);
      border-color: var(--ts-accent-bright);
      color: ${t.id === "black-neon" ? "#000000" : t.id === "deep-forest" ? "#0C1410" : "#0F172A"};
      box-shadow: 0 0 25px var(--ts-accent-200);
      transform: translateY(-1px);
    }
    .ts-btn-outline {
      background: transparent;
      border: 1.5px solid var(--ts-border);
      color: var(--ts-text);
    }
    .ts-btn-outline:hover {
      background: var(--ts-accent-50);
      border-color: var(--ts-accent);
      color: var(--ts-accent-bright);
    }
    .ts-btn-ghost {
      background: transparent;
      border: none;
      color: var(--ts-text-muted);
      font-weight: 500;
    }
    .ts-btn-ghost:hover {
      color: var(--ts-white);
      background: var(--ts-accent-50);
    }

    /* Navbar */
    .ts-navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background: ${t.bg}E6;
      backdrop-filter: blur(16px);
      border-bottom: 1px solid ${t.border}99;
      padding: 0.6rem 0;
    }
    .ts-brand-square {
      width: 38px;
      height: 38px;
      background: var(--ts-accent);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${t.id === "black-neon" ? "#000000" : t.id === "deep-forest" ? "#0C1410" : "#0F172A"};
      font-size: 1.2rem;
      box-shadow: 0 0 18px var(--ts-accent-200);
    }
    .ts-brand-text {
      font-weight: 800;
      font-size: 1.4rem;
      color: var(--ts-white);
      margin-left: 10px;
      letter-spacing: -0.02em;
    }
    .ts-nav-link {
      color: var(--ts-text-muted) !important;
      font-weight: 500;
      margin: 0 10px;
      font-size: 0.95rem;
    }
    .ts-nav-link:hover {
      color: var(--ts-accent-bright) !important;
    }

    /* Hero */
    .ts-hero {
      padding-top: 160px;
      padding-bottom: 80px;
      position: relative;
      background: ${t.glowHero};
    }
    .ts-eyebrow {
      background: var(--ts-accent-100);
      color: var(--ts-accent-bright);
      font-weight: 600;
      padding: 6px 18px;
      border-radius: 999px;
      display: inline-block;
      font-size: 0.9rem;
      letter-spacing: -0.01em;
      border: 1px solid var(--ts-accent-200);
    }
    .ts-hero-title {
      font-size: 3.5rem;
      font-weight: 800;
      line-height: 1.1;
      margin: 24px 0;
      letter-spacing: -0.02em;
    }
    .ts-hero-title span {
      color: var(--ts-accent-bright);
    }
    .ts-hero-lead {
      font-size: 1.15rem;
      color: var(--ts-text-muted);
      margin-bottom: 2rem;
      line-height: 1.6;
    }
    .ts-hero-cta {
      display: flex;
      gap: 15px;
      align-items: center;
      flex-wrap: wrap;
    }
    .ts-rating-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--ts-surface);
      padding: 8px 16px;
      border-radius: 999px;
      font-weight: 600;
      color: var(--ts-text);
      margin-left: 10px;
      font-size: 0.9rem;
      border: 1px solid var(--ts-border);
    }
    .ts-stars {
      color: var(--ts-star);
    }

    .ts-hero-card {
      background: var(--ts-surface);
      border-radius: var(--ts-radius-md);
      padding: 20px;
      box-shadow: var(--ts-shadow);
      border: 1px solid var(--ts-border);
      transition: all 0.3s;
    }
    .ts-hero-card:hover {
      border-color: var(--ts-border-hover);
      box-shadow: var(--ts-shadow-hover);
    }
    .ts-hero-card-img {
      background: linear-gradient(135deg, ${t.surfaceHover} 0%, ${t.bg} 100%);
      border-radius: var(--ts-radius-sm);
      aspect-ratio: 4 / 3;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 4rem;
      margin-bottom: 16px;
      border: 1px solid var(--ts-border);
    }
    .ts-hero-card-loc {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--ts-accent-100);
      color: var(--ts-accent-bright);
      font-weight: 600;
      padding: 5px 14px;
      border-radius: 999px;
      font-size: 0.85rem;
      margin-bottom: 12px;
      width: fit-content;
      border: 1px solid var(--ts-accent-200);
    }
    .ts-hero-price {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--ts-white);
    }
    .ts-hero-price small {
      font-weight: 500;
      color: var(--ts-text-muted);
      font-size: 1rem;
    }
    .ts-progress-bar-bg {
      height: 6px;
      background: ${t.border};
      border-radius: 999px;
      margin: 10px 0 6px;
    }
    .ts-progress-fill {
      width: 75%;
      height: 100%;
      background: var(--ts-accent);
      border-radius: 999px;
      box-shadow: 0 0 10px var(--ts-accent-200);
    }
    .ts-progress-text {
      font-size: 0.8rem;
      color: var(--ts-text-muted);
    }

    /* Marquee */
    .ts-marquee-section {
      background: var(--ts-dark-bg);
      padding: 28px 0;
      overflow: hidden;
      white-space: nowrap;
      position: relative;
      margin-top: 20px;
      border-top: 1px solid var(--ts-border);
      border-bottom: 1px solid var(--ts-border);
    }
    .ts-marquee-track {
      display: inline-block;
      animation: ts-marquee 40s linear infinite;
    }
    .ts-marquee-item {
      display: inline-block;
      color: var(--ts-text);
      font-weight: 600;
      font-size: 1.1rem;
      margin: 0 18px;
    }
    .ts-marquee-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      background: var(--ts-accent);
      border-radius: 50%;
      margin: 0 8px;
      vertical-align: middle;
      box-shadow: 0 0 8px var(--ts-accent-200);
    }
    @keyframes ts-marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    /* How it works */
    .ts-section {
      padding: 80px 0;
    }
    .ts-section-title {
      font-size: 2.5rem;
      font-weight: 800;
      margin-bottom: 60px;
      letter-spacing: -0.02em;
    }
    .ts-step-card {
      background: var(--ts-surface);
      border-radius: var(--ts-radius-md);
      padding: 35px 30px;
      border: 1px solid var(--ts-border);
      transition: 0.3s;
    }
    .ts-step-card:hover {
      border-color: var(--ts-border-hover);
      box-shadow: var(--ts-shadow-hover);
    }
    .ts-step-number {
      font-size: 3rem;
      font-weight: 800;
      color: var(--ts-accent-200);
      letter-spacing: 0;
    }
    .ts-step-icon {
      font-size: 1.8rem;
      color: var(--ts-accent-bright);
      margin: 10px 0 15px;
    }
    .ts-step-title {
      font-weight: 800;
      font-size: 1.3rem;
      margin-bottom: 8px;
    }
    .ts-step-card p {
      color: var(--ts-text-muted);
    }

    /* Featured Tools */
    .ts-bg-light {
      background: var(--ts-dark-bg);
    }
    .ts-tool-card {
      background: var(--ts-surface);
      border-radius: var(--ts-radius-md);
      border: 1px solid var(--ts-border);
      overflow: hidden;
      transition: 0.3s;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .ts-tool-card:hover {
      border-color: var(--ts-border-hover);
      box-shadow: var(--ts-shadow-hover);
    }
    .ts-tool-img {
      height: 140px;
      background: linear-gradient(135deg, ${t.surfaceHover}, ${t.bg});
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3.5rem;
      border-bottom: 1px solid var(--ts-border);
    }
    .ts-tool-body {
      padding: 18px;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .ts-tool-tag {
      background: var(--ts-accent-100);
      color: var(--ts-accent-bright);
      font-weight: 600;
      padding: 3px 12px;
      border-radius: 999px;
      font-size: 0.75rem;
      width: fit-content;
      margin-bottom: 8px;
      border: 1px solid var(--ts-accent-200);
    }
    .ts-tool-rating {
      background: var(--ts-dark-bg);
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--ts-text);
      border: 1px solid var(--ts-border);
    }
    .ts-tool-name {
      font-weight: 800;
      margin-top: 8px;
      font-size: 1.1rem;
    }
    .ts-tool-owner {
      color: var(--ts-text-muted);
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 12px;
    }
    .ts-tool-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
    }
    .ts-tool-price {
      font-weight: 800;
      font-size: 1.2rem;
      color: var(--ts-white);
    }

    /* Earn */
    .ts-earn-card {
      background: linear-gradient(135deg, var(--ts-dark-bg) 0%, var(--ts-dark-card) 100%);
      border-radius: var(--ts-radius-lg);
      padding: 4rem;
      border: 1px solid var(--ts-border);
      position: relative;
      overflow: hidden;
    }
    .ts-earn-card::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, var(--ts-accent-50) 0%, transparent 70%);
      pointer-events: none;
    }
    .ts-earn-title {
      font-size: 2.2rem;
      font-weight: 800;
      color: var(--ts-white);
      margin-bottom: 15px;
      position: relative;
    }
    .ts-earn-sub {
      color: var(--ts-text-muted);
      font-size: 1.1rem;
      margin-bottom: 25px;
      position: relative;
    }
    .ts-earn-highlight {
      color: var(--ts-accent-bright);
      font-weight: 700;
    }
    .ts-perk-item {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 20px;
      color: var(--ts-text-muted);
      font-weight: 500;
      position: relative;
    }
    .ts-perk-check {
      width: 28px;
      height: 28px;
      background: var(--ts-accent);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${t.id === "black-neon" ? "#000000" : t.id === "deep-forest" ? "#0C1410" : "#0F172A"};
      font-size: 0.8rem;
      flex-shrink: 0;
      box-shadow: 0 0 12px var(--ts-accent-200);
    }

    /* Community */
    .ts-stat-box {
      border-left: 4px solid var(--ts-accent);
      padding-left: 20px;
      margin-bottom: 30px;
    }
    .ts-stat-number {
      font-size: 2.2rem;
      font-weight: 800;
      color: var(--ts-white);
    }
    .ts-stat-label {
      color: var(--ts-text-muted);
      font-weight: 500;
    }
    .ts-testimonial-card {
      background: var(--ts-surface);
      border-radius: var(--ts-radius-md);
      padding: 30px;
      border: 1px solid var(--ts-border);
      height: 100%;
      transition: 0.3s;
    }
    .ts-testimonial-card:hover {
      border-color: var(--ts-border-hover);
    }
    .ts-quote-mark {
      font-size: 3rem;
      color: var(--ts-accent-200);
      line-height: 1;
      margin-bottom: 10px;
    }

    /* CTA Section */
    .ts-cta-section {
      position: relative;
      background: ${t.glowCta};
    }

    /* Footer */
    .ts-footer {
      background: var(--ts-dark-bg);
      color: var(--ts-text-muted);
      padding: 60px 0 30px;
      border-top: 1px solid var(--ts-border);
    }
    .ts-footer a {
      color: var(--ts-text-dim);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }
    .ts-footer a:hover {
      color: var(--ts-accent-bright);
    }
    .ts-footer h5 {
      color: var(--ts-white);
      font-weight: 700;
      margin-bottom: 18px;
    }
    .ts-footer-bottom {
      border-top: 1px solid ${t.border};
      padding-top: 25px;
      margin-top: 40px;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      font-size: 0.9rem;
    }

    /* Theme Switcher */
    .ts-theme-switcher {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
    }
    .ts-theme-btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--ts-surface);
      border: 2px solid var(--ts-border);
      color: var(--ts-accent-bright);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 1.2rem;
      transition: all 0.3s;
      box-shadow: var(--ts-shadow);
    }
    .ts-theme-btn:hover {
      border-color: var(--ts-accent);
      box-shadow: var(--ts-shadow-hover);
    }
    .ts-theme-dropdown {
      position: absolute;
      bottom: 52px;
      right: 0;
      background: var(--ts-surface);
      border: 1px solid var(--ts-border);
      border-radius: 16px;
      padding: 12px;
      min-width: 220px;
      box-shadow: var(--ts-shadow-hover);
      display: none;
    }
    .ts-theme-dropdown.show {
      display: block;
    }
    .ts-theme-option {
      display: block;
      width: 100%;
      padding: 10px 14px;
      border-radius: 10px;
      border: none;
      background: transparent;
      color: var(--ts-text);
      text-align: left;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    .ts-theme-option:hover {
      background: var(--ts-accent-50);
      color: var(--ts-accent-bright);
    }
    .ts-theme-option.active {
      background: var(--ts-accent-100);
      color: var(--ts-accent-bright);
      font-weight: 700;
    }
    .ts-theme-swatch {
      display: inline-block;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      margin-right: 10px;
      vertical-align: middle;
      border: 1px solid rgba(255,255,255,0.2);
    }

    @media (max-width: 768px) {
      .ts-hero {
        padding-top: 130px;
        padding-bottom: 50px;
      }
      .ts-section {
        padding: 64px 0;
      }
      .ts-hero-title {
        font-size: 2.5rem;
      }
      .ts-earn-card {
        padding: 2.5rem;
      }
    }
  `}</style>
);

// ──────────────────────────────────────────────
// THEME SWITCHER COMPONENT (inline)
// ──────────────────────────────────────────────
const ThemeSwitcher = ({ current, onChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="ts-theme-switcher">
      <div className={`ts-theme-dropdown ${open ? "show" : ""}`}>
        {Object.values(themes).map((th) => (
          <button
            key={th.id}
            className={`ts-theme-option ${current === th.id ? "active" : ""}`}
            onClick={() => { onChange(th.id); setOpen(false); }}
          >
            <span className="ts-theme-swatch" style={{ background: th.accent }} />
            {th.name}
          </button>
        ))}
      </div>
      <button className="ts-theme-btn" onClick={() => setOpen(!open)} title="Switch theme">
        <FaPalette />
      </button>
    </div>
  );
};

// ──────────────────────────────────────────────
// MAIN LANDING PAGE
// ──────────────────────────────────────────────
const LandingPage = () => {
  const navigate = useNavigate();
  const [themeId, setThemeId] = useState("graphite-mint"); // <-- CHANGE DEFAULT THEME HERE
  const t = themes[themeId];

  return (
    <>
      <Styles t={t} />

      {/* Fixed Navbar */}
      <Navbar expand="lg" className="ts-navbar">
        <Container>
          <Navbar.Brand href="#" className="d-flex align-items-center">
            <div className="ts-brand-square"><FaWrench /></div>
            <span className="ts-brand-text">ToolShare</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="main-nav" />
          <Navbar.Collapse id="main-nav">
            <Nav className="mx-auto">
              <Nav.Link className="ts-nav-link" href="#how">How it works</Nav.Link>
              <Nav.Link className="ts-nav-link" href="#browse">Browse Tools</Nav.Link>
              <Nav.Link className="ts-nav-link" href="#community">Community</Nav.Link>
            </Nav>
            <div className="d-flex gap-2">
              <Button variant="ghost" className="ts-btn ts-btn-ghost" onClick={() => navigate("/login")}>Sign in</Button>
              <Button className="ts-btn ts-btn-primary" onClick={() => navigate("/register")}>Join free</Button>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Hero */}
      <section className="ts-hero">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-5 mb-lg-0">
              <div className="ts-eyebrow">Now serving 45+ Indian Cities</div>
              <h1 className="ts-hero-title">
                Borrow the tool.<br /><span>Skip the hardware store.</span>
              </h1>
              <p className="ts-hero-lead">
                Rent drills, saws, ladders & more from neighbours nearby. Affordable daily rates, trusted community.
              </p>
              <div className="ts-hero-cta">
                <Button className="ts-btn ts-btn-primary" size="lg" onClick={() => navigate("/browse")}>
                  Browse tools <FaArrowRight className="ms-2" />
                </Button>
                <Button className="ts-btn ts-btn-outline" size="lg" onClick={() => navigate("/add-tool")}>
                  List your tool
                </Button>
                <div className="ts-rating-badge">
                  <span className="ts-stars">★★★★★</span> 4.9 from 2,300+ reviews
                </div>
              </div>
            </Col>
            <Col lg={6} className="d-flex justify-content-center">
              <div className="ts-hero-card" style={{ maxWidth: "380px", width: "100%" }}>
                <div className="ts-hero-card-img">🛠️</div>
                <div className="ts-hero-card-loc">
                  <FaMapMarkerAlt /> Pickup nearby • 0.5 km
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="ts-hero-price">₹150 <small>/ day</small></span>
                  <span className="ts-tool-rating"><FaStar style={{color: t.starColor}} /> 4.9</span>
                </div>
                <div className="ts-progress-bar-bg"><div className="ts-progress-fill"></div></div>
                <div className="ts-progress-text">3 of 4 days booked this week</div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Marquee */}
      <div className="ts-marquee-section">
        <div className="ts-marquee-track">
          {categories.map((cat, i) => (
            <React.Fragment key={i}>
              <span className="ts-marquee-item">{cat}</span>
              <span className="ts-marquee-dot"></span>
            </React.Fragment>
          ))}
          {categories.map((cat, i) => (
            <React.Fragment key={`dup-${i}`}>
              <span className="ts-marquee-item">{cat}</span>
              <span className="ts-marquee-dot"></span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* How it Works */}
      <section id="how" className="ts-section">
        <Container>
          <h2 className="text-center ts-section-title">How ToolShare works</h2>
          <Row className="g-4">
            <Col md={4}>
              <div className="ts-step-card text-center">
                <div className="ts-step-number">01</div>
                <div className="ts-step-icon"><FaSearch /></div>
                <h4 className="ts-step-title">Find what you need</h4>
                <p>Search drills, saws, ladders within 5 km. Filter by price & availability.</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="ts-step-card text-center">
                <div className="ts-step-number">02</div>
                <div className="ts-step-icon"><FaCalendarAlt /></div>
                <h4 className="ts-step-title">Book by the day</h4>
                <p>Reserve online, pay securely. See real-time calendars of each tool.</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="ts-step-card text-center">
                <div className="ts-step-number">03</div>
                <div className="ts-step-icon"><FaHandshake /></div>
                <h4 className="ts-step-title">Pickup, build, return</h4>
                <p>Coordinate pickup via chat. Use it, clean it, return it. Simple.</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Featured Tools */}
      <section id="browse" className="ts-section ts-bg-light">
        <Container>
          <h2 className="ts-section-title text-center">Real tools, from real neighbours.</h2>
          <Row className="g-4">
            {featuredTools.map((tool, idx) => (
              <Col key={idx} md={6} lg={4}>
                <div className="ts-tool-card">
                  <div className="ts-tool-img">{tool.emoji}</div>
                  <div className="ts-tool-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="ts-tool-tag">{tool.category}</span>
                      <span className="ts-tool-rating"><FaStar style={{color: t.starColor, marginRight:4}}/>{tool.rating}</span>
                    </div>
                    <h5 className="ts-tool-name">{tool.name}</h5>
                    <div className="ts-tool-owner">
                      <FaMapMarkerAlt size={12} /> {tool.owner} • {tool.distance}
                    </div>
                    <div className="ts-tool-footer">
                      <span className="ts-tool-price">₹{tool.price}<small style={{color:"var(--ts-text-muted)", fontSize:"0.8rem"}}>/day</small></span>
                      <Button className="ts-btn ts-btn-primary" size="sm">Book</Button>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Earn Section */}
      <section className="ts-section">
        <Container>
          <div className="ts-earn-card">
            <Row className="align-items-center">
              <Col lg={6} className="mb-4 mb-lg-0">
                <h3 className="ts-earn-title">Your garage is a side hustle waiting to happen.</h3>
                <p className="ts-earn-sub">
                  The average lender on ToolShare earns <span className="ts-earn-highlight">₹15,000/month</span> renting out tools they already own.
                </p>
                <Button className="ts-btn ts-btn-primary" onClick={() => navigate("/add-tool")}>
                  Start earning <FaArrowRight className="ms-2" />
                </Button>
              </Col>
              <Col lg={6}>
                <div className="ps-lg-4">
                  <div className="ts-perk-item"><span className="ts-perk-check"><FaCheck /></span> Set your own daily price</div>
                  <div className="ts-perk-item"><span className="ts-perk-check"><FaCheck /></span> Covered by damage protection</div>
                  <div className="ts-perk-item"><span className="ts-perk-check"><FaCheck /></span> Flexible pickup & return windows</div>
                  <div className="ts-perk-item"><span className="ts-perk-check"><FaCheck /></span> Payouts every week</div>
                </div>
              </Col>
            </Row>
          </div>
        </Container>
      </section>

      {/* Community */}
      <section id="community" className="ts-section ts-bg-light">
        <Container>
          <h2 className="ts-section-title text-center mb-5">Trusted by thousands across India</h2>
          <Row className="mb-5">
            {[
              { number: "12.4k", label: "Active members" },
              { number: "38k", label: "Tools listed" },
              { number: "45+", label: "Cities covered" },
              { number: "4.9★", label: "Average rating" },
            ].map((stat, i) => (
              <Col key={i} sm={6} lg={3}>
                <div className="ts-stat-box">
                  <div className="ts-stat-number">{stat.number}</div>
                  <div className="ts-stat-label">{stat.label}</div>
                </div>
              </Col>
            ))}
          </Row>
          <Row className="g-4">
            {testimonials.map((testimonial, i) => (
              <Col key={i} md={4}>
                <div className="ts-testimonial-card">
                  <div className="ts-quote-mark">"</div>
                  <p style={{ fontSize: "1.05rem", fontWeight: 500, marginBottom: "20px", color: "var(--ts-text)" }}>{testimonial.quote}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold" style={{color:"var(--ts-white)"}}>{testimonial.name}</span>
                    <span className="ts-tool-tag">{testimonial.city}</span>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA */}
      <section className="ts-section text-center ts-cta-section">
        <Container>
          <h2 style={{ fontSize: "2.8rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Less stuff. <span style={{ color: "var(--ts-accent-bright)" }}>More building.</span>
          </h2>
          <p style={{ fontSize: "1.1rem", color: "var(--ts-text-muted)" }} className="mb-4">Join the neighbourhood sharing economy today.</p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Button className="ts-btn ts-btn-primary" size="lg" onClick={() => navigate("/register")}>Get started free</Button>
            <Button className="ts-btn ts-btn-outline" size="lg" onClick={() => navigate("/browse")}>See tools near you</Button>
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="ts-footer">
        <Container>
          <Row>
            <Col lg={4} className="mb-4">
              <div className="d-flex align-items-center mb-3">
                <div className="ts-brand-square"><FaWrench /></div>
                <span className="ts-brand-text" style={{ color: "var(--ts-white)" }}>ToolShare</span>
              </div>
              <p>Borrow tools from neighbours. Save money, reduce waste, build community.</p>
            </Col>
            <Col lg={4} className="mb-4">
              <h5>Product</h5>
              <ul className="list-unstyled">
                <li><a href="#">How it works</a></li>
                <li><a href="#">Browse tools</a></li>
                <li><a href="#">List a tool</a></li>
                <li><a href="#">Pricing</a></li>
              </ul>
            </Col>
            <Col lg={4} className="mb-4">
              <h5>Community</h5>
              <ul className="list-unstyled">
                <li><a href="#">Trust & Safety</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Help Centre</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </Col>
          </Row>
          <div className="ts-footer-bottom">
            <span>© 2026 ToolShare India. All rights reserved.</span>
            <span>
              <a href="#" className="me-3">Terms</a>
              <a href="#">Privacy</a>
            </span>
          </div>
        </Container>
      </footer>

      {/* Floating Theme Switcher */}
      <ThemeSwitcher current={themeId} onChange={setThemeId} />
    </>
  );
};

export default LandingPage;