"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";

type Episode = { id: string; title: string; show: string; author?: string; audioUrl: string; externalUrl?: string; artworkUrl?: string; durationSeconds?: number };
const duration = (seconds?: number) => seconds ? `${Math.round(seconds / 60)} นาที` : "ฟังตอนเต็ม";

export function PodcastShelf({ slug, title, author, spotifyUrl, appleUrl, youtubeUrl, audiobookUrl }: { slug: string; title: string; author: string; spotifyUrl?: string; appleUrl?: string; youtubeUrl: string; audiobookUrl?: string }) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(`/api/podcasts?slug=${encodeURIComponent(slug)}`).then(response => response.json()).then(data => setEpisodes(data.episodes ?? [])).catch(() => setEpisodes([])).finally(() => setLoading(false));
  }, [slug]);
  const play = (episode: Episode) => window.dispatchEvent(new CustomEvent("cup-audio-play", { detail: episode }));

  return <div className="podcast-shelf podcast-native-shelf"><header><span>◉ PODCAST &amp; AUDIO</span><b>ฟังต่อได้แม้เปลี่ยนหน้า</b><small>ค้นหาตอนที่กล่าวถึง “{title}” และ {author} จาก RSS metadata โดยไม่ต้องส่งข้อมูลส่วนตัวหรือใช้ API key</small></header>
    {episodes.length > 0 && <div className="native-episode-list">{episodes.map(episode => <article key={episode.id}>{episode.artworkUrl ? <img src={episode.artworkUrl} alt="" /> : <i>◉</i>}<div><small>{episode.show} · {duration(episode.durationSeconds)}</small><b>{episode.title}</b></div><button onClick={() => play(episode)} type="button" aria-label={`เล่น ${episode.title}`}>▶</button></article>)}</div>}
    {loading && <p className="podcast-loading">กำลังชงตอนที่ตรงกับหนังสือเล่มนี้…</p>}
    {!loading && episodes.length === 0 && <p className="podcast-empty">ยังไม่พบตอนที่ยืนยันไฟล์เสียงได้ แต่คุณยังเปิดผลค้นหาตรงเล่มจากแอปที่ใช้ประจำได้</p>}
    <div className="podcast-provider-links">{spotifyUrl && <a href={spotifyUrl} target="_blank" rel="noreferrer"><i>Spotify</i><b>ค้นหาใน Spotify<small>ชื่อเล่ม + ผู้เขียน</small></b><span>↗</span></a>}<a href={appleUrl || `https://podcasts.apple.com/th/search?term=${encodeURIComponent(`${title} ${author}`)}`} target="_blank" rel="noreferrer"><i>Apple</i><b>Apple Podcasts<small>ผลค้นหาตรงหนังสือ</small></b><span>↗</span></a><a href={youtubeUrl} target="_blank" rel="noreferrer"><i>YouTube</i><b>YouTube Podcast<small>บทสนทนาและสัมภาษณ์</small></b><span>↗</span></a>{audiobookUrl && <a href={audiobookUrl} target="_blank" rel="noreferrer"><i>Audio</i><b>Audiobook<small>หนังสือเสียงฉบับเต็ม</small></b><span>↗</span></a>}</div>
  </div>;
}
