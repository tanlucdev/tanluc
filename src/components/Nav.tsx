"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/work", label: "Work" },
  { href: "/photography", label: "Photo" },
  { href: "/about", label: "About" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <header className="relative mx-auto flex w-[calc(100%-32px)] items-baseline justify-between gap-4 pt-4 sm:w-[calc(100%-128px)] sm:justify-start sm:gap-6 sm:pt-[30px]">
      <nav className="contents">
        <Link href="/" className="font-sans text-sm leading-[1.2] tracking-[-0.02em] sm:text-[clamp(15px,1.1vw,18px)] sm:leading-[1.05] sm:tracking-[-0.035em]">
          Tan Luc
        </Link>
        <ul className="flex gap-[14px] text-sm leading-[1.2] tracking-[-0.02em] text-[#8f8f8f] sm:gap-6 sm:text-[clamp(15px,1.1vw,18px)] sm:leading-[1.05] sm:tracking-[-0.035em]">
          {LINKS.map((l) => {
            const active =
              pathname.startsWith(l.href);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`transition-colors ${
                    active ? "text-ink" : "hover:text-ink"
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
