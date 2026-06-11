"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/vagas", label: "Vagas" },
  { href: "/cultura", label: "Cultura" },
  { href: "/banco-de-talentos", label: "Banco de Talentos" },
  { href: "/meus-dados", label: "Meus dados" },
];

export function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-wt-gray-300/60 bg-wt-off-white/95 backdrop-blur supports-[backdrop-filter]:bg-wt-off-white/80">
      <nav className="mx-auto flex max-w-wt-container items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="font-wt-heading text-xl font-bold tracking-tight text-wt-teal-deep"
        >
          Welcome <span className="text-wt-primary">Carreiras</span>
        </Link>

        {/* Desktop */}
        <ul className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "font-wt-heading text-xs font-semibold uppercase tracking-[0.1em] transition-colors hover:text-wt-primary",
                    isActive
                      ? "text-wt-primary underline underline-offset-4"
                      : "text-wt-gray-700"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Mobile toggle */}
        <button
          type="button"
          className="text-wt-gray-700 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-wt-gray-300/60 md:hidden">
          <ul className="mx-auto max-w-wt-container space-y-1 px-6 py-4">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "block rounded-wt-sm px-3 py-2 font-wt-heading text-sm font-semibold uppercase tracking-[0.08em] transition-colors hover:bg-wt-gray-100 hover:text-wt-primary",
                      isActive
                        ? "bg-wt-primary-light text-wt-primary"
                        : "text-wt-gray-700"
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </header>
  );
}
