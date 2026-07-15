import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cup of Us — Different books for different us",
  description: "ร้านหนังสือในจินตนาการที่เสิร์ฟหนังสือเหมือนเครื่องดื่มหนึ่งแก้ว พร้อมสรุป พอดแคสต์ และกิจกรรม Cup (Club) of Us",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="th"><body>{children}</body></html>;
}
