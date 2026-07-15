type InfographicProps = { title: string; summary: string; tags: string[]; concerns: string[]; action?: string };

export function BookInfographic({ title, summary, tags, concerns, action }: InfographicProps) {
  const focus = tags.slice(0, 3);
  return <figure className="book-infographic" aria-label={`ภาพสรุปแนวคิดของ ${title}`}>
    <figcaption><span>ONE-PAGE INFOGRAPHIC</span><strong>{title} in one cup</strong><small>อ่านภาพนี้ก่อน แล้วค่อยลงไปจิบรายละเอียดด้านล่าง</small></figcaption>
    <div className="infographic-flow">
      <article className="infographic-problem"><i>01</i><span>สิ่งที่แก้วนี้ช่วยมอง</span><b>{concerns.slice(0, 2).join(" · ") || "ความรู้สึกที่ยังไม่ชัด"}</b></article><em>→</em>
      <article className="infographic-lens"><i>02</i><span>เลนส์สำคัญของเล่ม</span><b>{focus.join(" · ")}</b></article><em>→</em>
      <article className="infographic-action"><i>03</i><span>ลองทำในหนึ่งวัน</span><b>{action || `เลือก “${focus[0]}” หนึ่งเรื่อง แล้วทดลองเพียง 10 นาที`}</b></article>
    </div>
    <div className="infographic-aftertaste"><span>AFTERTASTE</span><p>{summary}</p><div className="infographic-mini-cup"><i></i><b>cup<br/><small>of us</small></b></div></div>
  </figure>;
}
