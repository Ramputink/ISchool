"use client";
// DUEÑO: Mateo (home / landing + integración).
import Link from "next/link";
import ParticleField from "@/components/ParticleField";

export default function Home() {
  return (
    <div className="phone-frame mesh-gradient min-h-screen relative flex flex-col items-center justify-center text-center px-gutter gap-xl">
      <ParticleField />
      <div className="relative z-10 flex flex-col items-center gap-md">
        <span className="text-headline-xl font-headline-xl font-extrabold text-primary">
          Quriuos
        </span>
        <p className="text-on-surface-variant text-body-lg max-w-md">
          Descubre tus intereses, conversa con referentes que te inspiran y
          encuentra tu camino — todo con tu voz.
        </p>
        <Link
          href="/coach"
          className="mt-md bg-primary-container text-on-primary-container px-xl py-md rounded-full font-headline-md text-body-md font-bold active:scale-95 transition-all"
        >
          Empezar
        </Link>
        <div className="flex gap-md mt-md text-label-sm font-label-sm text-on-surface-variant">
          <Link href="/coach">1 · Coach</Link>
          <Link href="/personajes">2 · Personajes</Link>
          <Link href="/vocacional">3 · Futuro</Link>
        </div>
      </div>
    </div>
  );
}
