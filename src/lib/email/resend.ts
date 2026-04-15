import { Resend } from "resend";

export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "Welcome Carreiras <onboarding@resend.dev>";
export const RH_EMAIL =
  process.env.RESEND_RH_EMAIL || process.env.RH_NOTIFY_EMAIL || "";

let client: Resend | null = null;

function getClient(): Resend | null {
  if (client) return client;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  client = new Resend(key);
  return client;
}

interface SendArgs {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

// Envia e-mail; faz log e retorna null se Resend não está configurado ou falha.
// Nunca lança — endpoints públicos continuam funcionando mesmo sem email.
export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: SendArgs): Promise<{ id: string } | null> {
  const resend = getClient();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY não configurada — envio ignorado.");
    return null;
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      replyTo,
    });
    if (result.error) {
      console.error("[email] erro Resend:", result.error);
      return null;
    }
    return result.data ? { id: result.data.id } : null;
  } catch (err) {
    console.error("[email] exceção Resend:", err);
    return null;
  }
}
