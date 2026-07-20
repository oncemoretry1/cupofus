"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";

type AudioTrack = { id: string; title: string; show: string; author?: string; audioUrl: string; externalUrl?: string; artworkUrl?: string };
const format = (seconds: number) => Number.isFinite(seconds) ? `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}` : "0:00";

export function GlobalAudioDock() {
  const audio = useRef<HTMLAudioElement>(null);
  const [track, setTrack] = useState<AudioTrack | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const stored = sessionStorage.getItem("cup-of-us-audio");
    if (stored) {
      try { setTrack(JSON.parse(stored) as AudioTrack); } catch { sessionStorage.removeItem("cup-of-us-audio"); }
    }
    const receive = (event: Event) => {
      const next = (event as CustomEvent<AudioTrack>).detail;
      if (!next?.audioUrl) return;
      setTrack(next);
      sessionStorage.setItem("cup-of-us-audio", JSON.stringify(next));
      window.setTimeout(() => audio.current?.play().catch(() => setPlaying(false)), 0);
    };
    window.addEventListener("cup-audio-play", receive);
    return () => window.removeEventListener("cup-audio-play", receive);
  }, []);

  useEffect(() => {
    if (!track || !("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.author || track.show,
      album: `Cup of Us · ${track.show}`,
      artwork: track.artworkUrl ? [{ src: track.artworkUrl, sizes: "600x600" }] : undefined,
    });
    navigator.mediaSession.setActionHandler("play", () => audio.current?.play());
    navigator.mediaSession.setActionHandler("pause", () => audio.current?.pause());
    navigator.mediaSession.setActionHandler("seekbackward", details => { if (audio.current) audio.current.currentTime = Math.max(0, audio.current.currentTime - (details.seekOffset || 15)); });
    navigator.mediaSession.setActionHandler("seekforward", details => { if (audio.current) audio.current.currentTime = Math.min(audio.current.duration || Infinity, audio.current.currentTime + (details.seekOffset || 30)); });
    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("seekbackward", null);
      navigator.mediaSession.setActionHandler("seekforward", null);
    };
  }, [track]);

  if (!track) return null;
  const close = () => { audio.current?.pause(); sessionStorage.removeItem("cup-of-us-audio"); setTrack(null); setPlaying(false); };
  return <aside className="global-audio-dock" aria-label="เครื่องเล่นพอดแคสต์">
    <audio ref={audio} src={track.audioUrl} preload="metadata" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onTimeUpdate={event => setCurrent(event.currentTarget.currentTime)} onLoadedMetadata={event => setDuration(event.currentTarget.duration)} onEnded={() => setPlaying(false)} />
    <button className="global-audio-play" onClick={() => playing ? audio.current?.pause() : audio.current?.play()} type="button" aria-label={playing ? "พักเสียง" : "เล่นเสียง"}>{playing ? "Ⅱ" : "▶"}</button>
    {track.artworkUrl ? <img src={track.artworkUrl} alt="" /> : <span className="global-audio-art">◉</span>}
    <div className="global-audio-copy"><small>กำลังฟังใน Cup of Us</small><strong>{track.title}</strong><span>{track.show}</span></div>
    <label className="global-audio-progress"><span>{format(current)}</span><input aria-label="เลื่อนตำแหน่งเสียง" type="range" min="0" max={duration || 1} value={Math.min(current, duration || 1)} onChange={event => { if (audio.current) audio.current.currentTime = Number(event.target.value); }} /><span>{format(duration)}</span></label>
    {track.externalUrl && <a href={track.externalUrl} target="_blank" rel="noreferrer" aria-label="เปิดหน้าตอนพอดแคสต์">↗</a>}
    <button className="global-audio-close" onClick={close} type="button" aria-label="ปิดเครื่องเล่น">×</button>
  </aside>;
}
