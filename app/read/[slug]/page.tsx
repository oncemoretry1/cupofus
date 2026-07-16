"use client";
/* eslint-disable @next/next/no-html-link-for-pages */

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BookEntrance } from "../../components/BookEntrance";
import { BookInfographic } from "../../components/BookInfographic";
import { ProgressiveReader, type ReaderStep } from "../../components/ProgressiveReader";
import { getReadingFlight } from "../../../lib/reading-flight";

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
        ).then((response) => response.json()).catch(() => ({}));
        setVolume(result.volume ?? null);
        setPreviewFallback(result.fallbackUrl ?? "");
      });
  }, [slug]);

  if (!book) return <main className="cup-loading">กำลังเปิดบทอ่าน...</main>;

  const flight = getReadingFlight(book);
  const previewUrl = volume?.accessInfo?.webReaderLink || volume?.volumeInfo?.previewLink || volume?.volumeInfo?.infoLink;
  const speak = () => {
    if (speaking) {
      speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(
      [book.title, flight.opening, flight.context, flight.lens, flight.tensionCopy, flight.application, flight.nuance, flight.aftertaste].join(". "),
    );
    utterance.lang = "th-TH";
    utterance.rate = 0.86;
    utterance.onend = () => setSpeaking(false);
    speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  const steps: ReaderStep[] = [
    {
      id: "opening",
      label: "ขึ้นขบวน",
      content: <><span className="chapter-no">01</span><p className="eyebrow">{book.author} · CUP OF US LONG READ</p><h1>{book.title}<br/><em>{book.thaiTitle}</em></h1><p className="reader-deck">{flight.opening}</p><div className="reader-meta"><span>อ่าน 10–15 นาที</span><span>{flight.tags.join(" · ")}</span><span>เรียบเรียงใหม่โดย Cup of Us</span></div><div className="story-copy"><h2>หนังสือเล่มนี้กำลังชวนเราไปไหน</h2><p>{flight.context}</p><p>{book.summary} แต่แทนที่จะรีบเปลี่ยนตัวเอง หน้านี้จะพาอ่านทีละสถานี เพื่อเห็นทั้งสิ่งที่แนวคิดนี้ให้เราและขอบเขตที่ควรระวัง</p></div></>,
    },
    {
      id: "core",
      label: "สถานีแก่นคิด",
      content: <><span className="chapter-no">02</span><h2>แก่นที่ควรถือไว้<br/>ตลอดการเดินทาง</h2><BookInfographic title={book.title} summary={flight.thesis} tags={flight.tags} concerns={flight.concerns} action={flight.practice}/><div className="story-copy"><h2>เปลี่ยนเลนส์ ก่อนเปลี่ยนชีวิต</h2><p>{flight.lens}</p><p>คำสำคัญของเล่มนี้คือ <b>{flight.tags.join(" · ")}</b> ไม่ใช่เพราะเราต้องท่องจำ แต่เพราะคำเหล่านี้ทำหน้าที่เหมือนป้ายสถานี ช่วยบอกว่าตอนนี้กำลังมองปัญหาจากมุมไหน และมุมไหนยังไม่ได้ถูกมอง</p></div></>,
    },
    {
      id: "tension",
      label: "สถานีทางแยก",
      content: <><span className="chapter-no">03</span><h2>สิ่งที่หนังสือกำลัง<br/>ท้าทายเรา</h2><p className="reader-deck">{flight.tension}</p><div className="reading-note-grid"><article><span>ความเคยชินเดิม</span><h3>{flight.concerns[0] ?? "คำตอบที่เคยใช้"}</h3><p>อย่ารีบมองว่าเป็นความล้มเหลว ลองมองว่ามันเคยช่วยอะไรและกำลังมีต้นทุนอะไรในวันนี้</p></article><article><span>ทางเลือกใหม่</span><h3>{flight.tags[0] ?? "มุมมองใหม่"}</h3><p>ทางเลือกใหม่ไม่ต้องชนะทุกครั้ง ขอเพียงเล็กพอให้เกิดข้อมูลจริงและทำให้เรามีอิสระเพิ่มขึ้น</p></article></div><div className="story-copy"><p>{flight.tensionCopy}</p></div></>,
    },
    {
      id: "application",
      label: "สถานีทดลอง",
      content: <><span className="chapter-no">04</span><h2>พาแนวคิดลงจากหน้า<br/>เข้าสู่วันธรรมดา</h2><p className="reader-deck">ความเข้าใจที่ยังไม่เจอสถานการณ์จริงเป็นเพียงสมมติฐาน สถานีนี้จึงไม่ถามว่าจะเปลี่ยนชีวิตอย่างไร แต่ถามว่าจะทดลองอะไรได้ภายในหนึ่งวัน</p><div className="practice-box"><p>การทดลอง 5 นาทีของ {book.title}</p><strong>{flight.practice}</strong><small>ทำเพียงหนึ่งรอบ แล้วจดว่าอะไรช่วย อะไรฝืด และอะไรควรเล็กลง</small></div><div className="story-copy"><p>{flight.application}</p></div></>,
    },
    {
      id: "nuance",
      label: "สถานีอ่านให้ลึก",
      content: <><span className="chapter-no">05</span><h2>ใช้หนังสือเป็นเครื่องมือ<br/>ไม่ใช่คำตัดสิน</h2><p className="reader-deck">หนังสือพัฒนาตัวเองที่ดีควรเพิ่มความเข้าใจและทางเลือก ไม่ใช่ทำให้รู้สึกว่าปัญหาทุกอย่างเกิดจากเราพยายามไม่พอ</p><div className="story-copy"><p>{flight.nuance}</p><blockquote>{flight.question}</blockquote><p>อ่านช้า ๆ ตรงนี้ได้ เพราะคำถามไม่จำเป็นต้องมีคำตอบทันที หน้าที่ของมันคือเดินทางไปกับเราและกลับมาปรากฏในสถานการณ์ที่เกี่ยวข้อง</p></div></>,
    },
    {
      id: "preview",
      label: "สถานีต้นฉบับ",
      content: <><span className="chapter-no">06</span><h2>ไปต่อกับ<br/>หนังสือต้นฉบับ</h2><p className="story-intro">บทอ่านนี้เป็นบทสรุปเรียบเรียงใหม่ ไม่ได้แทนรายละเอียด เรื่องเล่า งานวิจัย และน้ำเสียงของผู้เขียน</p>{volume && previewUrl ? <div className="official-preview"><div style={{ "--preview": book.coverColor } as React.CSSProperties}></div><div><p>{volume.volumeInfo?.description?.slice(0, 650) ?? "ดูรายละเอียดและสิทธิ์การอ่านตัวอย่างจาก Google Books"}</p>{volume.volumeInfo?.industryIdentifiers?.[0] && <small>ISBN {volume.volumeInfo.industryIdentifiers[0].identifier}</small>}<a href={previewUrl} target="_blank" rel="noreferrer">เปิด Preview ที่ได้รับอนุญาต <span>↗</span></a></div></div> : <div className="official-preview fallback-preview"><div style={{ "--preview": book.coverColor } as React.CSSProperties}></div><div><p>ยังไม่มี Preview ที่ได้รับอนุญาตสำหรับเล่มนี้ เราจึงไม่แสดงเนื้อหาต้นฉบับแทนโดยพลการ</p>{previewFallback && <a href={previewFallback} target="_blank" rel="noreferrer">ค้นหา {book.title} บน Google Books <span>↗</span></a>}</div></div>}</>,
    },
    {
      id: "aftertaste",
      label: "สถานีปลายทาง",
      content: <><span className="chapter-no">07</span><h2>รสที่ยังเหลืออยู่</h2><p className="reader-deck">{flight.aftertaste}</p><div className="aftertaste-ticket"><span>คำถามติดกระเป๋ากลับบ้าน</span><strong>{flight.question}</strong><small>ไม่ต้องตอบให้ดี ตอบให้จริงกับช่วงเวลานี้ก็พอ</small></div><div className="reader-final-actions"><a className="reader-next" href={`/cup/${slug}#listen`}><i>◉</i><b>ไปสถานีฟังและดู<small>ฟังบทสรุป ดูคลิป และเพลงที่จับคู่</small></b><span>→</span></a><a className="reader-next secondary" href={`/cup/${slug}#buy`}><i>▣</i><b>หาหนังสือฉบับเต็ม<small>ดูร้านค้าที่ตรวจสอบลิงก์แล้ว</small></b><span>→</span></a></div></>,
    },
  ];

  // ProgressiveReader renders the interactive reader-directory / Cup Line.
  return <main className="reader-page reader-story-page"><BookEntrance title={book.title} author={book.author} color={book.coverColor}/>
    <nav className="reader-top"><a className="logo" href="/"><span>CUP</span><i>of</i><span>US</span></a><a href={`/cup/${slug}`}>← กลับไปที่แก้ว</a></nav>
    <ProgressiveReader title={book.title} eyebrow="CUP LINE · 10–15 MIN" steps={steps} actions={<><button onClick={speak} type="button"><i>{speaking ? "Ⅱ" : "▶"}</i><span><b>{speaking ? "พักเสียงอ่าน" : "ฟังบทอ่าน"}</b><small>อ่านออกเสียงฉบับสรุป</small></span></button><a href={`/cup/${slug}#buy`}><i>▣</i><span><b>หาหนังสือ</b><small>ร้านค้าที่ตรวจสอบแล้ว</small></span></a></>}/>
  </main>;
}
