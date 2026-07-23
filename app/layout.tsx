import type { Metadata } from "next";
import { PwaRegister } from "./components/PwaRegister";
import { MorphTransition } from "./components/MorphTransition";
import { MobileTabBar } from "./components/MobileTabBar";
import { GlobalAudioDock } from "./components/GlobalAudioDock";
import "./globals.css";
import "./typography.css";
import "./centered-layout.css";
import "./mobile-nav.css";
import "./audio-dock.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_BASE_URL || "https://cup-of-us.vercel.app"),
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml", sizes: "any" }],
    shortcut: "/favicon.svg",
  },
  title: "Cup of Us — วันนี้ไม่รู้จะอ่านอะไร ให้ความรู้สึกเลือกให้",
  description: "ตอบ 7 คำถามใน 2 นาที รับแก้ว Personality พร้อมหนังสือ กาแฟ เพลง และหนังที่เหมาะกับช่วงเวลานี้",
  openGraph: {
    title: "Cup of Us",
    description: "ไม่ต้องรู้ว่าอยากอ่านเล่มไหน แค่รู้ว่าตอนนี้คุณรู้สึกยังไง",
    type: "website",
    images: [{ url: "/og-hook.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cup of Us",
    description: "ตอบ 7 คำถาม แล้วให้ Cup of Us ชงหนังสือที่เหมาะกับคุณตอนนี้",
    images: ["/og-hook.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="th"><body><PwaRegister /><MorphTransition />{children}<GlobalAudioDock /><MobileTabBar /></body></html>;
}
