"use client";

import { useEffect, useState } from "react";
import "../account-flow.css";

export default function VerifyEmailPage() {
  const [status,setStatus] = useState<"checking"|"success"|"error">("checking");
  const [message,setMessage] = useState("กำลังตรวจลิงก์ยืนยันของคุณ...");
  useEffect(()=>{
    const token = new URLSearchParams(window.location.search).get("token");
    fetch("/api/auth/verify-email",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({token})}).then(async(response)=>({ok:response.ok,data:await response.json()})).then(({ok,data})=>{setStatus(ok?"success":"error");setMessage(ok?"ยืนยันอีเมลแล้ว แก้วของคุณพร้อมเดินทางข้ามอุปกรณ์":""+(data.error??"ยืนยันอีเมลไม่สำเร็จ"))}).catch(()=>{setStatus("error");setMessage("เชื่อมต่อระบบยืนยันอีเมลไม่ได้")});
  },[]);
  return <main className="account-flow-page"><section className="account-flow-card"><p className="eyebrow">CUP OF US · EMAIL CHECK</p><h1>{status==="success"?"ยืนยันแก้วของคุณแล้ว ✓":status==="error"?"ลิงก์นี้ใช้ไม่ได้แล้ว":"กำลังตรวจส่วนผสม..."}</h1><p className={`status-box ${status==="success"?"success":""}`} role="status">{message}</p><a href="/profile">กลับไปที่โปรไฟล์ →</a></section></main>;
}
