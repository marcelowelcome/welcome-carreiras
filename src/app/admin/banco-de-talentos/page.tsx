import { createServiceRoleClient } from "@/lib/supabase/admin";
import { TalentPoolTable } from "./TalentPoolTable";
import type { TalentPoolEntry, Brand, Department } from "@/types";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    area?: Department;
    marca?: Brand;
  }>;
}

export default async function AdminBancoDeTalentosPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  // Middleware já protege /admin. Usamos service role para evitar RLS no read.
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("talent_pool")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[admin/banco-de-talentos] supabase:", error);
  }

  let entries = (data ?? []) as TalentPoolEntry[];

  if (params.q) {
    const q = params.q.toLowerCase();
    entries = entries.filter(
      (e) =>
        e.full_name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q)
    );
  }
  if (params.area) {
    entries = entries.filter((e) => e.area_interest?.includes(params.area!));
  }
  if (params.marca) {
    entries = entries.filter((e) => e.brand_interest?.includes(params.marca!));
  }

  return (
    <div>
      <div>
        <h1 className="font-wt-heading text-3xl font-bold tracking-tight text-wt-teal-deep">
          Banco de Talentos
        </h1>
        <p className="mt-1 text-sm text-wt-gray-500">
          {entries.length}{" "}
          {entries.length === 1 ? "pessoa cadastrada" : "pessoas cadastradas"}
        </p>
      </div>

      <div className="mt-8">
        <TalentPoolTable entries={entries} />
      </div>
    </div>
  );
}
