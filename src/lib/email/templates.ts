// Templates HTML inline para e-mails transacionais.
// Mantém estilo consistente com o design system Welcome Trips
// (off-white quente, teal deep, orange CTA, Nunito Sans fallback).

interface ApplicationConfirmationParams {
  candidateName: string;
  jobTitle: string;
  siteUrl: string;
}

interface RHNotificationParams {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  adminUrl: string;
}

interface TalentPoolConfirmationParams {
  candidateName: string;
  siteUrl: string;
}

const BASE_STYLES = `
  font-family: 'Nunito Sans', 'Avenir Next', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #F8F7F4;
  color: #4A4540;
`;

const CONTAINER_STYLES = `
  max-width: 560px;
  margin: 0 auto;
  background: #FFFFFF;
  border-radius: 12px;
  padding: 32px;
  border: 1px solid #D1CCC5;
`;

const HEADING_STYLES = `
  color: #0D5257;
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 16px;
  letter-spacing: -0.01em;
`;

const BODY_STYLES = `
  color: #4A4540;
  font-size: 15px;
  line-height: 1.6;
  margin: 0 0 14px;
`;

const ACCENT_STYLES = `color: #0091B3; font-weight: 600;`;

const CTA_STYLES = `
  display: inline-block;
  background: #EA7600;
  color: #FFFFFF !important;
  text-decoration: none;
  padding: 12px 28px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

const FOOTER_STYLES = `
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid #F2F0ED;
  font-size: 12px;
  color: #8A8580;
  line-height: 1.5;
`;

export function applicationConfirmationEmail({
  candidateName,
  jobTitle,
  siteUrl,
}: ApplicationConfirmationParams): { subject: string; html: string } {
  return {
    subject: `Recebemos sua candidatura — ${jobTitle}`,
    html: `<!DOCTYPE html>
<html lang="pt-BR">
<body style="${BASE_STYLES} margin: 0; padding: 32px 16px;">
  <div style="${CONTAINER_STYLES}">
    <h1 style="${HEADING_STYLES}">Oi, ${escape(candidateName.split(" ")[0])}! 👋</h1>
    <p style="${BODY_STYLES}">
      Recebemos sua candidatura para a vaga de
      <span style="${ACCENT_STYLES}">${escape(jobTitle)}</span> no Welcome Group.
    </p>
    <p style="${BODY_STYLES}">
      Nosso time vai avaliar seu perfil com carinho. Se houver fit, entraremos
      em contato pelos próximos passos do processo — acompanhe seu e-mail
      (e a caixa de spam, só por garantia).
    </p>
    <p style="${BODY_STYLES}">
      Enquanto isso, conheça mais da nossa cultura e outras oportunidades:
    </p>
    <p style="margin: 24px 0;">
      <a href="${siteUrl}/cultura" style="${CTA_STYLES}">Conhecer a cultura</a>
    </p>
    <div style="${FOOTER_STYLES}">
      <p style="margin: 0;">
        Welcome Group · Curitiba, PR<br />
        Este e-mail foi enviado porque você se candidatou em <strong>carreiras.welcome</strong>.
      </p>
    </div>
  </div>
</body>
</html>`,
  };
}

export function rhNewApplicationEmail({
  candidateName,
  candidateEmail,
  jobTitle,
  adminUrl,
}: RHNotificationParams): { subject: string; html: string } {
  return {
    subject: `Nova candidatura — ${candidateName} · ${jobTitle}`,
    html: `<!DOCTYPE html>
<html lang="pt-BR">
<body style="${BASE_STYLES} margin: 0; padding: 32px 16px;">
  <div style="${CONTAINER_STYLES}">
    <h1 style="${HEADING_STYLES}">Nova candidatura</h1>
    <p style="${BODY_STYLES}">
      <strong style="color:#0D5257;">${escape(candidateName)}</strong>
      (${escape(candidateEmail)}) se candidatou para a vaga
      <span style="${ACCENT_STYLES}">${escape(jobTitle)}</span>.
    </p>
    <p style="margin: 24px 0;">
      <a href="${adminUrl}" style="${CTA_STYLES}">Abrir no painel</a>
    </p>
    <div style="${FOOTER_STYLES}">
      <p style="margin: 0;">
        Notificação automática do Portal de Carreiras — Welcome Group.
      </p>
    </div>
  </div>
</body>
</html>`,
  };
}

export function talentPoolConfirmationEmail({
  candidateName,
  siteUrl,
}: TalentPoolConfirmationParams): { subject: string; html: string } {
  return {
    subject: "Você está no nosso banco de talentos",
    html: `<!DOCTYPE html>
<html lang="pt-BR">
<body style="${BASE_STYLES} margin: 0; padding: 32px 16px;">
  <div style="${CONTAINER_STYLES}">
    <h1 style="${HEADING_STYLES}">Obrigado, ${escape(candidateName.split(" ")[0])}!</h1>
    <p style="${BODY_STYLES}">
      Seu cadastro no banco de talentos do Welcome Group está confirmado.
      Quando surgir uma vaga nas áreas e marcas que você escolheu, você será
      uma das primeiras pessoas a saber.
    </p>
    <p style="${BODY_STYLES}">
      Enquanto isso, dá uma olhada nas vagas abertas hoje:
    </p>
    <p style="margin: 24px 0;">
      <a href="${siteUrl}/vagas" style="${CTA_STYLES}">Ver vagas abertas</a>
    </p>
    <div style="${FOOTER_STYLES}">
      <p style="margin: 0;">
        Welcome Group · Curitiba, PR<br />
        Se você quiser sair do banco de talentos a qualquer momento, é só
        responder este e-mail.
      </p>
    </div>
  </div>
</body>
</html>`,
  };
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
