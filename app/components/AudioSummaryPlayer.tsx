"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

export function AudioSummaryPlayer({ title, text }: { title: string; text: string }) {
  const duration = useMemo(() => Math.max(38, Math.round(text.length / 7.2)), [text]);
  const [state, setState] = useState<"idle" | "playing" | "paused" | "ended">("idle");
  const [elapsed, setElapsed] = useState(0);
  const timer = useRef<number | null>(null);

  const clearTimer = () => {
    if (timer.current !== null) window.clearInterval(timer.current);
    timer.current = null;
  };

  const startTimer = () => {
    clearTimer();
    timer.current = window.setInterval(() => {
      setElapsed((value) => Math.min(duration, value + 1));
    }, 1000);
  };

  const playFromStart = () => {
    window.speechSynthesis.cancel();
    setElapsed(0);
    const utterance = new SpeechSynthesisUtterance(`${title}. ${text}`);
    utterance.lang = "th-TH";
    utterance.rate = 0.86;
    utterance.onend = () => {
      clearTimer();
      setElapsed(duration);
      setState("ended");
    };
    utterance.onerror = () => {
      clearTimer();
      setState("idle");
    };
    window.speechSynthesis.speak(utterance);
    setState("playing");
    startTimer();
  };

  const toggle = () => {
    if (state === "playing") {
      window.speechSynthesis.pause();
      clearTimer();
      setState("paused");
      return;
    }
    if (state === "paused") {
      window.speechSynthesis.resume();
      setState("playing");
      startTimer();
      return;
    }
    playFromStart();
  };

  useEffect(() => () => {
    clearTimer();
    window.speechSynthesis.cancel();
  }, []);

  const progress = Math.min(100, (elapsed / duration) * 100);
  return (
    <div className={`audio-summary-player ${state === "playing" ? "is-playing" : ""}`}>
      <button className="audio-toggle" type="button" onClick={toggle} aria-label={state === "playing" ? "พักเสียง" : "เล่นเสียง"}>
        {state === "playing" ? "Ⅱ" : "▶"}
      </button>
      <div className="audio-track-copy">
        <span>AUDIO SUMMARY</span>
        <strong>{title}</strong>
        <div className="audio-timeline" aria-label={`เล่นไป ${formatTime(elapsed)} จาก ${formatTime(duration)}`}>
          <i style={{ width: `${progress}%` }}></i>
        </div>
        <div className="audio-time"><time>{formatTime(elapsed)}</time><time>-{formatTime(Math.max(0, duration - elapsed))}</time></div>
      </div>
      <div className="audio-duration"><b>{formatTime(duration)}</b><small>ความยาวโดยประมาณ</small></div>
    </div>
  );
}
