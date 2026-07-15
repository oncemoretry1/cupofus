"use client";
import { useEffect, useMemo, useState } from "react";

type Book={id:number;slug:string;title:string;thaiTitle?:string;author:string;coverColor:string;summary:string;tags:string;concerns:string;readingMinutes:number};
const moods=["ทั้งหมด","เริ่มต้นใหม่","ใจล้า","โฟกัสงาน","ความสัมพันธ์","ความคิดสร้างสรรค์","การเงิน"];

export default function DiscoverPage(){
  const [books,setBooks]=useState<Book[]>([]); const [query,setQuery]=useState(""); const [mood,setMood]=useState("ทั้งหมด");
  useEffect(()=>{fetch("/api/books").then(r=>r.json()).then(d=>setBooks(d.books??[])).catch(()=>setBooks([]))},[]);
  const shown=useMemo(()=>books.filter(b=>{const text=`${b.title} ${b.thaiTitle??""} ${b.author} ${b.tags} ${b.concerns}`.toLowerCase();const q=text.includes(query.toLowerCase());const m=mood==="ทั้งหมด"||text.includes(mood.replace("เริ่มต้นใหม่","เริ่ม").replace("โฟกัสงาน","งาน").replace("ความคิดสร้างสรรค์","สร้างสรรค์"));return q&&m}),[books,query,mood]);
  return <main className="catalog-page"><nav className="catalog-nav"><a className="logo" href="/"><span>CUP</span><i>of</i><span>US</span></a><div><a href="/brew">Brew yours</a><a href="/club">Cup (Club)</a><a href="/partners">Near me</a><a className="profile-icon" href="/profile" aria-label="โปรไฟล์">●</a></div></nav>
    <header className="catalog-hero"><p className="eyebrow">THE CUP DIRECTORY · {books.length||50} BOOKS</p><h1>วันนี้อยาก<br/><em>เติมอะไรให้ใจ?</em></h1><p>ค้นหาจากความรู้สึก เรื่องที่กำลังเจอ หรือชื่อหนังสือ เราจะเสิร์ฟทั้งบทสรุป เพลง หนัง และพอดแคสต์ที่เข้าคู่กัน</p><label><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="ลองพิมพ์ ‘หมดไฟ’, ‘อยากเริ่มใหม่’ หรือชื่อหนังสือ"/><b>{shown.length} cups</b></label></header>
    <div className="catalog-moods">{moods.map(x=><button className={mood===x?"active":""} onClick={()=>setMood(x)} key={x}>{x}</button>)}</div>
    <section className="catalog-grid">{shown.map((book,index)=><a className="catalog-card" href={`/cup/${book.slug}`} key={book.slug} style={{"--cover":book.coverColor} as React.CSSProperties}><span className="catalog-number">{String(index+1).padStart(2,"0")}</span><div className="generated-cover"><small>{book.author}</small><b>{book.title}</b><i>CUP OF US<br/>ORIGINAL SLEEVE</i></div><div className="catalog-copy"><p>{book.tags.split(",").slice(0,2).join(" · ")}</p><h2>{book.title}</h2><h3>{book.thaiTitle}</h3><span>{book.summary}</span><footer><b>READ · LISTEN · WATCH</b><i>→</i></footer></div></a>)}</section>
    {!books.length&&<div className="catalog-loading">กำลังเปิดตู้เก็บแก้วทั้ง 50 ใบ...</div>}
  </main>
}
