"use client";

import { useEffect, useState } from "react";

const moods = ["อยากเริ่มใหม่", "ใจล้าไปหน่อย", "อยากมีวินัย", "กำลังตามหาตัวเอง"];
const cups = [
  { title: "Atomic Habits", thai: "เพราะชีวิตดีได้กว่าที่เป็น", taste: "เบา · ทำง่าย · ดื่มได้ทุกวัน", color: "yellow", icon: "A", note: "สำหรับวันที่อยากเปลี่ยน แต่ไม่อยากฝืน" },
  { title: "The Courage to Be Disliked", thai: "กล้าที่จะถูกเกลียด", taste: "เข้ม · ตรง · ทิ้งรสไว้นาน", color: "blue", icon: "C", note: "สำหรับวันที่เสียงคนอื่นดังเกินเสียงของเรา" },
  { title: "Maybe You Should Talk to Someone", thai: "เพราะนี่คือสิ่งที่นักบำบัดอยากบอก", taste: "อุ่น · หวานน้อย · ปลอบใจ", color: "pink", icon: "M", note: "สำหรับวันที่อยากเข้าใจใจตัวเองอีกนิด" },
];
const heroCups = [
  { name: "Cup of Courage", book: "The Courage to Be Disliked", color: "#75c8d3", accent: "#e94d3f", label: "กล้าที่จะเลือกชีวิตของตัวเอง", mix: ["40% ความกล้า", "35% อิสระ", "25% การยอมรับ"] },
  { name: "Cup of Tiny Starts", book: "Atomic Habits", color: "#f5e545", accent: "#75c8d3", label: "เริ่มเล็กพอที่จะไม่ต้องรอวันพร้อม", mix: ["45% ระบบ", "35% ตัวตน", "20% ทำซ้ำ"] },
  { name: "Cup of Calm", book: "Maybe You Should Talk to Someone", color: "#f39aa6", accent: "#eb8b45", label: "แก้วอุ่นสำหรับวันที่ใจทำงานหนัก", mix: ["40% เข้าใจ", "35% รับฟัง", "25% ใจดี"] },
];
const brewQuestions = [
  { label:"BASE", question:"ช่วงนี้ อะไรค้างอยู่ในใจ?", options:["คิดเยอะจนไม่เริ่ม","เหนื่อยกับความคาดหวัง","อยากรู้ว่าตัวเองต้องการอะไร"] },
  { label:"MOOD", question:"เช้าวันนี้ ใจของคุณเป็นสีอะไร?", options:["ฟ้าโปร่ง พร้อมลอง","เทา ๆ อยากพัก","ส้มสด อยากลุย"] },
  { label:"FLAVOUR", question:"อยากให้หนังสือพูดกับคุณแบบไหน?", options:["นุ่มและค่อยเป็นค่อยไป","ตรง เข้ม และปลุกให้ตื่น","อบอุ่นเหมือนเพื่อนนั่งฟัง"] },
  { label:"ENERGY", question:"พลังของคุณตอนนี้เหลือประมาณไหน?", options:["น้อย ขอเริ่มเบา ๆ","พอดี พร้อมขยับ","เต็มแก้ว พร้อมเปลี่ยน"] },
  { label:"FOCUS", question:"เรื่องไหนที่อยากดูแลมากที่สุด?", options:["ความสัมพันธ์กับตัวเอง","งานและเป้าหมาย","ความสัมพันธ์กับคนอื่น"] },
  { label:"TEMPERATURE", question:"คุณต้องการความรู้สึกแบบไหนหลังอ่าน?", options:["ใจเย็นลง","มีไฟขึ้น","เห็นตัวเองชัดขึ้น"] },
  { label:"TEXTURE", question:"คุณชอบเนื้อหาแบบไหน?", options:["เรื่องเล่าอ่านลื่น","ไอเดียพร้อมใช้","บทสนทนาชวนคิด"] },
  { label:"SWEETNESS", question:"วันนี้อยากได้รับกำลังใจแค่ไหน?", options:["หวานน้อย เน้นความจริง","พอดี ๆ มีทั้งปลอบและผลัก","เติมเต็ม ขอความอ่อนโยน"] },
  { label:"SIZE", question:"ตอนนี้มีพื้นที่ให้การอ่านแค่ไหน?", options:["วันละ 10 นาที","หนึ่งบทก่อนนอน","พร้อมอ่านยาว ๆ"] },
  { label:"AFTERTASTE", question:"อยากให้ความคิดแบบไหนติดอยู่หลังปิดเล่ม?", options:["ฉันเริ่มได้เสมอ","ฉันเลือกชีวิตตัวเองได้","ฉันไม่ต้องผ่านมันคนเดียว"] },
];

export default function Home() {
  const [mood, setMood] = useState(moods[0]);
  const [saved, setSaved] = useState(2);
  const [concern, setConcern] = useState("คิดเยอะจนไม่เริ่ม");
  const [flavor, setFlavor] = useState("นุ่มและค่อยเป็นค่อยไป");
  const [time, setTime] = useState("วันละ 10 นาที");
  const [brewState, setBrewState] = useState<"idle" | "brewing" | "ready">("idle");
  const [heroIndex, setHeroIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [brewAnswers, setBrewAnswers] = useState<string[]>([]);

  useEffect(() => {
    const timer = window.setInterval(() => setHeroIndex((current) => (current + 1) % heroCups.length), 4800);
    return () => window.clearInterval(timer);
  }, []);

  const startBrewing = () => {
    setBrewState("brewing");
    window.setTimeout(() => setBrewState("ready"), 3200);
  };

  const answerBrewQuestion = (answer: string) => {
    const nextAnswers = [...brewAnswers, answer];
    setBrewAnswers(nextAnswers);
    if (questionIndex === 0) setConcern(answer);
    if (questionIndex === 2) setFlavor(answer);
    if (questionIndex === 8) setTime(answer);
    if (questionIndex === brewQuestions.length - 1) {
      setBrewState("brewing");
      window.setTimeout(() => setBrewState("ready"), 2400);
    } else window.setTimeout(() => setQuestionIndex((current) => current + 1), 240);
  };

  const resetBrew = () => { setBrewAnswers([]); setQuestionIndex(0); setBrewState("idle"); };

  return (
    <main id="top">
      <nav className="nav">
        <a className="logo" href="#top"><span>CUP</span><i>of</i><span>US</span></a>
        <div className="nav-links useful-nav"><a className="nav-search" href="#menu">⌕ <span>ค้นหาหนังสือ คาเฟ่ พอดแคสต์</span></a><a href="#brew">ชงแก้วของฉัน</a><a href="#market">สำรวจใกล้ฉัน</a><a className="profile-icon" href="/profile" aria-label="โปรไฟล์">●</a></div>
        <a className="cup-count" href="/profile">My Cups <b>{saved}</b></a>
      </nav>

      <section className="hero">
        <div className="sticker sticker-one"><span>BOOKS</span><b>brewed<br />for you</b></div>
        <div className="sticker sticker-two">☻<small>GOOD BOOK<br />GOOD MOOD</small></div>
        <div className="hero-copy">
          <p className="eyebrow">A LITTLE BOOK CAFÉ FOR EVERY KIND OF US</p>
          <div className="hero-variant-copy" key={`copy-${heroIndex}`}><span className="variant-count">0{heroIndex + 1} / 03 · {heroCups[heroIndex].name}</span><h1>Find a book<br />that feels like<br /><em>your cup of tea.</em></h1><p className="variant-book">NOW SERVING · {heroCups[heroIndex].book}</p><p className="thai-lead">{heroCups[heroIndex].label}<br />หนังสือและส่วนผสมที่เหมาะกับคุณในช่วงเวลานี้</p></div>
          <div className="hero-actions"><a className="main-cta" href="#brew">BREW YOURS <span>↓</span></a><div className="variant-controls"><button onClick={()=>setHeroIndex((heroIndex+heroCups.length-1)%heroCups.length)} type="button" aria-label="แก้วก่อนหน้า">←</button>{heroCups.map((cup,index)=><button className={heroIndex===index?"active":""} onClick={()=>setHeroIndex(index)} type="button" aria-label={cup.name} key={cup.name}></button>)}<button onClick={()=>setHeroIndex((heroIndex+1)%heroCups.length)} type="button" aria-label="แก้วถัดไป">→</button></div></div>
        </div>

        <div className="hero-cup rotating-cup" style={{"--cup-color":heroCups[heroIndex].color,"--cup-accent":heroCups[heroIndex].accent} as React.CSSProperties} key={`cup-${heroIndex}`} aria-hidden="true">
          <div className="steam">〰<br />〰</div>
          <div className="falling-mix"><i></i><i></i><i></i></div><div className="cup-body"><div className="hero-fill"></div><span>cup<br /><i>of</i><br />us</span><div className="riso-face">•‿•</div></div>
          <div className="cup-handle"></div><div className="saucer"></div>
          <p>{heroCups[heroIndex].mix.map(item=><span key={item}>{item}</span>)}</p>
        </div>
        <div className="scribble">different books<br />for different us! <b>↗</b></div>
      </section>

      <section className="ticker"><div>CUP OF COURAGE ✦ CUP OF CALM ✦ CUP OF CURIOSITY ✦ CUP OF CHANGE ✦ CUP OF COURAGE ✦ CUP OF CALM ✦</div></section>

      <section className="brew-section journey-section" id="brew">
        <div className="brew-intro compact"><span className="section-no">00</span><p className="eyebrow">BREW YOUR OWN CUP</p><h2>ตอบหนึ่งข้อ<br /><em>เติมหนึ่งส่วนผสม</em></h2><p>เริ่มจากแก้วเปล่า แล้วค่อย ๆ เติมความรู้สึก ความสนใจ และจังหวะการอ่านของคุณทีละข้อ</p></div>
        <div className="brew-lab journey-lab">
          {brewState === "idle" ? <div className="brew-journey"><div className="question-side"><div className="journey-progress"><span>{String(questionIndex + 1).padStart(2,"0")} / 10</span><div><i style={{width:`${questionIndex * 10}%`}}></i></div></div><div className="single-question" key={questionIndex}><span>{String(questionIndex + 1).padStart(2,"0")} · {brewQuestions[questionIndex].label}</span><h3>{brewQuestions[questionIndex].question}</h3><div>{brewQuestions[questionIndex].options.map(option=><button onClick={()=>answerBrewQuestion(option)} type="button" key={option}>{option}<i>＋</i></button>)}</div></div><p className="question-hint">เลือกคำตอบที่ใกล้กับตอนนี้ที่สุด ไม่มีคำตอบผิด ☺</p></div><div className="live-cup-side"><p className="eyebrow">YOUR CUP · {brewAnswers.length}/10 INGREDIENTS</p><div className="empty-cup"><div className="cup-layers">{brewAnswers.map((answer,index)=><i className={`layer layer-${index%5}`} title={answer} key={`${answer}-${index}`}></i>)}</div><b>{brewAnswers.length === 0 ? "EMPTY" : `${brewAnswers.length} / 10`}</b><span>{brewAnswers.length === 0 ? "เริ่มจากแก้วเปล่า" : "ส่วนผสมกำลังเข้ากัน"}</span></div><div className="added-ingredients">{brewAnswers.slice(-3).map((answer,index)=><span key={`${answer}-${index}`}>＋ {answer}</span>)}</div></div></div> : brewState === "brewing" ? <div className="brewing-scene" aria-live="polite">
            <p className="eyebrow">BREWING YOUR CUP...</p>
            <div className="ingredient ingredient-one"><i></i><b>{concern}</b></div><div className="ingredient ingredient-two"><i></i><b>{flavor}</b></div><div className="ingredient ingredient-three"><i></i><b>{time}</b></div>
            <div className="animated-steam"><i></i><i></i><i></i></div><div className="brewing-mug"><div className="coffee-liquid"><span></span></div><b>CUP<br/>OF<br/>YOU</b></div><div className="stirrer"></div>
            <div className="brew-progress"><span></span></div><p className="brew-status">กำลังชั่งความรู้สึก เติมความอยากรู้ และคนให้เข้ากัน...</p>
          </div> : <div className="brew-result"><p className="eyebrow">YOUR CUP IS READY!</p><div className="result-layout"><div className={`result-cover ${concern.includes("เหนื่อย")?"cover-talk":concern.includes("ตัวเอง")?"cover-courage":"cover-atomic"}`}><small>{concern.includes("เหนื่อย")?"LORI GOTTLIEB":concern.includes("ตัวเอง")?"ICHIRO KISHIMI":"JAMES CLEAR"}</small><b>{concern.includes("เหนื่อย")?<>MAYBE YOU<br/>SHOULD TALK<br/>TO SOMEONE</>:concern.includes("ตัวเอง")?<>THE COURAGE<br/>TO BE<br/>DISLIKED</>:<>ATOMIC<br/>HABITS</>}</b><span>CUP OF US MATCH</span></div><div className="result-copy"><h3>{concern.includes("เหนื่อย")?"The Gentle Oat Latte":concern.includes("ตัวเอง")?"The Clear Mind Americano":"The Tiny Start Flat White"}</h3><p className="result-book">เสิร์ฟคู่กับ <b>{concern.includes("เหนื่อย")?"Maybe You Should Talk to Someone":concern.includes("ตัวเอง")?"The Courage to Be Disliked":"Atomic Habits"}</b></p><p>เพราะคุณกำลัง “{concern}” และอยากได้คำแนะนำที่ “{flavor}” ในจังหวะ “{time}” แก้วนี้จึงเน้นความคิดที่ใช้ได้จริงโดยไม่เร่งคุณเกินไป</p><div className="result-tags"><span>40% เข้าใจตัวเอง</span><span>35% ลงมือแบบเล็ก</span><span>25% ใจดีกับตัวเอง</span></div></div></div><div className="taste-actions"><a className="try-read" href="#recipe"><b>Aa</b><span>ลองอ่าน<small>บทสรุป 5 นาที</small></span></a><a className="try-listen" href="#club"><b>▶</b><span>ลองฟัง<small>Podcast 12 นาที</small></span></a><a className="try-buy" href="#market"><b>↗</b><span>ลองซื้อ<small>เปรียบเทียบหลายร้าน</small></span></a></div><button className="retry-brew" onClick={resetBrew} type="button">ชงใหม่อีกแก้ว ↻</button></div>}
        </div>
      </section>

      <section className="mood-bar" id="menu">
        <p>วันนี้คุณรู้สึกแบบไหน?</p>
        <div>{moods.map((item) => <button className={mood === item ? "active" : ""} key={item} onClick={() => setMood(item)} type="button">{item}</button>)}</div>
      </section>

      <section className="menu-section">
        <header className="section-head">
          <div><span className="section-no">01</span><p className="eyebrow">TODAY'S CUP MENU</p></div>
          <h2>เลือกจากรสชาติ<br /><em>ที่ใจต้องการ</em></h2>
          <p>เราไม่เชื่อว่ามีหนังสือที่ดีที่สุด<br />มีแต่เล่มที่พอดีกับเราในตอนนี้</p>
        </header>

        <div className="cup-grid">
          {cups.map((cup, index) => (
            <article className={`book-cup ${cup.color}`} key={cup.title}>
              <div className="card-top"><span>0{index + 1}</span><button onClick={() => setSaved(saved + 1)} type="button" aria-label={`เก็บ ${cup.title}`}>＋</button></div>
              <div className="cup-illustration"><div className="mini-mug"><b>{cup.icon}</b></div><span className="coffee-shadow"></span></div>
              <p className="taste">{cup.taste}</p>
              <h3>{cup.title}</h3><p className="thai-title">{cup.thai}</p>
              <p className="cup-note">{cup.note}</p>
              <a href="#recipe">ดูส่วนผสมในแก้วนี้ <span>↗</span></a>
            </article>
          ))}
        </div>
      </section>

      <section className="recipe-section" id="recipe">
        <div className="recipe-art">
          <div className="big-mug"><span>1%</span><small>better<br />every day</small></div>
          <div className="bean bean-a"></div><div className="bean bean-b"></div><div className="bean bean-c"></div>
          <p>THE HOUSE<br />SPECIAL</p>
        </div>
        <div className="recipe-copy">
          <p className="eyebrow">WHAT'S IN THIS CUP?</p>
          <h2>Atomic Habits<br /><em>สูตรเปลี่ยนชีวิตทีละ 1%</em></h2>
          <p className="intro">แก้วนี้ไม่ได้มีคาเฟอีนวิเศษ แต่มีระบบเล็ก ๆ ที่ช่วยให้สิ่งดีทำง่ายขึ้น และสิ่งที่ไม่อยากทำเกิดยากลง</p>
          <div className="ingredients">
            <div><span>45%</span><p><b>Identity</b><br />เริ่มจากคนที่อยากเป็น</p></div>
            <div><span>35%</span><p><b>Environment</b><br />จัดพื้นที่ให้เอื้อต่อเรา</p></div>
            <div><span>20%</span><p><b>Consistency</b><br />เล็กพอที่จะทำซ้ำได้</p></div>
          </div>
          <blockquote>“ทุกการกระทำ คือคะแนนโหวตให้คนที่คุณอยากเป็น”</blockquote>
          <div className="recipe-actions"><a href="#stories">อ่านสรุปทั้งแก้ว <span>→</span></a><button onClick={() => setSaved(saved + 1)} type="button">เก็บแก้วนี้ไว้ ♡</button></div>
        </div>
      </section>

      <section className="market-section" id="market">
        <div className="market-head"><div><p className="eyebrow">FIND THIS CUP IN THE WILD</p><h2>เจอแก้วที่ใช่แล้ว<br /><em>เลือกที่ซื้อที่ชอบ</em></h2></div><div><span className="disclosure">AFFILIATE LINKS · OPENLY DISCLOSED</span><p>Cup of Us ไม่ได้ขายหนังสือโดยตรง เรารวมร้านที่มีเล่มนี้ไว้ให้เปรียบเทียบ และอาจได้รับค่าคอมมิชชันเล็กน้อยโดยที่ราคาของคุณไม่เพิ่มขึ้น</p></div></div>
        <div className="store-grid"><a href="https://www.kinokuniya.co.th" target="_blank" rel="noreferrer"><b>Kinokuniya</b><span>ฉบับภาษาอังกฤษ · หน้าร้านและออนไลน์</span><i>↗</i></a><a href="https://shopee.co.th" target="_blank" rel="noreferrer"><b>Shopee</b><span>หลายร้านค้า · เช็กราคาและรีวิวผู้ขาย</span><i>↗</i></a><a href="https://www.lazada.co.th" target="_blank" rel="noreferrer"><b>Lazada</b><span>ร้านทางการและมาร์เก็ตเพลส</span><i>↗</i></a><a href="https://www.naiin.com" target="_blank" rel="noreferrer"><b>Naiin</b><span>ฉบับแปลไทย · รับที่ร้านได้</span><i>↗</i></a><a href="https://thaimart.com" target="_blank" rel="noreferrer"><b>Thai Mart</b><span>อีกหนึ่งทางเลือกจากร้านค้าไทย</span><i>↗</i></a></div>
        <div className="creator-strip"><div><p className="eyebrow">UGC CREATOR PROGRAM</p><h3>มีหนังสือที่อยากป้ายยา? ชง Cup Review ของคุณเอง</h3><p>ทำคลิป พอดแคสต์ หรือสรุปสั้น ๆ สร้างลิงก์ร้านค้า และรับส่วนแบ่งเมื่อมีคนพบหนังสือที่ใช่ผ่านคอนเทนต์ของคุณ</p></div><a href="#club">BECOME A CUP CURATOR →</a></div>
      </section>

      <section className="community-discovery">
        <div className="community-heading"><p className="eyebrow">DISCOVERED & SHARED BY US</p><h2>ไม่ได้ป้ายยาแค่หนังสือ<br /><em>แต่ป้ายยาชีวิตที่อยากลอง</em></h2><p>ทุกโพสต์เชื่อมสิ่งที่สมาชิกกำลังสนใจเข้ากับหนังสือ พอดแคสต์ คาเฟ่ และเมนูจากร้านที่เข้าร่วมกับเรา</p></div>
        <div className="ugc-grid">
          <article className="ugc-card ugc-book"><div className="ugc-label">BOOK CUP</div><div className="ugc-visual">DEEP<br/>WORK</div><p>“เล่มนี้เหมาะกับวันที่แจ้งเตือนดังจนไม่ได้ยินความคิดตัวเอง”</p><footer><span>by @mildreads</span><b>♡ 128</b></footer></article>
          <article className="ugc-card ugc-cafe"><div className="ugc-label">CAFÉ CUP</div><div className="ugc-visual">☕<small>QUIET<br/>CORNER</small></div><p>“โต๊ะริมหน้าต่าง แสงบ่าย และเมนูไม่หวาน เหมาะกับอ่านบทที่ค้างไว้”</p><footer><span>by @sundaypages</span><b>♡ 94</b></footer></article>
          <article className="ugc-card ugc-podcast"><div className="ugc-label">PODCAST CUP</div><div className="ugc-visual">▶<small>18:42</small></div><p>“เอพิโสดที่ชวนคิดว่า การพักไม่ใช่รางวัล แต่เป็นส่วนหนึ่งของงาน”</p><footer><span>by @slowbetter</span><b>♡ 203</b></footer></article>
        </div>
        <a className="create-post" href="#club">＋ ชงโพสต์ป้ายยาของคุณ</a>
      </section>

      <section className="partner-cafes">
        <div className="partner-head"><div><p className="eyebrow">CUP OF US PARTNER CAFÉS</p><h2>หาร้านและเมนู<br /><em>ที่เข้ากับแก้วของคุณ</em></h2></div><p>ร้านพาร์ตเนอร์สามารถแชร์เมนู กิจกรรมอ่านหนังสือ และสิทธิพิเศษให้สมาชิก พร้อมลิงก์ออกไปดูรีวิว เส้นทาง และ Social ของร้านโดยตรง</p></div>
        <div className="cafe-list">
          <article><div className="cafe-badge blue-cafe">C</div><div><span>ARI · PARTNER SAMPLE</span><h3>Chapter & Cup</h3><p>เหมาะกับ: อ่านเงียบ ๆ · เขียนบันทึก · Deep work</p><div className="menu-pills"><b>Calm Oat Latte</b><b>1% Better Cold Brew</b></div></div><div className="cafe-links"><a href="https://www.google.com/maps/search/cafe+ari+bangkok" target="_blank" rel="noreferrer">Google Maps ↗</a><a href="https://www.google.com/search?q=cafe+ari+bangkok+reviews" target="_blank" rel="noreferrer">Google Reviews ↗</a><a href="#club">Social ↗</a></div></article>
          <article><div className="cafe-badge orange-cafe">U</div><div><span>CHAROEN KRUNG · PARTNER SAMPLE</span><h3>Unfinished Stories</h3><p>เหมาะกับ: Book date · Podcast club · คุยกับคนแปลกหน้า</p><div className="menu-pills"><b>Courage Espresso</b><b>Curious Cocoa</b></div></div><div className="cafe-links"><a href="https://www.google.com/maps/search/cafe+charoen+krung+bangkok" target="_blank" rel="noreferrer">Google Maps ↗</a><a href="https://www.google.com/search?q=cafe+charoen+krung+bangkok+reviews" target="_blank" rel="noreferrer">Google Reviews ↗</a><a href="#club">Social ↗</a></div></article>
        </div>
        <p className="sample-note">* รายชื่อร้านและเมนูในต้นแบบนี้เป็นข้อมูลตัวอย่างสำหรับแสดงรูปแบบแพลตฟอร์ม</p>
      </section>

      <section className="club-section" id="club">
        <div className="club-title"><p className="eyebrow">MORE THAN A BOOK CLUB</p><h2>Cup<br /><i>of Us</i></h2><p>ร้านกาแฟสมมติ ที่เราเอาหนังสือ ความคิด และตัวเองเวอร์ชันที่อยากเป็น มานั่งคุยโต๊ะเดียวกัน</p></div>
        <div className="events">
          <article><time>27 JUL</time><div><span>Sunday Slow Read</span><h3>อ่านช้า ๆ กับหนังสือที่ยังอ่านไม่จบ</h3><p>10:00–12:00 · Online Table</p></div><button type="button">↗</button></article>
          <article><time>03 AUG</time><div><span>One Cup Conversation</span><h3>นิสัยเล็ก ๆ ที่ทำให้ปีนี้ต่างออกไป</h3><p>14:00–15:30 · Bangkok</p></div><button type="button">↗</button></article>
          <article><time>EVERY FRI</time><div><span>Aftertaste Podcast</span><h3>ความคิดที่ยังติดอยู่ หลังปิดหนังสือ</h3><p>20 min · Listen here</p></div><button type="button">▶</button></article>
        </div>
      </section>

      <section className="stories" id="stories">
        <div className="section-head"><div><span className="section-no">02</span><p className="eyebrow">CUPS COLLECTED BY US</p></div><h2>แก้วที่เปลี่ยน<br /><em>อะไรบางอย่าง</em></h2><p>รีวิวสั้น ๆ จากคนที่เคยหยิบหนังสือเล่มนั้นขึ้นมาในเวลาที่พอดี</p></div>
        <div className="note-wall">
          <article className="note blue-note"><span>“</span><p>เล่มนี้ไม่ได้ทำให้ฉัน productive ขึ้นทันที แต่ทำให้เลิกโกรธตัวเองที่เริ่มได้ทีละนิด</p><small>— มายด์ · Cup #018</small></article>
          <article className="note yellow-note"><span>☕</span><p>บางทีเราไม่ได้ขี้เกียจ แค่ระบบรอบตัวทำให้สิ่งที่อยากทำยากเกินไป</p><small>— นัท · Cup #042</small></article>
          <article className="note pink-note"><span>♥</span><p>หนังสือที่ชอบไม่จำเป็นต้องเหมือนกัน แค่ได้ฟังว่าทำไมอีกคนถึงรักมันก็น่าสนุกแล้ว</p><small>— ฟ้า · Cup #067</small></article>
        </div>
      </section>

      <section className="join-section"><div className="join-cup">C</div><div><p className="eyebrow">SAVE A SEAT AT OUR TABLE</p><h2>มาเป็นส่วนหนึ่งของ<br />Cup of Us กันไหม?</h2><p>รับเมนูหนังสือประจำสัปดาห์ บันทึกหลังอ่าน และข่าวกิจกรรมของคลับ</p><form onSubmit={(e) => e.preventDefault()}><input aria-label="อีเมล" placeholder="your@email.com" type="email"/><button type="submit">JOIN THE CLUB →</button></form></div></section>

      <footer><a className="logo footer-logo" href="#top"><span>CUP</span><i>of</i><span>US</span></a><p>Different cups for different us.<br />Better, together.</p><div><a href="#menu">Book Menu</a><a href="#club">Club</a><a href="#stories">Stories</a><a href="#top">Instagram</a></div><small>BREWED WITH CARE IN BANGKOK · 2026</small></footer>
    </main>
  );
}
