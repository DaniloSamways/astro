"use client";

import Script from "next/script";

import { useIsMobile } from "../lib/use-is-mobile";

export default function Page() {
  const isMobile = useIsMobile();

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #09090b;
          --surface: #111113;
          --surface2: #18181b;
          --border: rgba(255,255,255,0.07);
          --border-soft: rgba(255,255,255,0.04);
          --text: #f4f4f5;
          --text-muted: #71717a;
          --text-dim: #3f3f46;
          --violet: #c4b5fd;
          --violet-dim: rgba(196,181,253,0.12);
          --violet-glow: rgba(167,139,250,0.15);
          --white: #ffffff;
          --mono: 'DM Mono', monospace;
          --serif: 'DM Serif Display', serif;
          --sans: 'Outfit', sans-serif;
        }

        html { scroll-behavior: smooth; }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: var(--sans);
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        /* ── STARS CANVAS ── */
        #stars-canvas {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          opacity: 0.5;
        }

        /* ── NAV ── */
        nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          padding: 20px 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-soft);
          backdrop-filter: blur(16px);
          background: rgba(9,9,11,0.7);
        }

        .nav-logo {
          font-family: var(--mono);
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.12em;
          color: var(--text-muted);
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .nav-logo .dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--violet);
          box-shadow: 0 0 8px var(--violet);
          animation: pulse-dot 2s ease-in-out infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.7); }
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 32px;
          list-style: none;
        }

        .nav-links a {
          font-size: 13px;
          font-weight: 400;
          color: var(--text-muted);
          text-decoration: none;
          letter-spacing: 0.02em;
          transition: color 0.2s;
        }
        .nav-links a:hover { color: var(--text); }

        .nav-cta {
          font-family: var(--mono);
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.08em;
          color: var(--bg);
          background: var(--white);
          padding: 9px 20px;
          border-radius: 6px;
          text-decoration: none;
          transition: background 0.2s, transform 0.2s;
        }
        .nav-cta:hover { background: #e4e4e7; transform: translateY(-1px); }

        /* ── HERO ── */
        #hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 120px 32px 80px;
          z-index: 1;
        }

        .hero-label {
          font-family: var(--mono);
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--violet);
          border: 1px solid rgba(196,181,253,0.2);
          background: rgba(196,181,253,0.06);
          padding: 6px 14px;
          border-radius: 100px;
          margin-bottom: 36px;
          opacity: 1;
        }

        .hero-title {
          font-family: var(--serif);
          font-size: clamp(52px, 7vw, 96px);
          line-height: 1.05;
          font-weight: 400;
          color: var(--white);
          max-width: 820px;
          margin-bottom: 28px;
          opacity: 1;
          letter-spacing: -0.02em;
        }

        .hero-title em {
          font-style: italic;
          color: var(--violet);
        }

        .hero-sub {
          font-size: 17px;
          font-weight: 300;
          color: var(--text-muted);
          max-width: 480px;
          line-height: 1.7;
          margin-bottom: 48px;
          opacity: 1;
        }

        .hero-actions {
          display: flex;
          gap: 14px;
          align-items: center;
          opacity: 1;
          flex-wrap: wrap;
          justify-content: center;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: var(--white);
          color: var(--bg);
          font-family: var(--mono);
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.06em;
          padding: 14px 28px;
          border-radius: 8px;
          text-decoration: none;
          transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.15), 0 4px 24px rgba(0,0,0,0.4);
        }
        .btn-primary:hover {
          background: #e4e4e7;
          transform: translateY(-2px);
          box-shadow: 0 0 0 1px rgba(255,255,255,0.2), 0 8px 32px rgba(0,0,0,0.5);
        }

        .btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          color: var(--text-muted);
          font-family: var(--mono);
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.06em;
          padding: 14px 24px;
          border-radius: 8px;
          text-decoration: none;
          border: 1px solid var(--border);
          transition: color 0.2s, border-color 0.2s, transform 0.2s;
        }
        .btn-ghost:hover {
          color: var(--text);
          border-color: rgba(255,255,255,0.15);
          transform: translateY(-2px);
        }

        .hero-stats {
          display: flex;
          gap: 48px;
          margin-top: 72px;
          opacity: 1;
        }

        .stat {
          text-align: center;
        }
        .stat-number {
          font-family: var(--serif);
          font-size: 32px;
          color: var(--white);
          line-height: 1;
          margin-bottom: 6px;
        }
        .stat-label {
          font-family: var(--mono);
          font-size: 11px;
          color: var(--text-dim);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        /* ── GLOW ORBS ── */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        .orb-1 {
          width: 100vw;
          max-width: 500px; 
          height: 500px;
          background: radial-gradient(circle, rgba(167,139,250,0.3) 0%, transparent 70%);
          top: 10%; left: 50%;
          transform: translateX(-50%);
        }
        .orb-2 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(196,181,253,0.1) 0%, transparent 70%);
          bottom: 20%; right: 10%;
        }

        /* ── DASHBOARD PREVIEW ── */
        #preview {
          position: relative;
          z-index: 1;
          padding: 32px 32px 120px;
          overflow: hidden;
        }

        .preview-wrapper {
          max-width: 1100px;
          margin: 0 auto;
          position: relative;
          overflow: hidden;
        }

        .preview-glow {
          z-index: 0;
          position: absolute;
          inset: -60px;
          background: radial-gradient(ellipse at 50% 30%, rgba(167,139,250,0.12) 0%, transparent 65%);
          pointer-events: none;
          border-radius: 32px;
        }

        .preview-light-left {
          z-index: 0;
          position: absolute;
          left: -80px; top: 50%;
          transform: translateY(-50%);
          width: 200px; height: 600px;
          background: radial-gradient(ellipse, rgba(196,181,253,0.06) 0%, transparent 70%);
          filter: blur(40px);
          pointer-events: none;
        }

        .preview-light-right {
          z-index: 0;
          position: absolute;
          right: -80px; top: 50%;
          transform: translateY(-50%);
          width: 200px; height: 600px;
          background: radial-gradient(ellipse, rgba(255,255,255,0.03) 0%, transparent 70%);
          filter: blur(40px);
          pointer-events: none;
        }

        .preview-frame {
          position: relative;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.1);
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.05),
            0 32px 80px rgba(0,0,0,0.8),
            0 0 120px rgba(167,139,250,0.08),
            inset 0 1px 0 rgba(255,255,255,0.08);
          opacity: 1;
          transform: none;
        }

        .preview-topbar {
          background: rgba(15,15,17,0.9);
          border-bottom: 1px solid var(--border-soft);
          padding: 14px 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          backdrop-filter: blur(20px);
        }
        .tb-dot { width: 11px; height: 11px; border-radius: 50%; }
        .tb-dot.r { background: #ff5f57; }
        .tb-dot.y { background: #febc2e; }
        .tb-dot.g { background: #28c840; }

        .preview-url {
          flex: 1;
          margin-left: 12px;
          background: var(--surface2);
          border-radius: 6px;
          padding: 5px 12px;
          font-family: var(--mono);
          font-size: 12px;
          color: var(--text-dim);
          border: 1px solid var(--border-soft);
        }

        .preview-img {
          width: 100%;
          display: block;
          background: #0a0a0c;
        }

        /* Simulated dashboard inside */
        .sim-dash {
          background: #09090b;
          padding: 32px;
          display: grid;
          grid-template-columns: 280px 1fr 300px;
          gap: 20px;
          min-height: 420px;
        }

        .sim-panel {
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border-soft);
          border-radius: 12px;
          padding: 20px;
        }

        .sim-label {
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-dim);
          margin-bottom: 12px;
        }

        .sim-title-big {
          font-family: var(--serif);
          font-size: 28px;
          color: var(--white);
          margin-bottom: 8px;
        }

        .sim-sub {
          font-size: 11px;
          color: var(--text-dim);
          margin-bottom: 20px;
        }

        .sim-field {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-soft);
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: 10px;
        }

        .sim-btn {
          width: 100%;
          background: transparent;
          border: 1px solid rgba(196,181,253,0.3);
          color: var(--violet);
          font-family: var(--mono);
          font-size: 12px;
          padding: 10px;
          border-radius: 8px;
          margin-top: 8px;
          text-align: center;
        }

        .sim-center {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-soft);
          border-radius: 12px;
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .sim-star-name {
          font-family: var(--serif);
          font-size: 40px;
          color: var(--white);
          margin-bottom: 4px;
        }

        .sim-metrics {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 10px;
        }

        .sim-metric {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-soft);
          border-radius: 8px;
          padding: 14px;
        }

        .sim-metric-label {
          font-family: var(--mono);
          font-size: 9px;
          letter-spacing: 0.12em;
          color: var(--text-dim);
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .sim-metric-val {
          font-family: var(--mono);
          font-size: 20px;
          color: var(--white);
          font-weight: 500;
        }

        .sim-right {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .sim-weather {
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border-soft);
          border-radius: 12px;
          padding: 18px;
        }

        .sim-sat {
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border-soft);
          border-radius: 12px;
          padding: 18px;
          flex: 1;
        }

        .sim-sat-name {
          font-family: var(--mono);
          font-size: 15px;
          color: var(--white);
          font-weight: 500;
        }

        .sim-badge {
          display: inline-block;
          background: var(--violet-dim);
          color: var(--violet);
          font-family: var(--mono);
          font-size: 10px;
          padding: 3px 10px;
          border-radius: 100px;
          margin-top: 6px;
        }

        /* ── FEATURES ── */
        #features {
          position: relative;
          z-index: 1;
          padding: 80px 32px 120px;
        }

        .section-header {
          text-align: center;
          max-width: 560px;
          margin: 0 auto 72px;
        }

        .section-eyebrow {
          font-family: var(--mono);
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--violet);
          margin-bottom: 16px;
        }

        .section-title {
          font-family: var(--serif);
          font-size: clamp(36px, 4vw, 52px);
          line-height: 1.1;
          color: var(--white);
          margin-bottom: 16px;
        }

        .section-desc {
          font-size: 16px;
          color: var(--text-muted);
          line-height: 1.7;
          font-weight: 300;
        }

        .features-grid {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: var(--border-soft);
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid var(--border-soft);
        }

        .feature-card {
          background: var(--surface);
          padding: 40px 36px;
          position: relative;
          overflow: hidden;
          transition: background 0.3s;
        }

        .feature-card:hover {
          background: var(--surface2);
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(196,181,253,0.2), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .feature-card:hover::before { opacity: 1; }

        .feature-icon {
          width: 44px; height: 44px;
          border-radius: 10px;
          background: var(--violet-dim);
          border: 1px solid rgba(196,181,253,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          margin-bottom: 24px;
        }

        .feature-icon svg {
          width: 20px; height: 20px;
          stroke: var(--violet);
          stroke-width: 1.5;
        }

        .feature-name {
          font-family: var(--serif);
          font-size: 22px;
          color: var(--white);
          margin-bottom: 10px;
        }

        .feature-desc {
          font-size: 14px;
          color: var(--text-muted);
          line-height: 1.7;
          font-weight: 300;
        }

        .feature-corner {
          position: absolute;
          bottom: 20px; right: 20px;
          font-family: var(--mono);
          font-size: 10px;
          color: var(--text-dim);
          letter-spacing: 0.08em;
        }

        /* ── HOW IT WORKS ── */
        #how {
          position: relative;
          z-index: 1;
          padding: 80px 32px 120px;
          background: radial-gradient(ellipse at 50% 0%, rgba(167,139,250,0.04) 0%, transparent 60%);
        }

        .steps-container {
          max-width: 860px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .step {
          display: grid;
          grid-template-columns: 64px 1fr;
          gap: 32px;
          align-items: start;
          padding: 36px 0;
          border-bottom: 1px solid var(--border-soft);
          opacity: 1;
          transform: none;
        }
        .step:last-child { border-bottom: none; }

        .step-num {
          font-family: var(--mono);
          font-size: 11px;
          letter-spacing: 0.1em;
          color: var(--text-dim);
          padding-top: 6px;
          text-align: right;
        }

        .step-title {
          font-family: var(--serif);
          font-size: 26px;
          color: var(--white);
          margin-bottom: 10px;
        }

        .step-desc {
          font-size: 15px;
          color: var(--text-muted);
          line-height: 1.7;
          font-weight: 300;
        }

        /* ── INSTALL ── */
        #install {
          position: relative;
          z-index: 1;
          padding: 80px 32px 120px;
        }

        .install-container {
          max-width: 860px;
          margin: 0 auto;
        }

        .install-steps {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 56px;
        }

        .install-step {
          border: 1px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
          transition: border-color 0.3s;
        }
        .install-step:hover { border-color: rgba(196,181,253,0.2); }

        .install-step-header {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 24px;
          background: var(--surface);
        }

        .install-step-num {
          width: 28px; height: 28px;
          border-radius: 50%;
          background: var(--violet-dim);
          border: 1px solid rgba(196,181,253,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--mono);
          font-size: 11px;
          color: var(--violet);
          flex-shrink: 0;
        }

        .install-step-label {
          font-size: 15px;
          font-weight: 500;
          color: var(--text);
        }

        .install-step-body {
          padding: 0 24px 20px;
          background: var(--surface);
        }

        .install-note {
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: 12px;
          font-weight: 300;
          padding-top: 4px;
        }

        /* Code block */
        .code-block {
          background: #0d0d0f;
          border: 1px solid var(--border-soft);
          border-radius: 10px;
          padding: 16px 20px;
          position: relative;
          overflow-x: auto;
        }

        .code-block pre {
          font-family: var(--mono);
          font-size: 13px;
          color: #a1a1aa;
          line-height: 1.8;
          white-space: pre;
          overflow-x: auto;
        }

        .code-block .comment { color: #3f3f46; }
        .code-block .cmd { color: #e4e4e7; }
        .code-block .str { color: var(--violet); }

        .copy-btn {
          position: absolute;
          top: 12px; right: 12px;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 5px 12px;
          font-family: var(--mono);
          font-size: 11px;
          color: var(--text-dim);
          cursor: pointer;
          transition: color 0.2s, border-color 0.2s;
        }
        .copy-btn:hover { color: var(--text); border-color: rgba(255,255,255,0.12); }

        /* Requirements callout */
        .req-callout {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          background: var(--violet-dim);
          border: 1px solid rgba(196,181,253,0.12);
          border-radius: 10px;
          padding: 16px;
          margin-top: 12px;
        }

        .req-callout-icon { font-size: 16px; flex-shrink: 0; padding-top: 1px; display: flex; align-items: flex-start; }
        .req-callout-icon svg { width: 16px; height: 16px; stroke: var(--violet); stroke-width: 1.8; flex-shrink: 0; margin-top: 1px; }

        .req-callout-text {
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.6;
          font-weight: 300;
        }

        .req-callout-text strong { color: var(--violet); font-weight: 500; }

        /* ── OPEN SOURCE BANNER ── */
        #opensource {
          position: relative;
          z-index: 1;
          padding: 80px 32px;
        }

        .os-card {
          max-width: 860px;
          margin: 0 auto;
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 64px 56px;
          text-align: center;
          position: relative;
          overflow: hidden;
          background: var(--surface);
        }

        .os-card::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 21px;
          background: linear-gradient(135deg, rgba(196,181,253,0.15), transparent 40%, transparent 60%, rgba(196,181,253,0.08));
          pointer-events: none;
        }

        .os-glow {
          position: absolute;
          top: -100px; left: 50%;
          transform: translateX(-50%);
          width: 400px; height: 300px;
          background: radial-gradient(ellipse, rgba(167,139,250,0.1) 0%, transparent 70%);
          pointer-events: none;
        }

        .os-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #1c1c20;
          border: 1px solid var(--border);
          border-radius: 100px;
          padding: 6px 16px 6px 10px;
          font-family: var(--mono);
          font-size: 11px;
          color: var(--text-muted);
          margin-bottom: 32px;
        }

        .os-badge-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 6px rgba(74,222,128,0.6);
        }

        .os-title {
          font-family: var(--serif);
          font-size: clamp(36px, 4vw, 52px);
          color: var(--white);
          margin-bottom: 16px;
          line-height: 1.1;
        }

        .os-desc {
          font-size: 16px;
          color: var(--text-muted);
          max-width: 480px;
          margin: 0 auto 40px;
          line-height: 1.7;
          font-weight: 300;
        }

        .os-actions {
          display: flex;
          gap: 14px;
          justify-content: center;
          flex-wrap: wrap;
        }

        /* ── FOOTER ── */
        footer {
          position: relative;
          z-index: 1;
          border-top: 1px solid var(--border-soft);
          padding: 40px 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .footer-brand {
          font-family: var(--mono);
          font-size: 12px;
          color: var(--text-dim);
          letter-spacing: 0.08em;
        }

        .footer-note {
          font-size: 12px;
          color: var(--text);
        }

        .footer-links {
          display: flex;
          gap: 24px;
        }

        .footer-links a {
          font-family: var(--mono);
          font-size: 12px;
          color: var(--text-dim);
          text-decoration: none;
          letter-spacing: 0.06em;
          transition: color 0.2s;
        }
        .footer-links a:hover { color: var(--text-muted); }

        /* ── SCROLL LINE ── */
        .scroll-line {
          position: absolute;
          left: 50%;
          bottom: 40px;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          opacity: 0;
        }

        .scroll-line-bar {
          width: 1px;
          height: 48px;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.2));
          animation: scroll-fade 2s ease-in-out infinite;
        }

        @keyframes scroll-fade {
          0%, 100% { opacity: 0; transform: scaleY(0); transform-origin: top; }
          50% { opacity: 1; transform: scaleY(1); transform-origin: top; }
        }

        .scroll-label {
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.15em;
          color: var(--text-dim);
          text-transform: uppercase;
          writing-mode: vertical-rl;
        }

        /* ── FLOATING PARTICLES ── */
        .particles {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .particle {
          position: absolute;
          width: 2px; height: 2px;
          background: rgba(255,255,255,0.4);
          border-radius: 50%;
          animation: float-particle linear infinite;
        }

        @keyframes float-particle {
          0% { transform: translateY(100vh) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100px) translateX(30px); opacity: 0; }
        }

        @media (min-width: 901px) {
          .hero-label,
          .hero-title,
          .hero-sub,
          .hero-actions,
          .hero-stats {
            opacity: 0;
          }

          .preview-frame {
            opacity: 0;
            transform: translateY(40px);
          }

          .step {
            opacity: 0;
            transform: translateY(20px);
          }
        }

        /* Responsive */
        @media (max-width: 900px) {
          nav { padding: 16px 24px; }
          .nav-links { display: none; }
          .features-grid { grid-template-columns: 1fr; }
          .sim-dash { grid-template-columns: 1fr; }
          .os-card { padding: 40px 28px; }
          footer { flex-direction: column; gap: 16px; text-align: center; }
          .hero-stats { gap: 28px; }
        }
      `}</style>

      <canvas id="stars-canvas" />
      <div className="particles" id="particles" />

      <nav id="main-nav">
        <div className="nav-logo">
          <div className="dot" />
          {isMobile ? "ASTRO CONTROL" : "Astro Control Deck"}
        </div>
        <ul className="nav-links">
          <li>
            <a href="#features">Funcionalidades</a>
          </li>
          <li>
            <a href="#how">Como funciona</a>
          </li>
          <li>
            <a href="#install">Instalação</a>
          </li>
          <li>
            <a href="#opensource">Open Source</a>
          </li>
        </ul>
        <a
          href="https://github.com/DaniloSamways/astro"
          target="_blank"
          rel="noreferrer"
          className="nav-cta"
        >
          Ver no GitHub ↗
        </a>
      </nav>

      <section id="hero">
        <div className="orb orb-1" />
        <div className="orb orb-2" />

        <div className="hero-label">
          Completamente gratuito &amp; open source
        </div>

        <h1 className="hero-title">
          Rastreie o céu,
          <br />
          <em>ao vivo</em>, do seu terminal
        </h1>

        <p className="hero-sub">
          Um painel astronômico que mostra em tempo real quais objetos celestes
          e satélites estão visíveis na sua localização.
        </p>

        <div className="hero-actions">
          <a
            href="https://github.com/DaniloSamways/astro"
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2 0-.4-.5-1.6.2-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.6.2 2.8.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3z" />
            </svg>
            Rodar localmente
          </a>
          <a href="#features" className="btn-ghost">
            Ver funcionalidades
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        <div className="hero-stats">
          <div className="stat">
            <div className="stat-number">∞</div>
            <div className="stat-label">Objetos rastreáveis</div>
          </div>
          <div className="stat">
            <div className="stat-number">0</div>
            <div className="stat-label">Custo para usar</div>
          </div>
          <div className="stat">
            <div className="stat-number">12h</div>
            <div className="stat-label">Janela de previsão</div>
          </div>
        </div>
      </section>

      <section id="preview">
        <div className="preview-glow" />
        <div className="preview-light-left" />
        <div className="preview-light-right" />
        <div className="preview-wrapper">
          <div className="preview-frame" id="dash-frame">
            <div className="preview-topbar">
              <div className="tb-dot r" />
              <div className="tb-dot y" />
              <div className="tb-dot g" />
              <div className="preview-url">
                localhost:5173 — Astro Control Deck
              </div>
            </div>

            <div className="sim-dash">
              <div className="sim-panel">
                <div className="sim-label">Command Panel</div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "var(--text)",
                    marginBottom: "20px",
                  }}
                >
                  Controle de leitura
                </div>

                <div className="sim-label" style={{ marginTop: "12px" }}>
                  Cidade
                </div>
                <div className="sim-field">Curitiba</div>

                <div className="sim-label" style={{ marginTop: "12px" }}>
                  Objeto
                </div>
                <div className="sim-field">Sirius</div>

                <div className="sim-label" style={{ marginTop: "12px" }}>
                  Horário
                </div>
                <div className="sim-field">06/05/2026, 23:42</div>

                <div className="sim-btn">Buscar</div>

                <div
                  style={{
                    marginTop: "28px",
                    borderTop: "1px solid var(--border-soft)",
                    paddingTop: "16px",
                  }}
                >
                  <div className="sim-label">Atalhos</div>
                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      flexWrap: "wrap",
                      marginTop: "8px",
                    }}
                  >
                    <span
                      style={{
                        background: "var(--surface2)",
                        border: "1px solid var(--border-soft)",
                        borderRadius: "100px",
                        padding: "4px 10px",
                        fontFamily: "var(--mono)",
                        fontSize: "10px",
                        color: "var(--text-muted)",
                      }}
                    >
                      Sol
                    </span>
                    <span
                      style={{
                        background: "var(--surface2)",
                        border: "1px solid var(--border-soft)",
                        borderRadius: "100px",
                        padding: "4px 10px",
                        fontFamily: "var(--mono)",
                        fontSize: "10px",
                        color: "var(--text-muted)",
                      }}
                    >
                      Lua
                    </span>
                    <span
                      style={{
                        background: "var(--surface2)",
                        border: "1px solid var(--border-soft)",
                        borderRadius: "100px",
                        padding: "4px 10px",
                        fontFamily: "var(--mono)",
                        fontSize: "10px",
                        color: "var(--text-muted)",
                      }}
                    >
                      Júpiter
                    </span>
                    <span
                      style={{
                        background: "var(--surface2)",
                        border: "1px solid var(--border-soft)",
                        borderRadius: "100px",
                        padding: "4px 10px",
                        fontFamily: "var(--mono)",
                        fontSize: "10px",
                        color: "var(--text-muted)",
                      }}
                    >
                      Sirius
                    </span>
                  </div>
                </div>
              </div>

              <div className="sim-center">
                <div>
                  <div className="sim-label">Target Lock</div>
                  <div className="sim-star-name">Sirius</div>
                  <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                    Curitiba, Paraná, Brasil · 6 de mai. de 2026, 23:42
                  </div>
                </div>

                <div className="sim-metrics">
                  <div className="sim-metric">
                    <div className="sim-metric-label">Altitude</div>
                    <div className="sim-metric-val">-30.3°</div>
                  </div>
                  <div className="sim-metric">
                    <div className="sim-metric-label">Azimute</div>
                    <div className="sim-metric-val">229.7°</div>
                  </div>
                  <div className="sim-metric">
                    <div className="sim-metric-label">Magnitude</div>
                    <div className="sim-metric-val">-1.5</div>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                  }}
                >
                  <div className="sim-panel" style={{ padding: "14px" }}>
                    <div className="sim-label">Coordenadas</div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: "8px",
                      }}
                    >
                      <span
                        style={{ fontSize: "12px", color: "var(--text-dim)" }}
                      >
                        RA
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "12px",
                          color: "var(--text)",
                        }}
                      >
                        101.29
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: "6px",
                      }}
                    >
                      <span
                        style={{ fontSize: "12px", color: "var(--text-dim)" }}
                      >
                        Dec
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "12px",
                          color: "var(--text)",
                        }}
                      >
                        -16.72
                      </span>
                    </div>
                  </div>
                  <div
                    className="sim-panel"
                    style={{
                      padding: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "12px",
                        color: "var(--text-muted)",
                      }}
                    >
                      Não visível
                    </span>
                  </div>
                </div>
              </div>

              <div className="sim-right">
                <div className="sim-weather">
                  <div className="sim-label">Atmospheric Layer</div>
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: 500,
                      color: "var(--text)",
                      marginBottom: "4px",
                    }}
                  >
                    Clima e contexto
                  </div>
                  <div
                    style={{
                      display: "inline-block",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid var(--border-soft)",
                      borderRadius: "100px",
                      padding: "3px 10px",
                      fontSize: "11px",
                      color: "var(--text-muted)",
                      marginTop: "4px",
                    }}
                  >
                    O céu está muito nublado.
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px",
                      marginTop: "16px",
                    }}
                  >
                    <div>
                      <div className="sim-label">Visibilidade</div>
                      <div
                        style={{
                          fontFamily: "var(--serif)",
                          fontSize: "22px",
                          color: "var(--white)",
                        }}
                      >
                        6{" "}
                        <span
                          style={{
                            fontSize: "13px",
                            fontFamily: "var(--sans)",
                            color: "var(--text-muted)",
                          }}
                        >
                          objetos
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="sim-label">Passagens</div>
                      <div
                        style={{
                          fontFamily: "var(--serif)",
                          fontSize: "22px",
                          color: "var(--white)",
                        }}
                      >
                        10
                      </div>
                      <div
                        style={{ fontSize: "11px", color: "var(--text-dim)" }}
                      >
                        dentro de 12h
                      </div>
                    </div>
                  </div>
                </div>
                <div className="sim-sat">
                  <div className="sim-label">Melhor Satélite Visível</div>
                  <div className="sim-sat-name">SL-8 R/B</div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--text-dim)",
                      marginTop: "4px",
                    }}
                  >
                    Pico em 7 de mai. de 2026, 03:38
                  </div>
                  <div className="sim-badge">Alt 18.0°</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features">
        <div className="section-header">
          <div className="section-eyebrow">Funcionalidades</div>
          <h2 className="section-title">
            Tudo que você precisa para observar o céu
          </h2>
          <p className="section-desc">
            Sem cadastro, sem assinatura, sem complicação. Dados astronômicos
            precisos, direto no seu navegador.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <i data-lucide="crosshair" />
            </div>
            <div className="feature-name">Target Lock</div>
            <p className="feature-desc">
              Busque qualquer objeto celeste por nome e veja altitude, azimute,
              magnitude e coordenadas em tempo real para sua localização.
            </p>
            <div className="feature-corner">01 / 06</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i data-lucide="satellite" />
            </div>
            <div className="feature-name">Satellite Stream</div>
            <p className="feature-desc">
              Listagem completa de passagens de satélites com horário de
              surgimento, pico e poente. Nunca perca o ISS passando pelo céu.
            </p>
            <div className="feature-corner">02 / 06</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i data-lucide="cloud" />
            </div>
            <div className="feature-name">Clima e Contexto</div>
            <p className="feature-desc">
              Condições atmosféricas integradas que te alertam quando o céu está
              nublado ou quando a visibilidade está comprometida.
            </p>
            <div className="feature-corner">03 / 06</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i data-lucide="radar" />
            </div>
            <div className="feature-name">Radar do Horizonte</div>
            <p className="feature-desc">
              Veja todos os objetos visíveis acima do horizonte agora, com
              altitude e azimute, ordenados do mais brilhante ao mais tênue.
            </p>
            <div className="feature-corner">04 / 06</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i data-lucide="zap" />
            </div>
            <div className="feature-name">Atalhos Rápidos</div>
            <p className="feature-desc">
              Acesse Sol, Lua, Júpiter e Sirius com um clique. Configure seus
              próprios atalhos para os objetos que você mais observa.
            </p>
            <div className="feature-corner">05 / 06</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i data-lucide="clock" />
            </div>
            <div className="feature-name">Previsão de 12h</div>
            <p className="feature-desc">
              Planeje sua sessão de observação com antecedência. Veja quais
              satélites e astros estarão visíveis nas próximas horas.
            </p>
            <div className="feature-corner">06 / 06</div>
          </div>
        </div>
      </section>

      <section id="how">
        <div className="section-header">
          <div className="section-eyebrow">Como funciona</div>
          <h2 className="section-title">Simples como apontar para o céu</h2>
          <p className="section-desc">
            Em menos de um minuto você já está rastreando objetos celestes com
            precisão astronômica.
          </p>
        </div>

        <div className="steps-container">
          <div className="step">
            <div className="step-num">01</div>
            <div>
              <h3 className="step-title">Informe sua cidade</h3>
              <p className="step-desc">
                Digite o nome da sua cidade no painel de controle. O sistema usa
                sua localização geográfica para calcular as posições dos astros
                com precisão para onde você está no momento.
              </p>
            </div>
          </div>
          <div className="step">
            <div className="step-num">02</div>
            <div>
              <h3 className="step-title">Escolha o que rastrear</h3>
              <p className="step-desc">
                Use os atalhos rápidos para Sol, Lua, Júpiter ou Sirius — ou
                busque qualquer objeto por nome. Estrelas, planetas, nebulosas,
                asteroides: se tem nome, você pode rastrear.
              </p>
            </div>
          </div>
          <div className="step">
            <div className="step-num">03</div>
            <div>
              <h3 className="step-title">Veja o Target Lock</h3>
              <p className="step-desc">
                O painel central exibe altitude, azimute e magnitude do objeto
                em tempo real. Aponte seu telescópio ou binóculo nas coordenadas
                indicadas e encontre o objeto instantaneamente.
              </p>
            </div>
          </div>
          <div className="step">
            <div className="step-num">04</div>
            <div>
              <h3 className="step-title">Planeje as passagens</h3>
              <p className="step-desc">
                O Satellite Stream lista todas as passagens de satélites das
                próximas 12 horas com horários precisos de surgimento, pico e
                poente. Saiba exatamente quando o ISS vai passar.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="install">
        <div className="install-container">
          <div
            className="section-header"
            style={{ textAlign: "left", maxWidth: "none", marginBottom: 0 }}
          >
            <div className="section-eyebrow">Instalação</div>
            <h2 className="section-title">Rode localmente em minutos</h2>
            <p className="section-desc" style={{ maxWidth: "480px" }}>
              O Astro Control Deck roda completamente no seu computador. Sem
              servidores, sem dados enviados a terceiros.
            </p>
          </div>

          <div className="install-steps">
            <div className="install-step">
              <div className="install-step-header">
                <div className="install-step-num">1</div>
                <div className="install-step-label">Configure o Python 3</div>
              </div>
              <div className="install-step-body">
                <p className="install-note">
                  Prepare o ambiente Python para rodar os serviços astronômicos.
                </p>
                <div className="code-block">
                  <button className="copy-btn" type="button">
                    copiar
                  </button>
                  <pre>
                    <span className="comment"># Linux (Ubuntu/Debian)</span>
                    <br />
                    <span className="cmd">
                      sudo apt install python3-venv python3-full -y
                    </span>
                    <br />
                    <span className="cmd">python3 -m venv venv</span>
                    <br />
                    <span className="cmd">source venv/bin/activate</span>
                    <br />
                    <span className="cmd">
                      pip install astropy astroquery requests skyfield
                    </span>
                    <br />
                    <br />
                    <span className="comment"># Windows (PowerShell)</span>
                    <br />
                    <span className="cmd">python -m venv venv</span>
                    <br />
                    <span className="cmd">.\\venv\\Scripts\\Activate.ps1</span>
                    <br />
                    <span className="cmd">
                      pip install astropy astroquery requests skyfield
                    </span>
                  </pre>
                </div>
                <div className="req-callout">
                  <span className="req-callout-icon">
                    <i data-lucide="info" />
                  </span>
                  <div className="req-callout-text">
                    Requer <strong>Python 3.10+</strong>. Se não tiver, instale
                    pelo site python.org.
                  </div>
                </div>
              </div>
            </div>

            <div className="install-step">
              <div className="install-step-header">
                <div className="install-step-num">2</div>
                <div className="install-step-label">Clone o repositório</div>
              </div>
              <div className="install-step-body">
                <p className="install-note">
                  Faça o clone do projeto para sua máquina via Git.
                </p>
                <div className="code-block">
                  <button className="copy-btn" type="button">
                    copiar
                  </button>
                  <pre>
                    <span className="comment"># Clone o repositório</span>
                    <br />
                    <span className="cmd">
                      git clone https://github.com/DaniloSamways/astro.git
                    </span>
                    <br />
                    <span className="cmd">cd astro</span>
                  </pre>
                </div>
              </div>
            </div>

            <div className="install-step">
              <div className="install-step-header">
                <div className="install-step-num">3</div>
                <div className="install-step-label">
                  Instale as dependências
                </div>
              </div>
              <div className="install-step-body">
                <p className="install-note">
                  Instale os pacotes necessários com npm, yarn ou pnpm.
                </p>
                <div className="code-block">
                  <button className="copy-btn" type="button">
                    copiar
                  </button>
                  <pre>
                    <span className="comment"># Usando npm</span>
                    <br />
                    <span className="cmd">npm run install:all</span>
                  </pre>
                </div>
                <div className="req-callout">
                  <span className="req-callout-icon">
                    <i data-lucide="triangle-alert" />
                  </span>
                  <div className="req-callout-text">
                    Requer <strong>Node.js 20.9.0+</strong>. Verifique sua
                    versão com <strong>node --version</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="install-step">
              <div className="install-step-header">
                <div className="install-step-num">4</div>
                <div className="install-step-label">
                  Inicie o servidor de desenvolvimento
                </div>
              </div>
              <div className="install-step-body">
                <p className="install-note">
                  Rode o projeto localmente e abra no navegador.
                </p>
                <div className="code-block">
                  <button className="copy-btn" type="button">
                    copiar
                  </button>
                  <pre>
                    <span className="cmd">npm run dev</span>
                    <br />
                    <br />
                    <span className="comment"># O painel abrirá em:</span>
                    <br />
                    <span className="str">
                      ➜ Local: http://localhost:3000/panel
                    </span>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="opensource">
        <div className="os-card">
          <div className="os-glow" />
          <div className="os-badge">
            <div className="os-badge-dot" />
            100% Open Source — Licença MIT
          </div>
          <h2 className="os-title">
            Gratuito.
            <br />
            Para sempre.
          </h2>
          <p className="os-desc">
            Sem planos pagos, sem freemium, sem limite de uso. O Astro Control
            Deck é código aberto e sempre será livre para usar, modificar e
            distribuir.
          </p>
          <div className="os-actions">
            <a
              href="https://github.com/DaniloSamways/astro"
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
            >
              <svg
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2 0-.4-.5-1.6.2-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.6.2 2.8.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3z" />
              </svg>
              Ver no GitHub
            </a>
            <a href="#install" className="btn-ghost">
              Instruções de instalação
            </a>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-brand">ASTRO CONTROL DECK · 2026</div>
        <div className="footer-note">
          Feito com{" "}
          <i
            data-lucide="heart"
            style={{
              display: "inline-block",
              width: "13px",
              height: "13px",
              stroke: "red",
              verticalAlign: "middle",
              margin: "0 2px",
            }}
          />{" "}
          por{" "}
          <a
            href="https://br.linkedin.com/in/danilo-samways"
            target="_blank"
            rel="noreferrer"
          >
            Danilo Samways
          </a>
        </div>
        <div className="footer-links">
          <a
            href="https://github.com/DaniloSamways/astro"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <a
            href="https://br.linkedin.com/in/danilo-samways"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
          <a href="#install">Docs</a>
        </div>
      </footer>

      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"
        strategy="afterInteractive"
      />

      <Script id="astro-landing-scripts" strategy="afterInteractive">{`
        const canvas = document.getElementById('stars-canvas');
        const ctx = canvas.getContext('2d');

        function resizeCanvas() {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          drawStars();
        }

        function drawStars() {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const count = Math.floor((canvas.width * canvas.height) / 4000);
          for (let i = 0; i < count; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const r = Math.random() * 1.2;
            const alpha = Math.random() * 0.6 + 0.1;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,' + alpha + ')';
            ctx.fill();
          }
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const particlesContainer = document.getElementById('particles');
        for (let i = 0; i < 12; i++) {
          const p = document.createElement('div');
          p.className = 'particle';
          p.style.left = Math.random() * 100 + '%';
          p.style.animationDuration = (Math.random() * 20 + 15) + 's';
          p.style.animationDelay = (Math.random() * 20) + 's';
          p.style.opacity = Math.random() * 0.4;
          p.style.width = p.style.height = (Math.random() * 2 + 1) + 'px';
          particlesContainer.appendChild(p);
        }

        const isDesktopViewport = window.matchMedia('(min-width: 901px)').matches;
        const gsapRef = window.gsap;
        const scrollTriggerRef = window.ScrollTrigger;
        const hasGsap = Boolean(gsapRef);

        if (isDesktopViewport && hasGsap && scrollTriggerRef) {
          gsapRef.registerPlugin(scrollTriggerRef);
        }

        if (hasGsap) {
          gsapRef.set(['.hero-label', '.hero-title', '.hero-sub', '.hero-actions', '.hero-stats'], { y: 24 });

          const tl = gsapRef.timeline({ defaults: { ease: 'power3.out' } });
          tl.to('.hero-label', { opacity: 1, y: 0, duration: 0.8, delay: 0.3 })
            .to('.hero-title', { opacity: 1, y: 0, duration: 1 }, '-=0.5')
            .to('.hero-sub', { opacity: 1, y: 0, duration: 0.8 }, '-=0.6')
            .to('.hero-actions', { opacity: 1, y: 0, duration: 0.8 }, '-=0.5')
            .to('.hero-stats', { opacity: 1, y: 0, duration: 0.8 }, '-=0.5')
            .to('#scroll-hint', { opacity: 1, duration: 0.6 }, '-=0.2');
        } else {
          // Desktop hides base animation elements; this fallback keeps content visible without GSAP.
          document.querySelectorAll('.hero-label, .hero-title, .hero-sub, .hero-actions, .hero-stats').forEach((el) => {
            el.style.opacity = '1';
            el.style.transform = 'none';
          });
        }

        if (isDesktopViewport && hasGsap) {
          gsapRef.to('#dash-frame', {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '#preview',
              start: 'top 80%'
            }
          });

          gsapRef.utils.toArray('.feature-card').forEach((card, i) => {
            gsapRef.from(card, {
              opacity: 0,
              y: 30,
              duration: 0.7,
              delay: i * 0.08,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 88%'
              }
            });
          });

          gsapRef.utils.toArray('.step').forEach((step) => {
            gsapRef.to(step, {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: step,
                start: 'top 85%'
              }
            });
          });

          gsapRef.from('.os-card', {
            opacity: 0,
            y: 40,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '#opensource',
              start: 'top 80%'
            }
          });
        } else {
          document.querySelectorAll('#dash-frame, .step').forEach((el) => {
            el.style.opacity = '1';
            el.style.transform = 'none';
          });
        }

        if (hasGsap && isDesktopViewport) {
          document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 30;
            const y = (e.clientY / window.innerHeight - 0.5) * 20;
            gsapRef.to('.orb-1', { x, y, duration: 2, ease: 'power1.out' });
            gsapRef.to('.orb-2', { x: -x * 0.5, y: -y * 0.5, duration: 2.5, ease: 'power1.out' });
          });
        }

        function copyCode(btn) {
          const code = btn.nextElementSibling.innerText;
          navigator.clipboard.writeText(code).then(() => {
            btn.textContent = 'copiado!';
            setTimeout(() => (btn.textContent = 'copiar'), 2000);
          });
        }

        document.querySelectorAll('.copy-btn').forEach((btn) => {
          btn.addEventListener('click', () => copyCode(btn));
        });

        window.addEventListener('scroll', () => {
          const nav = document.getElementById('main-nav');
          if (window.scrollY > 60) {
            nav.style.borderBottomColor = 'rgba(255,255,255,0.06)';
          } else {
            nav.style.borderBottomColor = 'rgba(255,255,255,0.04)';
          }
        });

        if (isDesktopViewport && hasGsap) {
          gsapRef.utils.toArray('.install-step').forEach((step, i) => {
            gsapRef.from(step, {
              opacity: 0,
              y: 20,
              duration: 0.6,
              delay: i * 0.1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: step,
                start: 'top 88%'
              }
            });
          });
        }

        if (window.lucide) {
          window.lucide.createIcons();
        }
      `}</Script>
    </>
  );
}
