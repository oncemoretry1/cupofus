"use client";

import { usePathname } from "next/navigation";

const tabs=[
  {href:"/",label:"หน้าแรก",icon:"home",match:(path:string)=>path==="/"},
  {href:"/discover",label:"ค้นหา",icon:"search",match:(path:string)=>path.startsWith("/discover")||path.startsWith("/read/")||path.startsWith("/cup/")},
  {href:"/brew",label:"ชงแก้ว",icon:"cup",match:(path:string)=>path.startsWith("/brew")},
  {href:"/club",label:"ชุมชน",icon:"chat",match:(path:string)=>path.startsWith("/club")},
  {href:"/profile",label:"โปรไฟล์",icon:"person",match:(path:string)=>path.startsWith("/profile")},
];

export function MobileTabBar(){const pathname=usePathname();return <nav className="mobile-tab-bar" aria-label="ไดเรกทอรีหลัก">{tabs.map(tab=><a className={tab.match(pathname)?"is-active":""} href={tab.href} aria-label={tab.label} aria-current={tab.match(pathname)?"page":undefined} key={tab.href}><i className={`dock-icon dock-${tab.icon}`} aria-hidden="true"></i><span>{tab.label}</span></a>)}</nav>}
