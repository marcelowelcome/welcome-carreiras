"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";

function LoginForm() {
  const searchParams = useSearchParams();
  const authError = searchParams.get("error");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    authError === "auth_failed"
      ? "Falha na autenticação. Tente novamente."
      : ""
  );

  async function handleAzureLogin() {
    setError("");
    setLoading(true);

    const supabase = createBrowserClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: "email profile openid",
      },
    });

    if (oauthError) {
      setError("Erro ao iniciar login. Tente novamente.");
      setLoading(false);
    }
    // Se sucesso, o browser é redirecionado para a Microsoft.
    // Não precisa fazer nada aqui — o callback cuida do resto.
  }

  return (
    <div className="mt-10 space-y-5">
      {error && (
        <div className="rounded-wt-sm bg-wt-red/10 p-3 text-center text-sm text-wt-red">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleAzureLogin}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-wt-sm bg-wt-primary px-4 py-3.5 font-wt-heading text-sm font-bold uppercase tracking-[0.05em] text-white shadow-wt-sm transition-all hover:-translate-y-0.5 hover:bg-wt-primary-dark hover:shadow-wt-md disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Redirecionando...
          </>
        ) : (
          <>
            <MicrosoftIcon />
            Entrar com Microsoft
          </>
        )}
      </button>

      <p className="text-center text-xs text-wt-gray-500">
        Use seu e-mail corporativo <strong>@welcometrips.com.br</strong> para
        acessar o painel.
      </p>
    </div>
  );
}

function MicrosoftIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 21 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-wt-off-white px-6 font-wt-body">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <h1 className="font-wt-heading text-3xl font-bold tracking-tight text-wt-teal-deep">
            Welcome <span className="text-wt-primary">Admin</span>
          </h1>
          <p className="mt-3 text-sm text-wt-gray-500">
            Acesse o painel de gestão de carreiras
          </p>
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
