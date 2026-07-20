"use client";
/* eslint-disable @next/next/no-html-link-for-pages */
import { useEffect, useMemo, useRef, useState } from "react";

type Book={id:number;slug:string;title:string;thaiTitle?:string;author:string;coverColor:string;coverTextColor?:string;summary:string;tags:string;concerns:string;readingMinutes:number;audioUrl?:string;podcastUrl?:string};
type Coffee={bookSlug:string;menuName:string;menuNameThai:string;layerTop:string;layerBottom:string};
const moods=["ทั้งหมด","เริ่มต้นใหม่","ใจล้า","โฟกัสงาน","ความสัมพันธ์","ความคิดสร้างสรรค์","การเงิน"];
const readableInk=(hex:string)=>{const value=hex.replace("#","");if(value.length!==6)return "#172f2b";const [r,g,b]=[0,2,4].map(i=>parseInt(value.slice(i,i+2),16));return (r*299+g*587+b*114)/1000<145?"#fffdf5":"#172f2b"};

export default function DiscoverPage(){
  const [books,setBooks]=useState<Book[]>([]); const [coffees,setCoffees]=useState<Record<string,Coffee>>({}); const [query,setQuery]=useState(""); const [mood,setMood]=useState("ทั้งหมด"); const [activeCard,setActiveCard]=useState(0); const railRef=useRef<HTMLElement|null>(null);
  useEffect(()=>{Promise.all([fetch("/api/books").then(r=>r.json()),fetch("/api/coffee").then(r=>r.json())]).then(([bookData,coffeeData])=>{setBooks(bookData.books??[]);setCoffees(Object.fromEntries((coffeeData.pairings??[]).map((coffee:Coffee)=>[coffee.bookSlug,coffee]))) }).catch(()=>setBooks([]))},[]);
  const shown=useMemo(()=>books.filter(b=>{const text=`${b.title} ${b.thaiTitle??""} ${b.author} ${b.tags} ${b.concerns}`.toLowerCase();const q=text.includes(query.toLowerCase());const m=mood==="ทั้งหมด"||text.includes(mood.replace("เริ่มต้นใหม่","เริ่ม").replace("โฟกัสงาน","งาน").replace("ความคิดสร้างสรรค์","สร้างสรรค์"));return q&&m}),[books,query,mood]);
  const updateSwipePosition=()=>{const rail=railRef.current;if(!rail||window.innerWidth>650)return;const cards=Array.from(rail.querySelectorAll<HTMLElement>(".catalog-card"));if(!cards.length)return;const center=rail.scrollLeft+rail.clientWidth/2;let nearest=0;let distance=Number.POSITIVE_INFINITY;cards.forEach((card,index)=>{const cardCenter=card.offsetLeft+card.offsetWidth/2;const nextDistance=Math.abs(center-cardCenter);if(nextDistance<distance){nearest=index;distance=nextDistance}});setActiveCard(nearest)};
  return <main className="catalog-page"><nav className="catalog-nav"><a className="logo" href="/"><span>CUP</span><i>of</i><span>US</span></a><div><a href="/brew">Brew yours</a><a href="/club">Cup (Club)</a><a href="/partners">Near me</a><a className="profile-icon" href="/profile" aria-label="โปรไฟล์">●</a></div></nav>
    <header className="catalog-hero"><p className="eyebrow">THE CUP DIRECTORY · {books.length||50} BOOKS</p><h1>วันนี้อยาก<br/><em>เติมอะไรให้ใจ?</em></h1><p>ค้นหาจากความรู้สึก เรื่องที่กำลังเจอ หรือชื่อหนังสือ เราจะเสิร์ฟทั้งบทสรุป เพลง หนัง และพอดแคสต์ที่เข้าคู่กัน</p><label><span>⌕</span><input value={query} onChange={e=>{setQuery(e.target.value);setActiveCard(0);railRef.current?.scrollTo({left:0,behavior:"smooth"})}} placeholder="ลองพิมพ์ ‘หมดไฟ’, ‘อยากเริ่มใหม่’ หรือชื่อหนังสือ"/><b>{shown.length} cups</b></label></header>
    <div className="catalog-moods">{moods.map(x=><button className={mood===x?"active":""} onClick={()=>{setMood(x);setActiveCard(0);railRef.current?.scrollTo({left:0,behavior:"smooth"})}} key={x}>{x}</button>)}</div>
    {!!shown.length&&<div className="catalog-swipe-status" aria-live="polite"><span>ปัดซ้าย–ขวาเพื่อเลือกเล่ม</span><b>{activeCard+1} / {shown.length}</b></div>}
    <section className="catalog-grid" ref={railRef} onScroll={updateSwipePosition}>{shown.map((book,index)=>{
      const coffee=coffees[book.slug];
      const coverInk=readableInk(book.coverColor);
      return <article className="catalog-card" key={book.slug} style={{"--cover":book.coverColor,"--cover-ink":coverInk,"--coffee-top":coffee?.layerTop??book.coverColor,"--coffee-bottom":coffee?.layerBottom??"#6f4937"} as React.CSSProperties}>
        <span className="catalog-number">{String(index+1).padStart(2,"0")}</span>
        <a className="catalog-cover-link" href={`/cup/${book.slug}`} aria-label={`เปิดแก้วของ ${book.title}`}><div className="generated-cover"><small>{book.author}</small><b>{book.title}</b><i>CUP OF US<br/>ORIGINAL SLEEVE</i></div></a>
        <div className="catalog-copy"><p>{book.tags.split(",").slice(0,2).join(" · ")}</p><a className="catalog-title-link" href={`/cup/${book.slug}`}><h2>{book.title}</h2><h3>{book.thaiTitle}</h3></a><span>{book.summary}</span><div className="catalog-media-badges"><b>AA อ่าน 10–15 นาที</b><b>◉ Podcast</b><b>▶ คลิปสรุป</b></div><div className="catalog-coffee"><i></i><div><small>แก้วคู่หนังสือ · {coffee?.menuNameThai??"เมนูประจำเล่ม"}</small><b>{coffee?.menuName??"Cup of Us Blend"}</b></div></div></div>
        <footer className="catalog-actions" aria-label={`เลือกสิ่งที่อยากทำกับ ${book.title}`}><a href={`/read/${book.slug}`}><i>AA</i><span><b>อ่าน</b><small>บทสรุป 10–15 นาที</small></span></a><a href={`/cup/${book.slug}#listen`}><i>▶</i><span><b>ฟัง</b><small>Podcast + เสียงสรุป</small></span></a><a href={`/cup/${book.slug}#buy`}><i>▣</i><span><b>ซื้อ</b><small>ดูร้านค้าที่มีเล่มนี้</small></span></a></footer>
      </article>
    })}</section>
    {!books.length&&<div className="catalog-loading">กำลังเปิดตู้เก็บแก้วทั้ง 50 ใบ...</div>}
  </main>
}
