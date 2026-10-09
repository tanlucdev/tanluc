"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/play", label: "Play" },
  { href: "/photography", label: "Photography" },
  { href: "/about", label: "About" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/85 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-serif text-lg italic">
          Neel Saswade
        </Link>
        <ul className="flex flex-wrap gap-1">
          {LINKS.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest transition-colors ${
                    active ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
