import { getDb } from "../../../db";
import { books } from "../../../db/schema";

const signals:Record<string,string[]>={
  "คิดเยอะจนไม่เริ่ม":["นิสัย","ลงมือ","เริ่ม"],"เหนื่อยกับความคาดหวัง":["เยียวยา","ปลอบใจ","ยอมรับ"],"อยากรู้ว่าตัวเองต้องการอะไร":["ชีวิต","ตัวตน","ความหมาย"],"ความสัมพันธ์กำลังสับสน":["ความสัมพันธ์","ความรัก","การสื่อสาร"],"เงินและอนาคต":["การเงิน","เวลา","อนาคต"],
  "งานและเป้าหมาย":["งาน","โฟกัส","เป้าหมาย"],"ความคิดสร้างสรรค์":["สร้างสรรค์","ไอเดีย","กล้า"],"การเงินและความมั่นคง":["การเงิน","พฤติกรรม","ชีวิต"],"เรื่องเล่าอ่านลื่น":["story","เรื่องเล่า"],"ไอเดียพร้อมใช้ทันที":["practical","ระบบ"],"งานวิจัยและกรณีศึกษา":["research","ข้อมูล"],"บทสั้น ๆ อ่านได้ทุกวัน":["short","บันทึก"]
};
export async function POST(request:Request){const body=await request.json().catch(()=>({}));const answers=Array.isArray(body.answers)?body.answers.map(String):[];const rows=await getDb().select().from(books);const ranked=rows.map(book=>{const hay=`${book.tags} ${book.concerns} ${book.personality} ${book.summary}`.toLowerCase();let score=0;for(const answer of answers){if(hay.includes(answer.toLowerCase()))score+=5;for(const token of signals[answer]??[])if(hay.includes(token.toLowerCase()))score+=2}return {...book,matchScore:score}}).sort((a,b)=>b.matchScore-a.matchScore||a.readingMinutes-b.readingMinutes).slice(0,5);return Response.json({recommendations:ranked,answers});}
