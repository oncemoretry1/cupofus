import { BookEntrance } from "../../components/BookEntrance";
import { BookInfographic } from "../../components/BookInfographic";

const chapters = [
  ["opening", "ก่อนเริ่มจิบ"],
  ["idea", "ไอเดียหลัก"],
  ["laws", "กฎ 4 ข้อ"],
  ["practice", "ลองทำวันนี้"],
  ["aftertaste", "Aftertaste"],
];

export default function ReadAtomicHabits() {
  return <main className="reader-page"><BookEntrance title="Atomic Habits" author="James Clear" color="#f5e545"/>
    <nav className="reader-top"><a className="logo" href="/"><span>CUP</span><i>of</i><span>US</span></a><a href="/discover">← กลับไปหน้า Discover</a></nav>
    <aside className="reader-directory"><p>บทสรุป 5 นาที</p><h2>Atomic<br/>Habits</h2><div className="read-progress"><i></i></div><nav>{chapters.map(([id,label],index)=><a href={`#${id}`} key={id}><span>0{index+1}</span>{label}</a>)}</nav><div className="directory-actions"><a href="/cup/atomic-habits#listen">▶ ฟังบทสรุป</a><a href="https://www.naiin.com/product/detail/508699" target="_blank" rel="noreferrer sponsored">ซื้อ Atomic Habits ↗</a></div></aside>
    <article className="reader-content">
      <header><p className="eyebrow">CUP OF TINY STARTS · JAMES CLEAR</p><h1>เปลี่ยนชีวิต<br/><em>ทีละ 1%</em></h1><p className="reader-deck">บทสรุปแนวคิดทั้งเล่มสำหรับวันที่อยากเริ่ม แต่ไม่อยากกดดันตัวเองให้เปลี่ยนทุกอย่างพร้อมกัน</p><div className="reader-meta"><span>อ่าน 5 นาที</span><span>Self Enrichment</span><span>ฉบับสรุปโดย Cup of Us</span></div></header>
      <section id="opening"><span className="chapter-no">01</span><h2>ก่อนเริ่มจิบ</h2><p>การเปลี่ยนแปลงครั้งใหญ่ไม่จำเป็นต้องเริ่มจากแรงฮึดครั้งใหญ่ หนังสือชวนให้มองนิสัยเป็นผลสะสมของการเลือกเล็ก ๆ ที่ทำซ้ำ จนวันหนึ่งระยะห่างเพียงเล็กน้อยกลายเป็นผลลัพธ์ที่ต่างกันมาก</p><blockquote>แก้วนี้ไม่ได้ถามว่า “วันนี้เก่งพอหรือยัง” แต่ถามว่า “วันนี้เทคะแนนให้คนที่อยากเป็นหรือยัง”</blockquote></section>
      <section id="idea"><span className="chapter-no">02</span><h2>เริ่มจากตัวตน ไม่ใช่แค่เป้าหมาย</h2><BookInfographic title="Atomic Habits" summary="นิสัยเล็กคือคะแนนเสียงให้ตัวตนที่เราอยากเป็น ระบบที่ทำซ้ำได้จึงสำคัญกว่าแรงฮึดชั่วคราว" tags={["ตัวตน","ระบบ","ทำซ้ำ"]} concerns={["คิดเยอะจนไม่เริ่ม","อยากมีวินัย"]} action="เลือกนิสัยหนึ่งอย่าง ลดให้เหลือ 2 นาที แล้ววางสัญญาณไว้ตรงหน้า"/><p>แทนที่จะตั้งต้นด้วยสิ่งที่อยากได้ ให้เริ่มจากคนที่อยากเป็น เช่น จาก “อยากอ่านหนังสือให้จบ” เป็น “ฉันเป็นคนที่อ่านทุกวัน” การกระทำเล็กแต่ละครั้งจึงเป็นหลักฐานยืนยันตัวตนนั้น</p><div className="idea-card"><b>เป้าหมาย</b><span>บอกทิศทาง</span><b>ระบบ</b><span>พาเราเดินต่อ</span><b>ตัวตน</b><span>ทำให้การเดินนั้นเป็นส่วนหนึ่งของเรา</span></div></section>
      <section id="laws"><span className="chapter-no">03</span><h2>กฎ 4 ข้อของนิสัยที่อยู่ได้นาน</h2><ol><li><b>ทำให้เห็นชัด</b><p>วางสัญญาณของนิสัยใหม่ไว้ตรงหน้า เช่น วางหนังสือบนหมอนก่อนออกจากห้อง</p></li><li><b>ทำให้น่าดึงดูด</b><p>จับคู่สิ่งที่ควรทำกับสิ่งที่ชอบ เช่น อ่านพร้อมกาแฟแก้วโปรด</p></li><li><b>ทำให้ง่าย</b><p>ลดแรงเสียดทานและเริ่มให้เล็กพอ เช่น อ่านเพียงสองหน้า</p></li><li><b>ทำให้น่าพอใจ</b><p>สร้างรางวัลทันทีและมองเห็นความต่อเนื่องของตัวเอง</p></li></ol></section>
      <section id="practice"><span className="chapter-no">04</span><h2>ลองทำวันนี้</h2><div className="practice-box"><p>เลือกนิสัยหนึ่งอย่าง แล้วเติมประโยคนี้</p><strong>หลังจากฉัน ________<br/>ฉันจะ ________ เป็นเวลา 2 นาที<br/>ที่ ________</strong><small>ตัวอย่าง: หลังชงกาแฟ ฉันจะอ่านสองหน้า ที่โต๊ะริมหน้าต่าง</small></div></section>
      <section id="aftertaste"><span className="chapter-no">05</span><h2>รสที่ยังเหลืออยู่</h2><p>อย่าตัดสินตัวเองจากวันที่หลุดหนึ่งวัน สิ่งสำคัญคือกลับมาให้เร็วและไม่ปล่อยให้พลาดติดกัน ระบบที่อ่อนโยนพอจะเริ่มใหม่ได้ มักอยู่กับเราได้นานกว่าความสมบูรณ์แบบ</p><div className="end-cup">1%<small>better<br/>every day</small></div><a className="reader-next" href="/discover">ค้นหาแก้วถัดไป →</a></section>
    </article>
  </main>;
}
