import type { MetadataRoute } from "next";
import { createServiceRoleClient } from "@/lib/supabase/admin";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://carreiras.welcome.com.br";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticUrls: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/vagas`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/cultura`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/banco-de-talentos`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return staticUrls;
  }

  try {
    const supabase = createServiceRoleClient();
    const { data: jobs } = await supabase
      .from("jobs")
      .select("slug, updated_at")
      .eq("status", "published");

    const jobUrls: MetadataRoute.Sitemap = (jobs ?? []).map((job) => ({
      url: `${BASE_URL}/vagas/${job.slug}`,
      lastModified: job.updated_at,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticUrls, ...jobUrls];
  } catch {
    return staticUrls;
  }
}
