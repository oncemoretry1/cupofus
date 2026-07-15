"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Book = {
  slug: string;
  title: string;
  thaiTitle?: string;
  author: string;
  summary: string;
  tags: string;
  concerns: string;
  personality: string;
  readingMinutes: number;
  coverColor: string;
};

type Volume = {
  volumeInfo?: {
    description?: string;
    previewLink?: string;
    infoLink?: string;
    industryIdentifiers?: { identifier: string }[];
  };
  accessInfo?: { webReaderLink?: string };
};

export default function DynamicReadPage() {
  const { slug } = useParams<{ slug: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [volume, setVolume] = useState<Volume | null>(null);
  const [previewFallback, setPreviewFallback] = useState("");
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    fetch(`/api/books?slug=${slug}`)
      .then((response) => response.json())
      .then(async (data) => {
        setBook(data.book);
        if (!data.book) return;
        const result = await fetch(
          `/api/external/books?title=${encodeURIComponent(data.book.title)}&author=${encodeURIComponent(data.book.author)}`,
        )
          .then((response) => response.json())
          .catch(() => ({}));
        setVolume(result.volume ?? null);
        setPreviewFallback(result.fallbackUrl ?? "");
      });
  }, [slug]);

  const speak = () => {
    if (speaking) {
      speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    if (!book) return;
    const utterance = new SpeechSynthesisUtterance(
      `${book.title}. ${book.summary}. แนวคิดสำคัญของแก้วนี้คือ ${book.tags}. เหมาะกับวันที่ ${book.concerns}`,
    );
    utterance.lang = "th-TH";
    utterance.rate = 0.86;
    utterance.onend = () => setSpeaking(false);
    speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  if (!book) return <main className="cup-loading">กำลังเปิดบทสรุป...</main>;
  const tags = book.tags.split(",");
  const previewUrl =
    volume?.accessInfo?.webReaderLink ||
    volume?.volumeInfo?.previewLink ||
    volume?.volumeInfo?.infoLink;

  return (
    <main className="reader-page">
      <nav className="reader-top">
        <a className="logo" href="/"><span>CUP</span><i>of</i><span>US</span></a>
        <a href={`/cup/${slug}`}>← กลับไปที่แก้ว</a>
      </nav>
      <aside className="reader-directory">
        <p>บทสรุป Cup of Us</p><h2>{book.title}</h2>
        <nav>
          <a href="#opening"><span>01</span>ก่อนเริ่มจิบ</a>
          <a href="#ideas"><span>02</span>แนวคิดสำคัญ</a>
          <a href="#practice"><span>03</span>ลองทำวันนี้</a>
          <a href="#preview"><span>04</span>ลองอ่านต้นฉบับ</a>
          <a href="#aftertaste"><span>05</span>Aftertaste</a>
        </nav>
        <div className="directory-actions">
          <button onClick={speak}>{speaking ? "■ หยุดฟัง" : "▶ ฟังบทสรุป"}</button>
          <a href={`/cup/${slug}#buy`}>ซื้อหนังสือ</a>
        </div>
      </aside>
      <article className="reader-content">
        <header>
          <p className="eyebrow">{book.author} · CUP OF US SUMMARY</p>
          <h1>{book.title}<br/><em>{book.thaiTitle}</em></h1>
          <p className="reader-deck">{book.summary}</p>
          <div className="reader-meta"><span>สรุป 5–8 นาที</span><span>{tags.join(" · ")}</span><span>เขียนใหม่โดย Cup of Us</span></div>
        </header>
        <section id="opening">
          <span className="chapter-no">01</span><h2>ก่อนเริ่มจิบ</h2>
          <p>แก้วนี้เหมาะกับช่วงที่คุณกำลังเจอเรื่องเกี่ยวกับ {book.concerns.replaceAll(",", " หรือ ")} หนังสือไม่ได้เสนอคำตอบสำเร็จรูป แต่ช่วยเปลี่ยนมุมมองและทำให้เราเห็นสิ่งที่เลือกลงมือได้ชัดขึ้น</p>
          <blockquote>{book.summary}</blockquote>
        </section>
        <section id="ideas">
          <span className="chapter-no">02</span><h2>แนวคิดสำคัญ</h2>
          <div className="idea-card">{tags.map((tag, index) => <div key={tag}><b>0{index + 1} · {tag}</b><span>{index === 0 ? "เริ่มจากการสังเกตสิ่งที่เกิดขึ้นจริงในชีวิตของเรา" : index === 1 ? "ออกแบบการกระทำและสภาพแวดล้อมให้สอดคล้องกับสิ่งที่ให้คุณค่า" : "ทดลองทีละน้อย ทบทวน และปรับโดยไม่ตัดสินตัวเอง"}</span></div>)}</div>
        </section>
        <section id="practice">
          <span className="chapter-no">03</span><h2>ลองทำวันนี้</h2>
          <div className="practice-box"><p>เลือกหนึ่งคำจากแก้วนี้: <b>{tags[0]}</b></p><strong>วันนี้ฉันจะทดลอง ________<br/>เพียง ________ นาที<br/>เพราะฉันอยากเป็นคนที่ ________</strong><small>เขียนให้เล็ก ชัด และทำได้ก่อนจบวันนี้</small></div>
        </section>
        <section id="preview">
          <span className="chapter-no">04</span><h2>ลองอ่านต้นฉบับ</h2>
          {volume && previewUrl ? <>
            <p>จับคู่กับ Google Books จากชื่อ <b>{book.title}</b> และผู้เขียน <b>{book.author}</b>{volume.volumeInfo?.industryIdentifiers?.[0] && <> · ISBN {volume.volumeInfo.industryIdentifiers[0].identifier}</>}</p>
            <div className="official-preview"><div style={{ "--preview": book.coverColor } as React.CSSProperties}></div><div><p>{volume.volumeInfo?.description?.slice(0, 600) ?? "ดูรายละเอียดและสิทธิ์การอ่านตัวอย่างจาก Google Books"}</p><a href={previewUrl} target="_blank" rel="noreferrer">เปิด Preview ที่ได้รับอนุญาต ↗</a></div></div>
          </> : <div className="official-preview fallback-preview"><div style={{ "--preview": book.coverColor } as React.CSSProperties}></div><div><p>ยังไม่มี Preview ที่ได้รับอนุญาตสำหรับเล่มนี้ จึงแสดงเฉพาะบทสรุปที่ Cup of Us เขียนขึ้นเอง</p>{previewFallback && <a href={previewFallback} target="_blank" rel="noreferrer">ค้นหา {book.title} บน Google Books ↗</a>}</div></div>}
        </section>
        <section id="aftertaste">
          <span className="chapter-no">05</span><h2>รสที่ยังเหลืออยู่</h2>
          <p>หลังปิดบทสรุป ลองไม่ถามว่าจำได้กี่ข้อ แต่ถามว่าวันนี้มีหนึ่งอย่างไหนที่เราอยากทดลอง ความเปลี่ยนแปลงที่อยู่ได้นานมักเริ่มจากการกระทำที่เล็กพอจะทำซ้ำและอ่อนโยนพอจะกลับมาใหม่ได้</p>
          <a className="reader-next" href={`/cup/${slug}`}>กลับไปฟัง ดู และซื้อ →</a>
        </section>
      </article>
    </main>
  );
}
