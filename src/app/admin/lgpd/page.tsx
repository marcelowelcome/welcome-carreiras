import { createServiceRoleClient } from "@/lib/supabase/admin";
import { LgpdRequestsTable } from "./LgpdRequestsTable";
import type { LgpdRequest } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminLgpdPage() {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("lgpd_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) console.error("[admin/lgpd]", error);

  const requests = (data ?? []) as LgpdRequest[];
  const pending = requests.filter((r) => r.status === "pendente").length;

  return (
    <div>
      <div>
        <h1 className="font-wt-heading text-3xl font-bold tracking-tight text-wt-teal-deep">
          LGPD
        </h1>
        <p className="mt-1 text-sm text-wt-gray-500">
          {pending}{" "}
          {pending === 1
            ? "solicitação pendente"
            : "solicitações pendentes"}
          {" · "}
          {requests.length}{" "}
          {requests.length === 1 ? "total" : "totais"}
        </p>
      </div>

      <div className="mt-8">
        <LgpdRequestsTable requests={requests} />
      </div>
    </div>
  );
}
