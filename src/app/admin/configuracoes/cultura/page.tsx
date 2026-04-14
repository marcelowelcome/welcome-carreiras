import { createServerClient } from "@/lib/supabase/server";
import { CultureEditor } from "./CultureEditor";
import type { CultureContent } from "@/types";

export default async function CulturaAdminPage() {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("culture_content")
    .select("*")
    .order("sort_order");

  return (
    <div>
      <h1 className="font-wt-heading text-3xl font-bold tracking-tight text-wt-teal-deep">
        Conteúdo de cultura
      </h1>
      <p className="mt-1 text-sm text-wt-gray-500">
        Edite os textos exibidos na página de cultura do site
      </p>

      <div className="mt-8">
        <CultureEditor sections={(data ?? []) as CultureContent[]} />
      </div>
    </div>
  );
}
