"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState, type CSSProperties } from "react";
import "./profile.css";
import "./onboarding.css";

type Cup = { id:number; cupName:string; bookSlug:string; bookTitle:string; coverColor:string; answers:string };
type User = { id:number; email:string; displayName:string };

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [draft, setDraft] = useState("");
  const guestId = useRef("");
  const [cups, setCups] = useState<Cup[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authName, setAuthName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  const load = async (id: string) => {
    const [profile, cupData] = await Promise.all([
      fetch(`/api/profile?guestId=${encodeURIComponent(id)}`).then((response) => response.json()),
      fetch(`/api/saved-cups?guestId=${encodeURIComponent(id)}`).then((response) => response.json()),
    ]);
    const displayName = profile.profile?.displayName ?? profile.user?.displayName ?? "";
    setName(displayName);
    setDraft(displayName);
    setCups(cupData.cups ?? []);
    setLoading(false);
  };

  useEffect(() => {
    let id = localStorage.getItem("cup-of-us-guest");
    if (!id) {
      id = `guest-${crypto.randomUUID()}`;
      localStorage.setItem("cup-of-us-guest", id);
    }
    guestId.current = id;
    fetch("/api/auth/session").then((response) => response.json()).then((data) => {
      setUser(data.user ?? null);
      return load(id);
    }).catch(() => load(id));
  }, []);

  const save = async () => {
    const value = draft.trim();
    if (!value) return;
    const response = await fetch("/api/profile", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({ guestId:guestId.current, displayName:value }) });
    if (response.ok) {
      setName(value);
      localStorage.setItem("cup-of-us-name", value);
    }
  };

  const authenticate = async (event: FormEvent) => {
    event.preventDefault();
    setAuthBusy(true);
    setAuthMessage("");
    try {
      const response = await fetch(`/api/auth/${authMode}`, { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({ email, password, displayName:authName, guestId:guestId.current }) });
      const data = await response.json().catch(() => ({ error:"ระบบบัญชียังไม่พร้อม ลองใหม่อีกครั้งนะ" }));
      if (!response.ok) {
        setAuthMessage(data.error ?? "ยังเข้าสู่ระบบไม่ได้ ลองอีกครั้งนะ");
        return;
      }
      setUser(data.user);
      setPassword("");
      setAuthMessage("ย้ายแก้วจากอุปกรณ์นี้เข้าบัญชีให้แล้ว ✓");
      await load(guestId.current);
    } catch {
      setAuthMessage("เชื่อมต่อระบบบัญชีไม่ได้ ลองใหม่อีกครั้งนะ");
    } finally {
      setAuthBusy(false);
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method:"POST" });
    setUser(null);
    setAuthMode("login");
    setPassword("");
    setAuthMessage("ออกจากระบบแล้ว แก้วในเครื่องนี้ยังอยู่เหมือนเดิม");
    await load(guestId.current);
  };

  return <main className="profile-page">
    <Link className="logo" href="/"><span>CUP</span><i>of</i><span>US</span></Link>
    <section>
      <div className="account-panel">
        {user ? <div className="signed-in-account"><span className="account-cup" aria-hidden="true"><i></i></span><div><p className="eyebrow">CUP OF US MEMBER</p><strong>{user.displayName}</strong><small>{user.email} · ซิงก์แก้วข้ามอุปกรณ์แล้ว</small></div><button onClick={logout} type="button">ออกจากระบบ</button></div> : <div className="auth-account">
          <div className="auth-account-copy"><p className="eyebrow">OPTIONAL MEMBER ACCOUNT</p><h2>เก็บแก้วไว้<br/>ไม่ว่าจะเปิดจากที่ไหน</h2><p>ใช้ต่อแบบ Guest ได้เสมอ หรือเข้าสู่ระบบเพื่อย้ายแก้วและประวัติจากเครื่องนี้เข้าบัญชี</p></div>
          <div className="auth-form-wrap"><div className="auth-tabs"><button className={authMode==="login"?"active":""} onClick={()=>{setAuthMode("login");setAuthMessage("")}} type="button">เข้าสู่ระบบ</button><button className={authMode==="signup"?"active":""} onClick={()=>{setAuthMode("signup");setAuthMessage("")}} type="button">สมัครสมาชิก</button></div><form onSubmit={authenticate}>{authMode==="signup"&&<label>ชื่อที่อยากให้เรียก<input value={authName} onChange={(event)=>setAuthName(event.target.value)} autoComplete="name" required maxLength={60}/></label>}<label>อีเมล<input value={email} onChange={(event)=>setEmail(event.target.value)} type="email" autoComplete="email" required/></label><label>รหัสผ่าน<input value={password} onChange={(event)=>setPassword(event.target.value)} type="password" autoComplete={authMode==="login"?"current-password":"new-password"} minLength={8} required/></label>{authMode==="signup"&&<small>อย่างน้อย 8 ตัว มีตัวอักษรและตัวเลข</small>}<button className="auth-submit" disabled={authBusy} type="submit">{authBusy?"กำลังชงบัญชี...":authMode==="login"?"เข้าสู่ระบบ →":"สร้างบัญชี →"}</button>{authMessage&&<p className="auth-message" role="status">{authMessage}</p>}</form></div>
        </div>}
      </div>

      {loading ? <p>กำลังหยิบแก้วของคุณ...</p> : name ? <>
        <p className="eyebrow">MY CUP PROFILE · {user?"SYNCED ACCOUNT":"THIS DEVICE"}</p>
        <h1>สวัสดี {name} ☺</h1>
        <p>{user?"แก้วของคุณเชื่อมกับบัญชีแล้ว สามารถเปิดจากอุปกรณ์อื่นและเข้าสู่ระบบด้วยอีเมลเดิมได้":"คุณกำลังใช้แบบ Guest แก้วจะผูกกับอุปกรณ์นี้จนกว่าจะสมัครหรือเข้าสู่ระบบ"}</p>
        <div className="profile-stats"><div><b>{cups.length}</b><span>แก้วที่เก็บไว้</span></div><div><b>7</b><span>ส่วนผสมต่อแก้ว</span></div><div><b>50</b><span>หนังสือในตู้</span></div></div>
        <h2>แก้วของฉัน</h2>
        {cups.length ? <div className="saved-cup-list">{cups.map((cup)=><a href={`/cup/${cup.bookSlug}`} key={cup.id} style={{"--saved-color":cup.coverColor} as CSSProperties}><i></i><div><b>{cup.cupName}</b><span>{cup.bookTitle}</span></div><strong>→</strong></a>)}</div> : <p className="empty-profile">ยังไม่มีแก้วที่เก็บไว้ — ลองชงหรือเปิดหนังสือแล้วกด “เก็บแก้วนี้”</p>}
        <div className="profile-actions"><a href="/brew">ชงแก้วใหม่</a><a href="/discover">ค้นหนังสือ</a></div>
      </> : <>
        <p className="eyebrow">KEEP YOUR CUPS AS A GUEST</p><h1>เรียกคุณว่าอะไรดี?</h1><p>ตั้งชื่อสั้น ๆ เพื่อเริ่มเก็บแก้วบนอุปกรณ์นี้ก่อนได้ แล้วค่อยสมัครสมาชิกเมื่อพร้อม</p><div className="local-signup"><input value={draft} onChange={(event)=>setDraft(event.target.value)} onKeyDown={(event)=>event.key==="Enter"&&save()} placeholder="ชื่อหรือ nickname" aria-label="ชื่อโปรไฟล์"/><button onClick={save} type="button">เริ่มเก็บแก้ว →</button></div><small>ไม่จำเป็นต้องสมัครสมาชิกเพื่อชงแก้วหรืออ่านบทสรุป</small>
      </>}
    </section>
  </main>;
}
