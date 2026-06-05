"use client";
// DUEÑO: Mateo (landing / portada).
// Hero con marca, propuesta de valor, los 3 pasos y CTA → /coach.
import Link from "next/link";
import ParticleField from "@/components/ParticleField";

const STEPS = [
  {
    number: "01",
    icon: "self_improvement",
    label: "Coach",
    description:
      "Habla con tu coach personal. Él te escucha y descubre qué te apasiona.",
    href: "/coach",
    accent: "#c0c1ff", // primary
  },
  {
    number: "02",
    icon: "groups",
    label: "Personajes",
    description:
      "Conversa con referentes reales — deportistas, científicos, artistas — que vivieron lo que te interesa.",
    href: "/personajes",
    accent: "#4cd7f6", // secondary
  },
  {
    number: "03",
    icon: "explore",
    label: "Futuro",
    description:
      "Tu orientador vocacional integra todo tu perfil y te abre caminos profesionales concretos.",
    href: "/vocacional",
    accent: "#ffb783", // tertiary
  },
];

export default function Home() {
  return (
    <div className="phone-frame mesh-gradient min-h-screen relative flex flex-col overflow-x-hidden">
      <ParticleField count={28} />

      {/* ── Hero ── */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-gutter pt-xxl pb-xl gap-lg">
        {/* Logotipo + marca */}
        <div className="flex flex-col items-center gap-sm">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-xs">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: "32px" }}>
              mic
            </span>
          </div>
          <h1 className="text-headline-xl font-headline-xl font-extrabold text-primary tracking-tight">
            Quriuos
          </h1>
        </div>

        {/* Propuesta de valor */}
        <p className="text-body-lg font-body-lg text-on-surface leading-relaxed max-w-sm">
          Descubre tus pasiones, habla con quienes ya lo lograron y encuentra{" "}
          <span className="text-primary font-semibold">tu camino</span> — todo con tu voz.
        </p>

        {/* Badge "mobile-first · IA · voz" */}
        <div className="flex gap-sm flex-wrap justify-center">
          {["Voz con IA", "Mobile-first", "Orientación real"].map((tag) => (
            <span
              key={tag}
              className="px-md py-1 rounded-full bg-white/8 border border-white/12 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wide"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ── Los 3 pasos ── */}
      <section className="relative z-10 px-gutter pb-xl space-y-sm">
        <p className="text-label-sm font-label-sm uppercase text-on-surface-variant tracking-widest text-center mb-md">
          Cómo funciona
        </p>

        {STEPS.map((step) => (
          <Link key={step.href} href={step.href} className="block group">
            <div className="glass-panel rounded-xl p-md flex items-start gap-md transition-all hover:border-white/20 active:scale-[0.98]">
              {/* Número + icono */}
              <div className="flex-shrink-0 flex flex-col items-center gap-xs">
                <span
                  className="text-label-sm font-label-sm"
                  style={{ color: step.accent }}
                >
                  {step.number}
                </span>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${step.accent}20`, border: `1px solid ${step.accent}40` }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ color: step.accent, fontSize: "20px" }}
                  >
                    {step.icon}
                  </span>
                </div>
              </div>

              {/* Texto */}
              <div className="flex-grow min-w-0">
                <p
                  className="text-body-md font-body-md font-semibold"
                  style={{ color: step.accent }}
                >
                  {step.label}
                </p>
                <p className="text-body-md text-on-surface-variant leading-snug mt-xs">
                  {step.description}
                </p>
              </div>

              {/* Flecha */}
              <span className="material-symbols-outlined text-on-surface-variant flex-shrink-0 mt-xs opacity-50 group-hover:opacity-100 transition-opacity">
                chevron_right
              </span>
            </div>
          </Link>
        ))}
      </section>

      {/* ── CTA principal ── */}
      <section className="relative z-10 px-gutter pb-xxl flex flex-col items-center gap-md">
        <Link
          href="/coach"
          className="w-full max-w-xs flex items-center justify-center gap-md bg-primary text-on-primary px-xl py-md rounded-full font-headline-md text-body-md font-bold shadow-lg shadow-primary/30 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined">mic</span>
          Empezar ahora
        </Link>
        <p className="text-label-sm font-label-sm text-on-surface-variant text-center">
          Sin registro · Solo tu voz · Menos de 10 minutos
        </p>
      </section>
    </div>
  );
}
