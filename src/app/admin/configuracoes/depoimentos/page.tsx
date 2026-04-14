import { createServerClient } from "@/lib/supabase/server";
import { TestimonialsAdmin } from "./TestimonialsAdmin";
import type { Testimonial } from "@/types";

export default async function DepoimentosAdminPage() {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .order("sort_order");

  return (
    <div>
      <h1 className="font-wt-heading text-3xl font-bold tracking-tight text-wt-teal-deep">
        Depoimentos
      </h1>
      <p className="mt-1 text-sm text-wt-gray-500">
        Gerencie os depoimentos exibidos nas páginas de carreiras e cultura
      </p>

      <div className="mt-8">
        <TestimonialsAdmin testimonials={(data ?? []) as Testimonial[]} />
      </div>
    </div>
  );
}
