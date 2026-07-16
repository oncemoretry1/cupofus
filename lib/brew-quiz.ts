export type TimeContext = "morning" | "afternoon" | "evening" | "night";
export type TraitKey = "clarity" | "energy" | "courage" | "connection" | "curiosity";
export type BrewAnswer = { questionId:string; optionId:string; label:string };
export type BrewOption = { id:string; label:string; signals:string[]; traits:Partial<Record<TraitKey,number>> };
export type BrewQuestion = { id:string; label:string; prompt:Record<TimeContext,string>; options:BrewOption[] };

export const traitLabels:Record<TraitKey,string> = { clarity:"ความชัดเจน", energy:"พลังลงมือ", courage:"ความกล้า", connection:"การเชื่อมโยง", curiosity:"ความอยากรู้" };

export function getTimeContext(hour:number):TimeContext {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "night";
}

const samePrompt = (morning:string, afternoon:string, evening:string, night:string) => ({ morning, afternoon, evening, night });

export const brewQuestions:BrewQuestion[] = [
  { id:"need", label:"WHAT'S ON YOUR TABLE", prompt:samePrompt("เช้านี้ ใจคุณวางเรื่องอะไรไว้บนโต๊ะ?","บ่ายนี้ เรื่องไหนกำลังแย่งพื้นที่ในหัว?","เย็นนี้ อยากวางเรื่องอะไรลงจากบ่าก่อน?","คืนนี้ มีเรื่องไหนยังไม่นอนตามคุณ?"), options:[
    {id:"start",label:"อยากเริ่มหรือจัดระบบอะไรสักอย่าง",signals:["นิสัย","ระบบ","ลงมือ","งาน","โฟกัส"],traits:{clarity:12,energy:8}},
    {id:"restore",label:"ใจล้า อยากพักและค่อย ๆ ฟื้น",signals:["ใจล้า","หมดไฟ","เยียวยา","ปลอบใจ","พัก","ความหวัง"],traits:{energy:-10,connection:8}},
    {id:"direction",label:"กำลังหาทิศทาง ความหมาย หรือตัวเอง",signals:["ตัวตน","ความหมาย","ชีวิต","อาชีพ","อยากรู้ว่าตัวเองต้องการอะไร"],traits:{clarity:-5,curiosity:14}},
    {id:"relationship",label:"มีเรื่องคนรัก ครอบครัว หรือขอบเขตใจ",signals:["ความสัมพันธ์","ความรัก","การสื่อสาร","ขอบเขต"],traits:{connection:15,courage:4}},
    {id:"future",label:"กังวลเรื่องเงิน งาน หรืออนาคต",signals:["การเงิน","อนาคต","เป้าหมาย","งาน","เวลา"],traits:{clarity:8,energy:-3}},
  ]},
  { id:"energy", label:"ENERGY CHECK", prompt:samePrompt("พลังแรกของวันนี้มาในระดับไหน?","แบตใจตอนบ่ายเหลือกี่ขีด?","หลังผ่านมาทั้งวัน คุณยังมีแรงแบบไหน?","ก่อนพักคืนนี้ ใจรับอะไรไหวแค่ไหน?"), options:[
    {id:"sip",label:"จิบเดียวพอ—ขออะไรสั้นและอ่อนโยน",signals:["short","gentle","soft","comforting","บันทึก"],traits:{energy:-12,connection:7}},
    {id:"slow",label:"อ่านช้า ๆ ผ่านเรื่องเล่าที่พาใจไป",signals:["story","warm","accessible","เรื่องเล่า"],traits:{energy:-3,connection:9,curiosity:4}},
    {id:"steady",label:"มีแรงพอดี—ขอแนวทางที่ทำตามได้",signals:["practical","structured","ระบบ","พฤติกรรม"],traits:{energy:7,clarity:10}},
    {id:"deep",label:"พร้อมคิดลึกและดูข้อมูลหลายด้าน",signals:["research","deep","clinical","ปรัชญา"],traits:{curiosity:13,clarity:5}},
    {id:"bold",label:"เต็มแก้ว—พูดตรง ๆ และเขย่าฉันได้เลย",signals:["direct","provocative","ความกล้า","เปลี่ยนแปลง"],traits:{energy:13,courage:13}},
  ]},
  { id:"window", label:"YOUR READING WINDOW", prompt:samePrompt("วันนี้อยากพกหนังสือไปกับช่วงไหน?","ช่องว่างที่พอมีวันนี้หน้าตาแบบไหน?","เย็นนี้มีพื้นที่ให้ตัวเองเท่าไร?","ถ้ายังไม่นอน คุณอยากอยู่กับเนื้อหาแบบไหน?"), options:[
    {id:"five",label:"5 นาที ระหว่างรอกาแฟหรือรถไฟ",signals:["short","visual","บันทึก","เริ่มเล็ก"],traits:{energy:3,clarity:5}},
    {id:"commute",label:"15–20 นาที อ่านลื่นหรือฟังต่อได้",signals:["story","accessible","dialogue","เรื่องเล่า"],traits:{connection:5,curiosity:5}},
    {id:"lunch",label:"พักหนึ่งช่วง ขอไอเดียที่หยิบใช้ได้",signals:["practical","clear","ระบบ","งาน"],traits:{clarity:11,energy:6}},
    {id:"evening",label:"ครึ่งชั่วโมงเงียบ ๆ เพื่อทบทวนตัวเอง",signals:["reflective","gentle","ตัวตน","ชีวิต"],traits:{clarity:5,curiosity:8}},
    {id:"weekend",label:"พร้อมจมลึกทั้งบทหรือทั้งบ่าย",signals:["research","deep","philosophical","clinical"],traits:{curiosity:14,energy:4}},
  ]},
  { id:"voice", label:"VOICE & FLAVOUR", prompt:samePrompt("อยากให้เสียงแรกของเล่มทักคุณแบบไหน?","ตอนนี้ คุณรับคำแนะนำโทนไหนได้ดีที่สุด?","อยากให้หนังสือนั่งคุยข้าง ๆ แบบไหน?","คืนนี้ อยากได้เสียงแบบไหนอยู่เป็นเพื่อน?"), options:[
    {id:"friend",label:"นุ่ม อุ่น และไม่รีบตัดสิน",signals:["warm","gentle","comforting","compassionate"],traits:{connection:13,courage:-2}},
    {id:"coach",label:"ตรง ชัด เหมือนโค้ชที่ไว้ใจกัน",signals:["direct","clear","leadership","เป้าหมาย"],traits:{clarity:12,courage:7}},
    {id:"storyteller",label:"เล่าผ่านชีวิตคน ให้ฉันค่อย ๆ เห็นเอง",signals:["story","dialogue","accessible","เรื่องเล่า"],traits:{connection:8,curiosity:7}},
    {id:"researcher",label:"มีหลักฐาน งานวิจัย และเหตุผลรองรับ",signals:["research","clinical","พฤติกรรม","จิตวิทยา"],traits:{clarity:8,curiosity:12}},
    {id:"artist",label:"ขี้เล่น เห็นภาพ และชวนทดลอง",signals:["playful","visual","creative","ทดลอง","ไอเดีย"],traits:{curiosity:12,courage:8}},
  ]},
  { id:"arena", label:"LIFE ARENA", prompt:samePrompt("ถ้าวันนี้ดีขึ้นได้หนึ่งมุม อยากให้เป็นมุมไหน?","บ่ายนี้ อยากดึงเรื่องไหนกลับมาอยู่ในมือ?","ก่อนจบวัน อยากดูแลพื้นที่ไหนของชีวิต?","ถ้าพรุ่งนี้เบาขึ้นหนึ่งเรื่อง อยากให้เป็นเรื่องไหน?"), options:[
    {id:"inner",label:"ใจ อารมณ์ และความสัมพันธ์กับตัวเอง",signals:["จิตใจ","เยียวยา","ตัวตน","เมตตา","อารมณ์"],traits:{connection:7,clarity:4}},
    {id:"work",label:"งาน สมาธิ นิสัย และการจัดเวลา",signals:["งาน","สมาธิ","นิสัย","เวลา","โฟกัส"],traits:{clarity:13,energy:8}},
    {id:"people",label:"ความรัก การสื่อสาร และคนรอบตัว",signals:["ความรัก","ความสัมพันธ์","การสื่อสาร","ทีม","ขอบเขต"],traits:{connection:15,courage:3}},
    {id:"create",label:"ความคิดสร้างสรรค์ ความกล้า และผลงาน",signals:["สร้างสรรค์","ไอเดีย","ความกล้า","ชุมชน"],traits:{curiosity:10,courage:12}},
    {id:"resources",label:"เงิน อาชีพ ความหมาย และอนาคต",signals:["การเงิน","อาชีพ","ความหมาย","อนาคต","ชีวิต"],traits:{clarity:8,curiosity:7}},
  ]},
  { id:"move", label:"NEXT SMALL MOVE", prompt:samePrompt("หลังวางแก้ว อยากเริ่มวันนี้ด้วยการขยับแบบไหน?","จากนี้ถึงเย็น อยากเปลี่ยนอะไรได้หนึ่งนิด?","ก่อนพัก อยากมอบอะไรให้ตัวเอง?","พรุ่งนี้เช้า อยากตื่นมาเจอการเปลี่ยนแปลงแบบไหน?"), options:[
    {id:"rest",label:"อนุญาตให้พักโดยไม่รู้สึกผิด",signals:["พัก","คุณภาพ","สังคม","political","self-compassion","เยียวยา","ยอมรับ"],traits:{energy:-7,connection:10}},
    {id:"tiny",label:"เริ่มให้เล็กจนปฏิเสธตัวเองไม่ลง",signals:["เริ่มเล็ก","นิสัย","ลงมือ","พฤติกรรม"],traits:{energy:10,clarity:8}},
    {id:"choose",label:"เลือกสิ่งสำคัญ แล้วปล่อยที่เหลือ",signals:["เลือก","โฟกัส","เวลา","essential"],traits:{clarity:15,courage:5}},
    {id:"speak",label:"พูดสิ่งที่รู้สึกหรือวางขอบเขตหนึ่งอย่าง",signals:["การสื่อสาร","ขอบเขต","ความสัมพันธ์","เปราะบาง"],traits:{courage:12,connection:11}},
    {id:"make",label:"ทำ ทดลอง หรือเผยแพร่อะไรสักชิ้น",signals:["สร้างสรรค์","ทดลอง","ฝึกฝน","ชุมชน","ไอเดีย"],traits:{energy:11,courage:10,curiosity:6}},
  ]},
  { id:"aftertaste", label:"AFTERTASTE", prompt:samePrompt("อยากให้รสอะไรอยู่กับคุณไปตลอดวันนี้?","อยากให้ความคิดไหนพาคุณผ่านช่วงที่เหลือ?","คืนนี้ อยากพาความรู้สึกไหนกลับบ้าน?","ก่อนหลับ อยากวางประโยคไหนไว้ข้างหมอน?"), options:[
    {id:"calm",label:"ฉันไม่ต้องรีบ และยังมีความหวัง",signals:["ความหวัง","ปลอบใจ","ยอมรับ","gentle"],traits:{connection:10,energy:-2}},
    {id:"clear",label:"ฉันรู้ว่าอะไรสำคัญและจะเริ่มตรงไหน",signals:["โฟกัส","ระบบ","เป้าหมาย","practical"],traits:{clarity:16,energy:7}},
    {id:"brave",label:"ฉันเลือกชีวิตตัวเองและรับเสียงไม่เห็นด้วยได้",signals:["อิสระ","ความกล้า","ตัวตน","direct"],traits:{courage:17,clarity:4}},
    {id:"together",label:"ฉันไม่ต้องเข้าใจหรือผ่านทุกอย่างคนเดียว",signals:["ความสัมพันธ์","ความรัก","เมตตา","warm"],traits:{connection:17}},
    {id:"wonder",label:"ฉันยังเรียนรู้ เปลี่ยนใจ และสร้างทางใหม่ได้",signals:["เรียนรู้","อยากรู้","สร้างสรรค์","curious","meaning"],traits:{curiosity:17,courage:5}},
  ]},
];

export function findBrewOption(answer:BrewAnswer) {
  return brewQuestions.find((question) => question.id === answer.questionId)?.options.find((option) => option.id === answer.optionId);
}

export function buildPersonality(answers:BrewAnswer[]) {
  const scores:Record<TraitKey,number> = { clarity:35, energy:35, courage:35, connection:35, curiosity:35 };
  for (const answer of answers) {
    const option = findBrewOption(answer);
    if (!option) continue;
    for (const key of Object.keys(option.traits) as TraitKey[]) scores[key] += option.traits[key] ?? 0;
  }
  for (const key of Object.keys(scores) as TraitKey[]) scores[key] = Math.max(12, Math.min(96, scores[key]));
  const sorted = (Object.keys(scores) as TraitKey[]).sort((a,b) => scores[b] - scores[a]);
  return {
    scores,
    strongest:sorted.slice(0,2),
    growing:sorted.slice(-2).reverse(),
    summary:`ช่วงนี้คุณเด่นเรื่อง${traitLabels[sorted[0]]}และ${traitLabels[sorted[1]]} ส่วน${traitLabels[sorted.at(-1)!]}คือส่วนผสมที่ควรค่อย ๆ เติม ไม่ใช่ข้อด้อยถาวร`,
  };
}

export const promptFor = (question:BrewQuestion, context:TimeContext) => question.prompt[context];
