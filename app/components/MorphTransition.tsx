"use client";

import { useEffect, useRef, useState } from "react";

type Phase = "idle" | "cover" | "reveal";
type Point = { x: number; y: number };

const STORAGE_KEY = "cup-of-us-morph-origin";

export function MorphTransition() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [point, setPoint] = useState<Point>({ x: 50, y: 50 });
  const navigating = useRef(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reveal = () => {
      if (reduceMotion.matches) return;
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        try { setPoint(JSON.parse(saved) as Point); } catch { setPoint({ x: 50, y: 50 }); }
        sessionStorage.removeItem(STORAGE_KEY);
      } else {
        setPoint({ x: 50, y: 50 });
      }
      setPhase("reveal");
      window.setTimeout(() => setPhase("idle"), 920);
    };

    const onClick = (event: MouseEvent) => {
      if (reduceMotion.matches || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || navigating.current) return;
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download") || anchor.dataset.noTransition === "true") return;
      const next = new URL(anchor.href, window.location.href);
      if (next.origin !== window.location.origin || !["http:", "https:"].includes(next.protocol)) return;
      const sameDocument = next.pathname === window.location.pathname && next.search === window.location.search;
      if (sameDocument && next.hash) return;

      event.preventDefault();
      navigating.current = true;
      const origin = {
        x: Math.max(0, Math.min(100, event.clientX / window.innerWidth * 100)),
        y: Math.max(0, Math.min(100, event.clientY / window.innerHeight * 100)),
      };
      setPoint(origin);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(origin));
      setPhase("cover");
      window.setTimeout(() => window.location.assign(next.href), 690);
    };

    const onPageShow = (event: PageTransitionEvent) => {
      navigating.current = false;
      if (event.persisted) reveal();
    };

    reveal();
    document.addEventListener("click", onClick, true);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  return <div className={`morph-transition morph-${phase}`} style={{ "--morph-x": `${point.x}vw`, "--morph-y": `${point.y}vh` } as React.CSSProperties} aria-hidden="true">
    <i className="morph-shape morph-shape-yellow"></i>
    <i className="morph-shape morph-shape-blue"></i>
    <i className="morph-shape morph-shape-paper"></i>
    <span className="morph-mark"><b>cup</b><em>of</em><b>us</b><small>กำลังเสิร์ฟหน้าถัดไป</small></span>
  </div>;
}
