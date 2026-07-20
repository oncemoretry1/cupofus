"use client";

import { useEffect, useRef, useState } from "react";

type Phase = "idle" | "cover" | "reveal";
type MorphKind = "home" | "cup" | "shelf" | "book" | "page" | "note" | "profile" | "place";
type MorphState = { x: number; y: number; width: number; height: number; kind: MorphKind; label: string };

const STORAGE_KEY = "cup-of-us-morph-route";

const routeMorph = (pathname: string): Pick<MorphState, "kind" | "label"> => {
  if (pathname.startsWith("/read/")) return { kind: "page", label: "เปิดบทอ่าน" };
  if (pathname.startsWith("/cup/")) return { kind: "book", label: "เปิดแก้วหนังสือ" };
  if (pathname === "/brew") return { kind: "cup", label: "เริ่มชงแก้ว" };
  if (pathname === "/discover") return { kind: "shelf", label: "เปิดตู้หนังสือ" };
  if (pathname === "/club") return { kind: "note", label: "ไปที่ Cup Club" };
  if (pathname === "/profile") return { kind: "profile", label: "เปิดแก้วของฉัน" };
  if (pathname === "/partners") return { kind: "place", label: "หาร้านที่เข้ากัน" };
  return { kind: "home", label: "กลับไป Cup of Us" };
};

export function MorphTransition() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [morph, setMorph] = useState<MorphState>({ x: 50, y: 50, width: 160, height: 76, kind: "home", label: "Cup of Us" });
  const navigating = useRef(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reveal = () => {
      if (reduceMotion.matches) return;
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          setMorph(JSON.parse(saved) as MorphState);
        } catch {
          setMorph((current) => ({ ...current, ...routeMorph(window.location.pathname), x: 50, y: 50 }));
        }
        sessionStorage.removeItem(STORAGE_KEY);
      } else {
        setMorph((current) => ({ ...current, ...routeMorph(window.location.pathname), x: 50, y: 50 }));
      }
      setPhase("reveal");
      // Keep the overlay alive until the cup has drained and the last layer clears.
      window.setTimeout(() => setPhase("idle"), 1080);
    };

    const onClick = (event: MouseEvent) => {
      if (reduceMotion.matches || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || navigating.current) return;
      const anchor = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download") || anchor.dataset.noTransition === "true") return;
      const next = new URL(anchor.href, window.location.href);
      if (next.origin !== window.location.origin || !["http:", "https:"].includes(next.protocol)) return;
      if (next.pathname === window.location.pathname && next.search === window.location.search && next.hash) return;

      event.preventDefault();
      navigating.current = true;
      const rect = anchor.getBoundingClientRect();
      const destination = routeMorph(next.pathname);
      const state: MorphState = {
        x: Math.max(0, Math.min(100, (rect.left + rect.width / 2) / window.innerWidth * 100)),
        y: Math.max(0, Math.min(100, (rect.top + rect.height / 2) / window.innerHeight * 100)),
        width: Math.max(44, Math.min(rect.width, 360)),
        height: Math.max(44, Math.min(rect.height, 240)),
        ...destination,
      };
      setMorph(state);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setPhase("cover");
      window.setTimeout(() => window.location.assign(next.href), 940);
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

  const style = {
    "--morph-x": `${morph.x}vw`,
    "--morph-y": `${morph.y}vh`,
    "--morph-w": `${morph.width}px`,
    "--morph-h": `${morph.height}px`,
  } as React.CSSProperties;

  return <div className={`morph-transition morph-${phase} morph-kind-${morph.kind}`} style={style} aria-hidden="true">
    <span className="morph-object">
      <i className="morph-steam morph-steam-one"></i>
      <i className="morph-steam morph-steam-two"></i>
      <i className="morph-handle"></i>
      <span className="morph-cup-body">
        <i className="morph-liquid"></i>
        <span className="morph-cup-mark"><b>cup</b><em>of</em><b>us</b></span>
      </span>
      <b className="morph-label">{morph.label}</b>
    </span>
  </div>;
}
