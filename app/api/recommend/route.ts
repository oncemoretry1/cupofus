import { getDb } from "../../../db";
import { books } from "../../../db/schema";
import { brewQuestions, buildPersonality, type BrewAnswer, type TimeContext } from "../../../lib/brew-quiz";
import { rankBooks } from "../../../lib/recommend-books";

function normalizeAnswers(raw:unknown[]):BrewAnswer[] {
  return raw.map((answer,index) => {
    if (answer && typeof answer === "object") {
      const item = answer as Partial<BrewAnswer>;
      return { questionId:String(item.questionId??""), optionId:String(item.optionId??""), label:String(item.label??"") };
    }
    const label = String(answer??"");
    const match = brewQuestions.flatMap((question)=>question.options.map((option)=>({question,option}))).find(({option})=>option.label===label);
    return { questionId:match?.question.id??`legacy-${index}`, optionId:match?.option.id??label, label };
  }).filter((answer)=>answer.label);
}

export async function POST(request:Request) {
  const body = await request.json().catch(()=>({}));
  const answers = normalizeAnswers(Array.isArray(body.answers)?body.answers:[]);
  const context = (["morning","afternoon","evening","night"].includes(body.timeContext)?body.timeContext:"afternoon") as TimeContext;
  const rows = await getDb().select().from(books);
  const excluded = new Set(Array.isArray(body.excludeSlugs)?body.excludeSlugs.map(String):[]);
  const preference = ["lighter","deeper"].includes(body.preference)?String(body.preference):"change";
  const ranked = rankBooks(rows,answers,context).filter((book)=>!excluded.has(book.slug)).map((book)=>{
    const personality = String(book.personality).toLowerCase();
    const preferenceScore = preference === "lighter" ? ((/gentle|soft|short|warm|accessible|playful/.test(personality)?28:0)-book.readingMinutes/90) : preference === "deeper" ? ((/deep|research|philosophical|clinical|reflective/.test(personality)?28:0)+book.readingMinutes/150) : 0;
    return {...book,matchScore:book.matchScore+preferenceScore};
  }).sort((a,b)=>b.matchScore-a.matchScore).slice(0,5);
  return Response.json({ recommendations:ranked, answers, timeContext:context, personality:buildPersonality(answers) });
}
