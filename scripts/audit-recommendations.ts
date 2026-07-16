import { DatabaseSync } from "node:sqlite";
import { brewQuestions, type BrewAnswer, type TimeContext } from "../lib/brew-quiz";
import { rankBooks, type RecommendationBook } from "../lib/recommend-books";

const databasePath = process.argv[2];
if (!databasePath) throw new Error("Pass the local D1 sqlite path");
const database = new DatabaseSync(databasePath,{readOnly:true});
const books = database.prepare("select slug,tags,concerns,personality,summary from books order by id").all() as RecommendationBook[];
const contexts:TimeContext[] = ["morning","afternoon","evening","night"];
const winners = new Map<string,number>();
let seed = 20260716;
const random = () => ((seed = (Math.imul(seed,1664525)+1013904223)>>>0) / 4294967296);
const sampleCount = 5_000;
for (let iteration=0; iteration<sampleCount; iteration+=1) {
  const sample:BrewAnswer[] = brewQuestions.map((question)=>{
    const option = question.options[Math.floor(random()*question.options.length)];
    return {questionId:question.id,optionId:option.id,label:option.label};
  });
  for (const context of contexts) {
    const winner = rankBooks(books,sample,context)[0].slug;
    winners.set(winner,(winners.get(winner)??0)+1);
  }
}
const missing = books.map((book)=>book.slug).filter((slug)=>!winners.has(slug));
console.log(JSON.stringify({books:books.length,sampled:contexts.length*sampleCount,totalPossible:contexts.length*(5**brewQuestions.length),covered:winners.size,missing,least:[...winners].sort((a,b)=>a[1]-b[1]).slice(0,10),most:[...winners].sort((a,b)=>b[1]-a[1]).slice(0,10)},null,2));
if (missing.length) process.exitCode = 1;
