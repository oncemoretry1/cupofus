"use client";

import { usePathname } from "next/navigation";

const tabs=[
  {href:"/",label:"หน้าแรก",icon:"⌂",match:(path:string)=>path==="/"},
  {href:"/discover",label:"คลัง 50 เล่ม",icon:"▤",match:(path:string)=>path.startsWith("/discover")||path.startsWith("/read/")||path.startsWith("/cup/")},
  {href:"/brew",label:"ชงแก้ว",icon:"☕",match:(path:string)=>path.startsWith("/brew")},
  {href:"/club",label:"Cup Club",icon:"✦",match:(path:string)=>path.startsWith("/club")},
  {href:"/profile",label:"แก้วของฉัน",icon:"♡",match:(path:string)=>path.startsWith("/profile")},
];

export function MobileTabBar(){const pathname=usePathname();return <nav className="mobile-tab-bar" aria-label="เมนูหลักสำหรับมือถือ">{tabs.map(tab=><a className={tab.match(pathname)?"is-active":""} href={tab.href} aria-current={tab.match(pathname)?"page":undefined} key={tab.href}><i aria-hidden="true">{tab.icon}</i><span>{tab.label}</span></a>)}</nav>}
