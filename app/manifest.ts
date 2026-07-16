import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cup of Us",
    short_name: "Cup of Us",
    description: "ชงหนังสือ เพลง หนัง และกาแฟที่เข้ากับอารมณ์ของคุณในวันนี้",
    start_url: "/",
    display: "standalone",
    background_color: "#fffdf5",
    theme_color: "#f5e545",
    lang: "th",
    icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
