import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cup of Us — Different books for different us",
  description: "ร้านหนังสือในจินตนาการที่เสิร์ฟหนังสือเหมือนเครื่องดื่มหนึ่งแก้ว พร้อมสรุป พอดแคสต์ และกิจกรรม Cup (Club) of Us",
  openGraph: {
    title: "Cup of Us",
    description: "Different books for different us. ชงแก้วที่เป็นคุณ",
    type: "website",
    images: [{ url: "https://between-the-lines-th.graphgent-sora.chatgpt.site/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cup of Us",
    description: "Different books for different us. ชงแก้วที่เป็นคุณ",
    images: ["https://between-the-lines-th.graphgent-sora.chatgpt.site/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="th"><body>{children}</body></html>;
}
