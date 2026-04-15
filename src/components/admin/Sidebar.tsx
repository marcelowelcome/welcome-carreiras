"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Inbox,
  Shield,
  Settings,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/vagas", label: "Vagas", icon: Briefcase },
  { href: "/admin/candidaturas", label: "Candidaturas", icon: Inbox },
  { href: "/admin/banco-de-talentos", label: "Banco de Talentos", icon: Users },
  { href: "/admin/lgpd", label: "LGPD", icon: Shield },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-wt-gray-300/60 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-wt-gray-300/60 px-5 py-5">
        <Link
          href="/admin"
          className="font-wt-heading text-base font-bold text-wt-teal-deep"
        >
          Welcome <span className="text-wt-primary">Admin</span>
        </Link>
        <Link
          href="/"
          className="text-wt-gray-500 transition-colors hover:text-wt-primary"
          title="Ver site público"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-wt-sm px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-wt-primary-light text-wt-primary"
                  : "text-wt-gray-700 hover:bg-wt-gray-100 hover:text-wt-teal-deep"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-wt-gray-300/60 px-3 py-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-wt-sm px-3 py-2.5 text-sm font-medium text-wt-gray-700 transition-colors hover:bg-wt-gray-100 hover:text-wt-red"
        >
          <LogOut className="h-5 w-5" />
          Sair
        </button>
      </div>
    </aside>
  );
}
