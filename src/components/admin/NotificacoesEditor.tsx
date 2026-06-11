"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2 } from "lucide-react";

interface NotificationSettings {
  rh_email: string;
  notify_candidate_on_apply: boolean;
  notify_rh_on_apply: boolean;
  notify_rh_on_talent_pool: boolean;
}

const DEFAULTS: NotificationSettings = {
  rh_email: "",
  notify_candidate_on_apply: true,
  notify_rh_on_apply: true,
  notify_rh_on_talent_pool: true,
};

interface NotificacoesEditorProps {
  initial: Partial<NotificationSettings>;
}

export function NotificacoesEditor({ initial }: NotificacoesEditorProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState<NotificationSettings>({
    ...DEFAULTS,
    ...initial,
  });

  function update<K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);

    const res = await fetch("/api/admin/settings/notification_settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: settings }),
    });

    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Erro ao salvar");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* E-mail do RH */}
      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-primary">Destinatário das notificações</h2>
        <p className="mt-1 text-xs text-muted">
          E-mail que receberá alertas de novas candidaturas e cadastros no banco de talentos.
          Sobrescreve a variável de ambiente <code className="rounded bg-gray-100 px-1 text-xs">RESEND_RH_EMAIL</code>.
        </p>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">E-mail do RH</label>
          <input
            type="email"
            value={settings.rh_email}
            onChange={(e) => update("rh_email", e.target.value)}
            placeholder="rh@welcome.com.br"
            className="mt-1 w-full max-w-md rounded-lg border border-border px-3 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      {/* Preferências */}
      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-primary">Preferências de notificação</h2>
        <p className="mt-1 text-xs text-muted">
          Estas configurações funcionam apenas quando o Resend está configurado
          (<code className="rounded bg-gray-100 px-1 text-xs">RESEND_API_KEY</code> definida).
        </p>

        <div className="mt-5 space-y-4">
          <Toggle
            id="notify_candidate_on_apply"
            checked={settings.notify_candidate_on_apply}
            onChange={(v) => update("notify_candidate_on_apply", v)}
            label="Confirmação ao candidato"
            description="Envia e-mail de confirmação ao candidato ao se inscrever em uma vaga"
          />
          <Toggle
            id="notify_rh_on_apply"
            checked={settings.notify_rh_on_apply}
            onChange={(v) => update("notify_rh_on_apply", v)}
            label="Alerta de nova candidatura"
            description="Notifica o RH quando uma nova candidatura é recebida"
          />
          <Toggle
            id="notify_rh_on_talent_pool"
            checked={settings.notify_rh_on_talent_pool}
            onChange={(v) => update("notify_rh_on_talent_pool", v)}
            label="Alerta de banco de talentos"
            description="Notifica o RH quando alguém se cadastra no banco de talentos"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar configurações
        </button>
        {saved && <p className="text-sm text-green-600">Salvo com sucesso!</p>}
        {error && <p className="text-sm text-error">{error}</p>}
      </div>
    </div>
  );
}

function Toggle({
  id,
  checked,
  onChange,
  label,
  description,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-gray-50"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
      />
      <div>
        <p className="text-sm font-medium text-primary">{label}</p>
        <p className="mt-0.5 text-xs text-muted">{description}</p>
      </div>
    </label>
  );
}
