"use client";
// DUEÑO: Fernando (diseño). Marco "app de móvil" + header + bottom-nav.
import Link from "next/link";
import { usePathname } from "next/navigation";
import ParticleField from "./ParticleField";

const NAV = [
  { href: "/coach", label: "Coach", icon: "self_improvement" },
  { href: "/personajes", label: "Personajes", icon: "groups" },
  { href: "/vocacional", label: "Futuro", icon: "explore" },
];

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

      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-white/10">
        <div className="flex justify-between items-center px-gutter h-16">
          <Link href="/" className="flex items-center gap-md">
            <span className="text-headline-md font-headline-md font-bold tracking-tight text-primary">
              Quriuos
            </span>
          </Link>
          {live && (
            <div className="flex items-center gap-xs px-sm py-1 bg-primary/10 rounded-full">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-label-sm font-label-sm text-primary uppercase">
                Live
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Contenido */}
      <main className="flex-grow w-full relative z-10">{children}</main>

      {/* Bottom nav */}
      <nav className="sticky bottom-0 z-50 glass-panel border-t border-white/10">
        <div className="flex justify-around items-center px-sm py-sm">
          {NAV.map((item) => {
            const activeItem = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-md py-1 rounded-lg transition-colors ${
                  activeItem ? "text-primary" : "text-on-surface-variant"
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="text-label-sm font-label-sm">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
