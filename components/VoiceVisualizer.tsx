"use client";
// DUEÑO: Fernando (diseño). Visualizador de barras estilo ElevenLabs.
// Barras animadas con gradiente de color según altura: primary → secondary.
import { useEffect, useRef } from "react";

// Clamp seguro
function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

// Interpolación lineal entre dos valores
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * clamp(t, 0, 1);
}

// Convierte hex "#rrggbb" a [r,g,b]
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

// Mezcla dos colores hex en proporción t ∈ [0,1]
function mixColor(
  from: [number, number, number],
  to: [number, number, number],
  t: number,
): string {
  const r = Math.round(lerp(from[0], to[0], t));
  const g = Math.round(lerp(from[1], to[1], t));
  const b = Math.round(lerp(from[2], to[2], t));
  return `rgb(${r},${g},${b})`;
}

const COL_PRIMARY   = hexToRgb("#c0c1ff"); // violeta/lavanda
const COL_SECONDARY = hexToRgb("#4cd7f6"); // cian
const COL_IDLE      = hexToRgb("#464554"); // gris apagado cuando inactivo

/** Altura mínima (px) de las barras en reposo */
const HEIGHT_MIN_IDLE   = 4;
const HEIGHT_MIN_ACTIVE = 6;

/** Altura máxima cuando está activo */
const HEIGHT_MAX = 56;

/** Umbral (en fracción 0-1 de HEIGHT_MAX) para cambiar de primary a secondary */
const SECONDARY_THRESHOLD = 0.55;

export default function VoiceVisualizer({
  active = true,
  bars = 44,
  getFrequency,
}: {
  active?: boolean;
  bars?: number;
  /** Si se provee, las barras reaccionan al audio REAL (bytes 0-255 del SDK de ElevenLabs). */
  getFrequency?: () => Uint8Array;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Mantén la última función en un ref para no recrear la animación en cada render.
  const freqRef = useRef<typeof getFrequency>(getFrequency);
  freqRef.current = getFrequency;

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    // Crear barras
    container.innerHTML = "";
    const els: HTMLDivElement[] = [];
    for (let i = 0; i < bars; i++) {
      const bar = document.createElement("div");
      bar.className = "voice-bar rounded-full";
      // Ancho variable: las barras centrales son ligeramente más anchas
      const centerFactor = 1 - Math.abs((i / (bars - 1)) - 0.5) * 0.6;
      bar.style.width  = `${Math.round(2 + centerFactor * 2)}px`;
      bar.style.height = `${HEIGHT_MIN_IDLE}px`;
      bar.style.background = mixColor(COL_IDLE, COL_IDLE, 0);
      container.appendChild(bar);
      els.push(bar);
    }

    // Estado interno por barra (smoothing)
    const current = new Float32Array(bars).fill(HEIGHT_MIN_IDLE);
    const target  = new Float32Array(bars).fill(HEIGHT_MIN_IDLE);

    let animFrame: number;
    let lastTime = 0;

    // Ofsets de fase para que cada barra tenga su propio ritmo
    const phaseOffset = els.map((_, i) => (i / bars) * Math.PI * 2);
    const freqOffset  = els.map(() => Math.random() * 0.003 + 0.002);

    function tick(timestamp: number) {
      const dt = Math.min(timestamp - lastTime, 50); // cap a 50ms
      lastTime = timestamp;

      // Datos de audio reales si el SDK los provee.
      const freq = active ? freqRef.current?.() : undefined;

      if (active && freq && freq.length > 0) {
        // Mapea cada barra a un bin de frecuencia (zona grave-media, 0-60% del espectro).
        const usable = Math.max(1, Math.floor(freq.length * 0.6));
        els.forEach((_, i) => {
          const bin = Math.min(usable - 1, Math.floor((i / bars) * usable));
          const v = freq[bin] / 255; // 0..1
          target[i] = HEIGHT_MIN_ACTIVE + v * (HEIGHT_MAX - HEIGHT_MIN_ACTIVE);
        });
      } else if (active) {
        // Sin datos reales: ondas sinusoidales + ruido (fallback / modo demo).
        els.forEach((_, i) => {
          const wave =
            Math.sin(timestamp * freqOffset[i] + phaseOffset[i]) * 0.5 +
            Math.sin(timestamp * (freqOffset[i] * 2.3) + phaseOffset[i] * 1.7) * 0.3 +
            0.2;
          // wave ∈ [-0.8, 1.0] → normalizar a [0,1]
          const normalized = (wave + 0.8) / 1.8;
          const noise = Math.random() * 0.25;
          target[i] = HEIGHT_MIN_ACTIVE + (normalized + noise) * (HEIGHT_MAX - HEIGHT_MIN_ACTIVE) * 0.7;
        });
      } else {
        // Reposo: pequeña ondulación idle
        els.forEach((_, i) => {
          const idle = Math.sin(timestamp * 0.0008 + phaseOffset[i]) * 2 + HEIGHT_MIN_IDLE + 2;
          target[i] = idle;
        });
      }

      // Smooth toward target
      const speed = active ? 0.18 : 0.08;
      els.forEach((bar, i) => {
        current[i] += (target[i] - current[i]) * speed * (dt / 16);
        const h = current[i];
        bar.style.height = `${h}px`;

        // Color interpolado por altura
        if (active) {
          const t = Math.max(0, (h - HEIGHT_MIN_ACTIVE) / (HEIGHT_MAX - HEIGHT_MIN_ACTIVE));
          const colorT = Math.max(0, (t - SECONDARY_THRESHOLD) / (1 - SECONDARY_THRESHOLD));
          const opacity = 0.5 + t * 0.5;
          bar.style.background = mixColor(COL_PRIMARY, COL_SECONDARY, colorT);
          bar.style.opacity = opacity.toFixed(2);
          // Sutil box-shadow en las más altas
          if (t > 0.7) {
            bar.style.boxShadow = `0 0 ${Math.round(t * 10)}px rgba(76,215,246,${(t * 0.5).toFixed(2)})`;
          } else {
            bar.style.boxShadow = "none";
          }
        } else {
          const idleT = (h - HEIGHT_MIN_IDLE) / 8;
          bar.style.background = mixColor(COL_IDLE, COL_PRIMARY, Math.max(0, idleT * 0.3));
          bar.style.opacity = "0.35";
          bar.style.boxShadow = "none";
        }
      });

      animFrame = requestAnimationFrame(tick);
    }

    animFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame);
  }, [active, bars]);

  return (
    <div
      ref={ref}
      className="w-full max-w-sm h-16 flex items-center justify-center gap-[3px]"
      aria-label={active ? "Visualizador de voz activo" : "Visualizador de voz inactivo"}
      role="img"
    />
  );
}
