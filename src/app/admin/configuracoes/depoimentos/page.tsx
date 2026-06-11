import { createServiceRoleClient } from "@/lib/supabase/admin";
import { TestimonialsAdmin } from "./TestimonialsAdmin";
import type { Testimonial } from "@/types";

export const dynamic = "force-dynamic";

export default async function DepoimentosAdminPage() {
  const supabase = createServiceRoleClient();

  const [{ data: testimonials }, { data: sectionSetting }] = await Promise.all([
    supabase.from("testimonials").select("*").order("sort_order"),
    supabase
      .from("culture_content")
      .select("is_visible")
      .eq("section_key", "testimonials_section")
      .maybeSingle(),
  ]);

  const sectionVisible = sectionSetting?.is_visible ?? true;

  return (
    <div>
      <h1 className="font-wt-heading text-3xl font-bold tracking-tight text-wt-teal-deep">
        Depoimentos
      </h1>
      <p className="mt-1 text-sm text-wt-gray-500">
        Gerencie os depoimentos de colaboradores exibidos no site
      </p>

      <div className="mt-8">
        <TestimonialsAdmin
          testimonials={(testimonials ?? []) as Testimonial[]}
          sectionVisible={sectionVisible}
        />
      </div>
    </div>
  );
}
