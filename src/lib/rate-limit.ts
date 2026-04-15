import { createServiceRoleClient } from "@/lib/supabase/admin";

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds?: number;
}

/**
 * Conta requisições recentes para um mesmo IP+endpoint no Supabase e aceita
 * ou rejeita. Depois registra a tentativa atual.
 *
 * Strategy: sliding window simples. Falha "fail-open" — se o Supabase der
 * erro, o request passa (mas loga).
 */
export async function checkRateLimit({
  ip,
  endpoint,
  maxRequests,
  windowSeconds,
}: {
  ip: string;
  endpoint: string;
  maxRequests: number;
  windowSeconds: number;
}): Promise<RateLimitResult> {
  const supabase = createServiceRoleClient();
  const since = new Date(Date.now() - windowSeconds * 1000).toISOString();

  const { count, error: countError } = await supabase
    .from("rate_limit_log")
    .select("id", { count: "exact", head: true })
    .eq("ip", ip)
    .eq("endpoint", endpoint)
    .gte("created_at", since);

  if (countError) {
    console.error("[rate-limit] falha ao contar:", countError);
    return { ok: true, remaining: maxRequests };
  }

  const used = count ?? 0;
  if (used >= maxRequests) {
    return { ok: false, remaining: 0, retryAfterSeconds: windowSeconds };
  }

  // Registra a tentativa atual de forma não-bloqueante do ponto de vista do erro
  const { error: insertError } = await supabase
    .from("rate_limit_log")
    .insert({ ip, endpoint });
  if (insertError) {
    console.error("[rate-limit] falha ao registrar:", insertError);
  }

  return { ok: true, remaining: maxRequests - used - 1 };
}

// Extrai IP do cliente confiando nos headers da Vercel / proxy.
export function getClientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}
