import { createServiceRoleClient } from "@/lib/supabase/admin";
import { EstatisticasEditor } from "@/components/admin/EstatisticasEditor";
import { DEFAULT_STATS } from "@/components/public/CountersStrip";
import type { Stat } from "@/components/public/CountersStrip";

export const dynamic = "force-dynamic";

export default async function EstatisticasPage() {
  const supabase = createServiceRoleClient();

  const { data } = await supabase
    .from("culture_content")
    .select("content")
    .eq("section_key", "company_stats")
    .maybeSingle();

  const stats: Stat[] =
    (data?.content as { stats?: Stat[] })?.stats ?? DEFAULT_STATS;

  return (
    <div>
      <h1 className="font-wt-heading text-3xl font-bold tracking-tight text-wt-teal-deep">
        Estatísticas da empresa
      </h1>
      <p className="mt-1 text-sm text-wt-gray-500">
        Números exibidos na seção de contadores da página inicial
      </p>

      <div className="mt-8 max-w-2xl">
        <EstatisticasEditor initial={stats} />
      </div>
    </div>
  );
}
