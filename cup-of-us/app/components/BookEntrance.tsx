"use client";

import { useEffect, useState } from "react";

export function BookEntrance({ title, author, color }: { title: string; author: string; color: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 1750);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;
  return (
    <div className="book-entrance" style={{ "--entrance-color": color } as React.CSSProperties} aria-hidden="true">
      <div className="book-entrance-card">
        <small>{author}</small>
        <strong>{title}</strong>
        <i>CUP OF US · NOW SERVING</i>
      </div>
    </div>
  );
}
