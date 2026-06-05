"use client";
// DUEÑO: Fernando (diseño). Visualizador de barras estilo ElevenLabs.
import { useEffect, useRef } from "react";

export default function VoiceVisualizer({
  active = true,
  bars = 48,
}: {
  active?: boolean;
  bars?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    container.innerHTML = "";
    const els: HTMLDivElement[] = [];
    for (let i = 0; i < bars; i++) {
      const bar = document.createElement("div");
      bar.className = "voice-bar w-1.5 bg-primary rounded-full opacity-60";
      bar.style.height = "10px";
      container.appendChild(bar);
      els.push(bar);
    }
    const id = setInterval(() => {
      els.forEach((bar, index) => {
        const wave = active
          ? Math.sin(performance.now() * 0.005 + index * 0.2) * 20 + 30
          : 8;
        const random = active ? Math.random() * 20 : 0;
        const height = wave + random;
        bar.style.height = `${height}px`;
        if (height > 40) {
          bar.classList.replace("bg-primary", "bg-secondary");
          bar.style.opacity = "0.9";
        } else {
          bar.classList.replace("bg-secondary", "bg-primary");
          bar.style.opacity = "0.6";
        }
      });
    }, 80);
    return () => clearInterval(id);
  }, [active, bars]);

  return (
    <div
      ref={ref}
      className="w-full max-w-2xl h-32 flex items-center justify-center gap-1"
    />
  );
}
