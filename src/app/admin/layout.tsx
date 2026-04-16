import { headers } from "next/headers";
import { Sidebar } from "@/components/admin/Sidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Força no-cache em todas as páginas admin — elimina CDN e browser cache
  const h = await headers();
  void h; // garante que a função é dinâmica

  return (
    <div className="flex h-screen overflow-hidden bg-wt-off-white font-wt-body text-wt-gray-700">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
