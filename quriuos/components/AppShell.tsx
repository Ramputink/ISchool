"use client";
// DUEÑO: Fernando (diseño). Marco "app de móvil" + header + bottom-nav.
import Link from "next/link";
import { usePathname } from "next/navigation";
import ParticleField from "./ParticleField";

const NAV = [
  { href: "/coach",      label: "Coach",      icon: "self_improvement" },
  { href: "/personajes", label: "Personajes",  icon: "groups"          },
  { href: "/vocacional", label: "Futuro",      icon: "explore"         },
];

// Icono SVG inline de la marca (Q con punto)
function QuriuosLogo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Círculo exterior */}
      <circle cx="16" cy="16" r="13" stroke="#c0c1ff" strokeWidth="2.2" />
      {/* Cola de la Q */}
      <line
        x1="22" y1="22"
        x2="27" y2="27"
        stroke="#c0c1ff"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Punto interior — "curiosidad" */}
      <circle cx="16" cy="16" r="3.5" fill="#c0c1ff" />
    </svg>
  );
}

export default function AppShell({
  children,
  live = false,
}: {
  children: React.ReactNode;
  live?: boolean;
}) {
  const pathname = usePathname();

  return (
    <div className="phone-frame mesh-gradient min-h-screen flex flex-col relative">
      <ParticleField />

      {/* ── Header ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 glass-panel-solid border-b border-white/[0.07]">
        <div className="flex justify-between items-center px-gutter h-14">

          {/* Logo + nombre */}
          <Link
            href="/"
            className="flex items-center gap-sm focus-visible:rounded-lg"
            aria-label="Inicio Quriuos"
          >
            <QuriuosLogo size={26} />
            <span
              className="text-headline-md font-headline-md font-bold tracking-tight text-primary"
              style={{ letterSpacing: "-0.02em" }}
            >
              Quriuos
            </span>
          </Link>

          {/* Chip "Live" */}
          {live && (
            <div
              className="flex items-center gap-xs px-sm py-[5px] rounded-full"
              style={{
                background: "rgba(192, 193, 255, 0.08)",
                border: "1px solid rgba(192, 193, 255, 0.15)",
              }}
            >
              {/* Punto pulsante */}
              <span
                className="w-[7px] h-[7px] rounded-full bg-primary animate-pulse-glow"
                aria-hidden
              />
              <span
                className="text-label-sm font-label-sm text-primary"
                style={{ fontSize: "11px", letterSpacing: "0.08em" }}
              >
                EN VIVO
              </span>
            </div>
          )}
        </div>
      </header>

      {/* ── Contenido ─────────────────────────────────────────── */}
      <main className="flex-grow w-full relative z-10 animate-fade-in">
        {children}
      </main>

      {/* ── Bottom nav ────────────────────────────────────────── */}
      <nav
        className="sticky bottom-0 z-50 glass-panel-solid border-t border-white/[0.07]"
        aria-label="Navegación principal"
      >
        {/* Safe-area para iPhone con home-indicator */}
        <div
          className="flex justify-around items-stretch px-xs"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)", paddingTop: "6px" }}
        >
          {NAV.map((item) => {
            const isActive = !!pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "relative flex flex-col items-center gap-[3px] px-md py-[6px] rounded-xl",
                  "transition-all duration-200 flex-1 min-w-0",
                  "focus-visible:outline-primary",
                  isActive ? "nav-item-active" : "",
                ].join(" ")}
                aria-current={isActive ? "page" : undefined}
              >
                {/* Fondo activo sutil */}
                {isActive && (
                  <span
                    className="absolute inset-x-2 inset-y-1 rounded-lg"
                    style={{ background: "rgba(192, 193, 255, 0.08)" }}
                    aria-hidden
                  />
                )}

                <span
                  className={[
                    "material-symbols-outlined relative",
                    isActive ? "nav-icon-active text-primary" : "nav-icon text-on-surface-variant",
                  ].join(" ")}
                  aria-hidden
                >
                  {item.icon}
                </span>

                <span
                  className={[
                    "relative text-[10px] font-semibold tracking-wide",
                    "transition-colors duration-200",
                    isActive ? "text-primary" : "text-on-surface-variant",
                  ].join(" ")}
                  style={{ letterSpacing: "0.04em" }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
