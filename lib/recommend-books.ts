import { findBrewOption, type BrewAnswer, type TimeContext } from "./brew-quiz";

export type RecommendationBook = { slug:string; tags:string; concerns:string; personality:string; summary:string; [key:string]:unknown };

const timeSignals:Record<TimeContext,string[]> = {
  morning:["practical","นิสัย","โฟกัส","เริ่ม"],
  afternoon:["งาน","ระบบ","accessible","สมาธิ"],
  evening:["reflective","ความสัมพันธ์","ชีวิต","story"],
  night:["gentle","deep","ปลอบใจ","ปรัชญา"],
};

function stableHash(value:string) {
  let hash = 2166136261;
  for (let index=0; index<value.length; index+=1) hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  return hash >>> 0;
}

export function rankBooks<T extends RecommendationBook>(rows:T[], answers:BrewAnswer[], context:TimeContext) {
  const selected = answers.map(findBrewOption).filter(Boolean);
  const requestedSignals = [...selected.flatMap((option)=>option?.signals??[]), ...timeSignals[context]];
  const signature = `${context}:${answers.map((answer)=>`${answer.questionId}.${answer.optionId}`).join("|")}`;
  const signalWeights = new Map(requestedSignals.map((signal)=>{
    const frequency = rows.filter((book)=>`${book.tags},${book.concerns},${book.personality},${book.summary}`.toLowerCase().includes(signal.toLowerCase())).length || rows.length;
    return [signal,4+Math.round(12/Math.sqrt(frequency))] as const;
  }));
  return rows.map((book)=>{
    const haystack = `${book.tags},${book.concerns},${book.personality},${book.summary}`.toLowerCase();
    const signalScore = requestedSignals.reduce((score,signal)=>score+(haystack.includes(signal.toLowerCase())?(signalWeights.get(signal)??4):0),0);
    const concernBonus = selected[0]?.signals.some((signal)=>String(book.concerns).toLowerCase().includes(signal.toLowerCase())) ? 18 : 0;
    const textureBonus = selected[3]?.signals.some((signal)=>String(book.personality).toLowerCase().includes(signal.toLowerCase())) ? 10 : 0;
    // A deterministic discovery component prevents the same bestseller from
    // winning every nearby answer set while semantic matches still lead.
    const discoveryBonus = stableHash(`${book.slug}:${signature}`) % 80;
    return {...book,matchScore:signalScore+concernBonus+textureBonus+discoveryBonus};
  }).sort((a,b)=>b.matchScore-a.matchScore||stableHash(`${a.slug}:${signature}`)-stableHash(`${b.slug}:${signature}`));
}
