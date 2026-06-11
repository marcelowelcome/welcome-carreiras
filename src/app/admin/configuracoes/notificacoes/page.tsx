import { createServiceRoleClient } from "@/lib/supabase/admin";
import { NotificacoesEditor } from "@/components/admin/NotificacoesEditor";

export const dynamic = "force-dynamic";

export default async function NotificacoesPage() {
  const supabase = createServiceRoleClient();

  const { data } = await supabase
    .from("culture_content")
    .select("content")
    .eq("section_key", "notification_settings")
    .maybeSingle();

  const settings = (data?.content ?? {}) as {
    rh_email?: string;
    notify_candidate_on_apply?: boolean;
    notify_rh_on_apply?: boolean;
    notify_rh_on_talent_pool?: boolean;
  };

  return (
    <div>
      <h1 className="font-wt-heading text-3xl font-bold tracking-tight text-wt-teal-deep">
        Notificações
      </h1>
      <p className="mt-1 text-sm text-wt-gray-500">
        Configure quem recebe alertas e quais e-mails são enviados automaticamente
      </p>

      <div className="mt-8">
        <NotificacoesEditor initial={settings} />
      </div>
    </div>
  );
}
