"use client";

import { FormEvent, useState } from "react";
import "../account-flow.css";

export default function ResetPasswordPage() {
  const [password,setPassword] = useState("");
  const [confirm,setConfirm] = useState("");
  const [message,setMessage] = useState("");
  const [done,setDone] = useState(false);
  const [busy,setBusy] = useState(false);
  const submit = async(event:FormEvent)=>{
    event.preventDefault();
    if(password!==confirm){setMessage("รหัสผ่านทั้งสองช่องยังไม่ตรงกัน");return}
    setBusy(true);setMessage("");
    const token = new URLSearchParams(window.location.search).get("token");
    const response = await fetch("/api/auth/reset-password",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({token,password})});
    const data = await response.json().catch(()=>({}));
    setBusy(false);setDone(response.ok);setMessage(response.ok?"ตั้งรหัสผ่านใหม่แล้ว กรุณาเข้าสู่ระบบอีกครั้ง":(data.error??"ตั้งรหัสผ่านใหม่ไม่สำเร็จ"));
  };
  return <main className="account-flow-page"><section className="account-flow-card"><p className="eyebrow">CUP OF US · NEW PASSWORD</p><h1>{done?"ส่วนผสมใหม่พร้อมแล้ว":"ตั้งรหัสผ่านใหม่"}</h1>{done?<><p className="status-box success" role="status">{message}</p><a href="/profile">ไปหน้าเข้าสู่ระบบ →</a></>:<form onSubmit={submit}><label>รหัสผ่านใหม่<input type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event)=>setPassword(event.target.value)} required/></label><label>ยืนยันรหัสผ่านใหม่<input type="password" autoComplete="new-password" minLength={8} value={confirm} onChange={(event)=>setConfirm(event.target.value)} required/></label><small>อย่างน้อย 8 ตัว พร้อมตัวอักษรภาษาอังกฤษและตัวเลข</small><button disabled={busy} type="submit">{busy?"กำลังเปลี่ยน...":"ตั้งรหัสผ่านใหม่ →"}</button>{message&&<p className="status-box" role="status">{message}</p>}</form>}</section></main>;
}
