"use client";
// DUEÑO: Fernando (diseño). Campo de partículas flotantes — fondo cinematográfico.
import { useEffect, useRef } from "react";

type ParticleDef = {
  /** clase CSS que determina el color */
  colorClass: "particle-primary" | "particle-secondary" | "particle-tertiary";
  /** desplazamiento lateral durante la subida (px, puede ser negativo) */
  drift: number;
  size: number;
  left: number;
  top: number;
  duration: number;
  delay: number;
  /** animación CSS a usar */
  anim: "float-up" | "float-drift";
};

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function buildParticles(count: number): ParticleDef[] {
  const colorPool: ParticleDef["colorClass"][] = [
    "particle-primary",
    "particle-primary",
    "particle-primary",   // más abundantes (azul/violeta)
    "particle-secondary",
    "particle-secondary",
    "particle-tertiary",
  ];

  return Array.from({ length: count }, () => ({
    colorClass: colorPool[Math.floor(Math.random() * colorPool.length)],
    drift: randomBetween(-40, 40),
    size: randomBetween(3, 9),
    left: randomBetween(0, 100),
    top: randomBetween(20, 100),   // salen desde la mitad inferior
    duration: randomBetween(8, 18),
    delay: randomBetween(0, 12),
    anim: Math.random() > 0.4 ? "float-up" : "float-drift",
  }));
}

export default function ParticleField({ count = 24 }: { count?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    container.innerHTML = "";
    const defs = buildParticles(count);

    defs.forEach((def) => {
      const p = document.createElement("div");
      p.className = `particle ${def.colorClass}`;
      p.style.cssText = [
        `width:${def.size}px`,
        `height:${def.size}px`,
        `left:${def.left}%`,
        `top:${def.top}%`,
        `--drift:${def.drift}px`,
        `animation:${def.anim} ${def.duration}s linear ${def.delay}s infinite`,
        `opacity:0`,            // arranca invisible; la animación la sube
      ].join(";");
      container.appendChild(p);
    });

    // Limpiar al desmontar
    return () => {
      container.innerHTML = "";
    };
  }, [count]);

  return (
    <div
      ref={ref}
      className="absolute inset-0 overflow-hidden pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
